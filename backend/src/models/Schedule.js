const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: {
      values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      message: 'Day must be a valid weekday'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    enum: {
      values: ['8AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM'],
      message: 'Time slot must be one of the four 3-hour slots'
    }
  },
  subjectId: {
    type: String,
    ref: 'Subject',
    default: null
  },
  trainerId: {
    type: String,
    ref: 'Trainer',
    default: null
  },
  isAllocated: {
    type: Boolean,
    default: false
  }
}, {
  _id: true
});

const scheduleSchema = new mongoose.Schema({
  weekId: {
    type: String,
    required: [true, 'Week ID is required'],
    unique: true,
    trim: true
  },
  weekStartDate: {
    type: Date,
    required: [true, 'Week start date is required']
  },
  weekEndDate: {
    type: Date,
    required: [true, 'Week end date is required']
  },
  timeSlots: [timeSlotSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

scheduleSchema.index({ weekId: 1 });
scheduleSchema.index({ weekStartDate: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);