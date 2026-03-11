// backend/src/models/Enrollment.js
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  studentEmail: {
    type: String,
    required: [true, 'Student email is required'],
    trim: true,
    lowercase: true
  },
  course: {
    type: String, // subjectId reference for now (course)
    required: [true, 'Course reference is required']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'completed', 'dropped', 'suspended'],
      message: 'Status must be active, completed, dropped, or suspended'
    },
    default: 'active'
  },
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who enrolled the student
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ studentEmail: 1, course: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });

// Virtual for checking if enrollment is active
enrollmentSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Pre-save hook to validate enrollment
enrollmentSchema.pre('save', async function(next) {
  // Check if student is already enrolled in this course
  if (this.isNew) {
    const existingEnrollment = await this.constructor.findOne({
      student: this.student,
      course: this.course,
      status: 'active'
    });
    
    if (existingEnrollment) {
      throw new Error('Student is already enrolled in this course');
    }
  }
  
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);