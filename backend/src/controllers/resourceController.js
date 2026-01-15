const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Resource = require('../models/Resource');
const megaService = require('../services/megaService');
const Module = require('../models/Module');

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
        const fileData = await megaService.uploadToMega(
            req.file.buffer,
            req.file.originalname,
            req.file.size
        );

        // Create Resource Record
        const resource = await Resource.create({
            title,
            type,
            answerFor, // Add this if it's in the schema/request
            academicYear, // Optional: e.g. "2021/2022"
            module: moduleDoc._id, // Use real ObjectId
            fileId: fileData.nodeId, // Storing Mega Node ID
            webViewLink: fileData.link,
            webContentLink: fileData.link, // Mega links are universal
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user ? req.user.id : null // Handle potential missing user in dev
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

        // Delete from Mega
        // Access fileId instead of driveFileId
        if (resource.fileId) {
            await megaService.deleteFromMega(resource.fileId);
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

        const { stream, name } = await megaService.getFileStream(resource.fileId);

        // Setup temp file path
        const tempFilePath = path.join(os.tmpdir(), `mega_${resource.fileId}_${Date.now()}_${name}`);
        const writeStream = fs.createWriteStream(tempFilePath);

        // Download to temp
        await new Promise((resolve, reject) => {
            stream.pipe(writeStream);
            stream.on('error', reject);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // Send file to user
        res.download(tempFilePath, name, (err) => {
            // Cleanup temp file after sending
            fs.unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
            });

            if (err) {
                console.error('Error sending file:', err);
                if (!res.headersSent) {
                    res.status(500).send('Failed to send file');
                }
            }
        });

    } catch (error) {
        console.error('Download Proxy Error:', error);
        res.status(500).send('Failed to process download');
    }
};
