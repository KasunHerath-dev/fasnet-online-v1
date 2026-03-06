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
        const dbModules = await Module.find().lean();
        const batchYears = await BatchYear.find().lean();
        const historicYears = await Resource.distinct('academicYear');

        // ─── COMPLETE WUSL MODULE LIST (guaranteed fallback) ─────────────────────
        const WUSL_MODULES = [
            // L1-S1
            { code: 'CMIS1113', level: '1', semester: '1' }, { code: 'CMIS1123', level: '1', semester: '1' },
            { code: 'CMIS1131', level: '1', semester: '1' }, { code: 'ELTN1112', level: '1', semester: '1' },
            { code: 'ELTN1122', level: '1', semester: '1' }, { code: 'ELTN1132', level: '1', semester: '1' },
            { code: 'MATH1112', level: '1', semester: '1' }, { code: 'STAT1113', level: '1', semester: '1' },
            { code: 'IMGT1112', level: '1', semester: '1' }, { code: 'IMGT1122', level: '1', semester: '1' },
            { code: 'IMGT1132', level: '1', semester: '1' },
            // L1-S2
            { code: 'CMIS1212', level: '1', semester: '2' }, { code: 'CMIS1221', level: '1', semester: '2' },
            { code: 'ELTN1212', level: '1', semester: '2' }, { code: 'ELTN1222', level: '1', semester: '2' },
            { code: 'MATH1212', level: '1', semester: '2' }, { code: 'MATH1222', level: '1', semester: '2' },
            { code: 'STAT1213', level: '1', semester: '2' }, { code: 'IMGT1212', level: '1', semester: '2' },
            { code: 'IMGT1222', level: '1', semester: '2' },
            // L2-S1
            { code: 'CMIS2113', level: '2', semester: '1' }, { code: 'CMIS2123', level: '2', semester: '1' },
            { code: 'ELTN2112', level: '2', semester: '1' }, { code: 'ELTN2121', level: '2', semester: '1' },
            { code: 'MATH2114', level: '2', semester: '1' }, { code: 'STAT2112', level: '2', semester: '1' },
            { code: 'IMGT2112', level: '2', semester: '1' }, { code: 'IMGT2122', level: '2', semester: '1' },
            { code: 'IMGT2132', level: '2', semester: '1' },
            // L2-S2
            { code: 'CMIS2214', level: '2', semester: '2' }, { code: 'ELTN2213', level: '2', semester: '2' },
            { code: 'ELTN2221', level: '2', semester: '2' }, { code: 'ELTN2232', level: '2', semester: '2' },
            { code: 'ELTN2241', level: '2', semester: '2' }, { code: 'MATH2213', level: '2', semester: '2' },
            { code: 'STAT2212', level: '2', semester: '2' }, { code: 'STAT2222', level: '2', semester: '2' },
            { code: 'IMGT2212', level: '2', semester: '2' }, { code: 'IMGT2222', level: '2', semester: '2' },
            // L3-S1
            { code: 'CMIS3114', level: '3', semester: '1' }, { code: 'CMIS3122', level: '3', semester: '1' },
            { code: 'CMIS3134', level: '3', semester: '1' }, { code: 'CMIS3142', level: '3', semester: '1' },
            { code: 'CMIS3153', level: '3', semester: '1' }, { code: 'ELTN3113', level: '3', semester: '1' },
            { code: 'ELTN3121', level: '3', semester: '1' }, { code: 'ELTN3133', level: '3', semester: '1' },
            { code: 'ELTN3141', level: '3', semester: '1' }, { code: 'MMOD3113', level: '3', semester: '1' },
            { code: 'MMOD3124', level: '3', semester: '1' }, { code: 'STAT3112', level: '3', semester: '1' },
            { code: 'STAT3124', level: '3', semester: '1' }, { code: 'IMGT3112', level: '3', semester: '1' },
            { code: 'IMGT3122', level: '3', semester: '1' }, { code: 'IMGT3162', level: '3', semester: '1' },
            // L3-S2
            { code: 'CMIS3214', level: '3', semester: '2' }, { code: 'CMIS3224', level: '3', semester: '2' },
            { code: 'CMIS3234', level: '3', semester: '2' }, { code: 'CMIS3242', level: '3', semester: '2' },
            { code: 'CMIS3253', level: '3', semester: '2' }, { code: 'ELTN3212', level: '3', semester: '2' },
            { code: 'ELTN3222', level: '3', semester: '2' }, { code: 'ELTN3233', level: '3', semester: '2' },
            { code: 'ELTN3241', level: '3', semester: '2' }, { code: 'MMOD3214', level: '3', semester: '2' },
            { code: 'STAT3212', level: '3', semester: '2' }, { code: 'STAT3223', level: '3', semester: '2' },
            { code: 'STAT3232', level: '3', semester: '2' }, { code: 'IMGT3212', level: '3', semester: '2' },
            { code: 'IMGT3222', level: '3', semester: '2' }, { code: 'IMGT3232', level: '3', semester: '2' },
            // L4-S1
            { code: 'CMIS4114', level: '4', semester: '1' }, { code: 'CMIS4123', level: '4', semester: '1' },
            { code: 'CMIS4134', level: '4', semester: '1' }, { code: 'CMIS4142', level: '4', semester: '1' },
            { code: 'CMIS4153', level: '4', semester: '1' }, { code: 'CMIS4118', level: '4', semester: '1' },
            { code: 'CMIS4126', level: '4', semester: '1' }, { code: 'ELTN4114', level: '4', semester: '1' },
            { code: 'ELTN4143', level: '4', semester: '1' }, { code: 'ELTN4151', level: '4', semester: '1' },
            { code: 'MATH4114', level: '4', semester: '1' }, { code: 'STAT4114', level: '4', semester: '1' },
            { code: 'STAT4134', level: '4', semester: '1' }, { code: 'IMGT4123', level: '4', semester: '1' },
            { code: 'IMGT4133', level: '4', semester: '1' }, { code: 'IMGT4142', level: '4', semester: '1' },
            { code: 'IMGT4152', level: '4', semester: '1' }, { code: 'IMGT4162', level: '4', semester: '1' },
            { code: 'IMGT4172', level: '4', semester: '1' },
            // L4-S2
            { code: 'CMIS4216', level: '4', semester: '2' }, { code: 'INDT4216', level: '4', semester: '2' },
            { code: 'ELTN4213', level: '4', semester: '2' }, { code: 'MATH4214', level: '4', semester: '2' },
            { code: 'MATH4224', level: '4', semester: '2' }, { code: 'IMGT4213', level: '4', semester: '2' },
            { code: 'IMGT4222', level: '4', semester: '2' }, { code: 'IMGT4234', level: '4', semester: '2' },
            { code: 'IMGT4242', level: '4', semester: '2' },
        ];

        // Merge DB modules with complete list (DB takes precedence for extra fields)
        const dbCodes = new Set(dbModules.map(m => m.code));
        const allModules = [...dbModules, ...WUSL_MODULES.filter(m => !dbCodes.has(m.code))];

        // ─── ALL YEARS (default + DB batch years + historic resource years) ───────
        const allYears = new Set(['General', '2019/2020', '2020/2021', '2021/2022', '2022/2023', '2023/2024', '2024/2025', '2025/2026']);
        batchYears.forEach(b => allYears.add(b.year));
        historicYears.forEach(y => { if (y) allYears.add(y); });

        const types = ['lecture_note', 'tutorial', 'past_paper', 'assignment', 'book', 'other'];
        console.log(`[INIT] ${allModules.length} modules × ${types.length} types × ${allYears.size} years`);

        let createdCount = 0;
        let errorCount = 0;

        for (const mod of allModules) {
            for (const type of types) {
                for (const year of allYears) {
                    const folderPath = `lms_materials/Level_${mod.level}/Semester_${mod.semester}/${mod.code}/${type}/${year}`;
                    try {
                        await cloudinary.api.create_folder(folderPath);
                        createdCount++;
                    } catch (folderErr) {
                        if (folderErr.http_code === 409 || folderErr.message?.includes('already exists')) {
                            createdCount++;
                        } else {
                            console.warn(`[INIT] Could not create ${folderPath}:`, folderErr.message);
                            errorCount++;
                        }
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `✅ Folder init complete! Created/Verified ${createdCount} folders across ${allModules.length} modules, ${types.length} types, ${allYears.size} years. (${errorCount} unexpected errors)`
        });

    } catch (error) {
        console.error('Folder Init Error:', error);
        res.status(500).json({ success: false, message: 'Failed to initialize Cloudinary folders', error: error.message });
    }
};

