// src/models/Subject.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectId: {
    type: String,
    required: [true, 'Subject ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    min: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  trainers: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for faster queries
subjectSchema.index({ subjectId: 1 });
subjectSchema.index({ name: 1 });

module.exports = mongoose.model('Subject', subjectSchema);