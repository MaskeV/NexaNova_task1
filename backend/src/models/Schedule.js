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
  subject: {
    type: String,   // stores subjectId string, NOT ObjectId
    ref: 'Subject',
    default: null
  },
  trainer: {
    type: String,   // stores empId string, NOT ObjectId
    ref: 'Trainer',
    default: null
  },
  isAllocated: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const scheduleSchema = new mongoose.Schema({
  weekId: {
    type: String,
    required: [true, 'Week ID is required'],
    unique: true,   // this already creates a unique index called weekId_1
    trim: true
    // DO NOT add scheduleSchema.index({ weekId: 1 }) below —
    // that would try to create a second non-unique index with the same
    // name "weekId_1", causing IndexKeySpecsConflict on syncIndexes
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
}, { timestamps: true });

// Only indexes that are NOT already implied by the schema definition above.
// weekId_1 is already created by unique:true — do NOT repeat it here.
scheduleSchema.index({ weekStartDate: 1 });
scheduleSchema.index({ 'timeSlots.trainer': 1 });
scheduleSchema.index({ 'timeSlots.subject': 1 });

// ── Instance methods ──────────────────────────────────────────────────────────

scheduleSchema.methods.isSlotAvailable = function (day, timeSlot) {
  const slot = this.timeSlots.find(s => s.day === day && s.timeSlot === timeSlot);
  return slot && !slot.isAllocated;
};

scheduleSchema.methods.allocateSlot = function (slotId, trainerId, subjectId) {
  const slot = this.timeSlots.id(slotId);
  if (!slot) throw new Error('Time slot not found');
  if (slot.isAllocated) throw new Error('Time slot is already allocated');
  slot.trainer = trainerId;
  slot.subject = subjectId;
  slot.isAllocated = true;
  return slot;
};

// ── Model + index sync ────────────────────────────────────────────────────────

const Schedule = mongoose.model('Schedule', scheduleSchema);

// syncIndexes drops stale indexes (e.g. old scheduleId_1) and creates any
// missing ones. Safe to run on every startup.
Schedule.syncIndexes()
  .then(() => console.log('✅ Schedule indexes synced'))
  .catch(err => console.error('❌ Schedule syncIndexes error:', err.message));

module.exports = Schedule;