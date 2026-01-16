// backend/src/models/Trainer.js
const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  empId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  subjects: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    min: 0
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
trainerSchema.index({ empId: 1 });
trainerSchema.index({ subjects: 1 });
trainerSchema.index({ email: 1 });

module.exports = mongoose.model('Trainer', trainerSchema);