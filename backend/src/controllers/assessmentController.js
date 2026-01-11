const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const ModuleEnrollment = require('../models/ModuleEnrollment');
const Student = require('../models/Student');
const Module = require('../models/Module'); // Assuming Module model exists
const xlsx = require('xlsx');
const fs = require('fs');

exports.uploadResults = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: { message: 'No file uploaded' } });
        }

        const { batchYear, level, moduleId, type } = req.body; // type: 'Mid' or 'End'

        // Check Batch Scope for Admins
        if (req.user.batchScope && parseInt(req.user.batchScope) !== parseInt(batchYear)) {
            return res.status(403).json({
                error: { message: `Access denied. You can only manage results for batch ${req.user.batchScope}` }
            });
        }

        // Validate Module
        const moduleDoc = await Module.findById(moduleId);
        if (!moduleDoc) {
            return res.status(404).json({ error: { message: 'Module not found' } });
        }

        // Parse Excel
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        let successCount = 0;
        let errors = [];

        // Ensure Assessment Metadata Exists
        let assessment = await Assessment.findOne({
            module: moduleId,
            batchYear: batchYear,
            type: type
        });

        if (!assessment) {
            assessment = await Assessment.create({
                module: moduleId,
                type: type,
                title: `${type} Exam - ${moduleDoc.name}`, // Fallback title
                maxMarks: 100, // Default, maybe input?
                batchYear: batchYear,
                createdBy: req.user._id
            });
        }

        for (const row of data) {
            // Assume Col 1 is key 'Registration Number' or similar, Col 2 is 'Marks'
            // We'll look for keys dynamically or assume position if needed, but JSON uses header
            // Let's assume headers are 'RegNum' and 'Marks' or first/second keys
            const keys = Object.keys(row);
            const regNum = row[keys[0]];
            const marks = row[keys[1]];

            if (!regNum || marks === undefined) {
                errors.push(`Row missing data: ${JSON.stringify(row)}`);
                continue;
            }

            try {
                // Find Student
                const student = await Student.findOne({ registrationNumber: regNum.toString().toUpperCase() });
                if (!student) {
                    errors.push(`Student not found: ${regNum}`);
                    continue;
                }

                // Update AssessmentResult
                await AssessmentResult.findOneAndUpdate(
                    { assessment: assessment._id, student: student._id },
                    { marks: marks },
                    { upsert: true, new: true }
                );

                // Update ModuleEnrollment (Sync)
                // We need to find the enrollment for this student/module/year
                // Note: academicYear format in Enrollment might differ from batchYear (e.g. "2023/2024" vs "2023")
                // We might need logic here, but for now let's try to match module + student

                const enrollment = await ModuleEnrollment.findOne({
                    student: student._id,
                    module: moduleId
                    // Maybe check academicYear/batchYear if possible?
                });

                if (enrollment) {
                    if (type === 'Mid') {
                        enrollment.continuousAssessmentMark = marks;
                    } else if (type === 'End') {
                        enrollment.endSemesterExamMark = marks;
                        // User Request: Only use Semester End Result for Final Mark (GPA Calculation)
                        enrollment.finalMark = marks;
                    }
                    await enrollment.save();
                }

                successCount++;
            } catch (err) {
                errors.push(`Error processing ${regNum}: ${err.message}`);
            }
        }

        // Cleanup
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'Results processed',
            stats: {
                total: data.length,
                success: successCount,
                errors: errors
            }
        });

    } catch (error) {
        console.error('Upload results error', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: { message: 'Failed to upload results' } });
    }
};
