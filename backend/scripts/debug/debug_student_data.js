const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./src/models/Student');
const Result = require('./src/models/Result');
const Module = require('./src/models/Module');
const User = require('./src/models/User');

const debugStudentData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find the user 'student' (or any student user)
        // Adjust username if you know the specific test user, otherwise list a few
        const users = await User.find({ roles: 'student' }).limit(5);

        if (users.length === 0) {
            console.log('No student users found.');
            return;
        }

        console.log(`Found ${users.length} student users.`);

        for (const user of users) {
            console.log(`\n--- Inspecting User: ${user.username} ---`);
            if (!user.studentRef) {
                console.log('No studentRef linked!');
                continue;
            }

            const student = await Student.findById(user.studentRef);
            if (!student) {
                console.log(`Student profile not found for ID: ${user.studentRef}`);
                continue;
            }

            console.log(`Student: ${student.fullName} (${student.registrationNumber})`);
            console.log(`Level: ${student.level}, Combination: ${student.combination}`);

            // Check Results
            const results = await Result.find({ student: student._id }).populate('module');
            console.log(`Total Results Found: ${results.length}`);

            if (results.length > 0) {
                results.forEach(r => {
                    console.log(` - Module: ${r.module?.code} (${r.module?.level}S${r.module?.semester}): Grade ${r.grade}, GPA ${r.gradePoint}`);
                });
            } else {
                console.log(' > NO RESULTS FOUND. This explains the empty dashboard.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugStudentData();
