const VehicleBooking = require('../models/VehicleBooking');
const Vehicle = require('../models/Vehicle');
const axios = require('axios');
const crypto = require('crypto');

// @desc    Create Razorpay order for vehicle booking
// @route   POST /api/vehicle-bookings/create-order
// @access  Public
exports.createOrder = async (req, res) => {
    try {
        const { vehicleId, totalPrice, customerName, customerEmail } = req.body;

        // Validate required fields
        if (!vehicleId || !totalPrice) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle ID and total price are required'
            });
        }

        // Validate totalPrice is a positive number
        const amount = parseFloat(totalPrice);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Total price must be a positive number'
            });
        }

        // Validate vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Create Razorpay order (using same pattern as bookingController)
        const orderResponse = await axios.post(
            'https://api.razorpay.com/v1/orders',
            {
                amount: Math.round(amount * 100), // Convert to paise
                currency: 'INR',
                receipt: `veh_${Date.now()}`,
                notes: {
                    vehicleId: vehicleId,
                    vehicleName: vehicle.name,
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
// @route   POST /api/vehicle-bookings/verify-payment
// @access  Public
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            bookingData
        } = req.body;

        // Verify signature
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', razorpayKeySecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Verify payment status with Razorpay
        const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
        const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

        const paymentResponse = await axios.get(
            `https://api.razorpay.com/v1/payments/${razorpayPaymentId}`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            }
        );

        if (paymentResponse.data.status !== 'captured') {
            return res.status(400).json({
                success: false,
                message: 'Payment not captured'
            });
        }

        // Get vehicle details
        const vehicle = await Vehicle.findById(bookingData.vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Create booking record
        const booking = await VehicleBooking.create({
            userId: bookingData.userId || null,
            vehicleId: bookingData.vehicleId,
            vehicleName: vehicle.name,
            customerName: bookingData.customerName,
            customerEmail: bookingData.customerEmail,
            customerPhone: bookingData.customerPhone,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            totalDays: bookingData.totalDays,
            pricePerDay: vehicle.pricePerDay,
            totalPrice: bookingData.totalPrice,
            deposit: vehicle.deposit,
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
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message
        });
    }
};

// @desc    Get all vehicle bookings (Admin)
// @route   GET /api/vehicle-bookings/all
// @access  Admin
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await VehicleBooking.find()
            .populate('vehicleId', 'name type image')
            .sort({ createdAt: -1 });
        
        // Calculate stats
        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter(b => b.bookingStatus === 'confirmed').length;
        const totalRevenue = bookings
            .filter(b => b.bookingStatus === 'confirmed')
            .reduce((sum, b) => sum + b.totalPrice, 0);

        res.status(200).json({
            success: true,
            stats: {
                totalBookings,
                confirmedBookings,
                totalRevenue
            },
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};

// @desc    Get user's vehicle bookings
// @route   GET /api/vehicle-bookings/history
// @access  Protected
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await VehicleBooking.find({ userId: req.user.id })
            .populate('vehicleId', 'name type image')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking history',
            error: error.message
        });
    }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/vehicle-bookings/:id/status
// @access  Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const booking = await VehicleBooking.findByIdAndUpdate(
            req.params.id,
            { bookingStatus: status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking status updated',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status',
            error: error.message
        });
    }
};
