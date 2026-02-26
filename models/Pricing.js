const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['single', 'double', 'dormitory'],
      required: [true, 'Please provide a room category'],
    },
    days: {
      type: Number,
      required: [true, 'Please provide number of days'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique combination of category + days
pricingSchema.index({ category: 1, days: 1 }, { unique: true });

module.exports = mongoose.model('Pricing', pricingSchema);
