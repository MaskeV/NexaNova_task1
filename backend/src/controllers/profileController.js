// backend/src/controllers/profileController.js
const Trainer = require('../models/Trainer');
const Subject = require('../models/Subject');
const User = require('../models/user');

// @desc    Get my trainer profile
// @route   GET /profile
const getMyProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ createdBy: req.user._id });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer profile not found'
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

// @desc    Create my trainer profile
// @route   POST /profile
const createMyProfile = async (req, res) => {
  try {
    const { empId, name, email, phone, subjects, experience } = req.body;

    // Check if user already has a trainer profile
    const existingProfile = await Trainer.findOne({ createdBy: req.user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'You already have a trainer profile. Use update instead.'
      });
    }

    // Check if empId or email already exists
    const existingTrainer = await Trainer.findOne({ $or: [{ empId }, { email }] });
    if (existingTrainer) {
      return res.status(400).json({ 
        success: false,
        message: 'Trainer with this Employee ID or Email already exists' 
      });
    }

    // Create new trainer profile
    const trainer = await Trainer.create({
      empId,
      name,
      email,
      phone,
      subjects,
      experience,
      createdBy: req.user._id
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
      message: 'Trainer profile created successfully',
      data: trainer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update my trainer profile
// @route   PUT /profile
const updateMyProfile = async (req, res) => {
  try {
    const { name, email, phone, subjects, experience } = req.body;

    // Find trainer profile by user ID
    const trainer = await Trainer.findOne({ createdBy: req.user._id });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer profile not found. Please create one first.'
      });
    }

    // Check if new email conflicts with another trainer
    if (email && email !== trainer.email) {
      const emailExists = await Trainer.findOne({ 
        email, 
        _id: { $ne: trainer._id } 
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'This email is already used by another trainer'
        });
      }
    }

    // Store old subjects for cleanup
    const oldSubjects = trainer.subjects || [];

    // Update trainer fields
    if (name) trainer.name = name;
    if (email) trainer.email = email;
    if (phone !== undefined) trainer.phone = phone;
    if (experience !== undefined) trainer.experience = experience;
    if (subjects !== undefined) trainer.subjects = subjects;

    await trainer.save();

    // Update subjects
    if (subjects !== undefined) {
      const newSubjects = subjects || [];
      const empId = trainer.empId;

      // Remove trainer from old subjects
      const subjectsToRemove = oldSubjects.filter(s => !newSubjects.includes(s));
      if (subjectsToRemove.length > 0) {
        await Subject.updateMany(
          { subjectId: { $in: subjectsToRemove } },
          { $pull: { trainers: empId } }
        );
      }

      // Add trainer to new subjects
      const subjectsToAdd = newSubjects.filter(s => !oldSubjects.includes(s));
      if (subjectsToAdd.length > 0) {
        await Subject.updateMany(
          { subjectId: { $in: subjectsToAdd } },
          { $addToSet: { trainers: empId } }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Trainer profile updated successfully',
      data: trainer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete my trainer profile
// @route   DELETE /profile
const deleteMyProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ createdBy: req.user._id });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer profile not found'
      });
    }

    // Remove trainer from all subjects
    await Subject.updateMany(
      { trainers: trainer.empId },
      { $pull: { trainers: trainer.empId } }
    );

    await trainer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Trainer profile deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
  deleteMyProfile
};