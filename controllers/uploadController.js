const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// @desc    Upload vehicle image to Cloudinary
// @route   POST /api/upload/vehicle-image
// @access  Admin
const uploadVehicleImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Convert buffer to base64
        const base64Image = req.file.buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'yoga-website/vehicles',
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto',
            width: 800,
            height: 600,
            crop: 'limit',
            public_id: `vehicle_${Date.now()}_${Math.random().toString(36).substring(7)}`
        });

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                filename: result.public_id
            }
        });

    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

// @desc    Delete vehicle image from Cloudinary
// @route   DELETE /api/upload/vehicle-image/:publicId
// @access  Admin
const deleteVehicleImage = async (req, res) => {
    try {
        const { publicId } = req.params;

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });

    } catch (error) {
        console.error('Image delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    uploadVehicleImage,
    deleteVehicleImage
};
