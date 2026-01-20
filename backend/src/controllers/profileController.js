const Trainer = require('../models/Trainer');
const Subject = require('../models/Subject');
const User = require('../models/User');

// Helper function to generate empId
const generateEmpId = async () => {
  try {
    // Find the highest empId
    const lastTrainer = await Trainer.findOne().sort({ empId: -1 });
    
    let nextNum = 1;
    if (lastTrainer && lastTrainer.empId) {
      const match = lastTrainer.empId.match(/EMP(\d+)/);
      if (match) {
        nextNum = parseInt(match[1]) + 1;
      }
    }
    
    return `EMP${String(nextNum).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating empId:', error);
    return 'EMP001'; // Fallback
  }
};

// @desc    Get my trainer profile
// @route   GET /profile/me
const getMyProfile = async (req, res) => {
  try {
    // Try to find by user ID first (createdBy)
    let trainer = await Trainer.findOne({ createdBy: req.user._id });
    
    // If not found, try to find by email (for backward compatibility)
    if (!trainer && req.user.email) {
      trainer = await Trainer.findOne({ email: req.user.email });
    }

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Create my trainer profile
// @route   POST /profile
const createMyProfile = async (req, res) => {
  try {
    const { name, phone, subjects, experience } = req.body;
    
    // Get user email from auth (should not come from request body)
    const userEmail = req.user.email;
    
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email not found in authentication'
      });
    }

    // Check if user already has a trainer profile
    const existingByUser = await Trainer.findOne({ createdBy: req.user._id });
    if (existingByUser) {
      return res.status(400).json({
        success: false,
        message: 'You already have a trainer profile. Use update instead.'
      });
    }

    // Check if email already exists in trainer profiles
    const existingByEmail = await Trainer.findOne({ email: userEmail });
    if (existingByEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'Trainer profile with this email already exists' 
      });
    }

    // Generate empId automatically
    const empId = await generateEmpId();

    // Create new trainer profile
    const trainer = await Trainer.create({
      empId,
      name: name || req.user.name || req.user.username,
      email: userEmail, // Use email from auth, NOT from request body
      phone,
      subjects: subjects || [],
      experience: experience || 0,
      createdBy: req.user._id
    });

    // Update subjects with this trainer's empId
    if (trainer.subjects && trainer.subjects.length > 0) {
      await Subject.updateMany(
        { subjectId: { $in: trainer.subjects } },
        { $addToSet: { trainers: trainer.empId } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Trainer profile created successfully',
      data: trainer
    });
  } catch (error) {
    console.error('Create profile error:', error);
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
    const { name, phone, subjects, experience } = req.body;

    // Find trainer profile by user ID
    const trainer = await Trainer.findOne({ createdBy: req.user._id });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer profile not found. Please create one first.'
      });
    }

    // Store old subjects for cleanup
    const oldSubjects = trainer.subjects || [];

    // Update trainer fields (DO NOT update email - it comes from auth)
    if (name) trainer.name = name;
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
    console.error('Update profile error:', error);
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
    console.error('Delete profile error:', error);
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