// src/controllers/trainerController.js
const Trainer = require('../models/Trainer');
const Subject = require('../models/Subject');

// @desc    Add a new trainer
// @route   POST /trainer
const addTrainer = async (req, res) => {
  try {
    const { empId, name, email, phone, subjects, experience } = req.body;

    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({ $or: [{ empId }, { email }] });
    if (existingTrainer) {
      return res.status(400).json({ 
        success: false,
        message: 'Trainer with this Employee ID or Email already exists' 
      });
    }

    // Create new trainer
    const trainer = await Trainer.create({
      empId,
      name,
      email,
      phone,
      subjects,
      experience
    });

    // Update subjects with this trainer's empId
    if (subjects && subjects.length > 0) {
      await Subject.updateMany(
        { subjectId: { $in: subjects } },
        { $addToSet: { trainers: empId } }
      );
    }

    res.status(201).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all trainers
// @route   GET /trainer
const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find();
    
    res.status(200).json({
      success: true,
      count: trainers.length,
      data: trainers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a specific trainer
// @route   DELETE /trainer
const deleteTrainer = async (req, res) => {
  try {
    const { empId } = req.body;

    if (!empId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const trainer = await Trainer.findOneAndDelete({ empId });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Remove trainer from subjects
    await Subject.updateMany(
      { trainers: empId },
      { $pull: { trainers: empId } }
    );

    res.status(200).json({
      success: true,
      message: 'Trainer deleted successfully',
      data: trainer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get trainer by ID
// @route   GET /trainer/:id
const getTrainerById = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findOne({ empId: id });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get trainers by subject
// @route   GET /trainer/:subject/topic
const getTrainersBySubject = async (req, res) => {
  try {
    const { subject } = req.params;

    const trainers = await Trainer.find({ 
      subjects: { $in: [subject] } 
    });

    if (trainers.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No trainers found teaching ${subject}`
      });
    }

    res.status(200).json({
      success: true,
      count: trainers.length,
      subject: subject,
      data: trainers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addTrainer,
  getAllTrainers,
  deleteTrainer,
  getTrainerById,
  getTrainersBySubject
};