// backend/src/models/Subject.js - REPLACE ENTIRE FILE
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectId: {
    type: String,
    required: [true, 'Subject ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^SB\d{2}$/.test(v);
      },
      message: 'Subject ID must be in format SB01, SB02, etc.'
    }
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    minlength: [3, 'Subject name must be at least 3 characters'],
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // NEW: Modules that belong to this subject
  modules: {
    type: [{
      moduleId: {
        type: String,
        required: true,
        ref: 'Module'
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    default: []  // ADDED: Default empty array
  },
  // NEW: Total duration calculated from modules
  totalDuration: {
    type: Number,
    default: 0
  },
  // LEGACY: Keep old duration field for backward compatibility
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 hour'],
    max: [1000, 'Duration cannot exceed 1000 hours']
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: {
      values: ['Beginner', 'Intermediate', 'Advanced'],
      message: 'Level must be either Beginner, Intermediate, or Advanced'
    },
    default: 'Beginner'
  },
  trainers: {
    type: [{
      type: String,
      trim: true,
      ref: 'Trainer'
    }],
    default: []  // ADDED: Default empty array
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
subjectSchema.index({ subjectId: 1 });
subjectSchema.index({ name: 1 });

// NEW: Method to calculate total duration from modules
subjectSchema.methods.calculateTotalDuration = async function() {
  const Module = require('./Module');
  let total = 0;
  
  if (this.modules && this.modules.length > 0) {
    for (const moduleRef of this.modules) {
      const module = await Module.findOne({ moduleId: moduleRef.moduleId });
      if (module) {
        total += module.duration || 0;
      }
    }
  }
  
  this.totalDuration = total;
  return total;
};

// NEW: Pre-save hook to calculate total duration
subjectSchema.pre('save', async function(next) {
  if (this.isModified('modules') && this.modules && this.modules.length > 0) {
    try {
      await this.calculateTotalDuration();
    } catch (error) {
      console.error('Error calculating total duration:', error);
      // Continue anyway - don't block save
    }
  }
  
});

module.exports = mongoose.model('Subject', subjectSchema);
