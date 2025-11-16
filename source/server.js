require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

let pool;

async function initDb(){
    const cfg = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'foodtour',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
    pool = mysql.createPool(cfg);
    // create users table if it doesn't exist
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL DEFAULT 'email@',
            password VARCHAR(255) NOT NULL DEFAULT 'password',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          
    `);
}

app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body || {};
    if(!email || !password) return res.status(400).json({ message: 'Email e password sono richieste' });
    if(!email.includes('@')) return res.status(400).json({ message: 'Email non valida: deve contenere @' });
    try{
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed]);
        return res.status(201).json({ message: 'Utente creato', id: result.insertId });
    }catch(err){
        if(err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email già registrata' });
        console.error(err);
        return res.status(500).json({ message: 'Errore del server' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body || {};
    if(!email || !password) return res.status(400).json({ message: 'Email e password sono richieste' });
    if(!email.includes('@')) return res.status(400).json({ message: 'Email non valida: deve contenere @' });
    try{
        const [rows] = await pool.query('SELECT id, password FROM users WHERE email = ?', [email]);
        if(!rows || rows.length === 0) return res.status(401).json({ message: 'Credenziali non valide' });
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(401).json({ message: 'Credenziali non valide' });
        return res.json({ message: 'Login effettuato' });
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: 'Errore del server' });
    }
});

app.get('/health', (req, res) => res.json({ ok: true }));

initDb().then(()=>{
    app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
}).catch(err=>{
    console.error('DB init failed', err);
    process.exit(1);
});
