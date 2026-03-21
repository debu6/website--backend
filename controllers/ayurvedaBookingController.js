const AyurvedaBooking = require('../models/AyurvedaBooking');
const AyurvedaTreatment = require('../models/AyurvedaTreatment');
const axios = require('axios');
const crypto = require('crypto');

// @desc    Create Razorpay order for ayurveda booking
// @route   POST /api/ayurveda-bookings/create-order
// @access  Public
exports.createOrder = async (req, res) => {
    try {
        const { treatmentId, price, customerName, customerEmail } = req.body;

        if (!treatmentId || !price) {
            return res.status(400).json({ success: false, message: 'Treatment ID and price are required' });
        }

        const amount = parseFloat(price);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Price must be a positive number' });
        }

        const treatment = await AyurvedaTreatment.findById(treatmentId);
        if (!treatment) {
            return res.status(404).json({ success: false, message: 'Treatment not found' });
        }

        const orderResponse = await axios.post(
            'https://api.razorpay.com/v1/orders',
            {
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: `ayu_${Date.now()}`,
                notes: {
                    treatmentId: treatmentId,
                    treatmentName: treatment.name,
                    customerName: customerName || '',
                    customerEmail: customerEmail || ''
                }
            },
            {
                auth: {
                    username: process.env.RAZORPAY_KEY_ID,
                    password: process.env.RAZORPAY_KEY_SECRET
                }
            }
        );

        res.status(200).json({
            success: true,
            orderId: orderResponse.data.id,
            amount: orderResponse.data.amount,
            currency: orderResponse.data.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.response?.data?.error?.description || error.message
        });
    }
};

// @desc    Verify payment and create booking
// @route   POST /api/ayurveda-bookings/verify-payment
// @access  Public
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingData } = req.body;

        // Verify signature
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', razorpayKeySecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // Verify payment status with Razorpay
        const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
        const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

        const paymentResponse = await axios.get(
            `https://api.razorpay.com/v1/payments/${razorpayPaymentId}`,
            { headers: { 'Authorization': `Basic ${auth}` } }
        );

        if (paymentResponse.data.status !== 'captured') {
            return res.status(400).json({ success: false, message: 'Payment not captured' });
        }

        // Get treatment details
        const treatment = await AyurvedaTreatment.findById(bookingData.treatmentId);
        if (!treatment) {
            return res.status(404).json({ success: false, message: 'Treatment not found' });
        }

        // Create booking record
        const booking = await AyurvedaBooking.create({
            userId: bookingData.userId || null,
            treatmentId: bookingData.treatmentId,
            treatmentName: treatment.name,
            treatmentCategory: treatment.category,
            customerName: bookingData.customerName,
            customerEmail: bookingData.customerEmail,
            customerPhone: bookingData.customerPhone,
            appointmentDate: bookingData.appointmentDate,
            price: bookingData.price,
            duration: treatment.duration,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            bookingStatus: 'confirmed'
        });

        res.status(201).json({
            success: true,
            message: 'Booking confirmed successfully',
            data: booking
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
    }
};

// @desc    Get all ayurveda bookings (Admin)
// @route   GET /api/ayurveda-bookings/all
// @access  Admin
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await AyurvedaBooking.find()
            .populate('treatmentId', 'name category price duration')
            .sort({ createdAt: -1 });

        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter(b => b.bookingStatus === 'confirmed').length;
        const totalRevenue = bookings
            .filter(b => b.bookingStatus === 'confirmed')
            .reduce((sum, b) => sum + b.price, 0);

        res.status(200).json({
            success: true,
            stats: { totalBookings, confirmedBookings, totalRevenue },
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
    }
};

// @desc    Get user's ayurveda bookings
// @route   GET /api/ayurveda-bookings/history
// @access  Protected
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await AyurvedaBooking.find({
            $or: [
                { userId: req.user.id },
                { customerEmail: req.user.email }
            ]
        })
            .populate('treatmentId', 'name category price duration')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch booking history', error: error.message });
    }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/ayurveda-bookings/:id/status
// @access  Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const booking = await AyurvedaBooking.findByIdAndUpdate(
            req.params.id,
            { bookingStatus: status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update booking status', error: error.message });
    }
};
