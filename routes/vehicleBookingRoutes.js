const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createOrder,
    verifyPayment,
    getAllBookings,
    getUserBookings,
    updateBookingStatus
} = require('../controllers/vehicleBookingController');

// Public routes (payment)
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

// Admin routes
router.get('/all', getAllBookings);
router.put('/:id/status', updateBookingStatus);

// Protected routes (logged in users)
router.get('/history', protect, getUserBookings);

module.exports = router;
