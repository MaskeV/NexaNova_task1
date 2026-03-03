// backend/src/models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: [true, 'Course ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^CRS\d{2}$/.test(v);
      },
      message: 'Course ID must be in format CRS01, CRS02, etc.'
    }
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    minlength: [3, 'Course name must be at least 3 characters'],
    maxlength: [200, 'Course name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 week'],
    max: [104, 'Duration cannot exceed 104 weeks (2 years)'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Duration must be a whole number (in weeks)'
    }
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: {
      values: ['Beginner', 'Intermediate', 'Advanced'],
      message: 'Level must be Beginner, Intermediate, or Advanced'
    },
    default: 'Beginner'
  },
  // Array of Subject IDs (modules) that are part of this course
  modules: [{
    subjectId: {
      type: String,
      required: true,
      ref: 'Subject'
    },
    sequenceOrder: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  // Total hours calculated from all modules
  totalHours: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
courseSchema.index({ courseId: 1 });
courseSchema.index({ name: 1 });
courseSchema.index({ isActive: 1 });

// Method to calculate total hours from modules
courseSchema.methods.calculateTotalHours = async function() {
  const Subject = require('./Subject');
  let total = 0;
  
  for (const module of this.modules) {
    const subject = await Subject.findOne({ subjectId: module.subjectId });
    if (subject) {
      total += subject.duration || 0;
    }
  }
  
  this.totalHours = total;
  return total;
};

// Virtual to get module count
courseSchema.virtual('moduleCount').get(function() {
  return this.modules ? this.modules.length : 0;
});

// Pre-save hook to calculate total hours
courseSchema.pre('save', async function(next) {
  if (this.isModified('modules')) {
    await this.calculateTotalHours();
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);