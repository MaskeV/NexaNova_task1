// backend/src/routes/timetableRoutes.js
const express = require('express');
const router = express.Router();
const {
  getStudentTimetable,
  getMyTimetable,
  getTimetableStats
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Logging middleware for debugging
router.use((req, res, next) => {
  console.log(`🗓️ Timetable Route: ${req.method} ${req.path}`);
  next();
});

// All routes require authentication
router.use(protect);

// UPDATED: GET current user's timetable (Student only)
router.get('/my-timetable', authorize('student'), getMyTimetable);

// GET timetable statistics (Admin only)
router.get('/stats/:weekId', authorize('admin'), getTimetableStats);

// UPDATED: GET specific student's timetable (Student can view own, Admin can view all)
router.get('/student/:studentId', authorize('student', 'admin'), getStudentTimetable);

module.exports = router;