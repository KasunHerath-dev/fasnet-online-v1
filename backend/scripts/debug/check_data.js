const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./src/models/Student');
const Result = require('./src/models/Result');
const User = require('./src/models/User');

const checkData = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const studentUser = await User.findOne({ username: '242074' });
        if (!studentUser) {
            console.log('User 242074 not found');
            return;
        }
        console.log('User found:', studentUser._id);

        const student = await Student.findById(studentUser.studentRef);
        if (!student) {
            console.log('Student profile not found');
            return;
        }
        console.log('Student found:', student.registrationNumber);

        const results = await Result.find({ student: student._id });
        console.log('Results count:', results.length);
        if (results.length > 0) {
            console.log('Sample result:', results[0]);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

// Timeout after 10s
setTimeout(() => {
    console.log('Timeout!');
    process.exit(1);
}, 10000);

checkData();
