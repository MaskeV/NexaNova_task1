// backend/src/models/Module.js
const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: [true, 'Module ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^MD\d{3}$/.test(v);
      },
      message: 'Module ID must be in format MD001, MD002, etc.'
    }
  },
  name: {
    type: String,
    required: [true, 'Module name is required'],
    trim: true,
    minlength: [3, 'Module name must be at least 3 characters'],
    maxlength: [100, 'Module name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Duration (in hours) is required'],
    min: [1, 'Duration must be at least 1 hour'],
    max: [100, 'Duration cannot exceed 100 hours'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Duration must be a whole number'
    }
  },
  content: {
    type: String,
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  learningObjectives: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String, // moduleId references
    trim: true
  }],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['video', 'article', 'documentation', 'book', 'other']
    }
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
moduleSchema.index({ moduleId: 1 });
moduleSchema.index({ name: 1 });
moduleSchema.index({ isActive: 1 });

module.exports = mongoose.model('Module', moduleSchema);