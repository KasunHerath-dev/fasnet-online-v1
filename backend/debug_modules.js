const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/My Test/FAS DATA BASE/workspace - 02/fasnet-deploy/backend/.env' });

const ModuleSchema = new mongoose.Schema({
    code: String,
    title: String,
    credits: Number,
    level: Number,
    semester: Number,
    department: String,
    prerequisites: [String]
});

const Module = mongoose.model('Module', ModuleSchema);
const Student = mongoose.model('Student', new mongoose.Schema({ combination: String }, { strict: false }));

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Check Modules
        const modules = await Module.find({});
        console.log(`Total Modules: ${modules.length}`);

        const depts = {};
        modules.forEach(m => {
            depts[m.department] = (depts[m.department] || 0) + 1;
        });
        console.log('Modules per Department:', depts);

        // Sample a few modules
        console.log('Sample Modules:', modules.slice(0, 3).map(m => ({ code: m.code, dept: m.department })));

        // Check Students
        const students = await Student.find({});
        console.log(`Total Students: ${students.length}`);
        const combs = {};
        students.forEach(s => {
            combs[s.combination] = (combs[s.combination] || 0) + 1;
        });
        console.log('Student Combinations:', combs);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
