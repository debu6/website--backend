const mongoose = require('mongoose');

const ayurvedaBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    treatmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AyurvedaTreatment',
        required: true
    },
    treatmentName: {
        type: String,
        required: true
    },
    treatmentCategory: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    customerEmail: {
        type: String,
        required: [true, 'Customer email is required'],
        trim: true,
        lowercase: true
    },
    customerPhone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AyurvedaBooking', ayurvedaBookingSchema);
