const Vehicle = require('../models/Vehicle');

// @desc    Get all active vehicles
// @route   GET /api/vehicles
// @access  Public
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicles',
            error: error.message
        });
    }
};

// @desc    Get all vehicles (including inactive) for admin
// @route   GET /api/vehicles/admin/all
// @access  Admin
exports.getAllVehiclesAdmin = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicles',
            error: error.message
        });
    }
};

// @desc    Get single vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }
        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicle',
            error: error.message
        });
    }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Admin
exports.createVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: vehicle
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create vehicle',
            error: error.message
        });
    }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Admin
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: vehicle
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update vehicle',
            error: error.message
        });
    }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Admin
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete vehicle',
            error: error.message
        });
    }
};

// @desc    Seed default vehicles
// @route   POST /api/vehicles/seed
// @access  Admin
exports.seedVehicles = async (req, res) => {
    try {
        const defaultVehicles = [
            {
                name: "Honda Activa 6G",
                subtitle: "Honda Activa 6G (2023)",
                type: 'scooter',
                pricePerDay: 500,
                image: "/images/rent/activa_6g.png",
                thumbnails: ["/images/rent/activa_6g.png"],
                description: "The most reliable scooter for city commutes and short trips around Varkala.",
                specs: { passengers: 2, fuel: "Petrol", transmission: "Automatic", location: "Kshetra Retreat", mileage: "45 kmpl", engine: "110cc" },
                features: ["Easy to ride", "Storage space", "Reliable", "Lightweight"],
                deposit: 2000,
                isActive: true
            },
            {
                name: "Access 125",
                subtitle: "Suzuki Access 125 (2023)",
                type: 'scooter',
                pricePerDay: 800,
                image: "/images/rent/access_125.png",
                thumbnails: ["/images/rent/access_125.png"],
                description: "A powerful and comfortable scooter perfect for slightly longer rides with a pillion.",
                specs: { passengers: 2, fuel: "Petrol", transmission: "Automatic", location: "Kshetra Retreat", mileage: "40 kmpl", engine: "125cc" },
                features: ["Comfortable seating", "Good suspension", "Digital meter", "LED lights"],
                deposit: 2000,
                isActive: true
            },
            {
                name: "Royal Enfield Classic 350",
                subtitle: "Royal Enfield Classic 350 (2023)",
                type: 'bike',
                pricePerDay: 1200,
                image: "/images/rent/classic_350.png",
                thumbnails: ["/images/rent/classic_350.png"],
                description: "Experience the thrill of riding a classic motorcycle through Kerala's scenic routes.",
                specs: { passengers: 2, fuel: "Petrol", transmission: "Manual", location: "Kshetra Retreat Resort", mileage: "35 kmpl", engine: "349cc" },
                features: ["Powerful engine", "Comfortable for long rides", "Classic styling", "Good ground clearance", "Reliable performance"],
                deposit: 5000,
                isActive: true
            },
            {
                name: "Maruti Suzuki Swift",
                subtitle: "Maruti Suzuki Swift (2022)",
                type: 'car',
                pricePerDay: 2000,
                image: "/images/rent/swift.png",
                thumbnails: ["/images/rent/swift.png"],
                description: "A sporty hatchback that makes navigating Kerala's roads fun and easy.",
                specs: { passengers: 5, fuel: "Petrol/Diesel", transmission: "Manual/Auto", location: "Kshetra Retreat", mileage: "22 kmpl", engine: "1197cc" },
                features: ["AC", "Music System", "Power Windows", "Airbags"],
                deposit: 10000,
                isActive: true
            },
            {
                name: "Toyota Innova Crysta",
                subtitle: "Toyota Innova Crysta (2022)",
                type: 'car',
                pricePerDay: 3500,
                image: "/images/rent/innova.png",
                thumbnails: ["/images/rent/innova.png"],
                description: "The ultimate family car for comfortable long-distance travel across Kerala.",
                specs: { passengers: 7, fuel: "Diesel", transmission: "Manual", location: "Kshetra Retreat", mileage: "14 kmpl", engine: "2393cc" },
                features: ["Captain Seats", "Dual AC", "Spacious Boot", "Premium Interiors"],
                deposit: 15000,
                isActive: true
            }
        ];

        // Clear existing vehicles and insert defaults
        await Vehicle.deleteMany({});
        const vehicles = await Vehicle.insertMany(defaultVehicles);
        
        res.status(201).json({
            success: true,
            message: 'Default vehicles seeded successfully',
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to seed vehicles',
            error: error.message
        });
    }
};
