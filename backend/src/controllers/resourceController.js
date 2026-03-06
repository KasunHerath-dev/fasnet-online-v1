const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cloudinary = require('cloudinary').v2;
const Resource = require('../models/Resource');
const Module = require('../models/Module');
const BatchYear = require('../models/BatchYear');
const ModuleEnrollment = require('../models/ModuleEnrollment');
const { createNotification } = require('./notificationController');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

        // Upload to Cloudinary
        const folderPath = `lms_materials/Level_${moduleDoc.level}/Semester_${moduleDoc.semester}/${moduleDoc.code}/${type}/${academicYear || 'General'}`;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folderPath,
                resource_type: 'auto',
                public_id: req.file.originalname.split('.')[0] + '_' + Date.now()
            },
            async (error, result) => {
                if (error) {
                    console.error("Cloudinary Error:", error);
                    return res.status(500).json({ success: false, message: 'Upload to Cloudinary failed' });
                }

                try {
                    // Create Resource Record
                    const resource = await Resource.create({
                        title,
                        type,
                        answerFor,
                        academicYear,
                        module: moduleDoc._id,
                        fileId: result.public_id, // Cloudinary public_id
                        webViewLink: result.secure_url,
                        webContentLink: result.secure_url, // For Cloudinary, secure_url is used for downloading
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
                                        body: `"${title}" has been uploaded for ${moduleDoc.code} – ${moduleDoc.title}.`,
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

                } catch (dbErr) {
                    console.error('Upload Controller DB Error:', dbErr);
                    // Optional: Delete from Cloudinary if DB save fails
                    cloudinary.uploader.destroy(result.public_id).catch(console.error);

                    res.status(500).json({
                        success: false,
                        message: 'Server Error saving resource',
                        error: dbErr.message || JSON.stringify(dbErr)
                    });
                }
            }
        );

        uploadStream.end(req.file.buffer);

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

        // If module not found (invalid code or ID), return empty list or 404
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

        // Delete from Cloudinary
        if (resource.fileId) {
            try {
                await cloudinary.uploader.destroy(resource.fileId, { resource_type: 'raw' });
                // We also attempt with 'image' and 'video' if 'raw' fails, as Cloudinary types it sometimes
                await cloudinary.uploader.destroy(resource.fileId, { resource_type: 'image' }).catch(() => { });
                await cloudinary.uploader.destroy(resource.fileId, { resource_type: 'video' }).catch(() => { });
            } catch (cloudErr) {
                console.error("Cloudinary deletion error:", cloudErr);
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

// @desc    Stream a resource (Download Proxy)
// @route   GET /api/v1/resources/stream/:id
// @access  Public (or Private if you want)
exports.streamResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).send('Resource not found');
        }

        // For Cloudinary, we can redirect directly to the secure URL
        // Append fl_attachment to force download for images/videos
        const downloadUrl = resource.webContentLink.includes('/upload/')
            ? resource.webContentLink.replace('/upload/', '/upload/fl_attachment/')
            : resource.webContentLink;

        res.redirect(downloadUrl);

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

// @desc    Scan Cloudinary to manually sync uploaded large files
// @route   POST /api/v1/resources/sync-cloudinary
// @access  Private (Admin/Superadmin)
exports.scanCloudinaryResources = async (req, res) => {
    try {
        console.log('Initiating Cloudinary Sync...');

        // Use Cloudinary Search API to find all files in our managed folder
        const { resources: cloudFiles } = await cloudinary.search
            .expression('folder:lms_materials/*')
            .sort_by('created_at', 'desc')
            .max_results(500)
            .execute();

        console.log(`Found ${cloudFiles.length} files in Cloudinary.`);
        let syncedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const file of cloudFiles) {
            try {
                // Check if this fileId (public_id) already exists in our DB
                const existing = await Resource.findOne({ fileId: file.public_id });
                if (existing) {
                    skippedCount++;
                    continue;
                }

                // Parse Folder Structure: lms_materials/Level_X/Semester_Y/ModuleCode/Type/Year
                const pathParts = file.folder.split('/');
                // Example pathParts: ['lms_materials', 'Level_1', 'Semester_1', 'CMIS1113', 'past_paper', '2023']

                if (pathParts.length < 5) {
                    console.log(`Skipping ${file.public_id} - doesn't match expected folder depth.`);
                    skippedCount++;
                    continue;
                }

                const moduleCode = pathParts[3];
                const resourceType = pathParts[4];
                const academicYear = pathParts[5] || 'General';

                // Find the corresponding module in the DB
                const moduleDoc = await resolveModule(moduleCode);

                if (!moduleDoc) {
                    console.log(`Module ${moduleCode} not found in DB for file ${file.public_id}. Skipping.`);
                    skippedCount++;
                    continue;
                }

                const fileName = file.filename || file.public_id.split('/').pop();

                // Build a title from the filename, removing underscores/hyphens for readability
                const humanTitle = fileName.replace(/_/g, ' ').replace(/-/g, ' ');

                // Create DB Record
                await Resource.create({
                    title: humanTitle,
                    type: resourceType,
                    academicYear: academicYear,
                    module: moduleDoc._id,
                    fileId: file.public_id,
                    webViewLink: file.secure_url,
                    webContentLink: file.secure_url,
                    mimeType: `${file.resource_type}/${file.format}`, // e.g. image/png or raw/pdf
                    size: file.bytes,
                    uploadedBy: req.user ? req.user.id : await mongoose.model('User').findOne({ role: 'admin' }).select('_id'), // Fallback to a random admin if somehow detached
                });

                syncedCount++;
                console.log(`Successfully synced: ${fileName}`);

            } catch (itemErr) {
                console.error(`Error syncing individual file ${file.public_id}:`, itemErr);
                errorCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Cloudinary sync complete',
            stats: {
                totalFound: cloudFiles.length,
                newlySynced: syncedCount,
                skipped: skippedCount,
                errors: errorCount
            }
        });

    } catch (error) {
        console.error('Cloudinary Sync Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error during Cloudinary Sync',
            error: error.message
        });
    }
};

