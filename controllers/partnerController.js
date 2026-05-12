const Partner = require('../models/Partner');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (partnerId) => {
    return jwt.sign({ id: partnerId, type: 'partner' }, process.env.JWT_SECRET || 'your_secret_key', {
        expiresIn: '7d',
    });
};

// @route   POST /api/partners/register
// @desc    Register a new partner
// @access  Public
exports.register = async (req, res) => {
    try {
        const { companyName, contactPersonName, email, phone, address, password, hasGST, gst } = req.body;

        // Validate required fields
        if (!companyName || !contactPersonName || !email || !phone || !address || !password) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided',
                errors: [{ msg: 'Missing required fields' }],
            });
        }

        // Check if partner already exists
        const existingPartner = await Partner.findOne({ email });
        if (existingPartner) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
                errors: [{ msg: 'A partner with this email already exists' }],
            });
        }

        // Validate GST if provided
        if (hasGST && gst) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
            if (!gstRegex.test(gst.replace(/\s+/g, ''))) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid GST format',
                    errors: [{ msg: 'GST must be in format: XX AAAA XXXX XXXX X' }],
                });
            }
        }

        // Create new partner
        const partner = await Partner.create({
            companyName,
            contactPersonName,
            email: email.toLowerCase(),
            phone,
            address,
            password,
            hasGST: hasGST || false,
            gst: hasGST ? gst : null,
        });

        // Generate token
        const token = generateToken(partner._id);

        // Remove password from response
        const partnerData = partner.toObject();
        delete partnerData.password;

        return res.status(201).json({
            success: true,
            message: 'Partner registered successfully',
            token,
            user: {
                id: partner._id,
                type: 'partner',
                companyName: partner.companyName,
                contactPersonName: partner.contactPersonName,
                email: partner.email,
                phone: partner.phone,
            },
        });
    } catch (error) {
        console.error('Partner registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message,
        });
    }
};

// @route   POST /api/partners/login
// @desc    Login a partner
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
                errors: [{ msg: 'Email and password must be provided' }],
            });
        }

        // Find partner and select password field
        const partner = await Partner.findOne({ email: email.toLowerCase() }).select('+password');

        if (!partner) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                errors: [{ msg: 'No partner found with this email' }],
            });
        }

        // Check if partner account is active
        if (!partner.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated',
                errors: [{ msg: 'Account is inactive' }],
            });
        }

        // Check password
        const isPasswordMatch = await partner.matchPassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                errors: [{ msg: 'Password does not match' }],
            });
        }

        // Generate token
        const token = generateToken(partner._id);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: partner._id,
                type: 'partner',
                companyName: partner.companyName,
                contactPersonName: partner.contactPersonName,
                email: partner.email,
                phone: partner.phone,
            },
        });
    } catch (error) {
        console.error('Partner login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message,
        });
    }
};

// @route   GET /api/partners/:id
// @desc    Get partner profile
// @access  Private
exports.getPartnerProfile = async (req, res) => {
    try {
        // Ensure partner can only access their own profile
        if (req.partnerId !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this partner profile',
            });
        }

        const partner = await Partner.findById(req.params.id).select('-password');

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: partner,
        });
    } catch (error) {
        console.error('Get partner profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch partner profile',
            error: error.message,
        });
    }
};

// @route   PUT /api/partners/:id
// @desc    Update partner profile
// @access  Private
exports.updatePartnerProfile = async (req, res) => {
    try {
        // Ensure partner can only update their own profile
        if (req.partnerId !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this partner profile',
            });
        }

        const { companyName, phone, address, bankDetails, hasGST, gst } = req.body;

        const partner = await Partner.findByIdAndUpdate(
            req.params.id,
            {
                companyName,
                phone,
                address,
                bankDetails,
                hasGST,
                gst: hasGST ? gst : null,
                updatedAt: Date.now(),
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: partner,
        });
    } catch (error) {
        console.error('Update partner profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message,
        });
    }
};
