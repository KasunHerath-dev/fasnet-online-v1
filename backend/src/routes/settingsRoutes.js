const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Public route to get site logo
router.get('/logo', settingsController.getLogo);

module.exports = router;
