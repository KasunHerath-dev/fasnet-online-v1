const mongoose = require('mongoose');

/**
 * Stores Moodle assignment/deadline events scraped per student.
 * moodleUid is the ICS event UID — compound unique index prevents duplicates.
 */
const lmsAssignmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    moodleUid: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    moduleCode: {
      type: String,
      default: null, // e.g. "MATH 1222"
    },
    type: {
      type: String,
      enum: ['assignment', 'tutorial', 'quiz', 'exam', 'other'],
      default: 'other',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    categories: {
      type: String,
      default: '',
    },
    syncedAt: {
      type: Date,
      default: Date.now,
    },
    notified: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index: one record per student per Moodle event
lmsAssignmentSchema.index({ student: 1, moodleUid: 1 }, { unique: true });

// Index for date-sorted queries
lmsAssignmentSchema.index({ student: 1, dueDate: 1 });

module.exports = mongoose.model('LmsAssignment', lmsAssignmentSchema);