// @desc    Get all resources still hosted on Mega
// @route   GET /api/v1/resources/mega-pending
// @access  Private (Superadmin)
exports.getPendingMegaResources = async (req, res) => {
    try {
        const megaResources = await Resource.find({
            $or: [
                { storageType: 'mega' },
                { webViewLink: { $not: /res\.cloudinary\.com/ }, storageType: { $exists: false } }
            ]
        }).populate('module', 'name code level semester').lean();

        res.status(200).json({
            success: true,
            count: megaResources.length,
            data: megaResources
        });
    } catch (error) {
        console.error('Fetch Pending Mega Resources Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending resources' });
    }
};

// @desc    Migrate a single resource from Mega to Cloudinary
// @route   POST /api/v1/resources/migrate-single/:id
// @access  Private (Superadmin)
exports.migrateSingleResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const resource = await Resource.findById(resourceId).populate('module');

        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        if (resource.webViewLink && resource.webViewLink.includes('res.cloudinary.com')) {
            return res.status(400).json({ success: false, message: 'Resource is already on Cloudinary' });
        }

        const megaService = require('../services/megaService');

        // 1. Get the stream from Mega
        const { stream, name } = await megaService.getFileStream(resource.fileId);

        // Construct Cloudinary Folder Path
        const level = resource.module ? resource.module.level : 'Unknown_Level';
        const semester = resource.module ? resource.module.semester : 'Unknown_Semester';
        const modCode = resource.module ? resource.module.code : 'Unknown_Module';
        const resType = resource.type || 'other';
        const year = resource.academicYear || 'General';

        const folderPath = `lms_materials/Level_${level}/Semester_${semester}/${modCode}/${resType}/${year}`;

        // 2. Upload Stream to Cloudinary
        console.log(`[MIGRATION] Starting upload to Cloudinary for: ${name}`);
        const cloudinaryUploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folderPath,
                    resource_type: 'auto',
                    public_id: name.split('.')[0] + '_' + Date.now()
                },
                (error, result) => {
                    if (error) {
                        console.error('[MIGRATION] Cloudinary Upload Error:', error);
                        reject(error);
                    } else {
                        console.log('[MIGRATION] Cloudinary Upload Success');
                        resolve(result);
                    }
                }
            );

            // Handle stream errors
            stream.on('error', (err) => {
                console.error('[MIGRATION] Mega Stream Error:', err);
                reject(err);
            });

            // Pipe the mega stream directly to Cloudinary
            stream.pipe(uploadStream);
        });

        // 3. Update Database
        resource.fileId = cloudinaryUploadResult.public_id;
        resource.webViewLink = cloudinaryUploadResult.secure_url;
        resource.webContentLink = cloudinaryUploadResult.secure_url;
        resource.storageType = 'cloudinary';

        await resource.save();

        res.status(200).json({
            success: true,
            message: `Successfully migrated ${resource.title}`,
            url: resource.webViewLink
        });

    } catch (error) {
        console.error('Single Migration Error:', error);
        res.status(500).json({ success: false, message: 'Failed to migrate resource via stream', error: error.message });
    }
};

