// backend/src/controllers/timetableController.js
const Enrollment = require('../models/Enrollment');
const Schedule = require('../models/Schedule');
const Subject = require('../models/Subject');
const Trainer = require('../models/Trainer');
const Course = require('../models/Course');

// @desc    Get weekly timetable for a student
// @route   GET /timetable/student/:studentId
const getStudentTimetable = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { weekId } = req.query;

    if (req.user._id.toString() !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this timetable' });
    }

    // Step 1: Get student's active enrollments
    const enrollments = await Enrollment.find({ student: studentId, status: 'active' });
    console.log('📋 Enrolled courseIds:', enrollments.map(e => e.course));

    if (enrollments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          weekId: null,
          weekStartDate: null,
          weekEndDate: null,
          enrolledCourses: [],
          timetable: [],
          totalClasses: 0
        }
      });
    }

    const enrolledCourseIds = enrollments.map(e => e.course); // e.g. ['CRS05']

    // Step 2: For each enrolled course, get all its subjectIds
    // This builds the set of subjectIds the student should see in the timetable
    const enrolledSubjectIds = new Set();
    const enrolledCourseDetails = [];

    for (const courseId of enrolledCourseIds) {
      // Try as a Course first (CRS01 format)
      const course = await Course.findOne({ courseId });
      if (course) {
        // course.subjects is [{ subjectId, order }]
        (course.subjects || []).forEach(s => {
          enrolledSubjectIds.add(typeof s === 'string' ? s : s.subjectId);
        });
        enrolledCourseDetails.push({
          subjectId: course.courseId,
          name: course.name,
          level: course.level
        });
        continue;
      }

      // Fallback: treat as a direct subjectId (SB01 format)
      const subject = await Subject.findOne({ subjectId: courseId });
      if (subject) {
        enrolledSubjectIds.add(subject.subjectId);
        enrolledCourseDetails.push({
          subjectId: subject.subjectId,
          name: subject.name,
          level: subject.level
        });
      }
    }

    console.log('📚 Enrolled subjectIds (from courses):', [...enrolledSubjectIds]);

    // Step 3: Find the schedule
    let schedule;
    if (weekId) {
      schedule = await Schedule.findOne({ weekId });
    } else {
      const now = new Date();
      schedule = await Schedule.findOne({
        weekStartDate: { $lte: now },
        weekEndDate: { $gte: now }
      });
      // Fallback to most recent schedule if no current week
      if (!schedule) {
        schedule = await Schedule.findOne().sort({ weekStartDate: -1 });
      }
    }

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'No schedule found. Please contact your administrator.'
      });
    }

    console.log('📅 Schedule:', schedule.weekId);
    console.log('📅 Allocated slot subjects:', schedule.timeSlots.filter(s => s.isAllocated).map(s => s.subject));

    // Step 4: Match slots whose subject is in the student's enrolled subjectIds
    const studentSlots = schedule.timeSlots.filter(slot => {
      if (!slot.isAllocated || !slot.subject) return false;
      const match = enrolledSubjectIds.has(slot.subject);
      console.log(`  slot.subject="${slot.subject}" in enrolledSubjectIds? ${match}`);
      return match;
    });

    console.log('✅ Matching slots:', studentSlots.length);

    // Step 5: Populate subject and trainer details manually (both are strings, not ObjectIds)
    const populatedSlots = await Promise.all(
      studentSlots.map(async (slot) => {
        const subject = await Subject.findOne({ subjectId: slot.subject });
        const trainer = slot.trainer
          ? await Trainer.findOne({ empId: slot.trainer })
          : null;

        return {
          _id: slot._id,
          day: slot.day,
          timeSlot: slot.timeSlot,
          subject: {
            subjectId: slot.subject,
            name: subject?.name || 'Unknown',
            description: subject?.description,
            level: subject?.level,
            totalDuration: subject?.totalDuration
          },
          trainer: trainer
            ? {
                empId: trainer.empId,
                name: trainer.name,
                email: trainer.email,
                experience: trainer.experience
              }
            : null
        };
      })
    );

    // Step 6: Organise by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const organizedTimetable = days.map(day => ({
      day,
      slots: populatedSlots
        .filter(slot => slot.day === day)
        .sort((a, b) => {
          const order = ['8AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM'];
          return order.indexOf(a.timeSlot) - order.indexOf(b.timeSlot);
        })
    }));

    res.status(200).json({
      success: true,
      data: {
        weekId: schedule.weekId,
        weekStartDate: schedule.weekStartDate,
        weekEndDate: schedule.weekEndDate,
        enrolledCourses: enrolledCourseDetails,
        timetable: organizedTimetable,
        totalClasses: populatedSlots.length
      }
    });
  } catch (error) {
    console.error('❌ Get student timetable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current week timetable for logged-in student
// @route   GET /timetable/my-timetable
const getMyTimetable = async (req, res) => {
  try {
    req.params.studentId = req.user._id.toString();
    return getStudentTimetable(req, res);
  } catch (error) {
    console.error('❌ Get my timetable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get timetable statistics for a week
// @route   GET /timetable/stats/:weekId
const getTimetableStats = async (req, res) => {
  try {
    const { weekId } = req.params;
    const schedule = await Schedule.findOne({ weekId });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const stats = {
      totalSlots: schedule.timeSlots.length,
      allocatedSlots: schedule.timeSlots.filter(s => s.isAllocated).length,
      availableSlots: schedule.timeSlots.filter(s => !s.isAllocated).length,
      utilizationPercentage: 0
    };
    stats.utilizationPercentage = ((stats.allocatedSlots / stats.totalSlots) * 100).toFixed(2);

    const uniqueTrainers = new Set(
      schedule.timeSlots.filter(s => s.isAllocated && s.trainer).map(s => s.trainer)
    );
    const uniqueSubjects = new Set(
      schedule.timeSlots.filter(s => s.isAllocated && s.subject).map(s => s.subject)
    );

    stats.uniqueTrainers = uniqueTrainers.size;
    stats.uniqueSubjects = uniqueSubjects.size;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    stats.slotsByDay = days.map(day => ({
      day,
      total: schedule.timeSlots.filter(s => s.day === day).length,
      allocated: schedule.timeSlots.filter(s => s.day === day && s.isAllocated).length
    }));

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Get timetable stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStudentTimetable, getMyTimetable, getTimetableStats };