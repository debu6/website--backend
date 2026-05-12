const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getPartnerProfile,
    updatePartnerProfile,
} = require('../controllers/partnerController');
const partnerAuth = require('../middleware/partnerAuth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/:id', partnerAuth, getPartnerProfile);
router.put('/:id', partnerAuth, updatePartnerProfile);

module.exports = router;
