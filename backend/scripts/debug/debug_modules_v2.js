const mongoose = require('mongoose');

// Default URI from server.js
const uri = 'mongodb://localhost:27017/fas_db';

const ModuleSchema = new mongoose.Schema({
    code: String,
    title: String,
    credits: Number,
    level: Number,
    semester: Number,
    department: String,
    prerequisites: [String]
}, { strict: false });

const StudentSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    registrationNumber: String,
    combination: String
}, { strict: false });

const Module = mongoose.model('Module', ModuleSchema);
const Student = mongoose.model('Student', StudentSchema);

async function checkData() {
    try {
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // Check Modules
        const modules = await Module.find({});
        console.log(`Total Modules: ${modules.length}`);

        const depts = {};
        modules.forEach(m => {
            depts[m.department] = (depts[m.department] || 0) + 1;
        });
        console.log('Modules per Department:', depts);

        // Check level 1 modules specifically (since user sees 1131)
        const l1 = modules.filter(m => m.level === 1);
        console.log(`Level 1 Modules: ${l1.length}`);
        console.log('L1 Sample:', l1.slice(0, 3).map(m => `${m.code} (${m.department})`));

        // Check Students
        const students = await Student.find({});
        console.log(`Total Students: ${students.length}`);

        // Print all combinations found
        students.forEach(s => {
            console.log(`Student: ${s.firstName} ${s.lastName} (${s.registrationNumber}) - Comb: '${s.combination}'`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
