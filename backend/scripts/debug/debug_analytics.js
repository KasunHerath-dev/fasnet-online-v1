const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./src/models/Student');
const Result = require('./src/models/Result');
const User = require('./src/models/User');

const debugAnalytics = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // 1. Find the user 'student' OR '242074'
        let user = await User.findOne({ username: 'student' });
        if (!user) {
            console.log('User "student" not found. Trying "242074"...');
            user = await User.findOne({ username: '242074' });
        }
        if (!user) {
            console.log('User "242074" not found. Finding ANY user with studentRef...');
            user = await User.findOne({ studentRef: { $exists: true } });
        }
        if (!user) {
            console.log('❌ User "student" NOT found.');
            return;
        }
        console.log(`✅ User found: ${user.username} (${user._id})`);
        console.log('   Roles:', user.roles);
        console.log('   StudentRef:', user.studentRef);

        if (!user.studentRef) {
            console.log('❌ User has no studentRef.');
            return;
        }

        // 2. Find the Student Profile
        const student = await Student.findById(user.studentRef);
        if (!student) {
            console.log(`❌ Student profile ${user.studentRef} NOT found.`);
            return;
        }
        console.log(`✅ Student profile found: ${student.fullName} (${student.registrationNumber})`);
        console.log(`   Level: ${student.level}, Batch: ${student.batchYear}`);

        // 3. Find Results
        const results = await Result.find({ student: student._id }).populate('module');
        console.log(`🔍 Found ${results.length} results for this students.`);

        if (results.length === 0) {
            console.log('⚠️ No results found. Aggregation will return empty.');
        } else {
            console.log('--- Sample Result ---');
            console.log(JSON.stringify(results[0], null, 2));
        }

        // 4. Test Aggregation (mimic academicController.getStudentHistory)
        console.log('\n--- Testing Aggregation ---');
        const history = await Result.aggregate([
            { $match: { student: student._id } },
            {
                $lookup: {
                    from: 'modules',
                    localField: 'module',
                    foreignField: '_id',
                    as: 'moduleInfo'
                }
            },
            { $unwind: '$moduleInfo' },
            {
                $group: {
                    _id: {
                        level: '$moduleInfo.level',
                        semester: '$moduleInfo.semester'
                    },
                    gpa: { $avg: '$gradePoint' },
                    totalCredits: { $sum: '$moduleInfo.credits' },
                    earnedCredits: {
                        $sum: {
                            $cond: [{ $gte: ['$gradePoint', 2.0] }, '$moduleInfo.credits', 0]
                        }
                    }
                }
            },
            { $sort: { '_id.level': 1, '_id.semester': 1 } }
        ]);

        console.log('Aggregation Result:', JSON.stringify(history, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugAnalytics();
