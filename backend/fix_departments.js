const mongoose = require('mongoose');

// Default URI
const uri = 'mongodb://localhost:27017/fas_db';

const ModuleSchema = new mongoose.Schema({
    code: String,
    department: String
}, { strict: false });

const Module = mongoose.model('Module', ModuleSchema);

async function fixDepartments() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const modules = await Module.find({});
        console.log(`Found ${modules.length} modules.`);

        let updated = 0;
        let errors = 0;

        for (const m of modules) {
            if (!m.code) continue;

            // Extract Dept (First 3-4 letters)
            // e.g. CMIS1131 -> CMIS
            // PHY101 -> PHY (if exists)
            // But usually 4 letters in this context.
            const match = m.code.match(/^([A-Z]+)/);
            if (match) {
                const dept = match[1];
                m.department = dept;
                await m.save();
                updated++;
                // console.log(`Updated ${m.code} -> ${dept}`);
            } else {
                console.warn(`Could not parse department from code: ${m.code}`);
                errors++;
            }
        }

        console.log(`Migration Complete. Updated: ${updated}, Skipped: ${errors}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

fixDepartments();
