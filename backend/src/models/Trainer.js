// backend/src/models/Trainer.js
const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  empId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^EMP\d{3}$/.test(v);
      },
      message: 'Employee ID must be in format EMP001, EMP002, etc.'
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Name can only contain letters and spaces'
    }
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
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits and start with 6, 7, 8, or 9'
    }
  },
  subjects: {
    type: [{
      type: String,
      trim: true
    }],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one subject must be assigned'
    }
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [1, 'Experience must be at least 1 year'],
    max: [50, 'Experience cannot exceed 50 years'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Experience must be a whole number'
    }
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

// Index for faster queries - empId and email already indexed via unique: true
trainerSchema.index({ subjects: 1 });

module.exports = mongoose.model('Trainer', trainerSchema);