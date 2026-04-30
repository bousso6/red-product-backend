const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configurer nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// POST - Mot de passe oublié
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'Email non trouvé !' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000;
        await user.save({ validateBeforeSave: false });

        const resetUrl = `https://bousso6.github.io/red-product-frontend/reset-password.html?token=${resetToken}`;
        
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Réinitialisation de mot de passe - RED PRODUCT',
            html: `
                <h2>Réinitialisation de mot de passe</h2>
                <p>Clique sur le lien ci-dessous pour réinitialiser ton mot de passe :</p>
                <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
                <p>Ce lien expire dans 1 heure.</p>
            `
        });

        res.json({ message: 'Email envoyé avec succès !' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST - Réinitialiser le mot de passe
router.post('/reset-password', async (req, res) => {
    try {
        const user = await User.findOne({
            resetToken: req.body.token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token invalide ou expiré !' });
        }

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.mot_de_passe = await bcrypt.hash(req.body.mot_de_passe, salt);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({ message: 'Mot de passe réinitialisé avec succès !' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'Email non trouvé !' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000;
        await user.save({ validateBeforeSave: false });

        const resetUrl = `https://bousso6.github.io/red-product-frontend/reset-password.html?token=${resetToken}`;
        
        console.log('Tentative envoi email à:', user.email);
        console.log('EMAIL config:', process.env.EMAIL);
        
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Réinitialisation de mot de passe - RED PRODUCT',
            html: `
                <h2>Réinitialisation de mot de passe</h2>
                <p>Clique sur le lien ci-dessous pour réinitialiser ton mot de passe :</p>
                <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
                <p>Ce lien expire dans 1 heure.</p>
            `
        });

        res.json({ message: 'Email envoyé avec succès !' });

    } catch (err) {
        console.error('ERREUR:', err);
        res.status(500).json({ message: err.message });
    }
});