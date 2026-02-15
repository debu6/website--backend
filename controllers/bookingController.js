const Booking = require('../models/Booking');
const User = require('../models/User');
const axios = require('axios');
const crypto = require('crypto');

// Initialize Razorpay API base URL
const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

// Helper function to verify Razorpay payment
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

// @route   POST /api/bookings/create-order
// @desc    Create a Razorpay order
// @access  Private (User must be authenticated via token)
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency, email, name } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ success: false, message: 'Amount and currency are required' });
    }

    // Create order via Razorpay API
    const orderResponse = await axios.post(
      `${RAZORPAY_API_BASE}/orders`,
      {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          email,
          name,
        },
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );

    res.status(201).json({
      success: true,
      orderId: orderResponse.data.id,
      amount: orderResponse.data.amount / 100, // Convert back to rupees
      currency: orderResponse.data.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// @route   POST /api/bookings/verify-payment
// @desc    Verify Razorpay payment and create booking
// @access  Private (User must be authenticated)
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingData } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // Verify signature
    const isValidSignature = verifyRazorpaySignature(orderId, paymentId, signature);

    if (!isValidSignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Verify payment with Razorpay API
    try {
      const paymentResponse = await axios.get(
        `${RAZORPAY_API_BASE}/payments/${paymentId}`,
        {
          auth: {
            username: process.env.RAZORPAY_KEY_ID,
            password: process.env.RAZORPAY_KEY_SECRET,
          },
        }
      );

      if (paymentResponse.data.status !== 'captured') {
        return res.status(400).json({ success: false, message: 'Payment not captured' });
      }
    } catch (err) {
      console.error('Error verifying payment with Razorpay:', err.message);
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Find user by email
    const user = await User.findOne({ email: bookingData.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create booking
    const booking = new Booking({
      userId: user._id,
      name: bookingData.name,
      email: bookingData.email,
      category: bookingData.category,
      days: bookingData.days,
      startDate: new Date(bookingData.startDate),
      endDate: new Date(bookingData.endDate),
      price: bookingData.price,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      bookingStatus: 'confirmed',
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking: {
        id: booking._id,
        name: booking.name,
        email: booking.email,
        category: booking.category,
        days: booking.days,
        startDate: booking.startDate,
        endDate: booking.endDate,
        price: booking.price,
        bookingStatus: booking.bookingStatus,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    res.status(500).json({ success: false, message: 'Payment verification error' });
  }
};

// @route   GET /api/bookings/all
// @desc    Get all bookings (Admin)
// @access  Public (admin auth is handled on frontend)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

// @route   GET /api/bookings/history
// @desc    Get user's booking history
// @access  Private (User must be authenticated)
exports.getBookingHistory = async (req, res) => {
  try {
    // Get userId from authentication middleware (you'll need to add auth middleware)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching booking history:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch booking history' });
  }
};