// @desc    DANGER: Delete ALL Cloudinary resources and folders under lms_materials, reset DB storageType
// @route   DELETE /api/v1/resources/clear-cloudinary
// @access  Private (Superadmin ONLY)
exports.clearCloudinary = async (req, res) => {
    try {
        console.log('[CLEAR] Starting full Cloudinary wipe...');
        let deletedAssets = 0;

        // 1. Delete ALL uploaded resources in lms_materials/* for each resource type
        for (const rtype of ['raw', 'image', 'video']) {
            try {
                let nextCursor = null;
                do {
                    const params = { resource_type: rtype, prefix: 'lms_materials', max_results: 500, type: 'upload' };
                    if (nextCursor) params.next_cursor = nextCursor;
                    const listResult = await cloudinary.api.resources(params);
                    const publicIds = listResult.resources.map(r => r.public_id);
                    if (publicIds.length > 0) {
                        await cloudinary.api.delete_resources(publicIds, { resource_type: rtype });
                        deletedAssets += publicIds.length;
                        console.log(`[CLEAR] Deleted ${publicIds.length} ${rtype} assets`);
                    }
                    nextCursor = listResult.next_cursor;
                } while (nextCursor);
            } catch (typeErr) {
                console.warn(`[CLEAR] Error clearing ${rtype}:`, typeErr.message);
            }
        }

        // 2. Delete ALL folders under lms_materials (Cloudinary requires folders to be empty first)
        const deleteSubFolders = async (parentPath) => {
            try {
                const { folders } = await cloudinary.api.sub_folders(parentPath);
                for (const f of folders) {
                    await deleteSubFolders(f.path);
                }
                await cloudinary.api.delete_folder(parentPath);
                console.log(`[CLEAR] Deleted folder: ${parentPath}`);
            } catch (err) {
                console.warn(`[CLEAR] Could not delete folder ${parentPath}:`, err.message);
            }
        };
        await deleteSubFolders('lms_materials');

        // 3. Reset ALL DB resource storageType back to 'mega' so migration modal shows all files as pending
        const dbReset = await Resource.updateMany({}, { $set: { storageType: 'mega' } });
        console.log(`[CLEAR] DB reset: ${dbReset.modifiedCount} resources reset to 'mega'`);

        res.status(200).json({
            success: true,
            message: `✅ Cloudinary fully cleared! Deleted ${deletedAssets} assets and all lms_materials folders. ${dbReset.modifiedCount} DB records reset to 'mega'. Now run "Setup Folders" then migrate your files.`,
            stats: { deletedAssets, dbRecordsReset: dbReset.modifiedCount }
        });

    } catch (error) {
        console.error('[CLEAR] Cloudinary Clear Error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear Cloudinary', error: error.message });
    }
};
