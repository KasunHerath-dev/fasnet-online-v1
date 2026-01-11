const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    nicNumber: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    birthday: {
      type: Date,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    guardianName: {
      type: String,
      trim: true,
    },
    guardianRelationship: {
      type: String,
      trim: true,
    },
    guardianPhone: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    nearestCity: {
      type: String,
      trim: true,
    },
    homeTown: {
      type: String,
      trim: true,
    },
    batchYear: {
      type: String,
    },
    course: {
      type: String,
    },
    level: {
      type: Number,
      default: 1
    },
    currentSemester: {
      type: Number,
      default: 1,
      min: 1,
      max: 2
    },
    combination: {
      type: String, // e.g., "COMB1", "COMB2"
    },
    isCombinationLocked: {
      type: Boolean,
      default: false
    },
    degreeProgramme: {
      type: String, // e.g., "B.Sc. (General)", "B.Sc. (Special) in Computer Science"
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
    // WUSL Schema Alignment
    alZScore: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['Active', 'Graduated', 'Suspended', 'Inactive'],
      default: 'Active',
    },
    admissionYear: {
      type: Number,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    // Academic Progression Fields
    academicStatus: {
      type: String,
      enum: ['Regular', 'Repeat', 'Probation', 'Suspended'],
      default: 'Regular'
    },
    totalCreditsEarned: {
      type: Number,
      default: 0
    },
    cumulativeGPA: {
      type: Number,
      default: 0.0
    },
    // Track failed modules that must be repeated
    repeatModules: [{
      module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
      failedLevel: Number,
      failedSemester: Number,
      deadlineDate: Date // If max repeat time exists
    }]
  },
  { timestamps: true }
);

// Compute next birthday for sorting
studentSchema.virtual('nextBirthday').get(function () {
  if (!this.birthday) return null;
  const today = new Date();
  const bd = new Date(this.birthday);
  let nextBd = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
  if (nextBd < today) {
    nextBd = new Date(today.getFullYear() + 1, bd.getMonth(), bd.getDate());
  }
  return nextBd;
});

// Encryption Hooks
const { encrypt, decrypt } = require('../utils/encryption');

const encryptedFields = [
  'nicNumber',
  'guardianName',
  'guardianPhone',
  'guardianRelationship',
  'whatsapp',
  'contactNumber',
  'address',
  'email'
];

// Encrypt before saving
// Encrypt before saving
studentSchema.pre('save', async function () {
  try {
    encryptedFields.forEach(field => {
      // Only encrypt if modified and not already encrypted (naive check or assume clean state from app)
      // Mongoose isModified handles if the field was actually set/changed.
      if (this.isModified(field) && this[field]) {
        // Check if already in encrypted format to avoid double encryption during some updates
        // Our encrypt function returns "iv:content". 
        // If we are strictly inputting plain text from API, we just encrypt.
        this[field] = encrypt(this[field]);
      }
    });
  } catch (error) {
    throw error;
  }
});

// Decrypt on retrieval
studentSchema.post('init', function (doc) {
  try {
    encryptedFields.forEach(field => {
      if (doc[field]) {
        doc[field] = decrypt(doc[field]);
      }
    });
  } catch (error) {
    // If decryption fails, we might just leave it (legacy data or error)
    console.error('Decryption error on init', error);
  }
});

// Additional indexes for queries (registrationNumber index already created by unique: true)
studentSchema.index({ birthday: 1 });
studentSchema.index({ district: 1 });

module.exports = mongoose.model('Student', studentSchema);
