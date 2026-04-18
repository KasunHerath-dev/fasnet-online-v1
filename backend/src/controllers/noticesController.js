const Notice = require('../models/Notice');
const SystemSetting = require('../models/SystemSetting');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { spawn } = require('child_process');
const path = require('path');
const { createNotification } = require('./notificationController');
const logger = require('../utils/logger');

// @desc    Get notices (published for students, all for admins)
// @route   GET /api/v1/notices
exports.getNotices = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = {};

        // If not admin, only show published
        if (!req.user || !req.user.roles.includes('admin')) {
            query.status = 'published';
            query.isActive = true;
        } else if (status) {
            query.status = status;
        }

        const notices = await Notice.find(query)
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Notice.countDocuments(query);

        res.status(200).json({
            success: true,
            data: notices,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalNotices: count
        });
    } catch (err) {
        logger.error('Error fetching notices', { error: err.message });
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Publish a draft notice and trigger notifications
// @route   PATCH /api/v1/notices/:id/publish
exports.publishNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }

        notice.status = 'published';
        notice.publishedAt = new Date();
        notice.isActive = true;
        await notice.save();

        // Trigger Notifications strictly for relevant students
        let targetStudentIds = [];
        
        // 1. Identify module codes from tags
        const moduleCodes = (notice.tags || []).map(t => t.toUpperCase());
        
        if (moduleCodes.length > 0) {
            // 2. Find Module IDs for these codes
            const Module = require('../models/Module');
            const ModuleEnrollment = require('../models/ModuleEnrollment');
            
            const modules = await Module.find({ code: { $in: moduleCodes } }).select('_id');
            const moduleIds = modules.map(m => m._id);
            
            if (moduleIds.length > 0) {
                // 3. Find unique students enrolled in these modules
                const enrollments = await ModuleEnrollment.find({ 
                    module: { $in: moduleIds },
                    status: 'Enrolled' 
                }).select('student');
                
                // Map to User IDs (not Student IDs)
                const studentProfileIds = [...new Set(enrollments.map(e => e.student.toString()))];
                const users = await User.find({ studentRef: { $in: studentProfileIds }, isActive: true }).select('_id');
                targetStudentIds = users.map(u => u._id);
            }
        }

        // 4. If no specific module codes found, do not send notifications
        // Per user request: "student must recived notification only from module they following"
        if (targetStudentIds.length === 0) {
            return res.status(200).json({ success: true, data: notice, message: 'Notice published (No module-specific notifications sent)' });
        }

        for (const userId of targetStudentIds) {
            await createNotification({
                recipient: userId,
                type: 'announcement',
                title: `Module Update: ${notice.title}`,
                body: notice.subtext || notice.content?.substring(0, 100) || 'Click to view details.',
                link: '/dashboard?tab=notices',
                refModel: 'Notice',
                refId: notice._id
            }).catch(err => logger.error('Notice notification failed:', err.message));
        }

        res.status(200).json({ success: true, data: notice });
    } catch (err) {
        logger.error('Error publishing notice', { error: err.message });
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Unpublish a notice
// @route   PATCH /api/v1/notices/:id/unpublish
exports.unpublishNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }

        notice.status = 'draft';
        notice.isActive = false;
        await notice.save();

        // Real-time: Notify students to remove from their local state
        const io = req.app.get('socketio');
        if (io) {
            io.emit('notice_deleted', { id: req.params.id });
        }

        res.status(200).json({ success: true, data: notice });
    } catch (err) {
        logger.error('Error unpublishing notice', { error: err.message });
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a notice
// @route   DELETE /api/v1/notices/:id
exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);
        if (!notice) return res.status(404).json({ success: false, message: 'Not found' });
        
        // Real-time: Notify all clients to remove this ID from their state
        const io = req.app.get('socketio');
        if (io) {
            io.emit('notice_deleted', { id: req.params.id });
        }

        res.status(200).json({ success: true, message: 'Notice deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete all notices
// @route   DELETE /api/v1/notices
exports.deleteAllNotices = async (req, res) => {
    try {
        await Notice.deleteMany({});
        
        // Real-time: Notify all clients to clear their notice feeds
        const io = req.app.get('socketio');
        if (io) {
            io.emit('all_notices_deleted');
        }

        res.status(200).json({ success: true, message: 'All notices deleted' });
    } catch (err) {
        logger.error('Error deleting all notices', { error: err.message });
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get scraper settings
// @route   GET /api/v1/notices/settings
exports.getScraperSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne({ key: 'SCRAPER_CONFIG' });
        
        if (!settings) {
            // Default settings
            settings = await SystemSetting.create({
                key: 'SCRAPER_CONFIG',
                value: {
                    aiModel: 'anthropic',
                    apiKey: '',
                    targetUrl: 'https://fas.wyb.ac.lk/notices/',
                    selectors: {
                        item: 'article.elementor-post',
                        title: 'h3.elementor-post__title a',
                        excerpt: 'div.elementor-post__excerpt',
                        date: 'span.elementor-post-date',
                        deep: {
                            title: 'h1.elementor-heading-title',
                            body: '.elementor-widget-theme-post-content .elementor-widget-container',
                            attachments: 'a.elementor-button-link'
                        }
                    },
                    autoPublish: true,
                    cronSchedule: '0 * * * *'
                }
            });
        }

        const status = await SystemSetting.findOne({ key: 'SCRAPER_STATUS' });
        
        res.status(200).json({ 
            success: true, 
            data: settings.value,
            status: status ? status.value : { status: 'unknown', message: 'No status recorded' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update scraper settings
// @route   PUT /api/v1/notices/settings
exports.updateScraperSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.findOneAndUpdate(
            { key: 'SCRAPER_CONFIG' },
            { value: req.body },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, data: settings.value });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Manually trigger scraper
// @route   POST /api/v1/notices/scrape
exports.triggerScrape = async (req, res) => {
    try {
        const scraperPath = path.join(__dirname, '../../../scraper/index.js');
        
        // Emit socket event to notify admins that the scrape has started
        const io = req.app.get('socketio');
        if (io) {
            io.emit('scraper_started');
        }

        const scraperProcess = spawn('node', [scraperPath, '--once'], {
            cwd: path.join(__dirname, '../../../scraper'),
            env: { ...process.env, TRIGGERED_BY_API: 'true' }
        });

        scraperProcess.stdout.on('data', (data) => {
            console.log(`[Scraper] ${data}`);
        });

        scraperProcess.stderr.on('data', (data) => {
            console.error(`[Scraper Error] ${data}`);
        });

        scraperProcess.on('close', (code) => {
            console.log(`[Scraper] Process exited with code ${code}`);
            // Emit socket event to notify admins that the scrape is finished
            const io = req.app.get('socketio');
            if (io) {
                io.emit('scraper_finished', { code });
            }
        });

        res.status(200).json({ success: true, message: 'Scraper triggered successfully' });
    } catch (err) {
        logger.error('Error triggering scraper', { error: err.message });
        res.status(500).json({ success: false, message: 'Failed to trigger scraper' });
    }
};
