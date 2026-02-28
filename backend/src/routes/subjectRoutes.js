// backend/src/routes/subjectRoutes.js
const express = require('express');
const router = express.Router();
const {
  addSubject,
  getAllSubjects,
  getSubjectWithTrainers,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Logging middleware for debugging
router.use((req, res, next) => {
  console.log(`📘 Subject Route: ${req.method} ${req.path}`);
  next();
});

// Public routes - NO authentication required
router.get('/', getAllSubjects);

// UPDATED: Protected routes - Require authentication and admin role
router.post('/', protect, authorize('admin'), addSubject);

// Public route - Get single subject with trainers
router.get('/:id', getSubjectWithTrainers);

// UPDATED: Protected routes - Require authentication and admin role
router.put('/:id', protect, authorize('admin'), updateSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

module.exports = router;