import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Fix the path to point to the backend's .env file
dotenv.config({ path: path.join(process.cwd(), '../backend/.env') });

const ResultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    marks: { type: Number, default: 0 },
    grade: { type: String, required: true },
    gradePoint: { type: Number, required: true },
    attempt: { type: Number, default: 1 },
    academicYear: { type: String }
}, { timestamps: true });

const StudentSchema = new mongoose.Schema({
    registrationNumber: { type: String, required: true, unique: true },
    name: { type: String },
    firstName: { type: String },
    level: { type: Number },
    // ... basic details
});

const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema);
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);


async function testLatency() {
    try {
        console.log('Connecting to MongoDB...', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const testStudent = await Student.findOne();
        if (!testStudent) {
            console.log('No students found');
            process.exit(0);
        }

        console.log(`Testing query speed for student: ${testStudent.registrationNumber}`);

        console.time('DB Query: fetch student profile');
        const s = await Student.findById(testStudent._id);
        console.timeEnd('DB Query: fetch student profile');

        console.time('DB Query: fetch student results (no populate)');
        const results = await Result.find({ student: testStudent._id });
        console.timeEnd('DB Query: fetch student results (no populate)');

        console.time('DB Query: fetch student results (with populate)');
        const populatedResults = await Result.find({ student: testStudent._id }).populate('module');
        console.timeEnd('DB Query: fetch student results (with populate)');


    } catch (e) {
        console.error('Test failed', e);
    } finally {
        await mongoose.disconnect();
    }
}

testLatency();
