const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      lowercase: true,
    },
    category: {
      type: String,
      enum: ['single', 'double', 'dormitory'],
      required: [true, 'Please select a room category'],
    },
    days: {
      type: Number,
      enum: [7, 15],
      required: [true, 'Please select number of days'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide the price'],
    },
    razorpayOrderId: {
      type: String,
      required: [true, 'Razorpay Order ID is required'],
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      required: [true, 'Razorpay Payment ID is required'],
      unique: true,
    },
    razorpaySignature: {
      type: String,
      required: [true, 'Razorpay Signature is required'],
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
