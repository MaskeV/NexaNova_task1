// backend/src/models/Course.js - REPLACE ENTIRE FILE
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
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Frontend', 'Backend', 'DevOps', 'Mobile', 'Data Science', 'Cloud', 'Security', 'Other'],
      message: 'Invalid category'
    },
    default: 'Other'
  },
  // Subjects that are part of this course
  subjects: [{
    subjectId: {
      type: String,
      required: true,
      ref: 'Subject'
    },
    order: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  duration: {
    type: Number,
    required: [true, 'Duration (in weeks) is required'],
    min: [1, 'Duration must be at least 1 week'],
    max: [104, 'Duration cannot exceed 104 weeks (2 years)'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Duration must be a whole number (in weeks)'
    }
  },
  // Total hours calculated from all subjects
  totalHours: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: {
      values: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'],
      message: 'Level must be Beginner, Intermediate, Advanced, or Mixed'
    },
    default: 'Beginner'
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  outcomes: [{
    type: String,
    trim: true
  }],
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

// Indexes
courseSchema.index({ courseId: 1 });
courseSchema.index({ name: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isActive: 1 });

// Method to calculate total hours from subjects
courseSchema.methods.calculateTotalHours = async function() {
  const Subject = require('./Subject');
  let total = 0;
  
  for (const subjectRef of this.subjects) {
    const subject = await Subject.findOne({ subjectId: subjectRef.subjectId });
    if (subject) {
      // Recalculate subject duration if needed
      if (!subject.totalDuration || subject.totalDuration === 0) {
        await subject.calculateTotalDuration();
        await subject.save();
      }
      total += subject.totalDuration || 0;
    }
  }
  
  this.totalHours = total;
  return total;
};

// Virtual to get subject count
courseSchema.virtual('subjectCount').get(function() {
  return this.subjects ? this.subjects.length : 0;
});

// Pre-save hook to calculate total hours
courseSchema.pre('save', async function(next) {
  if (this.isModified('subjects')) {
    await this.calculateTotalHours();
  }
 
});

module.exports = mongoose.model('Course', courseSchema);