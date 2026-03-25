const mongoose = require('mongoose');
require('dotenv').config();
const Resource = require('../backend/src/models/Resource');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function syncCloudinary() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[SYNC] Connected to MongoDB');

        // Search for all files in lms_materials
        const { resources: cloudFiles } = await cloudinary.search
            .expression('folder:lms_materials/*')
            .max_results(500)
            .execute();

        console.log(`[SYNC] Found ${cloudFiles.length} files in Cloudinary.`);
        
        const existingResources = await Resource.find({}, 'fileId').lean();
        const existingIds = new Set(existingResources.map(r => r.fileId));

        let syncedCount = 0;

        for (const file of cloudFiles) {
            if (existingIds.has(file.public_id)) continue;

            const pathParts = file.folder.split('/');
            if (pathParts.length < 5) continue;

            const moduleCode = pathParts[3];
            const type = pathParts[4];
            const year = pathParts[5] || 'General';

            const Module = mongoose.model('Module');
            const moduleDoc = await Module.findOne({ code: moduleCode });

            if (!moduleDoc) {
                console.warn(`[SYNC] Skipping ${file.public_id} - Module ${moduleCode} not in DB`);
                continue;
            }

            const fileName = file.filename || file.public_id.split('/').pop();
            const title = fileName.replace(/_/g, ' ').replace(/-/g, ' ');

            await Resource.create({
                title,
                type,
                academicYear: year,
                module: moduleDoc._id,
                fileId: file.public_id,
                webViewLink: file.secure_url,
                webContentLink: file.secure_url,
                mimeType: `${file.resource_type}/${file.format}`,
                size: file.bytes,
                storageType: 'cloudinary'
            });

            syncedCount++;
            console.log(`[SYNC] Linked: ${fileName}`);
        }

        console.log(`[SYNC] Done! Linked ${syncedCount} new resources.`);
        process.exit(0);

    } catch (err) {
        console.error('[SYNC] Error:', err);
        process.exit(1);
    }
}

syncCloudinary();
