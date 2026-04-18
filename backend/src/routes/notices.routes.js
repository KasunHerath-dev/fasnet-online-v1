const express = require('express');
const router = express.Router();
const noticesController = require('../controllers/noticesController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const adminAuth = [authMiddleware, roleMiddleware('admin', 'superadmin')];

// ── Scraper management (static routes MUST come before /:id) ──
router.get('/settings', ...adminAuth, noticesController.getScraperSettings);
router.put('/settings', ...adminAuth, noticesController.updateScraperSettings);
router.post('/scrape', ...adminAuth, noticesController.triggerScrape);

// ── Notice management ──
router.patch('/:id/publish', ...adminAuth, noticesController.publishNotice);
router.patch('/:id/unpublish', ...adminAuth, noticesController.unpublishNotice);
router.delete('/:id', ...adminAuth, noticesController.deleteNotice);
router.delete('/', ...adminAuth, noticesController.deleteAllNotices);

// ── Public / Student (authenticated) ──
router.get('/', authMiddleware, noticesController.getNotices);

module.exports = router;
