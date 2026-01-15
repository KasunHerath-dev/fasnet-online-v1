const Student = require('../models/Student');
const User = require('../models/User');
const logger = require('../utils/logger');

const getAllStudents = async (req, res) => {
  try {
    // SECURITY CHECK: Only admins can list students
    if (req.user.roles.includes('user') && !req.user.roles.includes('admin') && !req.user.roles.includes('superadmin')) {
      return res.status(403).json({ error: { message: 'Forbidden: Students cannot listen all student data', code: 'FORBIDDEN' } });
    }

    const { q, district, batch, limit = 50, page = 1, sort = 'fullName' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = { ...(req.batchFilter || {}) };  // Apply batch scope filter
    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { registrationNumber: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    if (district) filter.district = district;
    if (batch) filter.batchYear = batch;

    const students = await Student.find(filter).sort(sort).limit(parseInt(limit)).skip(skip);
    const total = await Student.countDocuments(filter);

    res.json({ students, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    logger.error('Get students error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to fetch students', code: 'FETCH_STUDENTS_FAILED' } });
  }
};

const getStudentByRegNum = async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    const student = await Student.findOne({ registrationNumber: registrationNumber.toUpperCase() }).populate('userRef');

    if (!student) {
      return res.status(404).json({ error: { message: 'Student not found', code: 'STUDENT_NOT_FOUND' } });
    }

    // SECURITY CHECK: Data Isolation
    // If user is basic 'user' (student) and NOT admin, check ownership
    const isStudent = req.user.roles.includes('user') && !req.user.roles.includes('admin') && !req.user.roles.includes('superadmin');

    if (isStudent) {
      // Check if the student being requested matches the logged-in user's studentRef
      // req.user.studentRef is an ObjectId, student._id is an ObjectId
      if (!req.user.studentRef || req.user.studentRef.toString() !== student._id.toString()) {
        return res.status(403).json({ error: { message: 'Forbidden: You can only view your own profile', code: 'ACCESS_DENIED' } });
      }
    }

    // BATCH SCOPE CHECK: Batch-scoped admin can only view students from their batch
    if (req.user.batchScope && student.batchYear !== req.user.batchScope) {
      return res.status(403).json({
        error: {
          message: `Access denied. You can only view students from batch ${req.user.batchScope}`,
          code: 'BATCH_SCOPE_VIOLATION'
        }
      });
    }

    res.json({ student });
  } catch (error) {
    logger.error('Get student error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to fetch student', code: 'FETCH_STUDENT_FAILED' } });
  }
};

const createStudent = async (req, res) => {
  try {
    const studentData = req.body;

    if (!studentData.registrationNumber || !studentData.fullName) {
      return res.status(400).json({
        error: { message: 'Registration number and full name required', code: 'MISSING_REQUIRED_FIELDS' },
      });
    }

    const existing = await Student.findOne({ registrationNumber: studentData.registrationNumber.toUpperCase() });
    if (existing) {
      return res.status(409).json({ error: { message: 'Student already exists', code: 'STUDENT_EXISTS' } });
    }

    const student = new Student({
      ...studentData,
      registrationNumber: studentData.registrationNumber.toUpperCase(),
    });

    await student.save();
    logger.info('Student created', { studentId: student._id, regNum: student.registrationNumber });

    // Create User Account
    try {
      const user = new User({
        username: student.registrationNumber.toLowerCase(),
        passwordHash: 'abc123', // Default password
        roles: ['user'],
        studentRef: student._id,
      });
      await user.save();

      // Update student with userRef
      student.userRef = user._id;
      await student.save();

      logger.info('User account created for student', { userId: user._id, regNum: student.registrationNumber });
    } catch (userError) {
      logger.error('Failed to create user account for student', { error: userError.message });
      // Don't fail the request, but log the error. Admin might need to create user manually or retry.
    }

    res.status(201).json({ message: 'Student created', student });
  } catch (error) {
    logger.error('Create student error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to create student', code: 'CREATE_STUDENT_FAILED', details: error.message } });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    const updates = req.body;

    const student = await Student.findOneAndUpdate({ registrationNumber: registrationNumber.toUpperCase() }, updates, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ error: { message: 'Student not found', code: 'STUDENT_NOT_FOUND' } });
    }

    logger.info('Student updated', { studentId: student._id });
    res.json({ message: 'Student updated', student });
  } catch (error) {
    logger.error('Update student error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to update student', code: 'UPDATE_STUDENT_FAILED', details: error.message } });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    if (!req.user.studentRef) {
      return res.status(403).json({ error: { message: 'Not a student user', code: 'NOT_STUDENT' } });
    }

    const { firstName, lastName } = req.body;

    // Only allow updating specific fields
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;

    const student = await Student.findByIdAndUpdate(
      req.user.studentRef,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: { message: 'Student profile not found', code: 'PROFILE_NOT_FOUND' } });
    }

    logger.info('Student updated own profile', { studentId: student._id });
    res.json({ message: 'Profile updated successfully', student });
  } catch (error) {
    logger.error('Update own profile error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to update profile', code: 'UPDATE_FAILED', details: error.message } });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    const student = await Student.findOneAndDelete({ registrationNumber: registrationNumber.toUpperCase() });

    if (!student) {
      return res.status(404).json({ error: { message: 'Student not found', code: 'STUDENT_NOT_FOUND' } });
    }

    // Delete associated user if exists
    if (student.userRef) {
      await User.findByIdAndDelete(student.userRef);
    }

    logger.info('Student deleted', { studentId: student._id });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    logger.error('Delete student error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to delete student', code: 'DELETE_STUDENT_FAILED', details: error.message } });
  }
};

