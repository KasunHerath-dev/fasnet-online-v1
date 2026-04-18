const Notification = require('../models/Notification');
const { sendToUser } = require('../socket');

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Create a notification for a single user.
 * Can be called internally by other controllers.
 */
const createNotification = async ({ recipient, type, title, body, link = null, refModel = null, refId = null }) => {
    const notification = await Notification.create({ recipient, type, title, body, link, refModel, refId });
    
    // Real-time emission
    sendToUser(recipient, 'newNotification', notification);
    
    return notification;
};

// ── Controllers ────────────────────────────────────────────────────────────────

// @desc    Get all notifications for the logged-in user
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false,
        });

        res.status(200).json({ success: true, data: notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
exports.markRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }
        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
    }
};

// @desc    Mark all notifications as read for logged-in user
// @route   PATCH /api/v1/notifications/mark-all-read
// @access  Private
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
        res.status(200).json({ success: true, message: 'Notification deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete notification.' });
    }
};

// ── Internal helper exported for use in other controllers ──────────────────────
exports.createNotification = createNotification;
