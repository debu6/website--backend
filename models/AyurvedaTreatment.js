const mongoose = require('mongoose');

const ayurvedaTreatmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Treatment name is required'],
        trim: true
    },
    category: {
        type: String,
        enum: ['Ayurvedic Massage', 'Spa Massage', 'Special Treatment', 'Combo Packages'],
        required: [true, 'Category is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: String,
        required: [true, 'Duration is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AyurvedaTreatment', ayurvedaTreatmentSchema);
