const mongoose = require('mongoose');
require('dotenv').config();
const Resource = require('../src/models/Resource');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const WUSL_MODULES = [
    // L1-S1
    { code: 'CMIS1114', level: '1', semester: '1' }, { code: 'ELTN1112', level: '1', semester: '1' },
    { code: 'MATH1113', level: '1', semester: '1' }, { code: 'STAT1113', level: '1', semester: '1' },
    { code: 'IMGT1112', level: '1', semester: '1' }, { code: 'ENGL1112', level: '1', semester: '1' },
    // L1-S2
    { code: 'CMIS1214', level: '1', semester: '2' }, { code: 'ELTN1212', level: '1', semester: '2' },
    { code: 'MATH1213', level: '1', semester: '2' }, { code: 'STAT1213', level: '1', semester: '2' },
    { code: 'IMGT1212', level: '1', semester: '2' }, { code: 'ELTN1122', level: '1', semester: '2' },
    // L2-S1
    { code: 'CMIS2114', level: '2', semester: '1' }, { code: 'ELTN2113', level: '2', semester: '1' },
    { code: 'MATH2114', level: '2', semester: '1' }, { code: 'STAT2113', level: '2', semester: '1' },
    { code: 'IMGT2112', level: '2', semester: '1' }, { code: 'IMGT2123', level: '2', semester: '1' },
    // L2-S2
    { code: 'CMIS2214', level: '2', semester: '2' }, { code: 'ELTN2212', level: '2', semester: '2' },
    { code: 'MATH2214', level: '2', semester: '2' }, { code: 'STAT2213', level: '2', semester: '2' },
    { code: 'IMGT2212', level: '2', semester: '2' }, { code: 'ELTN2222', level: '2', semester: '2' },
    // L3-S1
    { code: 'CMIS3114', level: '3', semester: '1' }, { code: 'CMIS3123', level: '3', semester: '1' },
    { code: 'CMIS3132', level: '3', semester: '1' }, { code: 'ELTN3112', level: '3', semester: '1' },
    { code: 'MATH3114', level: '3', semester: '1' }, { code: 'STAT3113', level: '3', semester: '1' },
    { code: 'IMGT3113', level: '3', semester: '1' }, { code: 'IMGT3122', level: '3', semester: '1' },
    // L3-S2
    { code: 'CMIS3214', level: '3', semester: '2' }, { code: 'ELTN3212', level: '3', semester: '2' },
    { code: 'MATH3214', level: '3', semester: '2' }, { code: 'STAT3213', level: '3', semester: '2' },
    { code: 'IMGT3212', level: '3', semester: '2' }, { code: 'IMGT3222', level: '3', semester: '2' },
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

async function initCloudinary() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[EXEC] Connected to MongoDB');

        // Fetch dynamic content from DB
        const dbModules = await mongoose.model('Module').find({});
        const batchYears = await mongoose.model('BatchYear').find({});
        const resources = await Resource.find({});

        const historicYears = [...new Set(resources.map(r => r.year))];
        const dbCodes = new Set(dbModules.map(m => m.code));
        const allModules = [...dbModules, ...WUSL_MODULES.filter(m => !dbCodes.has(m.code))];

        const allYears = new Set(['General', '2019/2020', '2020/2021', '2021/2022', '2022/2023', '2023/2024', '2024/2025', '2025/2026']);
        batchYears.forEach(b => allYears.add(b.year));
        historicYears.forEach(y => { if (y) allYears.add(y); });

        const types = ['lecture_note', 'tutorial', 'past_paper', 'assignment', 'book', 'other'];
        const pathsToCreate = [];

        for (const mod of allModules) {
            for (const type of types) {
                for (const year of allYears) {
                    pathsToCreate.push(`lms_materials/Level_${mod.level}/Semester_${mod.semester}/${mod.code}/${type}/${year}`);
                }
            }
        }

        console.log(`[EXEC] Planning creation of ${pathsToCreate.length} folders...`);

        let createdCount = 0;
        let errorCount = 0;
        const BATCH_SIZE = 15;

        for (let i = 0; i < pathsToCreate.length; i += BATCH_SIZE) {
            const batch = pathsToCreate.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(batch.map(async (path) => {
                try {
                    await cloudinary.api.create_folder(path);
                    return { success: true };
                } catch (err) {
                    if (err.http_code === 409 || err.message?.includes('already exists')) return { success: true };
                    if (err.http_code === 429 || err.http_code === 420 || err.error?.http_code === 420) return { rateLimit: true };
                    console.warn(`[EXEC] Error creating ${path}:`, err.message || JSON.stringify(err));
                    return { error: true };
                }
            }));

            for (const res of results) {
                if (res.rateLimit) {
                    console.error('[EXEC] Cloudinary Rate Limit Hit. Sleeping script for 1 hour would be ideal here.');
                    process.exit(1);
                }
                if (res.success) createdCount++;
                if (res.error) errorCount++;
            }
            console.log(`[EXEC] Progress: ${i + batch.length}/${pathsToCreate.length} processed.`);
        }

        console.log(`[EXEC] Done! Verified ${createdCount} folders. Errors: ${errorCount}`);
        process.exit(0);

    } catch (err) {
        console.error('[EXEC] Critical failure:', err);
        process.exit(1);
    }
}

initCloudinary();
