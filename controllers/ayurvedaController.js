const AyurvedaTreatment = require('../models/AyurvedaTreatment');

// Default treatments data from the 4 categories
const defaultTreatments = [
    // Ayurvedic Massage
    { name: 'Abhyangam', category: 'Ayurvedic Massage', price: 1350, duration: '60 minutes' },
    { name: 'Aroma Therapy', category: 'Ayurvedic Massage', price: 2250, duration: '60 minutes' },
    { name: 'Deep Tissue Massage', category: 'Ayurvedic Massage', price: 1799, duration: '60 minutes' },
    { name: 'Marma Massage (45 min)', category: 'Ayurvedic Massage', price: 1799, duration: '45 minutes' },
    { name: 'Marma Massage (90 min)', category: 'Ayurvedic Massage', price: 2599, duration: '90 minutes' },
    { name: 'Head Massage', category: 'Ayurvedic Massage', price: 720, duration: '25 minutes' },
    { name: 'Face Massage', category: 'Ayurvedic Massage', price: 720, duration: '25 minutes' },
    { name: 'Foot Massage', category: 'Ayurvedic Massage', price: 720, duration: '25 minutes' },
    { name: 'Back Massage', category: 'Ayurvedic Massage', price: 720, duration: '25 minutes' },
    { name: 'Neck and Shoulder Massage', category: 'Ayurvedic Massage', price: 720, duration: '25 minutes' },
    { name: 'Neck and Back Massage', category: 'Ayurvedic Massage', price: 1080, duration: '30 minutes' },
    { name: 'Head Neck and Back Massage', category: 'Ayurvedic Massage', price: 1350, duration: '45 minutes' },

    // Spa Massage
    { name: 'Rejuvenation Therapy', category: 'Spa Massage', price: 2250, duration: '60 minutes' },
    { name: 'Body Spa (Massage and Scrub)', category: 'Spa Massage', price: 4499, duration: '90 minutes' },
    { name: 'Body Massage + Scrub + Pack', category: 'Spa Massage', price: 7199, duration: '150 minutes' },

    // Special Treatment
    { name: 'Shirodhara', category: 'Special Treatment', price: 1350, duration: '60 minutes' },
    { name: 'Udwartanam', category: 'Special Treatment', price: 1350, duration: '60 minutes' },
    { name: 'Podikizhi', category: 'Special Treatment', price: 1350, duration: '60 minutes' },
    { name: 'Elakizhi', category: 'Special Treatment', price: 1350, duration: '60 minutes' },
    { name: 'Naranga Kizhi', category: 'Special Treatment', price: 1350, duration: '60 minutes' },
    { name: 'Njavarakizhi', category: 'Special Treatment', price: 1799, duration: '60 minutes' },
    { name: 'Pizhichil', category: 'Special Treatment', price: 1799, duration: '60 minutes' },
    { name: 'Kativasti', category: 'Special Treatment', price: 899, duration: '30 minutes' },
    { name: 'Greevavasthi', category: 'Special Treatment', price: 899, duration: '30 minutes' },
    { name: 'Januvasthi', category: 'Special Treatment', price: 899, duration: '30 minutes' },
    { name: 'Meruvasthi', category: 'Special Treatment', price: 1350, duration: '30 minutes' },
    { name: 'Kati Pitchu', category: 'Special Treatment', price: 1080, duration: '30 minutes' },
    { name: 'Takradhara', category: 'Special Treatment', price: 1350, duration: '45 minutes' },
    { name: 'Ksheera Dhara', category: 'Special Treatment', price: 1350, duration: '45 minutes' },
    { name: 'Kashaya Dhara', category: 'Special Treatment', price: 1350, duration: '45 minutes' },
    { name: 'Dhanyamla Dhara', category: 'Special Treatment', price: 1799, duration: '60 minutes' },
    { name: 'Tharpanam', category: 'Special Treatment', price: 720, duration: '15 minutes' },
    { name: 'Karnapooranam', category: 'Special Treatment', price: 799, duration: '30 minutes' },
    { name: 'Shirovasthi', category: 'Special Treatment', price: 899, duration: '30 minutes' },
    { name: 'Nasyam', category: 'Special Treatment', price: 799, duration: '30 minutes' },

    // Combo Packages
    { name: 'Abhyangam & Steam Bath', category: 'Combo Packages', price: 1620, duration: '75 minutes' },
    { name: 'Udwartanam & Steam Bath', category: 'Combo Packages', price: 1699, duration: '75 minutes' },
    { name: 'Abhyanga & Shirodhara', category: 'Combo Packages', price: 2699, duration: '90 minutes' },
    { name: 'Local Massage & Local Podikizhi', category: 'Combo Packages', price: 1520, duration: '60 minutes' },
    { name: 'Back Massage, Local Podikizhi & Kativasti/Lepanam', category: 'Combo Packages', price: 2375, duration: '90 minutes' },
    { name: 'Abhyanga & Podikizhi', category: 'Combo Packages', price: 2375, duration: '120 minutes' },
];

