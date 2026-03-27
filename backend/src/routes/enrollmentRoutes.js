// backend/src/routes/enrollmentRoutes.js
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

router.use((req, res, next) => {
  console.log(`📚 Enrollment Route: ${req.method} ${req.path}`);
  next();
});

router.use(protect);

router.post('/', authorize('admin'), enrollStudent);
router.post('/bulk', authorize('admin'), bulkEnrollStudents);
router.get('/', authorize('admin'), getAllEnrollments);

// ✅ FIX: param was :studentId but controller reads req.params.studentEmail
// Rename param to :studentEmail to match controller
router.get('/student/:studentEmail/courses', authorize('student', 'admin'), getStudentCourses);

router.get('/course/:courseId', authorize('admin'), getCourseEnrollments);
router.put('/:enrollmentId', authorize('admin'), updateEnrollmentStatus);
router.delete('/:enrollmentId', authorize('admin'), deleteEnrollment);

module.exports = router;