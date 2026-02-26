const express = require('express');
const router = express.Router();
const {
  getAllPricing,
  upsertPricing,
  bulkUpsertPricing,
  deletePricing,
  seedPricing,
} = require('../controllers/pricingController');

// Public route — frontend fetches pricing matrix
router.get('/', getAllPricing);

// Admin routes (admin auth is handled on frontend, same pattern as bookings)
router.put('/', upsertPricing);
router.put('/bulk', bulkUpsertPricing);
router.delete('/:id', deletePricing);
router.post('/seed', seedPricing);

module.exports = router;
