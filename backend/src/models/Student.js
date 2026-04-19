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
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    nameWithInitials: {
      type: String,
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
    }],

    // LMS Sync Credentials (AES-256 encrypted password)
    lmsCredentials: {
      username: { type: String, trim: true },
      password: { type: String }, // Stored AES-256 encrypted via encryption.js
      lastSync: { type: Date, default: null },
      syncEnabled: { type: Boolean, default: false },
    }
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

// Helper to get/set nested values
const getNested = (obj, path) => path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
const setNested = (obj, path, val) => {
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((o, i) => (o[i] = o[i] || {}), obj);
  target[last] = val;
};

// Encrypt before saving
studentSchema.pre('save', async function () {
  try {
    // Standard fields
    encryptedFields.forEach(field => {
      if (this.isModified(field) && this[field] && !this[field].includes(':')) {
        this[field] = encrypt(this[field]);
      }
    });

    // LMS Password (Nested)
    if (this.isModified('lmsCredentials.password') && this.lmsCredentials?.password && !this.lmsCredentials.password.includes(':')) {
      this.lmsCredentials.password = encrypt(this.lmsCredentials.password);
    }
  } catch (error) {
    throw error;
  }
});

// Decrypt on retrieval
studentSchema.post('init', function (doc) {
  try {
    // Standard fields
    encryptedFields.forEach(field => {
      if (doc[field] && doc[field].includes(':')) {
        doc[field] = decrypt(doc[field]);
      }
    });

    // LMS Password (Nested)
    if (doc.lmsCredentials?.password && doc.lmsCredentials.password.includes(':')) {
      doc.lmsCredentials.password = decrypt(doc.lmsCredentials.password);
    }
  } catch (error) {
    console.error('Decryption error on init', error);
  }
});

// Additional indexes for queries (registrationNumber index already created by unique: true)
studentSchema.index({ birthday: 1 });
studentSchema.index({ district: 1 });

module.exports = mongoose.model('Student', studentSchema);
