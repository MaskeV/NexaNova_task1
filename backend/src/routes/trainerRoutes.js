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

// /trainer routes
router.post('/', addTrainer);
router.get('/', getAllTrainers);
router.delete('/', deleteTrainer);

// /trainer/:id
router.get('/:id', getTrainerById);

// /trainer/:subject/topic
router.get('/:subject/topic', getTrainersBySubject);

module.exports = router;