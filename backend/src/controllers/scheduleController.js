// backend/src/controllers/scheduleController.js - FIXED: Use subject instead of module
const Schedule = require('../models/Schedule');
const Subject = require('../models/Subject');
const Trainer = require('../models/Trainer');

// Helper function to generate week ID
const generateWeekId = (startDate) => {
  const year = startDate.getFullYear();
  const weekNum = getWeekNumber(startDate);
  return `W${weekNum}-${year}`;
};

// Helper function to get week number
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

// Helper function to get week start and end dates
const getWeekDates = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
};

// Helper function to create blank time slots
const createBlankTimeSlots = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['8AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM'];
  const slots = [];

  days.forEach(day => {
    timeSlots.forEach(time => {
      slots.push({
        day,
        timeSlot: time,
        subject: null,
        trainer: null,
        isAllocated: false
      });
    });
  });

  return slots;
};

// @desc    Create a blank weekly schedule
// @route   POST /api/schedule
// @access  Admin
const createSchedule = async (req, res) => {
  try {
    const { weekStartDate } = req.body;

    if (!weekStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Week start date is required'
      });
    }

    const startDate = new Date(weekStartDate);
    const weekDates = getWeekDates(startDate);
    const weekId = generateWeekId(weekDates.start);

    // Check if schedule already exists for this week
    const existingSchedule = await Schedule.findOne({ weekId });
    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: `Schedule for ${weekId} already exists`
      });
    }

    const timeSlots = createBlankTimeSlots();

    const schedule = await Schedule.create({
      weekId,
      weekStartDate: weekDates.start,
      weekEndDate: weekDates.end,
      timeSlots,
      createdBy: req.user._id
    });

    console.log('✅ Schedule created:', weekId);

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    });
  } catch (error) {
    console.error('❌ Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Allocate trainer and subject to a time slot
// @route   PUT /api/schedule/slot/:slotId
// @access  Admin
const allocateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { weekId, trainerId, subjectId } = req.body;

    if (!weekId || !trainerId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Week ID, trainer ID, and subject ID are required'
      });
    }

    const schedule = await Schedule.findOne({ weekId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    const slot = schedule.timeSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    if (slot.isAllocated) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already allocated'
      });
    }

    // Verify trainer exists by empId (string key, NOT ObjectId)
    const trainer = await Trainer.findOne({ empId: trainerId });
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Verify subject exists
    const subject = await Subject.findOne({ subjectId });
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if trainer teaches this subject
    if (!trainer.subjects.includes(subjectId)) {
      return res.status(400).json({
        success: false,
        message: `Trainer ${trainer.name} does not teach ${subject.name}`
      });
    }

    // Check for trainer conflict in the same day/time slot
    const conflictSlot = schedule.timeSlots.find(
      s => s.day === slot.day &&
           s.timeSlot === slot.timeSlot &&
           s.trainer === trainerId &&
           s.isAllocated &&
           s._id.toString() !== slotId
    );

    if (conflictSlot) {
      return res.status(400).json({
        success: false,
        message: `Trainer is already allocated on ${slot.day} at ${slot.timeSlot}`
      });
    }

    slot.trainer = trainerId;
    slot.subject = subjectId;
    slot.isAllocated = true;

    await schedule.save();

    console.log('✅ Slot allocated:', slotId);

    res.status(200).json({
      success: true,
      message: 'Slot allocated successfully',
      data: slot
    });
  } catch (error) {
    console.error('❌ Allocate slot error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get schedule for a specific week
// @route   GET /api/schedule/:weekId
// @access  Admin only (NOT students)
const getScheduleByWeek = async (req, res) => {
  try {
    const { weekId } = req.params;

    // FIXED: Do NOT use .populate() — trainer & subject are stored as strings (empId / subjectId),
    // not ObjectIds. Mongoose cannot cast "EMP101" to ObjectId, causing CastError.
    const schedule = await Schedule.findOne({ weekId });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Manually resolve trainer and subject details using their string IDs
    const populatedSlots = await Promise.all(
      schedule.timeSlots.map(async (slot) => {
        const slotObj = slot.toObject();

        if (slot.subject) {
          const subject = await Subject.findOne({ subjectId: slot.subject });
          slotObj.subjectDetails = subject
            ? {
                subjectId: subject.subjectId,
                name: subject.name,
                description: subject.description,
                level: subject.level,
                totalDuration: subject.totalDuration
              }
            : null;
        }

        if (slot.trainer) {
          // Query by empId (string), NOT by _id
          const trainer = await Trainer.findOne({ empId: slot.trainer });
          slotObj.trainerDetails = trainer
            ? {
                empId: trainer.empId,
                name: trainer.name,
                email: trainer.email,
                experience: trainer.experience
              }
            : null;
        }

        return slotObj;
      })
    );

    res.status(200).json({
      success: true,
      data: {
        ...schedule.toObject(),
        timeSlots: populatedSlots
      }
    });
  } catch (error) {
    console.error('❌ Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all schedules
// @route   GET /api/schedule
// @access  Admin
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .sort({ weekStartDate: -1 })
      .select('weekId weekStartDate weekEndDate createdAt');

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error('❌ Get all schedules error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a schedule
// @route   DELETE /api/schedule/:weekId
// @access  Admin
const deleteSchedule = async (req, res) => {
  try {
    const { weekId } = req.params;

    const schedule = await Schedule.findOneAndDelete({ weekId });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    console.log('✅ Schedule deleted:', weekId);

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully',
      data: schedule
    });
  } catch (error) {
    console.error('❌ Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update/Deallocate a time slot
// @route   PUT /api/schedule/slot/:slotId/deallocate
// @access  Admin
const deallocateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { weekId } = req.body;

    if (!weekId) {
      return res.status(400).json({
        success: false,
        message: 'Week ID is required'
      });
    }

    const schedule = await Schedule.findOne({ weekId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    const slot = schedule.timeSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    slot.trainer = null;
    slot.subject = null;
    slot.isAllocated = false;

    await schedule.save();

    console.log('✅ Slot deallocated:', slotId);

    res.status(200).json({
      success: true,
      message: 'Slot deallocated successfully',
      data: slot
    });
  } catch (error) {
    console.error('❌ Deallocate slot error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSchedule,
  allocateSlot,
  getScheduleByWeek,
  getAllSchedules,
  deleteSchedule,
  deallocateSlot
};