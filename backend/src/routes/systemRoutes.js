const express = require('express');
const { getSystemStats } = require('../controllers/systemController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Protected routes (Admin/Superadmin only)
router.use(authMiddleware);
router.use(roleMiddleware('admin', 'superadmin'));

router.get('/stats', getSystemStats);

module.exports = router;
