const express = require('express');
const router = express.Router();
const {
    getAllTreatments,
    getAllTreatmentsAdmin,
    getTreatmentById,
    createTreatment,
    updateTreatment,
    deleteTreatment,
    seedTreatments
} = require('../controllers/ayurvedaController');

// Public routes
router.get('/', getAllTreatments);
router.get('/:id', getTreatmentById);

// Admin routes
router.get('/admin/all', getAllTreatmentsAdmin);
router.post('/', createTreatment);
router.put('/:id', updateTreatment);
router.delete('/:id', deleteTreatment);
router.post('/seed', seedTreatments);

module.exports = router;
