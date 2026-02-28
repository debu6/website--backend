const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vehicle name is required'],
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['scooter', 'bike', 'car'],
        required: [true, 'Vehicle type is required']
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Price per day is required'],
        min: 0
    },
    image: {
        type: String,
        required: [true, 'Vehicle image is required']
    },
    thumbnails: [{
        type: String
    }],
    description: {
        type: String,
        trim: true
    },
    specs: {
        passengers: { type: Number, default: 2 },
        fuel: { type: String, default: 'Petrol' },
        transmission: { type: String, default: 'Manual' },
        location: { type: String, default: 'Kshetra Retreat' },
        mileage: { type: String },
        engine: { type: String }
    },
    features: [{
        type: String
    }],
    deposit: {
        type: Number,
        required: [true, 'Security deposit is required'],
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
