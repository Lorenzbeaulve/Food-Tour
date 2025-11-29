require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
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

// Serve success.html with Google Maps API key injected
app.get('/success.html', (req, res) => {
    try{
        let html = fs.readFileSync(path.join(__dirname, 'success.html'), 'utf8');
        const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
        html = html.replace('YOUR_GOOGLE_MAPS_API_KEY', apiKey);
        res.type('text/html').send(html);
    }catch(err){
        console.error('Error serving success.html', err);
        res.status(500).json({ message: 'Error loading page' });
    }
});

// Provide restaurants from DB or fallback mock data
app.get('/api/restaurants', async (req, res) => {
    try{
        const [rows] = await pool.query(`SELECT id, name, description, address, open_time, close_time, images, lat, lng, category, rating, extra_info FROM restaurants`);
        const mapped = rows.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            address: r.address,
            open_time: r.open_time,
            close_time: r.close_time,
            images: (() => {
                if(!r.images) return [];
                try{ return typeof r.images === 'string' ? JSON.parse(r.images) : r.images; }catch(e){ return [] }
            })(),
            lat: r.lat,
            lng: r.lng,
            category: r.category,
            rating: r.rating,
            extra_info: r.extra_info
        }));
        return res.json(mapped);
    }catch(err){
        // If the restaurants table doesn't exist, return sensible mock data so the frontend still works
        if(err && err.code === 'ER_NO_SUCH_TABLE'){
            console.warn('restaurants table missing, returning mock data');
            const mock = [
                { id: 1, name: 'Ristorante La Baia', description: 'Cucina tipica locale con vista mare.', address: 'Via Marina, 1, Vico Equense', open_time: '12:00', close_time: '23:00', images: ['https://picsum.photos/seed/1/800/600'], lat: 40.6135, lng: 14.4031, category: 'Ristorante di pesce', rating: 4.6, extra_info: '' },
                { id: 2, name: 'Pizzeria da Gino', description: 'Pizza a legna tradizionale.', address: 'Piazza XX Settembre, 5, Vico Equense', open_time: '11:30', close_time: '23:30', images: ['https://picsum.photos/seed/2/800/600'], lat: 40.6120, lng: 14.4050, category: 'Pizzeria', rating: 4.3, extra_info: '' }
            ];
            return res.json(mock);
        }
        console.error('Error fetching restaurants', err);
        return res.status(500).json({ message: 'Errore fetching restaurants' });
    }
});

initDb().then(()=>{
    app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
}).catch(err=>{
    console.error('DB init failed', err);
    process.exit(1);
});
