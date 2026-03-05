const Module = require('../models/Module');
const Result = require('../models/Result');
const Student = require('../models/Student');

// Grade Scale Logic
const getGradeDetails = (marks) => {
    if (marks >= 85) return { grade: 'A+', gp: 4.0 };
    if (marks >= 70) return { grade: 'A', gp: 4.0 };
    if (marks >= 65) return { grade: 'A-', gp: 3.7 };
    if (marks >= 60) return { grade: 'B+', gp: 3.3 };
    if (marks >= 55) return { grade: 'B', gp: 3.0 };
    if (marks >= 50) return { grade: 'B-', gp: 2.7 };
    if (marks >= 45) return { grade: 'C+', gp: 2.3 };
    if (marks >= 40) return { grade: 'C', gp: 2.0 };
    if (marks >= 35) return { grade: 'C-', gp: 1.7 };
    if (marks >= 30) return { grade: 'D+', gp: 1.3 };
    if (marks >= 25) return { grade: 'D', gp: 1.0 };
    return { grade: 'E', gp: 0.0 };
};

// Auto-Progression Helper: Evaluates earned credits and promotes student level/semester
const evaluateStudentProgression = async (studentId) => {
    try {
        const results = await Result.find({ student: studentId }).populate('module');
        let earnedCredits = 0;

        results.forEach(r => {
            // Only count passing grades (exclude I, F, E, N for progression triggers)
            if (r.module && r.grade && !['I', 'F', 'E', 'N'].includes(r.grade.toUpperCase())) {
                earnedCredits += r.module.credits;
            }
        });

        // WUSL Threshold Estimation (Assuming ~15 credits per semester, ~30 per level)
        let newLevel = 1;
        let newSemester = 1;

        if (earnedCredits >= 103) { newLevel = 4; newSemester = 2; }
        else if (earnedCredits >= 88) { newLevel = 4; newSemester = 1; }
        else if (earnedCredits >= 73) { newLevel = 3; newSemester = 2; }
        else if (earnedCredits >= 58) { newLevel = 3; newSemester = 1; }
        else if (earnedCredits >= 43) { newLevel = 2; newSemester = 2; }
        else if (earnedCredits >= 28) { newLevel = 2; newSemester = 1; }
        else if (earnedCredits >= 14) { newLevel = 1; newSemester = 2; }

        // Update the Student record silently
        await Student.findByIdAndUpdate(studentId, {
            level: newLevel,
            currentSemester: newSemester,
            totalCreditsEarned: earnedCredits
        });

    } catch (error) {
        console.error("Auto-progression evaluation failed:", error);
    }
};

