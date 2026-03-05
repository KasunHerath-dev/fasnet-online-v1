const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./src/models/Student');
const Result = require('./src/models/Result');
const Module = require('./src/models/Module');
const User = require('./src/models/User');

const seedStudentResults = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find the user '242074'
        const user = await User.findOne({ username: '242074' }); // Adjust if username is different
        if (!user || !user.studentRef) {
            console.log('User "student" not found or not linked.');
            return;
        }

        const student = await Student.findById(user.studentRef);
        console.log(`Seeding results for: ${student.fullName}`);

        // 2. Find some Level 1 Modules
        const modulesL1S1 = await Module.find({ level: 1, semester: 1 }).limit(3);
        const modulesL1S2 = await Module.find({ level: 1, semester: 2 }).limit(3);

        if (modulesL1S1.length === 0) {
            console.log('No modules found to seed with.');
            return;
        }

        // 3. Create Results
        const resultsToCreate = [];

        // L1S1: Good performance
        for (const mod of modulesL1S1) {
            resultsToCreate.push({
                student: student._id,
                module: mod._id,
                marks: 75,
                grade: 'A',
                gradePoint: 4.0,
                attempt: 1,
                academicYear: '2023/2024'
            });
        }

        // L1S2: Mixed performance
        for (const mod of modulesL1S2) {
            resultsToCreate.push({
                student: student._id,
                module: mod._id,
                marks: 65,
                grade: 'B+',
                gradePoint: 3.3,
                attempt: 1,
                academicYear: '2023/2024'
            });
        }

        // Clear existing results for this student to avoid dups
        await Result.deleteMany({ student: student._id });

        await Result.insertMany(resultsToCreate);
        console.log(`Successfully seeded ${resultsToCreate.length} results.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seedStudentResults();
