const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./src/models/Student');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testDashboard() {
    try {
        // Find a student user
        const user = await User.findOne({ role: 'student' }).populate('studentRef');

        if (!user) {
            console.log('No student user found');
            return;
        }

        console.log('Found user:', {
            username: user.username,
            role: user.role,
            hasStudentRef: !!user.studentRef,
            studentRefId: user.studentRef?._id
        });

        if (user.studentRef) {
            console.log('\nStudent details:', {
                name: user.studentRef.name,
                level: user.studentRef.level,
                batch: user.studentRef.batch,
                combination: user.studentRef.combination
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testDashboard();