// Get all modules
exports.getModules = async (req, res) => {
    try {
        const modules = await Module.find().sort({ level: 1, code: 1 });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new module
exports.createModule = async (req, res) => {
    try {
        const module = new Module(req.body);
        await module.save();
        res.status(201).json(module);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add a result for a student
exports.addResult = async (req, res) => {
    try {
        const { studentId, moduleId, marks, attempt, academicYear, isAbsent } = req.body;

        let grade, gp;

        if (isAbsent) {
            grade = 'I';
            gp = 0.0;
        } else {
            const details = getGradeDetails(marks);
            grade = details.grade;
            gp = details.gp;

            // Handle Repeat Attempts (Max Grade C)
            if (attempt > 1 && gp > 2.0) {
                grade = 'C';
                gp = 2.0;
            }
        }

        const result = new Result({
            student: studentId,
            module: moduleId,
            marks: isAbsent ? 0 : marks,
            grade,
            gradePoint: gp,
            attempt: attempt || 1,
            academicYear
        });

        await result.save();

        // Populate module details for response
        await result.populate('module');

        // Trigger Auto-Progression evaluation silently
        await evaluateStudentProgression(studentId);

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an existing result
exports.updateResult = async (req, res) => {
    try {
        const { resultId } = req.params;
        const { marks, attempt, academicYear, isAbsent } = req.body;

        const result = await Result.findById(resultId);
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        let grade, gp;
        if (isAbsent) {
            grade = 'I';
            gp = 0.0;
        } else {
            const details = getGradeDetails(marks);
            grade = details.grade;
            gp = details.gp;

            if (attempt > 1 && gp > 2.0) {
                grade = 'C';
                gp = 2.0;
            }
        }

        result.marks = isAbsent ? 0 : marks;
        result.grade = grade;
        result.gradePoint = gp;
        result.attempt = attempt || result.attempt;
        result.academicYear = academicYear || result.academicYear;

        await result.save();
        await result.populate('module'); // Return populated for UI update

        // Trigger Auto-Progression evaluation silently
        await evaluateStudentProgression(result.student);

        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get student's academic profile (GPA, Results)
exports.getStudentAcademicProfile = async (req, res) => {
    try {
        const { studentId } = req.params;

        const results = await Result.find({ student: studentId })
            .populate('module')
            .sort({ 'module.level': 1, 'module.code': 1 });

        const validResults = results.filter(r => r.module); // Filter out orphaned results

        // Calculate GPAs
        const calculateGPA = (moduleResults) => {
            if (!moduleResults.length) return 0;
            const totalWeightedGP = moduleResults.reduce((sum, r) => sum + (r.gradePoint * r.module.credits), 0);
            const totalCredits = moduleResults.reduce((sum, r) => sum + r.module.credits, 0);
            return totalCredits > 0 ? (totalWeightedGP / totalCredits).toFixed(2) : 0;
        };

        const level1Results = validResults.filter(r => r.module.level === 1);
        const level2Results = validResults.filter(r => r.module.level === 2);
        const level3Results = validResults.filter(r => r.module.level === 3);
        const level4Results = validResults.filter(r => r.module.level === 4);

        // Honours Classification Logic
        const getHonoursClass = (gpa, credits, degreeProgramme) => {
            const numGpa = parseFloat(gpa);

            // B.Sc. (General) - 3 Years
            if (degreeProgramme?.includes('General')) {
                if (numGpa >= 3.70 && credits >= 90) return 'First Class Honours';
                if (numGpa >= 3.30 && credits >= 84) return 'Second Class (Upper Division)';
                if (numGpa >= 3.00 && credits >= 80) return 'Second Class (Lower Division)';
                return 'Pass Degree';
            }

            // B.Sc. (Joint Major/Special) - 4 Years
            if (numGpa >= 3.70 && credits >= 120) return 'First Class Honours';
            if (numGpa >= 3.30 && credits >= 112) return 'Second Class (Upper Division)';
            if (numGpa >= 3.00 && credits >= 104) return 'Second Class (Lower Division)';
            return 'Pass Degree';
        };

        // Dean's List Logic (Annual)
        const getDeansListStatus = (levelResults) => {
            if (!levelResults || levelResults.length === 0) return 'NOT ELIGIBLE';

            const annualCredits = levelResults.reduce((sum, r) => sum + r.module.credits, 0);
            const annualGPA = calculateGPA(levelResults);
            const hasFailures = levelResults.some(r => r.gradePoint < 2.0); // Less than C

            if (annualCredits >= 30 && annualGPA >= 3.70 && !hasFailures) {
                return 'ELIGIBLE';
            }
            return 'NOT ELIGIBLE';
        };

        const student = await Student.findById(studentId);
        const overallGPA = calculateGPA(results);
        const totalCredits = results.reduce((sum, r) => sum + r.module.credits, 0);

        const profile = {
            results,
            studentDetails: {
                combination: student.combination,
                isCombinationLocked: student.isCombinationLocked,
                degreeProgramme: student.degreeProgramme,
                currentLevel: student.level
            },
            gpa: {
                overall: overallGPA,
                level1: calculateGPA(level1Results),
                level2: calculateGPA(level2Results),
                level3: calculateGPA(level3Results),
                level4: calculateGPA(level4Results)
            },
            credits: {
                total: totalCredits,
                level1: level1Results.reduce((sum, r) => sum + r.module.credits, 0),
                level2: level2Results.reduce((sum, r) => sum + r.module.credits, 0),
                level3: level3Results.reduce((sum, r) => sum + r.module.credits, 0),
                level4: level4Results.reduce((sum, r) => sum + r.module.credits, 0)
            },
            honours: getHonoursClass(overallGPA, totalCredits, student.degreeProgramme),
            deansList: {
                level1: getDeansListStatus(level1Results),
                level2: getDeansListStatus(level2Results),
                level3: getDeansListStatus(level3Results),
                level4: getDeansListStatus(level4Results)
            }
        };

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Assessment System Logic ---

const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');

// Create a new assessment
exports.createAssessment = async (req, res) => {
    try {
        const assessment = new Assessment({
            ...req.body,
            createdBy: req.user._id
        });
        await assessment.save();
        res.status(201).json(assessment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Bulk add assessment results
exports.addAssessmentResults = async (req, res) => {
    try {
        const { assessmentId, results } = req.body; // results: [{ registrationNumber, marks }]

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        const processedResults = [];
        const errors = [];

        for (const entry of results) {
            const student = await Student.findOne({ registrationNumber: entry.registrationNumber });
            if (!student) {
                errors.push(`Student not found: ${entry.registrationNumber}`);
                continue;
            }

            try {
                const result = await AssessmentResult.findOneAndUpdate(
                    { assessment: assessmentId, student: student._id },
                    { marks: entry.marks },
                    { upsert: true, new: true }
                );
                processedResults.push(result);
            } catch (err) {
                errors.push(`Error for ${entry.registrationNumber}: ${err.message}`);
            }
        }

        // Trigger final grade calculation for this module and these students
        // This can be done asynchronously or on-demand
        // For now, we'll just return the status

        res.json({
            message: 'Results processed',
            successCount: processedResults.length,
            errors
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Calculate Final Grade for a Module
exports.calculateFinalGrade = async (req, res) => {
    try {
        const { moduleId, batchYear } = req.body;

        // Fetch all assessments for this module and batch
        const assessments = await Assessment.find({ module: moduleId, batchYear });

        // Group assessments by type
        const assessmentsByType = {
            'Tutorial': [],
            'Quiz': [],
            'Assignment': [],
            'Mid': [],
            'End': []
        };
        assessments.forEach(a => assessmentsByType[a.type]?.push(a));

        // Get all students in this batch (simplified for now, ideally filter by enrollment)
        const students = await Student.find({ batchYear });

        const finalResults = [];

        for (const student of students) {
            let totalScore = 0;

            // Helper to calculate component score
            const calculateComponentScore = async (type, weightage) => {
                const typeAssessments = assessmentsByType[type];
                if (!typeAssessments || typeAssessments.length === 0) return 0;

                let earnedMarks = 0;
                let maxPossibleMarks = 0;

                for (const assessment of typeAssessments) {
                    const result = await AssessmentResult.findOne({ assessment: assessment._id, student: student._id });
                    if (result) {
                        earnedMarks += result.marks;
                    }
                    maxPossibleMarks += assessment.maxMarks;
                }

                if (maxPossibleMarks === 0) return 0;

                // Normalize to the weightage percentage
                // (Earned / Max) * Weightage
                return (earnedMarks / maxPossibleMarks) * weightage;
            };

            // Calculate weighted scores
            // Tutorials (5%), Quiz (5%), Assignment (5%), Mid (15%), End (70%)
            // Note: User said "amount varies depending on number", implying average or sum normalized to weight
            // The formula (SumEarned / SumMax) * Weightage handles "multiple items" correctly by averaging their contribution relative to the total max marks.

            totalScore += await calculateComponentScore('Tutorial', 5);
            totalScore += await calculateComponentScore('Quiz', 5);
            totalScore += await calculateComponentScore('Assignment', 5); // Covers Assignments, Presentations, Lab Reports
            totalScore += await calculateComponentScore('Mid', 15);
            totalScore += await calculateComponentScore('End', 70);

            // Update or Create Final Result
            const { grade, gp } = getGradeDetails(totalScore);

            const finalResult = await Result.findOneAndUpdate(
                { student: student._id, module: moduleId, attempt: 1 }, // Assuming 1st attempt for auto-calc
                {
                    marks: Math.round(totalScore),
                    grade,
                    gradePoint: gp,
                    academicYear: batchYear // Or derived from current date
                },
                { upsert: true, new: true }
            );
            finalResults.push(finalResult);

            // Trigger progression evaluation for this student
            await evaluateStudentProgression(student._id);
        }

        res.json({ message: 'Final grades calculated', count: finalResults.length });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Promote Students (Batch-wise Auto-Advance)
exports.promoteStudents = async (req, res) => {
    try {
        const { batchYear } = req.body;

        if (!batchYear) return res.status(400).json({ message: 'Batch Year is required' });

        // 1. Find all students in batch.
        const students = await Student.find({ batchYear });

        // 2. Prepare bulk operations.
        const bulkOps = students.map(student => {
            let update = {};
            if (student.currentSemester === 1) {
                update = { $set: { currentSemester: 2 } };
            } else {
                update = {
                    $inc: { level: 1 },
                    $set: { currentSemester: 1 }
                };
            }
            return {
                updateOne: {
                    filter: { _id: student._id },
                    update: update
                }
            };
        });

        if (bulkOps.length > 0) {
            await Student.bulkWrite(bulkOps);
        }

        res.json({
            message: `Promoted students in batch ${batchYear}`,
            count: bulkOps.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Repeaters (Students with Grade < C)
exports.getRepeaters = async (req, res) => {
    try {
        const { batchYear, moduleId } = req.query;

        const query = { gradePoint: { $lt: 2.0 } }; // Less than C (2.0)

        if (moduleId) query.module = moduleId;

        // If batchYear is provided, we need to filter by student's batch
        // This requires a lookup or two-step query. Two-step is often simpler for Mongoose without aggregate.
        let studentIds = null;
        if (batchYear) {
            const students = await Student.find({ batchYear }).select('_id');
            studentIds = students.map(s => s._id);
            query.student = { $in: studentIds };
        }

        const repeaters = await Result.find(query)
            .populate('student', 'registrationNumber fullName batchYear')
            .populate('module', 'code title')
            .sort({ 'student.registrationNumber': 1 });

        res.json(repeaters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Module Analytics (Pass/Fail, Grade Dist)
exports.getModuleAnalytics = async (req, res) => {
    try {
        const { moduleId, batchYear } = req.query;

        if (!moduleId) return res.status(400).json({ message: 'Module ID is required' });

        const query = { module: moduleId };
        if (batchYear) {
            const students = await Student.find({ batchYear }).select('_id');
            query.student = { $in: students.map(s => s._id) };
        }

        const results = await Result.find(query);

        const total = results.length;
        const passed = results.filter(r => r.gradePoint >= 2.0).length;
        const failed = total - passed;

        const gradeDistribution = {
            'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'I': 0
        };

        results.forEach(r => {
            const firstChar = r.grade.charAt(0);
            if (gradeDistribution[firstChar] !== undefined) {
                gradeDistribution[firstChar]++;
            }
        });

        res.json({
            total,
            passed,
            failed,
            passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : 0,
            gradeDistribution
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Batch Analytics (Batch Performance)
exports.getBatchAnalytics = async (req, res) => {
    try {
        const { batchYear, level, semester } = req.query;

        if (!batchYear) return res.status(400).json({ message: 'Batch Year is required' });

        // 1. Find all students in the batch
        const students = await Student.find({ batchYear }).select('_id');
        const studentIds = students.map(s => s._id);
        const totalStudents = students.length;

        if (totalStudents === 0) {
            return res.json({
                totalStudents: 0,
                passed: 0,
                failed: 0,
                avgGPA: 0,
                distribution: {},
                passResults: [],
                failResults: []
            });
        }

        // 2. Find results for this batch's level/semester
        // Note: 'semester' in Results usually corresponds to the module's semester.
        // We need to find modules for this Level/Semester first.
        const modules = await Module.find({ level: level, semester: semester }).select('_id credits');
        const moduleIds = modules.map(m => m._id);

        // Fetch all results for these students in these modules
        const results = await Result.find({
            student: { $in: studentIds },
            module: { $in: moduleIds }
        }).populate('module');

        // Logic: Pass/Fail is determined by GPA per semester or just raw Pass/Fail counts?
        // User request implies general "Passed / Failed".
        // Let's define "Failed" as having any F (E grade) or I (Incomplete) in ANY module of that semester.
        // "Passed" means all modules are C or above (or at least no failures).

        const studentPerformance = {}; // { studentId: { failures: 0, totalGP: 0, totalCredits: 0 } }

        results.forEach(r => {
            if (!studentPerformance[r.student]) {
                studentPerformance[r.student] = { failures: 0, totalGP: 0, totalCredits: 0 };
            }

            // Check failure (E or I, or GP < 2.0 depending on strictness. Let's say < 2.0 (C) is a "repeat" candidate)
            if (r.gradePoint < 2.0) {
                studentPerformance[r.student].failures++;
            }

            studentPerformance[r.student].totalGP += (r.gradePoint * r.module.credits);
            studentPerformance[r.student].totalCredits += r.module.credits;
        });

        let passedCount = 0;
        let failedCount = 0;
        let totalBatchGPA = 0;
        let gpaCount = 0;

        const gpaDistribution = {
            '0.00-1.99': 0,
            '2.00-2.49': 0,
            '2.50-2.99': 0,
            '3.00-3.49': 0,
            '3.50-4.00': 0
        };

        // Classify each student
        for (const sId of studentIds) {
            const perf = studentPerformance[sId];
            if (!perf) {
                // No results found for this student in this semester -> Treat as Absent/Fail or Ignore?
                // For statistics, if they are in the batch but have no results, they might be inactive.
                // We will count them as "No Data" or just ignore for GPA calc, but count in total.
                continue;
            }

            if (perf.failures > 0) {
                failedCount++;
            } else {
                passedCount++;
            }

            // Calculate Semester GPA
            const semGPA = perf.totalCredits > 0 ? (perf.totalGP / perf.totalCredits) : 0;
            totalBatchGPA += semGPA;
            gpaCount++;

            // Distribution
            if (semGPA < 2.0) gpaDistribution['0.00-1.99']++;
            else if (semGPA < 2.5) gpaDistribution['2.00-2.49']++;
            else if (semGPA < 3.0) gpaDistribution['2.50-2.99']++;
            else if (semGPA < 3.5) gpaDistribution['3.00-3.49']++;
            else gpaDistribution['3.50-4.00']++;
        }

        const avgGPA = gpaCount > 0 ? (totalBatchGPA / gpaCount).toFixed(2) : 0;

        res.json({
            totalStudents,
            passed: passedCount,
            failed: failedCount,
            avgGPA,
            distribution: gpaDistribution
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Degree Selection (Level 2 -> 3) ---

// Get Candidates for Degree Selection (Level 2 Students)
exports.getDegreeCandidates = async (req, res) => {
    try {
        const { batchYear } = req.query;

        const query = { level: 2 };
        if (batchYear) query.batchYear = batchYear;

        const students = await Student.find(query).select('registrationNumber fullName batchYear currentSemester degreeProgramme level');

        // Calculate GPA for each student to help with selection
        const candidates = [];
        for (const student of students) {
            const results = await Result.find({ student: student._id }).populate('module');
            const gpa = calculateGPA(results);
            candidates.push({
                ...student.toObject(),
                gpa
            });
        }

        // Sort by GPA descending
        candidates.sort((a, b) => b.gpa - a.gpa);

        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign Degree and Promote to Level 3
exports.assignDegree = async (req, res) => {
    try {
        const { studentId, degreeProgramme } = req.body;

        if (!studentId || !degreeProgramme) {
            return res.status(400).json({ message: 'Student ID and Degree Programme are required' });
        }

        const student = await Student.findByIdAndUpdate(
            studentId,
            {
                degreeProgramme,
                level: 3,
                currentSemester: 1
            },
            { new: true }
        );

        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.json({ message: 'Degree assigned and student promoted to Level 3', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Set Student Combination (and Lock it)
exports.setCombination = async (req, res) => {
    try {
        const { combination } = req.body;
        const userId = req.user._id;

        let student;

        // Priority 1: Use the student linked in the User record
        if (req.user.studentRef) {
            student = await Student.findById(req.user.studentRef);
            // Auto-heal backlink
            if (student && (!student.userRef || String(student.userRef) !== String(userId))) {
                student.userRef = userId;
                await student.save();
            }
        }

        // Priority 2: Fallback
        if (!student) {
            student = await Student.findOne({ userRef: userId });
        }

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        if (student.isCombinationLocked) {
            return res.status(403).json({ message: 'Combination is locked. Contact admin to change.' });
        }

        student.combination = combination;
        student.isCombinationLocked = true;
        await student.save();

        res.json({ message: 'Combination saved and locked', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Unlock Combination
exports.unlockCombination = async (req, res) => {
    try {
        const { studentId } = req.body;
        const student = await Student.findByIdAndUpdate(
            studentId,
            { isCombinationLocked: false },
            { new: true }
        );
        res.json({ message: 'Combination unlocked', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bulk Update Combinations (Excel/CSV)
exports.bulkUpdateCombination = async (req, res) => {
    try {
        const { batchYear, combination } = req.body;

        // Scope Check for Admin
        if (req.user.roles.includes('admin') && !req.user.roles.includes('superadmin')) {
            if (req.user.batchScope && String(req.user.batchScope) !== String(batchYear)) {
                return res.status(403).json({ message: 'You are not authorized for this batch' });
            }
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const XLSX = require('xlsx');

        let data = [];
        try {
            // Read the buffer
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Parse as objects (not 2D array) to handle headers dynamically
            data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        } catch (parseError) {
            console.error("File Parse Error:", parseError);
            return res.status(400).json({ message: 'Failed to parse file. Ensure it is a valid CSV or Excel file.' });
        }

        if (!data || data.length === 0) {
            return res.status(400).json({ message: 'The uploaded file is empty or unreadable.' });
        }

        let updatedCount = 0;
        let errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            // Aggressive Header Matching for Registration Number
            let regNumStr = '';
            for (const key of Object.keys(row)) {
                // Clean the key (header name) from the file
                const cleanKey = String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, '');

                // Look for common variations of Registration Number
                if (
                    cleanKey.includes('reg') ||
                    cleanKey.includes('id') ||
                    cleanKey.includes('index') ||
                    cleanKey.includes('student')
                ) {
                    regNumStr = String(row[key]).trim(); // Extract value
                    break;
                }
            }

            // Fallback: If no header matches, assume it's a file without headers and the reg num is the first key's value
            if (!regNumStr) {
                const firstKey = Object.keys(row)[0];
                regNumStr = String(row[firstKey]).trim();
            }

            if (!regNumStr || regNumStr.length < 4) {
                errors.push({ regNum: `Row ${i + 2}`, message: 'Invalid or missing Registration Number in file' });
                continue;
            }

            try {
                // Find student by Registration Number AND Batch
                const student = await Student.findOne({
                    registrationNumber: new RegExp('^' + regNumStr + '$', 'i'), // Case-insensitive exact match
                    batchYear: new RegExp(batchYear, 'i') // Flexible matching (e.g., "2020" matches "2020/2021")
                });

                if (student) {
                    student.combination = combination;
                    student.isCombinationLocked = true;
                    await student.save();
                    updatedCount++;
                } else {
                    console.warn(`Bulk Update: Student ${regNumStr} not found in batch matching "${batchYear}"`);
                    errors.push({ regNum: regNumStr, message: `Student ${regNumStr} not found in batch "${batchYear}"` });
                }
            } catch (err) {
                console.error(`DB Error for ${regNumStr}:`, err);
                errors.push({ regNum: regNumStr, message: 'Database lookup error' });
            }
        }

        res.json({
            success: true,
            message: 'Bulk update completed',
            updatedCount: updatedCount,
            totalProcessed: data.length,
            errors: errors
        });

    } catch (error) {
        console.error("Bulk Update Crash:", error);
        res.status(500).json({ message: error.message || 'An unexpected error occurred during bulk update' });
    }
};

// Get Current Student's Enrollments
exports.getMyEnrollments = async (req, res) => {
    try {
        const studentId = req.user.studentRef;
        if (!studentId) {
            return res.status(400).json({ message: 'No student profile linked to this user' });
        }

        const ModuleEnrollment = require('../models/ModuleEnrollment');
        const Student = require('../models/Student');
        const Module = require('../models/Module'); // Ensure Module is imported

        // 1. Fetch Student Profile to get Combination
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        let modules = [];

        // 2. Fetch via Enrollments (Primary Source of specific classes)
        const enrollments = await ModuleEnrollment.find({
            student: studentId,
            status: { $in: ['Enrolled', 'Completed', 'Passed', 'Failed'] }
        }).populate('module');

        const enrollmentModules = enrollments.map(e => e.module);

        // 3. Fetch via Combination (Secondary/Fallback Source)
        let combinationModules = [];
        if (student.combination) {
            // Normalize: Remove non-alphanumeric, convert to uppercase
            // e.g. "Comb-1" -> "COMB1", "Combination 1" -> "COMBINATION1"
            const rawCombo = student.combination.toUpperCase();
            const normalizedCombo = rawCombo.replace(/[^A-Z0-9]/g, '');

            let targetDepartments = [];

            // Robust Matching
            if (normalizedCombo.includes('COMB1') || rawCombo.includes('1')) {
                targetDepartments = ['MATH', 'CMIS', 'ELTN', 'STAT'];
            } else if (normalizedCombo.includes('COMB2') || rawCombo.includes('2')) {
                targetDepartments = ['MATH', 'ELTN', 'IMGT', 'STAT'];
            } else if (normalizedCombo.includes('COMB3') || rawCombo.includes('3')) {
                targetDepartments = ['MATH', 'IMGT', 'CMIS', 'STAT'];
            } else if (normalizedCombo.includes('PHYSICAL') || normalizedCombo.includes('PHY')) {
                targetDepartments = ['MATH', 'PHY', 'CHEM', 'CMIS']; // Assuming typical Mapping
            }

            if (targetDepartments.length > 0) {
                combinationModules = await Module.find({
                    department: { $in: targetDepartments }
                }).sort({ level: 1, semester: 1, code: 1 });
            }
        }

        // 4. Merge and Deduplicate
        // Use a Map to deduplicate by _id
        const moduleMap = new Map();

        // Add combination modules first (general)
        combinationModules.forEach(m => moduleMap.set(String(m._id), m));

        // Add enrollment modules (specifics - might overwrite but that's fine, they are the same object)
        enrollmentModules.forEach(m => {
            if (m) moduleMap.set(String(m._id), m);
        });

        modules = Array.from(moduleMap.values());

        // Sort final list
        modules.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            if (a.semester !== b.semester) return a.semester - b.semester;
            return a.code.localeCompare(b.code);
        });

        res.json(modules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Modules for Current Student (Specific to Combination)
exports.getStudentModules = async (req, res) => {
    try {
        const studentId = req.user.studentRef;
        if (!studentId) {
            return res.status(400).json({ message: 'No student profile linked' });
        }

        const Student = require('../models/Student');
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const combination = student.combination;

        // 1. Try to get Combination Definitions from SystemSettings
        const SystemSetting = require('../models/SystemSetting');
        const settings = await SystemSetting.findOne({ key: 'academic_combinations' });

        let allowedDepartments = [];
        let description = '';

        if (settings && combination && settings.value[combination]) {
            allowedDepartments = settings.value[combination].subjects || [];
            description = settings.value[combination].description;
        } else if (combination) {
            // Fallback: Hardcoded combination -> department mapping
            console.warn(`Combination ${combination} not in SystemSettings — using hardcoded fallback.`);
            const rawCombo = combination.toUpperCase();
            const normalizedCombo = rawCombo.replace(/[^A-Z0-9]/g, '');

            const COMBINATION_MAP = {
                'COMB1': { departments: ['MATH', 'CMIS', 'ELTN', 'STAT'], description: 'Combination 1: Mathematics, Computing, Electronics & Statistics' },
                'COMB2': { departments: ['MATH', 'ELTN', 'IMGT', 'STAT'], description: 'Combination 2: Mathematics, Electronics, Information Management & Statistics' },
                'COMB3': { departments: ['MATH', 'IMGT', 'CMIS', 'STAT'], description: 'Combination 3: Mathematics, Information Management, Computing & Statistics' },
                'INDT': { departments: ['CMIS', 'MATH', 'STAT', 'ELTN'], description: 'Industrial Technology Combination' },
                'MMOD': { departments: ['MATH', 'STAT', 'IMGT', 'CMIS'], description: 'Mathematical Modelling Combination' },
            };

            // Match against known keys
            const matchedKey = Object.keys(COMBINATION_MAP).find(k => normalizedCombo.includes(k));
            if (matchedKey) {
                allowedDepartments = COMBINATION_MAP[matchedKey].departments;
                description = COMBINATION_MAP[matchedKey].description;
            } else {
                // Last resort: return all modules so the page isn't blank
                console.warn(`No fallback found for combination: ${combination}. Returning all modules.`);
            }
        }

        // 2. Fetch Modules
        let query = {};
        if (allowedDepartments.length > 0) {
            query.department = { $in: allowedDepartments };
        }
        // If no combination set at all AND no departments → returns all modules
        // If combination set but no match found → also returns all modules (last resort)

        const modules = await Module.find(query)
            .lean()
            .sort({ level: 1, semester: 1, code: 1 });

        // 3. Fetch Student Results (to merge grade/status)
        const results = await Result.find({ student: studentId }).lean();

        // 4. Merge Data
        const modulesWithResults = modules.map(m => {
            const result = results.find(r => r.module.toString() === m._id.toString());
            let status = 'Not Enrolled';
            if (result) {
                if (result.gradePoint >= 2.0) status = 'Completed';
                else if (result.marks > 0 || result.grade) status = 'Completed';
                else status = 'Enrolled';
            }

            return {
                ...m,
                result: result ? result : null,
                status
            };
        });

        res.json({
            combination,
            description,
            modules: modulesWithResults
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Student History (Semester-wise Results for Progression)
exports.getStudentHistory = async (req, res) => {
    try {
        const { studentId } = req.params;

        const results = await Result.find({ student: studentId })
            .populate('module')
            .sort({ 'module.level': 1, 'module.semester': 1 }); // Sort by time

        // Group by Level + Semester
        // Key: L1S1, L1S2, etc.
        const historyMap = new Map();

        results.forEach(result => {
            if (!result.module) return; // Skip orphaned results
            const level = result.module.level;
            const semester = result.module.semester;
            const key = `L${level}S${semester}`;

            if (!historyMap.has(key)) {
                historyMap.set(key, {
                    key,
                    level,
                    semester,
                    totalGP: 0,
                    totalCredits: 0,
                    earnedCredits: 0,
                    results: []
                });
            }

            const semesterJava = historyMap.get(key);
            semesterJava.results.push(result);

            // GPA Calculation Logic
            semesterJava.totalGP += (result.gradePoint * result.module.credits);
            semesterJava.totalCredits += result.module.credits;

            // Credits Earned (Passed)
            if (result.gradePoint >= 2.0 || result.grade === 'C' || result.grade === 'D') { // D is a pass? Usually D is pass but low.
                // Assuming >= 2.0 is solid pass, but D (1.0) earns credits?
                // Standard: E (0.0) fails. D(1.0) usually earns credits but brings down GPA.
                if (result.grade !== 'E' && result.grade !== 'F' && result.grade !== 'I') {
                    semesterJava.earnedCredits += result.module.credits;
                }
            }
        });

        const history = Array.from(historyMap.values()).map(sem => {
            return {
                semester: sem.key,
                level: sem.level,
                semNo: sem.semester,
                gpa: sem.totalCredits > 0 ? parseFloat((sem.totalGP / sem.totalCredits).toFixed(2)) : 0,
                totalCredits: sem.totalCredits,
                earnedCredits: sem.earnedCredits,
                status: sem.totalCredits > 0 ? 'Completed' : 'Pending'
            };
        });

        // Sort to ensure order
        history.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.semNo - b.semNo;
        });

        res.json(history);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Student Dashboard Data
exports.getStudentDashboard = async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log('📊 Dashboard endpoint called with studentId:', studentId);

        // Fetch student details
        const student = await Student.findById(studentId);
        if (!student) {
            console.log('❌ Student not found for ID:', studentId);
            return res.status(404).json({ message: 'Student not found' });
        }
        console.log('✅ Student found:', student.name);

        // Fetch all results for GPA calculation
        const results = await Result.find({ student: studentId })
            .populate('module')
            .lean()
            .sort({ 'module.level': 1, 'module.code': 1 });
        console.log(`📚 Found ${results.length} results`);

        // Filter out orphaned results (where module was deleted)
        const validResults = results.filter(r => r.module);
        console.log(`✅ Valid results: ${validResults.length}`);

        // Calculate overall GPA
        const calculateGPA = (moduleResults) => {
            if (!moduleResults.length) return 0;
            const totalWeightedGP = moduleResults.reduce((sum, r) => sum + (r.gradePoint * r.module.credits), 0);
            const totalCredits = moduleResults.reduce((sum, r) => sum + r.module.credits, 0);
            return totalCredits > 0 ? parseFloat((totalWeightedGP / totalCredits).toFixed(2)) : 0;
        };

        const overallGPA = calculateGPA(validResults);
        const totalCreditsEarned = validResults.reduce((sum, r) => sum + r.module.credits, 0);
        console.log(`📊 GPA: ${overallGPA}, Credits: ${totalCreditsEarned}`);

        // Determine total credits required based on degree programme
        const creditsRequired = student.degreeProgramme?.includes('General') ? 90 : 120;

        // Fetch Combination Subjects from System Settings
        const SystemSetting = require('../models/SystemSetting');
        const settings = await SystemSetting.findOne({ key: 'academic_combinations' });
        let combinationSubjects = [];
        if (student.combination && settings && settings.value[student.combination]) {
            combinationSubjects = settings.value[student.combination].subjects || [];
        }

        // Prepare dashboard response
        const dashboardData = {
            student: {
                name: student.fullName || `${student.firstName} ${student.lastName}`.trim(),
                firstName: student.firstName || student.fullName?.split(' ')[0] || '',
                registrationNumber: student.registrationNumber,
                level: student.level,
                batch: student.batch,
                combination: student.combination || 'Not Set',
                combinationSubjects: combinationSubjects,
                degreeProgramme: student.degreeProgramme || 'Not Set'
            },
            academic: {
                gpa: overallGPA,
                creditsEarned: totalCreditsEarned,
                creditsTotal: creditsRequired,
                currentLevel: student.level,
                currentSemester: 1 // This could be calculated based on academic calendar
            }
        };

        console.log('✅ Sending dashboard data');
        res.json(dashboardData);
    } catch (error) {
        console.error('❌ Dashboard endpoint error:', error);
        res.status(500).json({ message: error.message });
    }
};


