const express = require('express');
const router = express.Router();
const { upload, uploadVehicleImage, deleteVehicleImage } = require('../controllers/uploadController');

// Upload vehicle image with optional crop data
router.post('/vehicle-image', upload.single('image'), uploadVehicleImage);

// Delete vehicle image
router.delete('/vehicle-image/:filename', deleteVehicleImage);

module.exports = router;
