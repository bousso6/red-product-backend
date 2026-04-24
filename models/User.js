const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mot_de_passe: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

resetToken: { type: String }
resetTokenExpiry: { type: Date };