// src/routes/trainerRoutes.js
const express = require('express');
const router = express.Router();
const {
  addTrainer,
  getAllTrainers,
  deleteTrainer,
  getTrainerById,
  getTrainersBySubject
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Apply protect middleware to all routes
router.use(protect);

// UPDATED: /trainer routes - Admin only for management, others can view
router.post('/', authorize('admin'), addTrainer);
router.get('/', getAllTrainers); // All authenticated users can view
router.delete('/', authorize('admin'), deleteTrainer);

// /trainer/:id
router.get('/:id', getTrainerById); // All authenticated users can view

// /trainer/:subject/topic
router.get('/:subject/topic', getTrainersBySubject); // All authenticated users can view

module.exports = router;