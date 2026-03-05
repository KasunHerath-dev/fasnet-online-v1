const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    getNotifications,
    markRead,
    markAllRead,
    deleteNotification,
} = require('../controllers/notificationController');

router.use(authMiddleware); // all notifications routes require auth

router.get('/', getNotifications);
router.patch('/mark-all-read', markAllRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteNotification);

module.exports = router;
