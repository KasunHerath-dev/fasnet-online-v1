const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const Module = require('../models/Module');
const ModuleEnrollment = require('../models/ModuleEnrollment');
const { createNotification } = require('./notificationController');
const megaService = require('../services/megaService'); // Using Mega Service

// Helper to resolve Module ID or Code -> Module Document
const resolveModule = async (idOrCode) => {
    let moduleDoc = null;
    if (mongoose.Types.ObjectId.isValid(idOrCode)) {
        moduleDoc = await Module.findById(idOrCode);
    }
    if (!moduleDoc) {
        moduleDoc = await Module.findOne({ code: idOrCode });
    }
    return moduleDoc;
};

// @desc    Upload a new resource (Tutorial/Past Paper)
// @route   POST /api/v1/resources
// @access  Private (Admin/Superadmin)
exports.uploadResource = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const { title, type, moduleId, answerFor, moduleContext, academicYear } = req.body;

        // Verify module exists (By ID or Code)
        let moduleDoc = await resolveModule(moduleId);

        // Auto-create module if missing and context provided (Handling Fallback Modules)
        if (!moduleDoc && moduleContext) {
            try {
                const ctx = JSON.parse(moduleContext);
                const department = ctx.code.substring(0, 4); // Extract dep from code e.g. CMIS

                moduleDoc = await Module.create({
                    code: ctx.code,
                    title: ctx.title,
                    credits: ctx.credits,
                    level: ctx.level,
                    semester: ctx.semester,
                    department: department, // Assumes code matches department pattern
                    isCompulsory: true
                });
                console.log(`Auto-created module: ${moduleDoc.code}`);
            } catch (createErr) {
                console.error("Failed to auto-create module:", createErr);
                return res.status(400).json({ success: false, message: 'Module not found and could not be created' });
            }
        }

        if (!moduleDoc) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Upload to Mega
        const fileName = `${moduleDoc.code}_${type}_${Date.now()}_${req.file.originalname}`;
        const megaUploadResult = await megaService.uploadToMega(req.file.buffer, fileName, req.file.size);

        // Create Resource Record
        const resource = await Resource.create({
            title,
            type,
            answerFor,
            academicYear,
            module: moduleDoc._id,
            fileId: megaUploadResult.nodeId, // Mega nodeId
            webViewLink: megaUploadResult.link,
            webContentLink: megaUploadResult.link, 
            storageType: 'mega', // Enforcing mega
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user ? req.user.id : null
        });

        res.status(201).json({
            success: true,
            data: resource
        });

        // Non-blocking: notify all enrolled students about the new resource
        setImmediate(async () => {
            try {
                const typeLabel = {
                    tutorial: 'Tutorial',
                    past_paper: 'Past Paper',
                    assignment: 'Assignment',
                    marking_scheme: 'Marking Scheme',
                    book: 'Book',
                    other: 'Resource',
                }[type] || 'Resource';

                const enrollments = await ModuleEnrollment.find({ module: moduleDoc._id })
                    .populate({ path: 'student', populate: { path: 'user', select: '_id' } });

                const notifPromises = enrollments
                    .map(e => e?.student?.user?._id)
                    .filter(Boolean)
                    .map(userId =>
                        createNotification({
                            recipient: userId,
                            type: 'resource_added',
                            title: `New ${typeLabel} Added`,
                            body: `"${title}" has been uploaded for ${moduleDoc.code} - ${moduleDoc.title}.`,
                            link: '/learning',
                            refModel: 'Resource',
                            refId: resource._id,
                        }).catch(() => { })
                    );

                await Promise.all(notifPromises);
            } catch (_) {
                // Silently ignore notification errors
            }
        });

    } catch (error) {
        console.error('Upload Controller Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error during upload',
            error: error.message || JSON.stringify(error)
        });
    }
};

// @desc    Get resources for a module
// @route   GET /api/v1/resources/module/:moduleId
// @access  Private (Students/Admins)
exports.getResourcesByModule = async (req, res) => {
    try {
        const moduleDoc = await resolveModule(req.params.moduleId);

        if (!moduleDoc) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const resources = await Resource.find({ module: moduleDoc._id })
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a resource
// @route   DELETE /api/v1/resources/:id
// @access  Private (Admin/Superadmin)
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        // Delete from Mega
        if (resource.fileId) {
            try {
                const deleted = await megaService.deleteFromMega(resource.fileId);
                if (!deleted) {
                    console.warn(`Mega file ${resource.fileId} not found, proceeding to delete DB record anyway.`);
                }
            } catch (megaErr) {
                console.error("Mega deletion error:", megaErr);
            }
        }

        // Delete from DB
        await resource.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Stream a resource (Download Proxy) from Mega
// @route   GET /api/v1/resources/stream/:id
// @access  Public (or Private if you want)
exports.streamResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).send('Resource not found');
        }

        // Check if file is stored on mega
        if (resource.storageType === 'mega') {
            try {
                const { stream, name, size } = await megaService.getFileStream(resource.fileId);

                // Add fallback generic name if Mega API doesn't find the name
                const filenameToUse = encodeURIComponent(name || resource.title || 'downloaded_resource');

                res.setHeader('Content-Type', resource.mimeType || 'application/octet-stream');
                res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filenameToUse}`);
                
                if (size) {
                    res.setHeader('Content-Length', size);
                }

                stream.pipe(res);
                
                stream.on('error', (err) => {
                    console.error('Mega File Stream Piping Error:', err);
                    if (!res.headersSent) {
                        res.status(500).send('Network error while streaming the file');
                    }
                });
            } catch (megaError) {
                console.error('Requesting Mega file stream failed:', megaError);
                return res.status(500).send('Failed to fetch file from Mega servers');
            }
        } else {
            // Native fallback for any remaining legacy links
            res.redirect(resource.webContentLink);
        }

    } catch (error) {
        console.error('Download Proxy Error:', error);
        res.status(500).send('Failed to process download');
    }
};

// @desc    Get resources for multiple modules at once (Frontend N+1 prevention)
// @route   POST /api/v1/resources/my-resources
// @access  Private (Students)
exports.getBulkResources = async (req, res) => {
    try {
        const { moduleIds } = req.body;

        if (!moduleIds || !Array.isArray(moduleIds)) {
            return res.status(400).json({ success: false, message: 'moduleIds array is required' });
        }

        const resources = await Resource.find({ module: { $in: moduleIds } })
            .lean()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error Fetching Bulk Resources' });
    }
};
