const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const MissingStudent = require('../models/MissingStudent');
const User = require('../models/User');
const logger = require('../utils/logger');

// Helper function to convert text to Capitalized Case
const toCapitalizedCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const previewImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file uploaded', code: 'NO_FILE' } });
    }

    const workbook = XLSX.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({ error: { message: 'File is empty', code: 'EMPTY_FILE' } });
    }

    // Get columns from first row
    const columns = Object.keys(rows[0]);

    // Preview first 5 rows
    const preview = rows.slice(0, 5);

    res.json({
      message: 'Preview ready',
      columns,
      preview,
      totalRows: rows.length,
    });
  } catch (error) {
    logger.error('Preview import error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to preview file', code: 'PREVIEW_FAILED', details: error.message } });
  }
};

const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file uploaded', code: 'NO_FILE' } });
    }

    const { columnMap = {}, updateIfExists = false, batchYear: globalBatchYear } = req.body;

    const workbook = XLSX.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      missing: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        const regNum = row['registrationNumber'] || row['Registration Number'] || row['Registration numbe'] || row['Reg No'] || row['RegNo'] || row['reg_no'];

        if (!regNum) {
          results.errors.push({ row: i + 1, message: 'Registration number is required' });
          results.skipped++;
          continue;
        }

        const rawName = row['fullName'] || row['Full Name'] || row['Name with initials'] || row['name'] || row['Name'] || '';

        const studentData = {
          registrationNumber: String(regNum).toUpperCase(),
          fullName: toCapitalizedCase(rawName),
          nicNumber: row['nicNumber'] || row['NIC Number'] || row['NIC'] || row['nic'],
          gender: row['gender'] || row['Gender'],
          birthday: row['birthday'] || row['Birthday'] || row['DOB'] || row['Date of Birth'] ? new Date(row['birthday'] || row['Birthday'] || row['DOB'] || row['Date of Birth']) : null,
          whatsapp: row['whatsapp'] || row['Whatsapp Number'] || row['Whatsapp'] || row['Phone'] || row['phone'],
          email: row['email'] || row['Email'],
          address: row['address'] || row['Address'],
          guardianName: toCapitalizedCase(row['guardianName'] || row['Guardian\'s Name'] || row['Guardian Name'] || row['Parent Name'] || ''),
          guardianRelationship: row['guardianRelationship'] || row['Relationship with Guardian'] || row['Relationship'],
          guardianPhone: row['guardianPhone'] || row['Guardian\'s Phone Number'] || row['Guardian Phone'],
          district: toCapitalizedCase(row['district'] || row['District'] || ''),
          nearestCity: toCapitalizedCase(row['nearestCity'] || row['The City Nearest You'] || row['Nearest City'] || row['City'] || ''),
          homeTown: toCapitalizedCase(row['homeTown'] || row['Home Town'] || row['Hometown'] || ''),
          batchYear: globalBatchYear || row['batchYear'] || row['Batch Year'] || row['Batch'] || row['batch'],
          course: row['course'] || row['Course / Combination'] || row['Course'] || row['course'],
        };

        const existing = await Student.findOne({ registrationNumber: studentData.registrationNumber });

        if (existing) {
          // Student exists
          if (updateIfExists === 'true' || updateIfExists === true) {
            // Update mode: update existing students
            await Student.updateOne({ registrationNumber: studentData.registrationNumber }, studentData);
            results.updated++;
          } else {
            // Register mode: skip existing students
            results.skipped++;
          }
        } else {
          // Student doesn't exist
          if (updateIfExists === 'true' || updateIfExists === true) {
            // Update mode: save as missing student
            await MissingStudent.findOneAndUpdate(
              { registrationNumber: studentData.registrationNumber },
              { ...studentData, importFile: req.file.originalname, importedAt: new Date() },
              { upsert: true, new: true }
            );
            results.missing++;
          } else {
            // Register mode: create new students
            const newStudent = await Student.create(studentData);

            // Create User Account
            try {
              const user = new User({
                username: newStudent.registrationNumber.toLowerCase(),
                passwordHash: 'abc123', // Default password
                roles: ['user'],
                studentRef: newStudent._id,
              });
              await user.save();

              newStudent.userRef = user._id;
              await newStudent.save();
            } catch (userError) {
              logger.error(`Failed to create user for imported student ${newStudent.registrationNumber}`, { error: userError.message });
            }

            results.created++;
          }
        }
      } catch (rowError) {
        results.errors.push({ row: i + 1, message: rowError.message });
        results.skipped++;
      }
    }

    logger.info('Import completed', { ...results });

    // Save import file (Only in development)
    if (process.env.NODE_ENV !== 'production') {
      try {
        const importDir = path.join(__dirname, '../../imports');
        if (!fs.existsSync(importDir)) fs.mkdirSync(importDir, { recursive: true });

        fs.writeFileSync(
          path.join(importDir, `import_${Date.now()}.xlsx`),
          req.file.buffer
        );
      } catch (err) {
        logger.warn('Failed to archive import file', { error: err.message });
      }
    }

    res.json({
      message: 'Import completed',
      results,
    });
  } catch (error) {
    logger.error('Import error', { error: error.message });
    res.status(500).json({ error: { message: 'Import failed', code: 'IMPORT_FAILED', details: error.message } });
  }
};

module.exports = {
  previewImport,
  importStudents,
};
