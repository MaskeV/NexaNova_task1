// src/controllers/subjectController.js
const Subject = require('../models/Subject');
const Trainer = require('../models/Trainer');

// @desc    Add a new subject
// @route   POST /subject
const addSubject = async (req, res) => {
  try {
    const { subjectId, name, description, duration, level, trainers } = req.body;

    // Check if subject already exists
    const existingSubject = await Subject.findOne({ subjectId });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this ID already exists'
      });
    }

    // Create new subject
    const subject = await Subject.create({
      subjectId,
      name,
      description,
      duration,
      level,
      trainers
    });

    // Update trainers with this subject
    if (trainers && trainers.length > 0) {
      await Trainer.updateMany(
        { empId: { $in: trainers } },
        { $addToSet: { subjects: subjectId } }
      );
    }

    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all subjects
// @route   GET /subject
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get subject with all trainers teaching it
// @route   GET /subject/:id
const getSubjectWithTrainers = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the subject
    const subject = await Subject.findOne({ subjectId: id });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Find all trainers teaching this subject
    const trainers = await Trainer.find({
      empId: { $in: subject.trainers }
    }).select('empId name email phone experience');

    res.status(200).json({
      success: true,
      data: {
        subject: subject,
        trainers: trainers,
        trainerCount: trainers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addSubject,
  getAllSubjects,
  getSubjectWithTrainers
};