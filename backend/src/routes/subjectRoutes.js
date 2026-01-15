// src/routes/subjectRoutes.js
const express = require('express');
const router = express.Router();
const {
  addSubject,
  getAllSubjects,
  getSubjectWithTrainers
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes (anyone can view)
router.get('/', getAllSubjects);
router.get('/:id', getSubjectWithTrainers);

// Protected routes (must be logged in)
// Only admin can add subjects
router.post('/', protect, authorize('admin'), addSubject);

module.exports = router;