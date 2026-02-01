// backend/src/controllers/subjectController.js
const Subject = require('../models/Subject');
const Trainer = require('../models/Trainer');

// Validation helper function
const validateSubjectData = (data) => {
  const errors = {};

  // Validate Subject ID
  if (!data.subjectId || !data.subjectId.trim()) {
    errors.subjectId = 'Subject ID is required';
  } else if (!/^SB\d{2}$/.test(data.subjectId.trim().toUpperCase())) {
    errors.subjectId = 'Subject ID must be in format SB01, SB02, etc.';
  }

  // Validate Name
  if (!data.name || !data.name.trim()) {
    errors.name = 'Subject name is required';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Subject name must be at least 3 characters long';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Subject name cannot exceed 100 characters';
  }

  // Validate Description (NOW REQUIRED)
  if (!data.description || !data.description.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  } else if (data.description.trim().length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  // Validate Duration (NOW REQUIRED)
  if (data.duration === undefined || data.duration === null || data.duration === '') {
    errors.duration = 'Duration is required';
  } else {
    const dur = parseInt(data.duration);
    if (isNaN(dur)) {
      errors.duration = 'Duration must be a number';
    } else if (dur < 1) {
      errors.duration = 'Duration must be at least 1 hour';
    } else if (dur > 1000) {
      errors.duration = 'Duration cannot exceed 1000 hours';
    } else if (!Number.isInteger(dur)) {
      errors.duration = 'Duration must be a whole number';
    }
  }

  // Validate Level
  if (!data.level) {
    errors.level = 'Level is required';
  } else if (!['Beginner', 'Intermediate', 'Advanced'].includes(data.level)) {
    errors.level = 'Level must be either Beginner, Intermediate, or Advanced';
  }

  return errors;
};

// @desc    Add a new subject
// @route   POST /subject
const addSubject = async (req, res) => {
  try {
    const { subjectId, name, description, duration, level, trainers } = req.body;

    console.log('📝 Adding new subject:', { subjectId, name });

    // Validate input data
    const validationErrors = validateSubjectData(req.body);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if subject already exists
    const existingSubject = await Subject.findOne({ subjectId: subjectId.trim().toUpperCase() });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this ID already exists',
        errors: { subjectId: 'Subject ID already exists' }
      });
    }

    // Create new subject
    const subject = await Subject.create({
      subjectId: subjectId.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      duration: parseInt(duration),
      level,
      trainers: trainers || []
    });

    // Update trainers with this subject
    if (trainers && trainers.length > 0) {
      await Trainer.updateMany(
        { empId: { $in: trainers } },
        { $addToSet: { subjects: subject.subjectId } }
      );
    }

    console.log('✅ Subject created successfully:', subject.subjectId);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    console.error('❌ Add subject error:', error);

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
      message: error.message || 'Failed to add subject'
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
    console.error('❌ Get all subjects error:', error);
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
    
    console.log('🔍 Getting subject:', id);

    // Find the subject
    const subject = await Subject.findOne({ subjectId: id });

    if (!subject) {
      console.log('❌ Subject not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Find all trainers teaching this subject
    const trainers = await Trainer.find({
      empId: { $in: subject.trainers }
    }).select('empId name email phone experience');

    console.log('✅ Subject found:', id, '- Trainers:', trainers.length);

    res.status(200).json({
      success: true,
      data: {
        subject: subject,
        trainers: trainers,
        trainerCount: trainers.length
      }
    });
  } catch (error) {
    console.error('❌ Get subject error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a subject
// @route   PUT /subject/:id
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, level, trainers } = req.body;

    console.log('✏️ Updating subject:', id);

    // Validate input data (skip subjectId validation as it cannot be updated)
    const validationErrors = validateSubjectData({ 
      subjectId: 'SB01', // Dummy value for validation
      name, 
      description, 
      duration, 
      level 
    });
    delete validationErrors.subjectId; // Remove subjectId error

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Find the subject
    const subject = await Subject.findOne({ subjectId: id });

    if (!subject) {
      console.log('❌ Subject not found for update:', id);
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Store old trainers for cleanup
    const oldTrainers = subject.trainers || [];

    // Update subject fields
    if (name) subject.name = name.trim();
    if (description) subject.description = description.trim();
    if (duration !== undefined) subject.duration = parseInt(duration);
    if (level) subject.level = level;
    if (trainers !== undefined) subject.trainers = trainers;

    await subject.save();

    console.log('💾 Subject saved:', subject);

    // Update trainers - sync relationships
    if (trainers !== undefined) {
      const newTrainers = trainers || [];
      const subjectId = subject.subjectId;

      // Remove subject from trainers who are no longer teaching it
      const trainersToRemove = oldTrainers.filter(t => !newTrainers.includes(t));
      if (trainersToRemove.length > 0) {
        await Trainer.updateMany(
          { empId: { $in: trainersToRemove } },
          { $pull: { subjects: subjectId } }
        );
      }

      // Add subject to new trainers
      const trainersToAdd = newTrainers.filter(t => !oldTrainers.includes(t));
      if (trainersToAdd.length > 0) {
        await Trainer.updateMany(
          { empId: { $in: trainersToAdd } },
          { $addToSet: { subjects: subjectId } }
        );
      }
    }

    console.log('✅ Subject updated successfully:', id);

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (error) {
    console.error('❌ Update subject error:', error);

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
      message: error.message || 'Failed to update subject'
    });
  }
};

// @desc    Delete a subject
// @route   DELETE /subject/:id
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting subject:', id);

    const subject = await Subject.findOne({ subjectId: id });

    if (!subject) {
      console.log('❌ Subject not found for deletion:', id);
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Remove subject from all trainers
    if (subject.trainers && subject.trainers.length > 0) {
      console.log('🔄 Removing subject from trainers:', subject.trainers);
      await Trainer.updateMany(
        { subjects: subject.subjectId },
        { $pull: { subjects: subject.subjectId } }
      );
    }

    await subject.deleteOne();

    console.log('✅ Subject deleted successfully:', id);

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
      data: subject
    });
  } catch (error) {
    console.error('❌ Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addSubject,
  getAllSubjects,
  getSubjectWithTrainers,
  updateSubject,
  deleteSubject
};