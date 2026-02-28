const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'vehicles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for memory storage (for processing with sharp)
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

// @desc    Upload vehicle image with optional cropping
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

        // Parse crop data if provided
        let cropData = null;
        if (req.body.cropData) {
            try {
                cropData = JSON.parse(req.body.cropData);
            } catch (e) {
                // Ignore parsing errors, proceed without cropping
            }
        }

        // Generate unique filename
        const filename = `vehicle_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
        const outputPath = path.join(uploadDir, filename);

        // Process image with sharp
        let sharpInstance = sharp(req.file.buffer);

        // Apply crop if crop data is provided
        if (cropData && cropData.width && cropData.height) {
            sharpInstance = sharpInstance.extract({
                left: Math.round(cropData.x),
                top: Math.round(cropData.y),
                width: Math.round(cropData.width),
                height: Math.round(cropData.height)
            });
        }

        // Resize to reasonable dimensions and convert to WebP for optimization
        await sharpInstance
            .resize(800, 600, { 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .webp({ quality: 85 })
            .toFile(outputPath);

        // Return the URL path to access the image
        const imageUrl = `/uploads/vehicles/${filename}`;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: imageUrl,
                filename: filename
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

// @desc    Delete vehicle image
// @route   DELETE /api/upload/vehicle-image/:filename
// @access  Admin
const deleteVehicleImage = async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Validate filename to prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename'
            });
        }

        const filePath = path.join(uploadDir, filename);

        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

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
