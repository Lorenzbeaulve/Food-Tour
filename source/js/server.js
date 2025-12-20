const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

let pool = require("./Connection");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/connect', async (req, res) => {
    try{
        console.log(req.body);
        res.json({success: true, msg: 'connected to the database'});
    }
    catch (err) {
        res.json({success: false, msg: 'connection error'});
    }
})

// Endpoint per eseguire query
app.post('/query', async (req, res) => {
    try {
        const [rows] = await pool.query(req.body.sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ensure password column can hold hashed passwords
async function ensurePasswordColumn() {
    try{
        // get current database name
        const [[{ dbName }]] = await pool.query('SELECT DATABASE() AS dbName');
        const [cols] = await pool.query(
            `SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user' AND COLUMN_NAME = 'password'`,
            [dbName]
        );
        if(!cols || cols.length === 0){
            console.warn('Column `password` not found in table `user` (skipping migration)');
            return;
        }
        const len = cols[0].CHARACTER_MAXIMUM_LENGTH || 0;
        if(len < 100){
            console.log('Altering `user.password` to VARCHAR(255) to store hashed passwords...');
            await pool.query("ALTER TABLE `user` MODIFY COLUMN `password` VARCHAR(255) NOT NULL");
            console.log('Migration applied: password column resized to VARCHAR(255)');
        } else {
            console.log('Password column length is sufficient:', len);
        }
    }catch(err){
        console.warn('Could not ensure password column size:', err.message || err);
    }
}

app.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, msg: 'Email e password richieste' });

    try {
        // Try to find user in `user` table
        const query = "SELECT email, password, Nome, Cognome FROM `user` WHERE email = ?";
        const [rows] = await pool.execute(query, [email]);

        console.log('[LOGIN] attempt for email:', email);
        console.log('[LOGIN] query returned rows:', Array.isArray(rows) ? rows.length : typeof rows);

        if (!rows || rows.length === 0) {
            console.log('[LOGIN] no user found for', email);
            return res.status(401).json({ success: false, msg: "Email o password errati" });
        }

        const user = rows[0];
        const stored = user.password || '';
        console.log('[LOGIN] user record fetched. password type:', typeof stored, 'length:', stored.length);

        let match = false;
        // If the stored password looks like a bcrypt hash (starts with $2), use bcrypt.compare
        if (typeof stored === 'string' && stored.startsWith('$2')) {
            try {
                match = await bcrypt.compare(password, stored);
            } catch (compareErr) {
                console.error('[LOGIN] bcrypt.compare error for', email, compareErr && compareErr.message ? compareErr.message : compareErr);
                return res.status(500).json({ success: false, msg: 'Errore interno confronto password', error: compareErr && compareErr.message });
            }
        } else {
            // Fallback: stored password is likely plaintext or non-bcrypt; compare directly
            try {
                match = password === stored;
            } catch (plainErr) {
                console.error('[LOGIN] plaintext compare error for', email, plainErr && plainErr.message ? plainErr.message : plainErr);
                match = false;
            }

            // If plaintext matched, migrate to a bcrypt hash for future logins
            if (match) {
                try {
                    const newHash = await bcrypt.hash(password, 10);
                    await pool.execute("UPDATE `user` SET password = ? WHERE email = ?", [newHash, email]);
                    console.log('[LOGIN] migrated plaintext password to bcrypt for', email);
                } catch (migrateErr) {
                    console.warn('[LOGIN] failed to migrate password for', email, migrateErr && migrateErr.message ? migrateErr.message : migrateErr);
                }
            }
        }

        console.log('[LOGIN] password match:', match);
        if (!match) {
            return res.status(401).json({ success: false, msg: 'Email o password errati' });
        }

        return res.json({ success: true, email: user.email, nome: user.Nome, cognome: user.Cognome });
    } catch (err) {
        console.error('Login error', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/register', async (req, res) => {
    const { email, password, nome, cognome } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, msg: 'Email e password richieste' });

    try{
        const hashed = await bcrypt.hash(password, 10);
        const query = "INSERT INTO `user` (email, password, Nome, Cognome) VALUES (?, ?, ?, ?)";
        await pool.execute(query, [email, hashed, nome || null, cognome || null]);
        return res.json({ success: true, msg: 'Registrazione avvenuta con successo' });
    }
    catch (err) {
        console.error('Register error', err.message);
        if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, msg: 'Email già registrata' });
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Update user profile
app.post('/update', async (req, res) => {
    const { email, nome, cognome, password } = req.body || {};
    if (!email) return res.status(400).json({ success: false, msg: 'Email richiesta' });

    try {
        let query = 'UPDATE `user` SET Nome = ?, Cognome = ?';
        let params = [nome || "No name", cognome || "No surname", email];
        
        // If password is provided, hash and update it
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            query = 'UPDATE `user` SET Nome = ?, Cognome = ?, password = ? WHERE email = ?';
            params = [nome || "No name", cognome || "No name", hashed, email];
        } else {
            query += ' WHERE email = ?';
        }

        await pool.execute(query, params);
        return res.json({ success: true, msg: 'Profilo aggiornato con successo' });
    } catch (err) {
        console.error('Update error', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Delete user account
app.post('/delete', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, msg: 'Email e password richieste' });

    try {
        // First verify the password
        const query = "SELECT email, password FROM `user` WHERE email = ?";
        const [rows] = await pool.execute(query, [email]);

        if (!rows || rows.length === 0) {
            return res.status(401).json({ success: false, msg: "Utente non trovato" });
        }

        const user = rows[0];
        const stored = user.password || '';
        let match = false;

        if (typeof stored === 'string' && stored.startsWith('$2')) {
            match = await bcrypt.compare(password, stored);
        } else {
            match = password === stored;
        }

        if (!match) {
            return res.status(401).json({ success: false, msg: 'Password non corretta' });
        }

        // Delete the user
        await pool.execute("DELETE FROM `user` WHERE email = ?", [email]);
        return res.json({ success: true, msg: 'Account eliminato con successo' });
    } catch (err) {
        console.error('Delete error', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Run migration and start server
ensurePasswordColumn().then(()=>{
    app.listen(3000, () => console.log('Server in ascolto su http://localhost:3000'));
}).catch(err=>{
    console.error('Failed to run migrations', err);
    app.listen(3000, () => console.log('Server in ascolto su http://localhost:3000 (migrations failed)'));
});

// Fetch favorites for a user (Preferito = 'V')
app.post('/favorites', async (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, msg: 'Email richiesta' });

    try {
        console.log('[FAVORITES] fetch for', email);
        const query = `SELECT r.Name, r.Description, r.Location, r.Tipologia, r.OpeningAndClosingTime
                       FROM Restaurant r
                       JOIN user_Prefere_A_Restaurant u ON u.Restaurant_Name = r.Name
                       WHERE u.user_email = ? AND u.Preferito = 'V'`;
        const [rows] = await pool.execute(query, [email]);
        console.log('[FAVORITES] returned', Array.isArray(rows) ? rows.length : typeof rows, 'rows');
        return res.json({ success: true, favorites: rows });
    } catch (err) {
        console.error('Favorites fetch error', err && err.message ? err.message : err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Remove a favorite (set Preferito = 'F')
app.post('/favorites/remove', async (req, res) => {
    const { email, restaurant } = req.body || {};
    if (!email || !restaurant) return res.status(400).json({ success: false, msg: 'Email e restaurant richiesti' });

    try {
        console.log('[FAVORITES] remove request:', { email, restaurant });
        const query = "UPDATE user_Prefere_A_Restaurant SET Preferito = 'F' WHERE user_email = ? AND Restaurant_Name = ?";
        const [result] = await pool.execute(query, [email, restaurant]);
        console.log('[FAVORITES] remove affectedRows:', result && result.affectedRows);
        return res.json({ success: true, affectedRows: result.affectedRows });
    } catch (err) {
        console.error('Favorites remove error', err && err.message ? err.message : err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ottenere ristoranti per mappa
app.post("/restaurants", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM Restaurant`);

    res.json({ success: true, restaurants: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Errore DB" });
  }
});

// stato preferito per (email, ristorante)
app.post('/favorites/status', async (req, res) => {
  const { email, restaurant } = req.body || {};
  if (!email || !restaurant) {
    return res.status(400).json({ success: false, msg: 'Email e Restaurant richiesti' });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT Preferito FROM user_Prefere_A_Restaurant WHERE user_email = ? AND Restaurant_Name = ?",
      [email, restaurant]
    );
    const isFavorite = rows && rows.length > 0 && rows[0].Preferito === 'V';
    return res.json({ success: true, isFavorite });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// toggle preferito: se V -> F, altrimenti -> V (con INSERT se non esiste)
app.post('/favorites/toggle', async (req, res) => {
  const { email, restaurant } = req.body || {};
  if (!email || !restaurant) {
    return res.status(400).json({ success: false, msg: 'Email e Restaurant richiesti' });
  }

  try {
    // leggi stato attuale
    const [rows] = await pool.execute(
      "SELECT Preferito FROM user_Prefere_A_Restaurant WHERE user_email = ? AND Restaurant_Name = ?",
      [email, restaurant]
    );

    const currentlyFav = rows && rows.length > 0 && rows[0].Preferito === 'V';
    const newValue = currentlyFav ? 'F' : 'V';

    // upsert (se non esiste crea, se esiste aggiorna)
    await pool.execute(
      `INSERT INTO user_Prefere_A_Restaurant (user_email, Restaurant_Name, Preferito)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE Preferito = VALUES(Preferito)`,
      [email, restaurant, newValue]
    );

    return res.json({ success: true, isFavorite: newValue === 'V' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
