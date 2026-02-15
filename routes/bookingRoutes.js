const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getBookingHistory, getAllBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Admin route
router.get('/all', getAllBookings);

// Public routes (but should ideally be protected with JWT in production)
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

// Protected routes
router.get('/history', protect, getBookingHistory);

module.exports = router;
