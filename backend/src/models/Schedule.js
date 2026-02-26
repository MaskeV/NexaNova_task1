// backend/src/models/Schedule.js
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
  module: {
    type: String, // subjectId reference
    ref: 'Subject',
    default: null
  },
  trainer: {
    type: String, // empId reference
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

// Index for faster queries
scheduleSchema.index({ weekId: 1 });
scheduleSchema.index({ weekStartDate: 1 });
scheduleSchema.index({ 'timeSlots.trainer': 1 });
scheduleSchema.index({ 'timeSlots.module': 1 });

// Method to check if a slot is available
scheduleSchema.methods.isSlotAvailable = function(day, timeSlot) {
  const slot = this.timeSlots.find(
    s => s.day === day && s.timeSlot === timeSlot
  );
  return slot && !slot.isAllocated;
};

// Method to allocate a slot
scheduleSchema.methods.allocateSlot = function(slotId, trainerId, moduleId) {
  const slot = this.timeSlots.id(slotId);
  if (!slot) {
    throw new Error('Time slot not found');
  }
  if (slot.isAllocated) {
    throw new Error('Time slot is already allocated');
  }
  
  slot.trainer = trainerId;
  slot.module = moduleId;
  slot.isAllocated = true;
  
  return slot;
};

module.exports = mongoose.model('Schedule', scheduleSchema);