// backend/src/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  bulkUploadStudents,
  updateStudentStatus,
  deleteStudent,
  getStudentStats,
  upload
} = require('../controllers/studentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Logging middleware
router.use((req, res, next) => {
  console.log(`👥 Student Route: ${req.method} ${req.path}`);
  next();
});

// All routes require authentication
router.use(protect);

// GET /api/students/stats - Get student statistics (Admin only)
router.get('/stats', authorize('admin'), getStudentStats);

// GET /api/students - Get all students (Admin only)
router.get('/', authorize('admin'), getAllStudents);

// POST /api/students/bulk-upload - Bulk upload students (Admin only)
router.post(
  '/bulk-upload',
  authorize('admin'),
  upload.single('file'),
  bulkUploadStudents
);

// GET /api/students/:id - Get student by ID (Admin or own profile)
router.get('/:id', authorize('student', 'admin'), getStudentById);

// PUT /api/students/:id/status - Update student status (Admin only)
router.put('/:id/status', authorize('admin'), updateStudentStatus);

// DELETE /api/students/:id - Delete student (Admin only)
router.delete('/:id', authorize('admin'), deleteStudent);

module.exports = router;