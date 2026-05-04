const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// --- ✅ CORS CONFIGURATION (IMPORTANT) ---
app.use(cors({
    origin: "https://bousso6.github.io",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// --- MIDDLEWARES ---
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- CONFIGURATION DE STORAGE POUR MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- CONNEXION MONGODB ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/red-product')
    .then(() => console.log('✅ MongoDB connecté !'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

// --- MODÈLE ---
const HotelSchema = new mongoose.Schema({
    nom: String,
    adresse: String,
    email: String,
    telephone: String,
    prix: Number,
    devise: String,
    photo: String
});
const Hotel = mongoose.model('Hotel', HotelSchema);

// --- ROUTES ---
app.get('/api/hotels', async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.json(hotels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/hotels', upload.single('photo'), async (req, res) => {
    try {
        const newHotel = new Hotel({
            nom: req.body.nom,
            adresse: req.body.adresse,
            email: req.body.email,
            telephone: req.body.telephone,
            prix: req.body.prix,
            devise: req.body.devise,
            photo: req.file ? req.file.path : 'uploads/default.jpg'
        });

        const savedHotel = await newHotel.save();
        res.status(201).json(savedHotel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- ROUTES AUTH ---
const authRoutes = require('./routes/auth');
const resetRoutes = require('./routes/reset');

app.use('/api/auth', authRoutes);
app.use('/api/auth', resetRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});