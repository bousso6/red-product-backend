const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Permet de rendre le dossier 'uploads' accessible publiquement pour voir les images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- CONFIGURATION DE STORAGE POUR MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Les images seront stockées dans le dossier 'uploads'
    },
    filename: (req, file, cb) => {
        // On donne un nom unique au fichier : date + nom d'origine
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- CONNEXION MONGODB ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/red-product')
    .then(() => console.log('✅ MongoDB connecté !'))
    .catch(err => console.error('❌ Erreur de connexion MongoDB:', err));

// --- MODÈLE DE DONNÉES ---
const HotelSchema = new mongoose.Schema({
    nom: String,
    adresse: String,
    email: String,
    telephone: String,
    prix: Number,
    devise: String,
    photo: String // Stockera le chemin de l'image (ex: "uploads/12345.jpg")
});
const Hotel = mongoose.model('Hotel', HotelSchema);

// --- ROUTES API ---

// 1. Récupérer tous les hôtels
app.get('/api/hotels', async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.json(hotels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Créer un nouvel hôtel (avec upload d'image)
// 'photo' ici doit correspondre au nom utilisé dans formData.append('photo', ...)
app.post('/api/hotels', upload.single('photo'), async (req, res) => {
    try {
        const newHotel = new Hotel({
            nom: req.body.nom,
            adresse: req.body.adresse,
            email: req.body.email,
            telephone: req.body.telephone,
            prix: req.body.prix,
            devise: req.body.devise,
            // On enregistre le chemin du fichier si une image a été envoyée
            photo: req.file ? req.file.path : 'uploads/default.jpg'
        });

        const savedHotel = await newHotel.save();
        res.status(201).json(savedHotel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

const authRoutes = require('./routes/auth');

// Ajoute cette ligne avec les autres routes
app.use('/api/auth', authRoutes);

const resetRoutes = require('./routes/reset');
app.use('/api/auth', resetRoutes);