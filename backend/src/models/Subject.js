// src/models/Subject.js
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
    minlength: [3, 'Subject name must be at least 3 characters long'],
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour'],
    max: [1000, 'Duration cannot exceed 1000 hours'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Duration must be a whole number'
    }
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
  trainers: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for faster queries - subjectId already indexed via unique: true
subjectSchema.index({ name: 1 });

module.exports = mongoose.model('Subject', subjectSchema);