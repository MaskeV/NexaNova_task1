// src/controllers/trainerController.js
const Trainer = require('../models/Trainer');
const Subject = require('../models/Subject');

// Validation helper function
const validateTrainerData = (data) => {
  const errors = {};

  // Validate Employee ID
  if (!data.empId || !data.empId.trim()) {
    errors.empId = 'Employee ID is required';
  } else if (!/^EMP\d{3}$/.test(data.empId)) {
    errors.empId = 'Employee ID must be in format EMP001, EMP002, etc.';
  }

  // Validate Name
  if (!data.name || !data.name.trim()) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters long';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Name cannot exceed 100 characters';
  } else if (!/^[a-zA-Z\s]+$/.test(data.name.trim())) {
    errors.name = 'Name can only contain letters and spaces';
  }

  // Validate Email
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate Phone
  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^[6-9]\d{9}$/.test(data.phone.trim())) {
    errors.phone = 'Phone number must be exactly 10 digits and start with 6, 7, 8, or 9';
  }

  // Validate Subjects
  if (!data.subjects || data.subjects.length === 0) {
    errors.subjects = 'At least one subject must be assigned';
  }

  // Validate Experience
  if (data.experience === undefined || data.experience === null || data.experience === '') {
    errors.experience = 'Experience is required';
  } else {
    const exp = parseInt(data.experience);
    if (isNaN(exp)) {
      errors.experience = 'Experience must be a number';
    } else if (exp < 1) {
      errors.experience = 'Experience must be at least 1 year';
    } else if (exp > 50) {
      errors.experience = 'Experience cannot exceed 50 years';
    } else if (!Number.isInteger(exp)) {
      errors.experience = 'Experience must be a whole number';
    }
  }

  return errors;
};

// @desc    Add a new trainer
// @route   POST /trainer
const addTrainer = async (req, res) => {
  try {
    const { empId, name, email, phone, subjects, experience } = req.body;

    console.log('📝 Adding new trainer:', { empId, name, email });

    // Validate input data
    const validationErrors = validateTrainerData(req.body);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({ $or: [{ empId }, { email }] });
    if (existingTrainer) {
      const errors = {};
      if (existingTrainer.empId === empId) {
        errors.empId = 'Employee ID already exists';
      }
      if (existingTrainer.email.toLowerCase() === email.toLowerCase()) {
        errors.email = 'Email already registered';
      }
      return res.status(400).json({ 
        success: false,
        message: 'Trainer with this Employee ID or Email already exists',
        errors
      });
    }

    // Create new trainer
    const trainer = await Trainer.create({
      empId: empId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subjects,
      experience: parseInt(experience)
    });

    // Update subjects with this trainer's empId
    if (subjects && subjects.length > 0) {
      await Subject.updateMany(
        { subjectId: { $in: subjects } },
        { $addToSet: { trainers: empId } }
      );
    }

    console.log('✅ Trainer created successfully:', trainer.empId);

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: trainer
    });
  } catch (error) {
    console.error('❌ Add trainer error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add trainer'
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