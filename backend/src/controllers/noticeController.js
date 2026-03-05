const Notice = require('../models/Notice');
const logger = require('../utils/logger');

// @desc    Get all active notices
// @route   GET /api/v1/notices
// @access  Private (Students/Admins)
exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(20);

        // Map `_id` to `id` to match existing frontend expectations
        const formattedNotices = notices.map(n => ({
            id: n._id.toString(),
            title: n.title,
            subtext: n.subtext,
            type: n.type,
            date: n.date,
            createdAt: n.createdAt
        }));

        res.status(200).json({ success: true, data: formattedNotices });
    } catch (err) {
        logger.error('Failed to get notices', { error: err.message });
        res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
    }
};

// @desc    Create a new notice (called by bot or admin)
// @route   POST /api/v1/notices
// @access  Public (Protected by bot secret) or Private (Admin)
exports.createNotice = async (req, res) => {
    try {
        const { title, subtext, type, date, botSecret } = req.body;

        // Basic protection for bot webhook (configurable via env later)
        if (botSecret && botSecret !== (process.env.BOT_SECRET || 'fasnet-bot-secret-123')) {
            return res.status(401).json({ success: false, message: 'Invalid bot secret' });
        }

        // Alternative: Admins can create if logged in via `req.user`
        if (!botSecret && (!req.user || !req.user.roles.includes('admin'))) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const notice = await Notice.create({
            title,
            subtext: subtext || '',
            type: type || 'default',
            date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });

        res.status(201).json({ success: true, data: notice });
    } catch (err) {
        logger.error('Failed to create notice', { error: err.message });
        res.status(500).json({ success: false, message: 'Failed to create notice.' });
    }
};
