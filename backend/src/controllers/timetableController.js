// backend/src/controllers/timetableController.js
const Enrollment = require('../models/Enrollment');
const Schedule = require('../models/Schedule');
const Subject = require('../models/Subject');
const Trainer = require('../models/Trainer');

// @desc    Get weekly timetable for a student
// @route   GET /api/timetable/student/:studentId
// @access  Private (Student or Admin)
const getStudentTimetable = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { weekId } = req.query;
    
    // Check authorization: user can only view their own timetable unless admin
    if (req.user._id.toString() !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this timetable'
      });
    }
    
    // Get student's active enrollments
    const enrollments = await Enrollment.find({
      student: studentId,
      status: 'active'
    });
    
    if (enrollments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active enrollments found',
        data: {
          enrollments: [],
          timetable: []
        }
      });
    }
    
    // Get course IDs
    const courseIds = enrollments.map(e => e.course);
    
    // Find schedule (use provided weekId or get current week)
    let schedule;
    if (weekId) {
      schedule = await Schedule.findOne({ weekId });
    } else {
      // Get current week schedule
      const now = new Date();
      schedule = await Schedule.findOne({
        weekStartDate: { $lte: now },
        weekEndDate: { $gte: now }
      });
    }
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: weekId ? `Schedule for ${weekId} not found` : 'No schedule found for current week'
      });
    }
    
    // Filter time slots for student's enrolled courses
    const studentSlots = schedule.timeSlots.filter(slot => 
      slot.isAllocated && courseIds.includes(slot.module)
    );
    
    // Populate slot details
    const populatedSlots = await Promise.all(
      studentSlots.map(async (slot) => {
        const module = await Subject.findOne({ subjectId: slot.module });
        const trainer = await Trainer.findOne({ empId: slot.trainer });
        
        return {
          _id: slot._id,
          day: slot.day,
          timeSlot: slot.timeSlot,
          module: {
            subjectId: slot.module,
            name: module?.name || 'Unknown',
            description: module?.description,
            level: module?.level
          },
          trainer: trainer ? {
            empId: trainer.empId,
            name: trainer.name,
            email: trainer.email,
            experience: trainer.experience
          } : null
        };
      })
    );
    
    // Get course details
    const courses = await Promise.all(
      courseIds.map(async (courseId) => {
        const course = await Subject.findOne({ subjectId: courseId });
        return course ? {
          subjectId: course.subjectId,
          name: course.name,
          level: course.level
        } : null;
      })
    );
    
    // Organize timetable by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const organizedTimetable = days.map(day => ({
      day,
      slots: populatedSlots.filter(slot => slot.day === day).sort((a, b) => {
        const timeOrder = ['8AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM'];
        return timeOrder.indexOf(a.timeSlot) - timeOrder.indexOf(b.timeSlot);
      })
    }));
    
    res.status(200).json({
      success: true,
      data: {
        weekId: schedule.weekId,
        weekStartDate: schedule.weekStartDate,
        weekEndDate: schedule.weekEndDate,
        enrolledCourses: courses.filter(c => c !== null),
        timetable: organizedTimetable,
        totalClasses: populatedSlots.length
      }
    });
  } catch (error) {
    console.error('❌ Get student timetable error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current week timetable for logged-in student
// @route   GET /api/timetable/my-timetable
// @access  Private (Student)
const getMyTimetable = async (req, res) => {
  try {
    // Get student's own timetable
    req.params.studentId = req.user._id.toString();
    return getStudentTimetable(req, res);
  } catch (error) {
    console.error('❌ Get my timetable error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get timetable statistics for a week
// @route   GET /api/timetable/stats/:weekId
// @access  Admin
const getTimetableStats = async (req, res) => {
  try {
    const { weekId } = req.params;
    
    const schedule = await Schedule.findOne({ weekId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    const stats = {
      totalSlots: schedule.timeSlots.length,
      allocatedSlots: schedule.timeSlots.filter(s => s.isAllocated).length,
      availableSlots: schedule.timeSlots.filter(s => !s.isAllocated).length,
      utilizationPercentage: 0
    };
    
    stats.utilizationPercentage = ((stats.allocatedSlots / stats.totalSlots) * 100).toFixed(2);
    
    // Get unique trainers and modules
    const uniqueTrainers = new Set(
      schedule.timeSlots
        .filter(s => s.isAllocated && s.trainer)
        .map(s => s.trainer)
    );
    
    const uniqueModules = new Set(
      schedule.timeSlots
        .filter(s => s.isAllocated && s.module)
        .map(s => s.module)
    );
    
    stats.uniqueTrainers = uniqueTrainers.size;
    stats.uniqueModules = uniqueModules.size;
    
    // Get slots by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    stats.slotsByDay = days.map(day => ({
      day,
      total: schedule.timeSlots.filter(s => s.day === day).length,
      allocated: schedule.timeSlots.filter(s => s.day === day && s.isAllocated).length
    }));
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Get timetable stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getStudentTimetable,
  getMyTimetable,
  getTimetableStats
};