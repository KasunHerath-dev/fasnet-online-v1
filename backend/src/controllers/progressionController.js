const Student = require('../models/Student');
const Module = require('../models/Module');
const ModuleEnrollment = require('../models/ModuleEnrollment');
const Result = require('../models/Result');
const SemesterResult = require('../models/SemesterResult');
const AcademicProgressionHistory = require('../models/AcademicProgressionHistory');
const { calculateGrade, calculateGPA } = require('../utils/gradeCalculator');
const logger = require('../utils/logger');

// Enroll a student in a set of modules
const enrollModules = async (req, res) => {
    try {
        const { studentId, modules, academicYear, semester, level } = req.body;
        // modules = [{ moduleId, type: 'Compulsory'|'Optional' }]

        const enrollments = [];
        for (const m of modules) {
            // Check if already enrolled
            let enrollment = await ModuleEnrollment.findOne({
                student: studentId,
                module: m.moduleId,
                academicYear
            });

            if (!enrollment) {
                // Check if this is a repeat (exists in previous enrollment with fail status)
                // For simplicity, we assume frontend flags repeats or we check academic history
                // But for now, just create new enrollment
                enrollment = new ModuleEnrollment({
                    student: studentId,
                    module: m.moduleId,
                    academicYear,
                    semester,
                    level,
                    type: m.type || 'Compulsory',
                    status: 'Enrolled'
                });
                await enrollment.save();
            }
            enrollments.push(enrollment);
        }

        res.json({ message: 'Enrollment successful', enrollments });
    } catch (error) {
        logger.error('Enrollment error', error);
        res.status(500).json({ error: error.message });
    }
};

// Calculate Semester Results & Trigger Progression
// This is the core function called when exams are done
const calculateSemesterResults = async (req, res) => {
    try {
        const { studentId, academicYear, level, semester } = req.body;

        // 1. Get all enrollments for this semester context
        const enrollments = await ModuleEnrollment.find({
            student: studentId,
            academicYear,
            level,
            semester
        }).populate('module');

        if (enrollments.length === 0) {
            return res.status(404).json({ message: 'No enrollments found for this semester' });
        }

        const student = await Student.findById(studentId);

        // 2. Prepare Results for GPA Calculation
        const processedResults = [];
        let earnedCredits = 0;
        let totalCredits = 0;
        const failedModules = [];

        for (const enrollment of enrollments) {
            // Skip courses that are withdrawn or not graded yet (unless we are forcing calculation)
            // Assuming results are already updated in ModuleEnrollment via bulk upload

            if (enrollment.finalMark === undefined) continue;

            const gradeInfo = calculateGrade(enrollment.finalMark);

            // Update enrollment with calculated grade
            enrollment.grade = gradeInfo.grade;
            enrollment.gradePoint = gradeInfo.gp;
            enrollment.status = gradeInfo.status; // Passed / Failed
            enrollment.credits = enrollment.module.credits;
            await enrollment.save();

            // SYNC TO RESULT COLLECTION (Fix for GPA Calculation)
            await Result.findOneAndUpdate(
                { student: studentId, module: enrollment.module._id, attempt: 1 },
                {
                    marks: enrollment.finalMark,
                    grade: gradeInfo.grade,
                    gradePoint: gradeInfo.gp,
                    academicYear: academicYear,
                    attempt: 1
                },
                { upsert: true, new: true }
            );

            processedResults.push({
                gradePoint: gradeInfo.gp,
                credits: enrollment.module.credits
            });

            if (gradeInfo.grade !== 'I') { // Incomplete doesn't count to total intended credits usually, but for GPA is 0.0
                totalCredits += enrollment.module.credits;
            }

            if (gradeInfo.status === 'Passed') {
                earnedCredits += enrollment.module.credits;
                // If it was in repeat list, remove it? (Logic can be complex here)
            } else {
                // Failed
                failedModules.push(enrollment.module._id);
                // Add to student's repeat list if not already there
                const isRepeated = student.repeatModules.some(rm => rm.module.toString() === enrollment.module._id.toString());
                if (!isRepeated) {
                    student.repeatModules.push({
                        module: enrollment.module._id,
                        failedLevel: level,
                        failedSemester: semester
                    });
                }
            }
        }

        // 3. Calculate GPA
        const gpa = calculateGPA(processedResults);

        // 4. Save Semester Result
        const semesterResult = await SemesterResult.findOneAndUpdate(
            { student: studentId, academicYear, level, semester },
            {
                gpa,
                totalCredits,
                earnedCredits,
                status: failedModules.length > 0 ? 'Fail' : 'Pass', // Or "Pass with Repeats"
                moduleResults: enrollments.map(e => ({
                    moduleEnrollment: e._id,
                    moduleCode: e.module.code,
                    grade: e.grade,
                    credits: e.module.credits,
                    isRepeat: e.isRepeat
                }))
            },
            { upsert: true, new: true }
        );

        // 5. Update Student Logic (Cumulative GPA, etc.)
        // Simplified cumulative calculation could go here

        // 6. PROGRESSION LOGIC
        // Rule: "Students can move to the next semester with failed module"
        // So we ALWAYS progress unless there's a specific block (like strict GPA limit which user didn't specify strict fail for)

        // Define Next State
        let nextLevel = level;
        let nextSemester = semester + 1;
        if (nextSemester > 2) {
            nextLevel += 1;
            nextSemester = 1;
        }

        // Update Student
        const oldLevel = student.level;
        const oldSemester = student.currentSemester;

        // Only update if moving forward
        if (nextLevel > oldLevel || (nextLevel === oldLevel && nextSemester > oldSemester)) {
            student.level = nextLevel;
            student.currentSemester = nextSemester;

            // Update status if repeats exist
            if (student.repeatModules.length > 0) {
                student.academicStatus = 'Repeat';
            } else {
                student.academicStatus = 'Regular';
            }

            await student.save();

            // Log History
            await AcademicProgressionHistory.create({
                student: studentId,
                fromLevel: oldLevel,
                fromSemester: oldSemester,
                toLevel: nextLevel,
                toSemester: nextSemester,
                academicYear,
                status: failedModules.length > 0 ? 'Probationary Promotion' : 'Promoted',
                remarks: `GPA: ${gpa}. Failed Modules: ${failedModules.length}`
            });
        }

        res.json({
            message: 'Results calculated and student progressed',
            gpa,
            progression: {
                from: `${oldLevel}.${oldSemester}`,
                to: `${nextLevel}.${nextSemester}`
            },
            semesterResult
        });

    } catch (error) {
        logger.error('Calculation error', error);
        res.status(500).json({ error: error.message });
    }
};

