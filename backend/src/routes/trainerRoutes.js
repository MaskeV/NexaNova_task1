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
const { protect } = require('../middlewares/authMiddleware');

// Apply protect middleware to all routes
router.use(protect);

// /trainer routes
router.post('/', addTrainer);
router.get('/', getAllTrainers);
router.delete('/', deleteTrainer);

// /trainer/:id
router.get('/:id', getTrainerById);

// /trainer/:subject/topic
router.get('/:subject/topic', getTrainersBySubject);

module.exports = router;