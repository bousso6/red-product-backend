const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER - Créer un compte
router.post('/register', async (req, res) => {
    try {
        // Vérifier si l'email existe déjà
        const userExiste = await User.findOne({ email: req.body.email });
        if (userExiste) {
            return res.status(400).json({ message: 'Email déjà utilisé !' });
        }

        // Chiffrer le mot de passe
        const salt = await bcrypt.genSalt(10);
        const motDePasseChiffre = await bcrypt.hash(req.body.mot_de_passe, salt);

        // Créer l'utilisateur
        const user = new User({
            nom: req.body.nom,
            email: req.body.email,
            mot_de_passe: motDePasseChiffre
        });

        const newUser = await user.save();
        res.status(201).json({ message: 'Compte créé avec succès !' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN - Se connecter
router.post('/login', async (req, res) => {
    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect !' });
        }

        // Vérifier le mot de passe
        const motDePasseValide = await bcrypt.compare(req.body.mot_de_passe, user.mot_de_passe);
        if (!motDePasseValide) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect !' });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { id: user._id, nom: user.nom },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, nom: user.nom, message: 'Connexion réussie !' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;