const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  enrollStudent,
  bulkEnrollStudents,
  bulkEnrollStudentsByIds,
  getStudentCourses,
  getCourseEnrollments,
  getAllEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment,
  bulkUploadStudents,
  bulkEnrollSelectedStudents
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

router.use((req, res, next) => {
  console.log(`📚 Enrollment Route: ${req.method} ${req.path}`);
  next();
});

router.use(protect);

// Existing routes
router.post('/', authorize('admin'), enrollStudent);
router.post('/bulk', authorize('admin'), bulkEnrollStudents);
router.get('/', authorize('admin'), getAllEnrollments);
router.get('/student/:studentEmail/courses', authorize('student', 'admin'), getStudentCourses);
router.get('/course/:courseId', authorize('admin'), getCourseEnrollments);
router.put('/:enrollmentId', authorize('admin'), updateEnrollmentStatus);
router.delete('/:enrollmentId', authorize('admin'), deleteEnrollment);
router.post('/bulk-by-ids', authorize('admin'), bulkEnrollStudentsByIds);

// NEW ROUTES
// FR-Admin-06: Bulk Upload Student Data
router.post('/bulk-upload-students', authorize('admin'), upload.single('file'), bulkUploadStudents);

// FR-Admin-07: Bulk Enroll Students in Course
router.post('/bulk-enroll-selected', authorize('admin'), bulkEnrollSelectedStudents);

module.exports = router;