// @desc    Get preview of files in Cloudinary not yet synced to MongoDB
// @route   GET /api/v1/resources/sync-preview
// @access  Private (Admin/Superadmin)
exports.getCloudinarySyncPreview = async (req, res) => {
    try {
        const cloudinaryResources = await cloudinary.search
            .expression('folder:lms_materials/*')
            .max_results(500)
            .execute();

        const cloudFiles = cloudinaryResources.resources;
        const existingResources = await Resource.find({}, 'fileId').lean();
        const existingIds = new Set(existingResources.map(r => r.fileId));

        const unsyncedFiles = cloudFiles.filter(file => !existingIds.has(file.public_id));

        const previewData = unsyncedFiles.map(file => {
            const parts = file.public_id.split('/');
            return {
                public_id: file.public_id,
                secure_url: file.secure_url,
                filename: parts[parts.length - 1],
                level: parts[1]?.split('_')[1] || '?',
                semester: parts[2]?.split('_')[1] || '?',
                moduleCode: parts[3] || 'Unknown',
                type: parts[4] || 'other',
                year: parts[5] || 'General',
                size: (file.bytes / (1024 * 1024)).toFixed(2) + ' MB',
                createdAt: file.created_at
            };
        });

        res.status(200).json({
            success: true,
            count: previewData.length,
            data: previewData
        });

    } catch (error) {
        console.error('Cloudinary Preview Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch Cloudinary preview', error: error.message });
    }
};

// @desc    Initialize the entire Cloudinary folder structure based on DB modules and years
// @route   POST /api/v1/resources/init-folders
// @access  Private (Superadmin)
exports.initCloudinaryFolders = async (req, res) => {
    try {
        const modules = await Module.find().lean();
        const batchYears = await BatchYear.find().lean();
        const historicYears = await Resource.distinct('academicYear');

        // Combine all possible years
        const allYears = new Set(['General']);
        batchYears.forEach(b => allYears.add(b.year));
        historicYears.forEach(y => { if (y) allYears.add(y); });

        const types = ['lecture_note', 'tutorial', 'past_paper', 'assignment', 'book', 'other'];

        if (modules.length === 0) {
            return res.status(400).json({ success: false, message: 'No modules found in database to initialize folders.' });
        }

        console.log(`Starting Exhaustive Folder Initialization for ${modules.length} modules and ${allYears.size} years...`);

        let createdCount = 0;

        for (const mod of modules) {
            for (const type of types) {
                for (const year of allYears) {
                    const folderPath = `lms_materials/Level_${mod.level}/Semester_${mod.semester}/${mod.code}/${type}/${year}`;
                    await cloudinary.api.create_folder(folderPath);
                    createdCount++;
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `Cloudinary folder structure initialization triggered successfully. Created/Verified ${createdCount} directory endpoints.`
        });

    } catch (error) {
        console.error('Folder Init Error:', error);
        res.status(500).json({ success: false, message: 'Failed to initialize Cloudinary folders', error: error.message });
    }
};