// Get Analytics for Batch
const getBatchAnalytics = async (req, res) => {
    try {
        const { batch, level, semester } = req.query; // batch like "2020/2021"

        const results = await SemesterResult.find({
            academicYear: batch, // Assuming academicYear correlates with batch logic, or we filter students by batch loop
            level,
            semester
        });

        // 1. Pass/Fail Counts
        let passed = 0;
        let failed = 0;
        let total = results.length;
        const gpaList = [];

        results.forEach(r => {
            if (r.status === 'Pass') passed++;
            else failed++;
            gpaList.push(r.gpa);
        });

        // 2. Score Distribution (GPA)
        const distribution = {
            '0.0-1.9': 0,
            '2.0-2.4': 0,
            '2.5-2.9': 0,
            '3.0-3.4': 0,
            '3.5-4.0': 0
        };

        gpaList.forEach(g => {
            if (g < 2.0) distribution['0.0-1.9']++;
            else if (g < 2.5) distribution['2.0-2.4']++;
            else if (g < 3.0) distribution['2.5-2.9']++;
            else if (g < 3.5) distribution['3.0-3.4']++;
            else distribution['3.5-4.0']++;
        });

        res.json({
            totalStudents: total,
            passed,
            failed,
            avgGPA: total > 0 ? (gpaList.reduce((a, b) => a + b, 0) / total).toFixed(2) : 0,
            distribution
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Student Academic History
const getStudentHistory = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Security check: Students can only view their own history
        if (req.user.roles.includes('user') && !req.user.roles.includes('admin') && !req.user.roles.includes('superadmin')) {
            if (!req.user.studentRef) {
                return res.status(403).json({ message: 'Access denied: No student profile linked' });
            }
            if (req.user.studentRef.toString() !== studentId) {
                return res.status(403).json({ message: 'Access denied: You can only view your own history' });
            }
        }

        const history = await SemesterResult.find({ student: studentId })
            .sort({ level: 1, semester: 1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    enrollModules,
    calculateSemesterResults,
    getBatchAnalytics,
    getStudentHistory
};
