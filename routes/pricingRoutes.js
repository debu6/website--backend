const express = require('express');
const router = express.Router();
const {
  getAllPricing,
  upsertPricing,
  bulkUpsertPricing,
  deletePricing,
  seedPricing,
  getPartnerPricing,
  upsertPartnerPricing,
  bulkUpsertPartnerPricing,
  deletePartnerPricing,
  seedPartnerPricing,
} = require('../controllers/pricingController');

// Partner Pricing routes (must come before ID-based routes to avoid conflicts)
router.get('/partner', getPartnerPricing);
router.put('/partner', upsertPartnerPricing);
router.put('/partner/bulk', bulkUpsertPartnerPricing);
router.post('/partner/seed', seedPartnerPricing);
router.delete('/partner/:id', deletePartnerPricing);

// Regular Pricing routes
// Public route — frontend fetches pricing matrix
router.get('/', getAllPricing);

// Admin routes (admin auth is handled on frontend, same pattern as bookings)
router.put('/', upsertPricing);
router.put('/bulk', bulkUpsertPricing);
router.post('/seed', seedPricing);
router.delete('/:id', deletePricing);

module.exports = router;
