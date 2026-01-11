const Resource = require('../models/Resource');
const googleDriveService = require('../services/googleDriveService');
const Module = require('../models/Module');

// @desc    Upload a new resource (Tutorial/Past Paper)
// @route   POST /api/v1/resources
// @access  Private (Admin/Superadmin)
exports.uploadResource = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const { title, type, moduleId } = req.body;

        // Verify module exists
        const moduleExists = await Module.findById(moduleId);
        if (!moduleExists) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Upload to Google Drive
        // You might want to define specific folder IDs for each module or a general 'LMS Resources' folder
        // For now, we upload to root (or user's default) but you can set a folderId in env
        const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const driveFile = await googleDriveService.uploadFile(req.file, driveFolderId);

        // Create Resource Record
        const resource = await Resource.create({
            title,
            type,
            module: moduleId,
            driveFileId: driveFile.id,
            webViewLink: driveFile.webViewLink,
            webContentLink: driveFile.webContentLink, // Direct download/view
            mimeType: req.file.mimetype,
            size: driveFile.size,
            uploadedBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: resource
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
        const resources = await Resource.find({ module: req.params.moduleId })
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

        // Delete from Drive
        await googleDriveService.deleteFile(resource.driveFileId);

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

const SystemSetting = require('../models/SystemSetting');

// ... (other imports)

// @desc    Generate Google Auth URL (One-time setup)
// @route   GET /api/v1/resources/auth/url
// @access  Private (Superadmin)
exports.getAuthUrl = (req, res) => {
    const url = googleDriveService.generateAuthUrl();
    res.json({ success: true, url });
};

// @desc    Handle Google Auth Callback (One-time setup)
// @route   GET /api/v1/resources/auth/callback
// @access  Public (Callback from Google)
exports.authCallback = async (req, res) => {
    const { code } = req.query;
    try {
        const tokens = await googleDriveService.getTokens(code);

        // Save Refresh Token to DB
        if (tokens.refresh_token) {
            await SystemSetting.findOneAndUpdate(
                { key: 'GOOGLE_REFRESH_TOKEN' },
                {
                    value: tokens.refresh_token,
                    description: 'Google Drive Refresh Token for Resource Uploads'
                },
                { upsert: true, new: true }
            );

            res.send(`
                <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: green;">Authorization Successful! ✅</h1>
                    <p>The system has successfully connected to your Google Drive.</p>
                    <p>You can verify this by checking the terminal log or listing 'SystemSetting' in DB.</p>
                    <p>You may now close this window and return to the Admin Dashboard.</p>
                </div>
            `);
        } else {
            console.log('No refresh token returned (User might have already approved).');
            res.send(`
                <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: blue;">Already Authorized ℹ️</h1>
                    <p>Google didn't return a new Refresh Token, likely because you have already approved this app.</p>
                    <p>If the app is working, you are good to go. If not, go to your Google Account > Security > Third-party apps and remove "FAS Database" then try again.</p>
                </div>
            `);
        }

    } catch (error) {
        console.error('Auth Callback Error:', error);
        res.status(500).send(`Auth Failed: ${error.message}`);
    }
};
