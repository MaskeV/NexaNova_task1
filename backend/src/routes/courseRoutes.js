// backend/src/routes/courseRoutes.js - CREATE OR REPLACE
const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  addSubjectToCourse,
  removeSubjectFromCourse,
  updateCourse,
  deleteCourse,
  getCoursesWithHierarchy
} = require('../controllers/courseController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Logging middleware
router.use((req, res, next) => {
  console.log(`📚 Course Route: ${req.method} ${req.path}`);
  next();
});

// Public routes
router.get('/', getAllCourses);
router.get('/hierarchy', getCoursesWithHierarchy);
router.get('/:id', getCourseById);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createCourse);
router.post('/:id/subjects', protect, authorize('admin'), addSubjectToCourse);
router.delete('/:id/subjects/:subjectId', protect, authorize('admin'), removeSubjectFromCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

module.exports = router;