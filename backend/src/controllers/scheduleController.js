const Schedule = require('../models/Schedule');
const Subject = require('../models/Subject');
const Trainer = require('../models/Trainer');

const generateWeekId = (startDate) => {
  const year = startDate.getFullYear();
  const weekNum = getWeekNumber(startDate);
  return `W${weekNum}-${year}`;
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

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

const createBlankTimeSlots = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['8AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM'];
  const slots = [];
  days.forEach(day => {
    timeSlots.forEach(time => {
      slots.push({
        day,
        timeSlot: time,
        subjectId: null,
        trainerId: null,
        isAllocated: false
      });
    });
  });
  return slots;
};

// @desc Create a blank weekly schedule
// @route POST /schedule
const createSchedule = async (req, res) => {
  try {
    const { weekStartDate } = req.body;
    if (!weekStartDate) {
      return res.status(400).json({ success: false, message: 'Week start date is required' });
    }

    const startDate = new Date(weekStartDate);
    const weekDates = getWeekDates(startDate);
    const weekId = generateWeekId(weekDates.start);

    const existingSchedule = await Schedule.findOne({ weekId });
    if (existingSchedule) {
      return res.status(400).json({ success: false, message: `Schedule for ${weekId} already exists` });
    }

    const schedule = await Schedule.create({
      weekId,
      weekStartDate: weekDates.start,
      weekEndDate: weekDates.end,
      timeSlots: createBlankTimeSlots(),
      createdBy: req.user._id
    });

    console.log('✅ Schedule created:', weekId);
    res.status(201).json({ success: true, message: 'Schedule created successfully', data: schedule });
  } catch (error) {
    console.error('❌ Create schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Allocate a time slot with subject and trainer
// @route PUT /schedule/slot/:slotId
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
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const slot = schedule.timeSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }

    // Verify subject exists
    const subject = await Subject.findOne({ subjectId });
    if (!subject) {
      return res.status(404).json({ success: false, message: `Subject ${subjectId} not found` });
    }

    // Verify trainer exists
    const trainer = await Trainer.findOne({ empId: trainerId });
    if (!trainer) {
      return res.status(404).json({ success: false, message: `Trainer ${trainerId} not found` });
    }

    // Check if trainer teaches this subject
    if (!trainer.subjects.includes(subjectId)) {
      return res.status(400).json({
        success: false,
        message: `Trainer ${trainer.name} is not assigned to subject ${subject.name}`
      });
    }

    // Check trainer conflict - same day, same time slot
    const conflict = schedule.timeSlots.find(
      s => s.day === slot.day &&
        s.timeSlot === slot.timeSlot &&
        s.trainerId === trainerId &&
        s.isAllocated &&
        s._id.toString() !== slotId
    );
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `Trainer ${trainer.name} is already allocated on ${slot.day} at ${slot.timeSlot}`
      });
    }

    slot.subjectId = subjectId;
    slot.trainerId = trainerId;
    slot.isAllocated = true;

    await schedule.save();
    console.log('✅ Slot allocated:', slotId);
    res.status(200).json({ success: true, message: 'Slot allocated successfully', data: slot });
  } catch (error) {
    console.error('❌ Allocate slot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get schedule by week ID with populated data
// @route GET /schedule/:weekId
const getScheduleByWeek = async (req, res) => {
  try {
    const { weekId } = req.params;
    const schedule = await Schedule.findOne({ weekId });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    // Populate subject and trainer details for allocated slots
    const populatedSlots = await Promise.all(
      schedule.timeSlots.map(async (slot) => {
        const slotObj = slot.toObject();
        if (slot.isAllocated && slot.subjectId) {
          const subject = await Subject.findOne({ subjectId: slot.subjectId })
            .select('subjectId name description level totalDuration');
          const trainer = await Trainer.findOne({ empId: slot.trainerId })
            .select('empId name email experience subjects');
          slotObj.subjectDetails = subject || null;
          slotObj.trainerDetails = trainer || null;
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all schedules
// @route GET /schedule
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .sort({ weekStartDate: -1 })
      .select('weekId weekStartDate weekEndDate createdAt');

    res.status(200).json({ success: true, count: schedules.length, data: schedules });
  } catch (error) {
    console.error('❌ Get all schedules error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete a schedule
// @route DELETE /schedule/:weekId
const deleteSchedule = async (req, res) => {
  try {
    const { weekId } = req.params;
    const schedule = await Schedule.findOneAndDelete({ weekId });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    console.log('✅ Schedule deleted:', weekId);
    res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('❌ Delete schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Deallocate a time slot
// @route PUT /schedule/slot/:slotId/deallocate
const deallocateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { weekId } = req.body;

    if (!weekId) {
      return res.status(400).json({ success: false, message: 'Week ID is required' });
    }

    const schedule = await Schedule.findOne({ weekId });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const slot = schedule.timeSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }

    slot.subjectId = null;
    slot.trainerId = null;
    slot.isAllocated = false;

    await schedule.save();
    console.log('✅ Slot deallocated:', slotId);
    res.status(200).json({ success: true, message: 'Slot deallocated successfully', data: slot });
  } catch (error) {
    console.error('❌ Deallocate slot error:', error);
    res.status(500).json({ success: false, message: error.message });
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