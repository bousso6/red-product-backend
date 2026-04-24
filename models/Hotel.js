const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    prix: {
        type: Number,
        required: true
    },
    devise: {
        type: String,
        required: true
    },
    photo: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', HotelSchema);