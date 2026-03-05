// backend/src/routes/enrollmentRoutes.js - REPLACE ENTIRE FILE
const express = require('express');
const router = express.Router();
const {
  enrollStudent,
  bulkEnrollStudents,
  getStudentCourses,
  getCourseEnrollments,
  getAllEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Logging middleware for debugging
router.use((req, res, next) => {
  console.log(`📚 Enrollment Route: ${req.method} ${req.path}`);
  next();
});

// All routes require authentication
router.use(protect);

// POST enroll a single student (Admin only)
router.post('/', authorize('admin'), enrollStudent);

// POST bulk enroll students (Admin only)
router.post('/bulk', authorize('admin'), bulkEnrollStudents);

// GET all enrollments (Admin only)
router.get('/', authorize('admin'), getAllEnrollments);

// GET student's courses by email (Student can view own, Admin can view all)
router.get('/student/:studentEmail/courses', authorize('student', 'admin'), getStudentCourses);

// GET course enrollments (Admin only)
router.get('/course/:courseId', authorize('admin'), getCourseEnrollments);

// PUT update enrollment status (Admin only)
router.put('/:enrollmentId', authorize('admin'), updateEnrollmentStatus);

// DELETE enrollment (Admin only)
router.delete('/:enrollmentId', authorize('admin'), deleteEnrollment);

module.exports = router;
