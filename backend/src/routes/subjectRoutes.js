// src/routes/subjectRoutes.js
const express = require('express');
const router = express.Router();
const {
  addSubject,
  getAllSubjects,
  getSubjectWithTrainers
} = require('../controllers/subjectController');

// /subject routes
router.post('/', addSubject);
router.get('/', getAllSubjects);

// /subject/:id
router.get('/:id', getSubjectWithTrainers);

module.exports = router;