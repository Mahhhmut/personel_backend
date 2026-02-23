const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db'); // Az önce oluşturduğumuz db.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware (Ara katmanlar)
app.use(cors()); // Flutter'ın erişimine izin ver
app.use(express.json()); // JSON formatındaki verileri oku

app.get('/', (req, res) => {
    res.send('Personel Takip API Çalışıyor! 🚀');
});

// Kayıt Olma (Register)
app.post('/register', async (req, res) => {
    const { full_name, email, password, role } = req.body;

    try {
        // Şifreyi şifrele (Güvenlik için)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Veri tabanına ekle
        const [result] = await db.execute(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role || 'employee']
        );

        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu!', userId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Kayıt sırasında hata oluştu: ' + err.message });
    }
});

// Giriş Yapma (Login)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kullanıcıyı bul
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'E-posta veya şifre hatalı!' });
        }

        const user = users[0];

        // Şifre kontrolü
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'E-posta veya şifre hatalı!' });
        }

        // JWT Token oluştur (Kullanıcıya verilen dijital kimlik)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET, // .env dosyasındaki gizli anahtar
            { expiresIn: '1d' } // 1 gün geçerli
        );

        res.json({
            message: 'Giriş başarılı!',
            token,
            user: { id: user.id, full_name: user.full_name, role: user.role }
        });

    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası!' });
    }
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
// '0.0.0.0' ekleyerek sunucunun dış dünyadan (IP üzerinden) gelen isteklere kapısını açıyoruz.
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sunucu dış bağlantılara açıldı: http://192.168.1.4:${PORT}`);
});