// backend/src/controllers/subjectController.js - REPLACE ENTIRE FILE
const Subject = require('../models/Subject');
const Module = require('../models/Module');
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

  // Validate Description
  if (!data.description || !data.description.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  } else if (data.description.trim().length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
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
    const { subjectId, name, description, level, trainers, modules } = req.body;

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

    // Validate modules if provided
    if (modules && modules.length > 0) {
      for (const moduleRef of modules) {
        const module = await Module.findOne({ moduleId: moduleRef.moduleId });
        if (!module) {
          return res.status(400).json({
            success: false,
            message: `Module ${moduleRef.moduleId} not found`
          });
        }
      }
    }

    // Create new subject
    const subject = await Subject.create({
      subjectId: subjectId.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      level: level || 'Beginner',
      trainers: trainers || [],
      modules: modules || []
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
// backend/src/controllers/subjectController.js

// Replace getAllSubjects function
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('trainers', 'name empId email experience')
      .populate('modules') // Populate module references
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('Error in getAllSubjects:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Replace getSubjectById function
const getSubjectById = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({ subjectId })
      .populate('trainers', 'name empId email experience')
      .populate('modules'); // Populate module references

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error in getSubjectById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Get subject with modules and trainers
// @route   GET /subject/:id
const getSubjectWithTrainers = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Getting subject:', id);

    const subject = await Subject.findOne({ subjectId: id });

    if (!subject) {
      console.log('❌ Subject not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Get modules
    const modules = await Promise.all(
      subject.modules.map(async (moduleRef) => {
        const module = await Module.findOne({ moduleId: moduleRef.moduleId });
        if (!module) return null;
        
        return {
          ...module.toObject(),
          order: moduleRef.order
        };
      })
    );

    // Get trainers
    const trainers = await Trainer.find({
      empId: { $in: subject.trainers }
    }).select('empId name email phone experience');

    console.log('✅ Subject found:', id, '- Modules:', modules.length, '- Trainers:', trainers.length);

    res.status(200).json({
      success: true,
      data: {
        subject: subject,
        modules: modules.filter(m => m !== null).sort((a, b) => a.order - b.order),
        trainers: trainers,
        stats: {
          moduleCount: modules.filter(m => m !== null).length,
          trainerCount: trainers.length,
          totalDuration: subject.totalDuration
        }
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

// @desc    Add module to subject
// @route   POST /subject/:id/modules
// @access  Admin
const addModuleToSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleId, order } = req.body;
    
    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: 'Module ID is required'
      });
    }
    
    // Verify module exists
    const module = await Module.findOne({ moduleId });
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    const subject = await Subject.findOne({ subjectId: id });
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Check if module already exists
    const existingModule = subject.modules.find(m => m.moduleId === moduleId);
    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: 'Module already exists in this subject'
      });
    }
    
    // Add module
    subject.modules.push({
      moduleId,
      order: order || (subject.modules.length + 1)
    });
    
    await subject.save();
    
    console.log('✅ Module added to subject:', subject.subjectId, '→', moduleId);
    
    res.status(200).json({
      success: true,
      message: 'Module added to subject successfully',
      data: subject
    });
  } catch (error) {
    console.error('❌ Add module error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove module from subject
// @route   DELETE /subject/:id/modules/:moduleId
// @access  Admin
const removeModuleFromSubject = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    
    const subject = await Subject.findOne({ subjectId: id });
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    const moduleIndex = subject.modules.findIndex(m => m.moduleId === moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found in this subject'
      });
    }
    
    subject.modules.splice(moduleIndex, 1);
    await subject.save();
    
    console.log('✅ Module removed from subject:', subject.subjectId, '→', moduleId);
    
    res.status(200).json({
      success: true,
      message: 'Module removed from subject successfully',
      data: subject
    });
  } catch (error) {
    console.error('❌ Remove module error:', error);
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
    const { name, description, level, trainers, modules, isActive } = req.body;

    console.log('✏️ Updating subject:', id);

    // Validate input data (skip subjectId validation as it cannot be updated)
    const validationErrors = validateSubjectData({ 
      subjectId: 'SB01', // Dummy value for validation
      name, 
      description, 
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
    if (level) subject.level = level;
    if (trainers !== undefined) subject.trainers = trainers;
    if (modules !== undefined) subject.modules = modules;
    if (isActive !== undefined) subject.isActive = isActive;

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

    // Check if subject is used in any course
    const Course = require('../models/Course');
    const usedInCourses = await Course.find({
      'subjects.subjectId': id
    }).select('courseId name');
    
    if (usedInCourses.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subject. It is used in ${usedInCourses.length} course(s)`,
        courses: usedInCourses
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
  addModuleToSubject,
  removeModuleFromSubject,
  updateSubject,
  deleteSubject
};