const getUpcomingBirthdays = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const endDate = new Date(today.getTime() + parseInt(days) * 24 * 60 * 60 * 1000);

    // Fetch all students with birthdays (apply batch scope filter)
    const filter = { birthday: { $exists: true, $ne: null }, ...(req.batchFilter || {}) };
    const students = await Student.find(filter);

    // Filter and sort by next birthday
    const upcoming = students
      .map((s) => ({
        ...s.toObject(),
        nextBirthday: s.nextBirthday,
      }))
      .filter((s) => s.nextBirthday >= today && s.nextBirthday <= endDate)
      .sort((a, b) => a.nextBirthday - b.nextBirthday);

    res.json({ students: upcoming, total: upcoming.length });
  } catch (error) {
    logger.error('Get birthdays error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to fetch birthdays', code: 'FETCH_BIRTHDAYS_FAILED' } });
  }
};

const deleteAllStudents = async (req, res) => {
  try {
    // SECURITY CHECK: Only superadmin
    if (!req.user.roles.includes('superadmin')) {
      return res.status(403).json({ error: { message: 'Forbidden: Only superadmin can perform this action', code: 'FORBIDDEN' } });
    }

    // Import additional models for comprehensive cleanup
    const MissingStudent = require('../models/MissingStudent');
    const AssessmentResult = require('../models/AssessmentResult');
    const ModuleEnrollment = require('../models/ModuleEnrollment');

    // Delete all related data
    const [studentDeleteResult, userDeleteResult, missingDeleteResult, assessmentDeleteResult, enrollmentDeleteResult] = await Promise.all([
      Student.deleteMany({}),
      User.deleteMany({
        $or: [
          { roles: 'user' },
          { studentRef: { $exists: true, $ne: null } }
        ]
      }),
      MissingStudent.deleteMany({}),
      AssessmentResult.deleteMany({}),
      ModuleEnrollment.deleteMany({})
    ]);

    logger.info('Reset All Data executed', {
      deletedStudents: studentDeleteResult.deletedCount,
      deletedUsers: userDeleteResult.deletedCount,
      deletedMissing: missingDeleteResult.deletedCount,
      deletedAssessments: assessmentDeleteResult.deletedCount,
      deletedEnrollments: enrollmentDeleteResult.deletedCount
    });

    res.json({
      message: 'All student data and related records deleted successfully',
      details: {
        students: studentDeleteResult.deletedCount,
        users: userDeleteResult.deletedCount,
        missingStudents: missingDeleteResult.deletedCount,
        assessmentResults: assessmentDeleteResult.deletedCount,
        moduleEnrollments: enrollmentDeleteResult.deletedCount
      }
    });
  } catch (error) {
    logger.error('Delete all students error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to delete all students', code: 'DELETE_ALL_FAILED' } });
  }
};

const createMissingUserAccounts = async (req, res) => {
  try {
    // Find students who don't have a userRef or whose userRef is null
    const students = await Student.find({
      $or: [{ userRef: { $exists: false } }, { userRef: null }]
    });

    let createdCount = 0;
    let errors = [];

    for (const student of students) {
      try {
        // Check if user already exists with this username (regNum)
        const existingUser = await User.findOne({ username: student.registrationNumber.toLowerCase() });

        if (existingUser) {
          // Link existing user to student if not linked
          student.userRef = existingUser._id;
          await student.save();
          if (!existingUser.studentRef) {
            existingUser.studentRef = student._id;
            await existingUser.save();
          }
          continue;
        }

        // Create new user
        const user = new User({
          username: student.registrationNumber.toLowerCase(),
          passwordHash: 'abc123', // Default password
          roles: ['user'],
          studentRef: student._id,
        });
        await user.save();

        student.userRef = user._id;
        await student.save();
        createdCount++;
      } catch (err) {
        errors.push({ regNum: student.registrationNumber, error: err.message });
      }
    }

    logger.info(`Created ${createdCount} missing user accounts`);
    res.json({
      message: `Process completed. Created ${createdCount} new accounts.`,
      totalProcessed: students.length,
      createdCount,
      errors
    });

  } catch (error) {
    logger.error('Create missing users error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to create missing users', code: 'BACKFILL_FAILED' } });
  }
};

const getDemographics = async (req, res) => {
  try {
    const { batchYear } = req.query;
    const filter = {};

    if (batchYear) {
      filter.batchYear = batchYear;
    }

    // Apply batch scope if present (for batch admins)
    if (req.batchFilter) {
      Object.assign(filter, req.batchFilter);
    }

    const maleCount = await Student.countDocuments({ ...filter, gender: 'Male' });
    const femaleCount = await Student.countDocuments({ ...filter, gender: 'Female' });
    const totalCount = await Student.countDocuments(filter);

    res.json({
      total: totalCount,
      male: maleCount,
      female: femaleCount,
      other: totalCount - (maleCount + femaleCount)
    });
  } catch (error) {
    logger.error('Get demographics error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to fetch demographics', code: 'FETCH_DEMOGRAPHICS_FAILED' } });
  }
};

module.exports = {
  getAllStudents,
  getStudentByRegNum,
  createStudent,
  updateStudent,
  deleteStudent,
  getUpcomingBirthdays,
  deleteAllStudents,
  createMissingUserAccounts,
  getDemographics,
  updateMyProfile,
};