// @desc    Get all active treatments (public)
// @route   GET /api/ayurveda/treatments
// @access  Public
exports.getAllTreatments = async (req, res) => {
    try {
        const treatments = await AyurvedaTreatment.find({ isActive: true }).sort({ category: 1, price: 1 });
        
        // Group by category
        const grouped = {};
        treatments.forEach(t => {
            if (!grouped[t.category]) grouped[t.category] = [];
            grouped[t.category].push(t);
        });

        res.status(200).json({
            success: true,
            data: treatments,
            grouped
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch treatments', error: error.message });
    }
};

// @desc    Get all treatments including inactive (admin)
// @route   GET /api/ayurveda/treatments/admin/all
// @access  Admin
exports.getAllTreatmentsAdmin = async (req, res) => {
    try {
        const treatments = await AyurvedaTreatment.find().sort({ category: 1, createdAt: -1 });
        res.status(200).json({ success: true, data: treatments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch treatments', error: error.message });
    }
};

// @desc    Get single treatment
// @route   GET /api/ayurveda/treatments/:id
// @access  Public
exports.getTreatmentById = async (req, res) => {
    try {
        const treatment = await AyurvedaTreatment.findById(req.params.id);
        if (!treatment) {
            return res.status(404).json({ success: false, message: 'Treatment not found' });
        }
        res.status(200).json({ success: true, data: treatment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch treatment', error: error.message });
    }
};

// @desc    Create treatment (admin)
// @route   POST /api/ayurveda/treatments
// @access  Admin
exports.createTreatment = async (req, res) => {
    try {
        const { name, category, price, duration, description, image } = req.body;

        if (!name || !category || !price || !duration) {
            return res.status(400).json({ success: false, message: 'Name, category, price, and duration are required' });
        }

        const treatment = await AyurvedaTreatment.create({ name, category, price, duration, description, image });
        res.status(201).json({ success: true, data: treatment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create treatment', error: error.message });
    }
};

// @desc    Update treatment (admin)
// @route   PUT /api/ayurveda/treatments/:id
// @access  Admin
exports.updateTreatment = async (req, res) => {
    try {
        const treatment = await AyurvedaTreatment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!treatment) {
            return res.status(404).json({ success: false, message: 'Treatment not found' });
        }
        res.status(200).json({ success: true, data: treatment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update treatment', error: error.message });
    }
};

// @desc    Delete treatment (admin)
// @route   DELETE /api/ayurveda/treatments/:id
// @access  Admin
exports.deleteTreatment = async (req, res) => {
    try {
        const treatment = await AyurvedaTreatment.findByIdAndDelete(req.params.id);
        if (!treatment) {
            return res.status(404).json({ success: false, message: 'Treatment not found' });
        }
        res.status(200).json({ success: true, message: 'Treatment deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete treatment', error: error.message });
    }
};

// @desc    Seed default treatments
// @route   POST /api/ayurveda/treatments/seed
// @access  Admin
exports.seedTreatments = async (req, res) => {
    try {
        await AyurvedaTreatment.deleteMany({});
        const treatments = await AyurvedaTreatment.insertMany(defaultTreatments);
        res.status(201).json({
            success: true,
            message: `Seeded ${treatments.length} treatments`,
            data: treatments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to seed treatments', error: error.message });
    }
};
