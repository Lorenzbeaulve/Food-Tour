const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

let pool = require("./conn");
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

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = "SELECT username, password FROM utenti WHERE username = ?";
        const [rows] = await pool.execute(query, [username]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, msg: "Username o password errati" });
        }

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log("Passwords don't match");
            return res.status(401).json({ success: false, msg: "Username o password errati" });
        }

        res.json({ success: true, username: user.username });
        console.log("Successfully logged in");
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try{
        const pswd = await bcrypt.hash(password, 10);
        const query = "INSERT INTO utenti (username, email , password) VALUES (?, ?, ?)";
        await pool.execute(query, [username, email, pswd]);
        console.log("success");
        res.json({success: true, msg: 'successfully registered'});
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false, error: err.message });
    }
})

app.listen(3000, () => console.log('Server in ascolto su http://localhost:3000'));