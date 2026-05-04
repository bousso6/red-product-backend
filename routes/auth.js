const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configurer nodemailer avec Brevo
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// REGISTER - Créer un compte
router.post('/register', async (req, res) => {
    try {
        const userExiste = await User.findOne({ email: req.body.email });
        if (userExiste) {
            return res.status(400).json({ message: 'Email déjà utilisé !' });
        }

        const salt = await bcrypt.genSalt(10);
        const motDePasseChiffre = await bcrypt.hash(req.body.mot_de_passe, salt);

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = new User({
            nom: req.body.nom,
            email: req.body.email,
            mot_de_passe: motDePasseChiffre,
            verificationToken: verificationToken,
            isVerified: false
        });

        await user.save();

        const verifyUrl = `https://bousso6.github.io/red-product-frontend/verify.html?token=${verificationToken}`;

        await transporter.sendMail({
            from: `RED PRODUCT <${process.env.BREVO_EMAIL}>`,
            to: user.email,
            subject: 'Activation de votre compte - RED PRODUCT',
            html: `
                <h2>Bienvenue sur RED PRODUCT !</h2>
                <p>Clique sur le lien ci-dessous pour activer ton compte :</p>
                <a href="${verifyUrl}">Activer mon compte</a>
                <p>Ce lien expire dans 24 heures.</p>
            `
        });

        res.status(201).json({ message: 'Compte créé ! Vérifiez votre email pour activer votre compte.' });

    } catch (err) {
        console.error('ERREUR REGISTER:', err);
        res.status(500).json({ message: err.message });
    }
});

// LOGIN - Se connecter
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect !' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Veuillez activer votre compte via l\'email envoyé !' });
        }

        const motDePasseValide = await bcrypt.compare(req.body.mot_de_passe, user.mot_de_passe);
        if (!motDePasseValide) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect !' });
        }

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

// VERIFY - Activer le compte
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ message: 'Token invalide !' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({ message: 'Compte activé avec succès !' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;