const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db'); // Az önce oluşturduğumuz db.js

const app = express();

// Middleware (Ara katmanlar)
app.use(cors()); // Flutter'ın erişimine izin ver
app.use(express.json()); // JSON formatındaki verileri oku

// Test Rotası (Tarayıcıdan kontrol etmek için)
app.get('/', (req, res) => {
    res.send('Personel Takip API Çalışıyor! 🚀');
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde ayaklandı.`);
});