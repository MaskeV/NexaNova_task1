// backend/src/controllers/subjectController.js
const Subject = require('../models/Subject');
const Trainer = require('../models/Trainer');

// @desc    Add a new subject
// @route   POST /subject
const addSubject = async (req, res) => {
  try {
    const { subjectId, name, description, duration, level, trainers } = req.body;

    console.log('📝 Adding new subject:', { subjectId, name });

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

    console.log('✅ Subject created successfully:', subject.subjectId);

    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('❌ Add subject error:', error);
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
    console.log('📦 Update data:', { name, description, duration, level, trainers });

    // Find the subject
    const subject = await Subject.findOne({ subjectId: id });

    if (!subject) {
      console.log('❌ Subject not found for update:', id);
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    console.log('📋 Current subject data:', subject);

    // Store old trainers for cleanup
    const oldTrainers = subject.trainers || [];

    // Update subject fields
    if (name !== undefined) subject.name = name;
    if (description !== undefined) subject.description = description;
    if (duration !== undefined) subject.duration = duration;
    if (level !== undefined) subject.level = level;
    if (trainers !== undefined) subject.trainers = trainers;

    await subject.save();

    console.log('💾 Subject saved:', subject);

    // Update trainers - sync relationships
    if (trainers !== undefined) {
      const newTrainers = trainers || [];
      const subjectId = subject.subjectId;

      console.log('🔄 Syncing trainers...');
      console.log('Old trainers:', oldTrainers);
      console.log('New trainers:', newTrainers);

      // Remove subject from trainers who are no longer teaching it
      const trainersToRemove = oldTrainers.filter(t => !newTrainers.includes(t));
      if (trainersToRemove.length > 0) {
        console.log('➖ Removing subject from trainers:', trainersToRemove);
        await Trainer.updateMany(
          { empId: { $in: trainersToRemove } },
          { $pull: { subjects: subjectId } }
        );
      }

      // Add subject to new trainers
      const trainersToAdd = newTrainers.filter(t => !oldTrainers.includes(t));
      if (trainersToAdd.length > 0) {
        console.log('➕ Adding subject to trainers:', trainersToAdd);
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
    res.status(400).json({
      success: false,
      message: error.message
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