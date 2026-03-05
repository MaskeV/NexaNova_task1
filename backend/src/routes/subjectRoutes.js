// backend/src/routes/subjectRoutes.js - REPLACE ENTIRE FILE
const express = require('express');
const router = express.Router();
const {
  addSubject,
  getAllSubjects,
  getSubjectWithTrainers,
  addModuleToSubject,
  removeModuleFromSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Logging middleware
router.use((req, res, next) => {
  console.log(`📘 Subject Route: ${req.method} ${req.path}`);
  next();
});

// Public routes
router.get('/', getAllSubjects);
router.get('/:id', getSubjectWithTrainers);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), addSubject);
router.post('/:id/modules', protect, authorize('admin'), addModuleToSubject);
router.delete('/:id/modules/:moduleId', protect, authorize('admin'), removeModuleFromSubject);
router.put('/:id', protect, authorize('admin'), updateSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

module.exports = router;