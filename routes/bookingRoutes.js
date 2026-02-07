const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getBookingHistory } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Public routes (but should ideally be protected with JWT in production)
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

// Protected routes
router.get('/history', protect, getBookingHistory);

module.exports = router;
