const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      default: ['user'],
      enum: ['superadmin', 'admin', 'user'],
    },
    studentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
    permissions: {
      type: [String],
      default: [],
      enum: [
        'view_students',
        'add_students',
        'edit_students',
        'delete_students',
        'view_birthdays',
        'view_analytics',
        'manage_users',
        'system_settings',
        'bulk_import',
        'bulk_update',
        'manage_resources',
        'manage_assessments'
      ],
    },
    batchScope: {
      type: Number,
      default: null,
      description: 'If set, restricts admin access to students from this batch year only'
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
      publicProfile: { type: Boolean, default: false },
      showGPA: { type: Boolean, default: true }
    },
    needsPasswordChange: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || 12));
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (err) {
    throw err;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Exclude passwordHash in toJSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
