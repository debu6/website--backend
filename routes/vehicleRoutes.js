const express = require('express');
const router = express.Router();
const {
    getAllVehicles,
    getAllVehiclesAdmin,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    seedVehicles
} = require('../controllers/vehicleController');

// Public routes
router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

// Admin routes
router.get('/admin/all', getAllVehiclesAdmin);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);
router.post('/seed', seedVehicles);

module.exports = router;
