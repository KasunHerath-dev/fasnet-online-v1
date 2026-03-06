const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Path to your env file (adjust if necessary)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Resource = require('../src/models/Resource');
const megaService = require('../src/services/megaService');
const Module = require('../src/models/Module'); // Needed to populate module codes

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrate() {
    console.log("Starting Mega to Cloudinary Migration...");

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        // Find all resources that look like Mega IDs (typically 8 chars like 'j5FmGSZY')
        // OR simply grab all resources that don't have cloudinary URLs 
        // A Cloudinary secure_url always starts with res.cloudinary.com
        const megaResources = await Resource.find({
            webViewLink: { $not: /res\.cloudinary\.com/ }
        }).populate('module');

        console.log(`Found ${megaResources.length} files currently hosted on Mega.`);

        let successCount = 0;
        let failCount = 0;

        for (const resource of megaResources) {
            console.log(`\nMigrating: [${resource.title}] (${resource.fileId})`);
            try {
                // 1. Get the stream from Mega
                const { stream, name } = await megaService.getFileStream(resource.fileId);

                // Construct Cloudinary Folder Path
                // Fallbacks if module happens to be deleted/corrupted in DB
                const level = resource.module ? resource.module.level : 'Unknown_Level';
                const semester = resource.module ? resource.module.semester : 'Unknown_Semester';
                const modCode = resource.module ? resource.module.code : 'Unknown_Module';
                const resType = resource.type || 'other';
                const year = resource.academicYear || 'General';

                const folderPath = `lms_materials/Level_${level}/Semester_${semester}/${modCode}/${resType}/${year}`;

                // 2. Upload Stream to Cloudinary
                const cloudinaryUploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: folderPath,
                            resource_type: 'auto', // Auto detects PDF, Docx, JPEG etc.
                            public_id: name.split('.')[0] + '_' + Date.now()
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );

                    // Pipe the mega stream directly to Cloudinary
                    stream.pipe(uploadStream);
                });

                // 3. Update Database
                resource.fileId = cloudinaryUploadResult.public_id;
                resource.webViewLink = cloudinaryUploadResult.secure_url;
                resource.webContentLink = cloudinaryUploadResult.secure_url;

                await resource.save();

                console.log(`✅ Success: ${resource.title} moved to Cloudinary -> ${cloudinaryUploadResult.secure_url}`);
                successCount++;

            } catch (err) {
                console.error(`❌ Failed to migrate ${resource.title}:`, err.message);
                failCount++;
            }
        }

        console.log("\n==================================");
        console.log("Migration Complete!");
        console.log(`Successfully Migrated: ${successCount}`);
        console.log(`Failed/Errored: ${failCount}`);
        console.log("==================================");

        process.exit(0);

    } catch (error) {
        console.error("Critical Migration Error:", error);
        process.exit(1);
    }
}

migrate();
