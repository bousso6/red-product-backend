const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const multer = require('multer');
const path = require('path');

// Configuration de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// GET - Récupérer tous les hôtels
router.get('/', async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.json(hotels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST - Créer un hôtel
router.post('/', upload.single('photo'), async (req, res) => {
    const hotel = new Hotel({
        nom: req.body.nom,
        adresse: req.body.adresse,
        email: req.body.email,
        telephone: req.body.telephone,
        prix: req.body.prix,
        devise: req.body.devise,
        photo: req.file ? `uploads/${req.file.filename}` : ''
    });
    try {
        const newHotel = await hotel.save();
        res.status(201).json(newHotel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT - Modifier un hôtel
router.put('/:id', upload.single('photo'), async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(hotel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE - Supprimer un hôtel
router.delete('/:id', async (req, res) => {
    try {
        await Hotel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Hôtel supprimé !' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;