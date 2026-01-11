const User = require('../models/User');
const logger = require('../utils/logger');

const activityMiddleware = async (req, res, next) => {
    try {
        // Only track authenticated users
        if (req.user && req.user._id) {
            // Create a function to update activity
            const updateActivity = async () => {
                try {
                    const now = new Date();
                    // Assuming req.user is a Mongoose document or at least has the fields
                    // If req.user is just a POJO from jwt decode, we might need to fetch or just update directly

                    // To minimize DB writes, we can check a local cache or relying on the 'lastActiveAt' timestamp 
                    // However, req.user from 'protect' middleware usually is the fresh User document (if using typical patterns)
                    // Let's check how req.user is populated. Assuming it's from authMiddleware.

                    if (req.user.lastActiveAt) {
                        const diff = now.getTime() - new Date(req.user.lastActiveAt).getTime();
                        // Update only if more than 1 minute has passed
                        if (diff < 60 * 1000) {
                            return;
                        }
                    }

                    await User.findByIdAndUpdate(req.user._id, { lastActiveAt: now });
                } catch (err) {
                    // Log but don't crash request
                    logger.error('Activity update error', err);
                }
            };

            // Execute without awaiting to not block the response
            updateActivity();
        }
    } catch (error) {
        // Middleware should not fail the request
        logger.error('Activity middleware wrapper error', error);
    }
    next();
};

module.exports = activityMiddleware;
