// backend/src/controllers/moduleController.js
const Module = require('../models/Module');

// Helper to generate module ID
const generateModuleId = async () => {
  try {
    const lastModule = await Module.findOne().sort({ moduleId: -1 });
    
    let nextNum = 1;
    if (lastModule && lastModule.moduleId) {
      const match = lastModule.moduleId.match(/MD(\d+)/);
      if (match) {
        nextNum = parseInt(match[1]) + 1;
      }
    }
    
    return `MD${String(nextNum).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating moduleId:', error);
    return 'MD001';
  }
};

// @desc    Create a new module
// @route   POST /api/modules
// @access  Admin
const createModule = async (req, res) => {
  try {
    const { name, description, duration, content, learningObjectives, prerequisites, resources, order } = req.body;
    
    // Validate required fields
    if (!name || !description || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and duration are required'
      });
    }
    
    // Generate module ID
    const moduleId = await generateModuleId();
    
    // Create module
    const module = await Module.create({
      moduleId,
      name: name.trim(),
      description: description.trim(),
      duration: parseInt(duration),
      content: content ? content.trim() : undefined,
      learningObjectives: learningObjectives || [],
      prerequisites: prerequisites || [],
      resources: resources || [],
      order: order || 0,
      isActive: true
    });
    
    console.log('✅ Module created:', module.moduleId);
    
    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: module
    });
  } catch (error) {
    console.error('❌ Create module error:', error);
    
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
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all modules
// @route   GET /api/modules
// @access  Public
const getAllModules = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const modules = await Module.find(filter).sort({ order: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules
    });
  } catch (error) {
    console.error('❌ Get all modules error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get module by ID
// @route   GET /api/modules/:id
// @access  Public
const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const module = await Module.findOne({ moduleId: id });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Get prerequisite modules
    const prerequisites = await Module.find({
      moduleId: { $in: module.prerequisites }
    }).select('moduleId name description duration');
    
    res.status(200).json({
      success: true,
      data: {
        ...module.toObject(),
        prerequisiteDetails: prerequisites
      }
    });
  } catch (error) {
    console.error('❌ Get module by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Admin
const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, content, learningObjectives, prerequisites, resources, order, isActive } = req.body;
    
    const module = await Module.findOne({ moduleId: id });
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Update fields
    if (name) module.name = name.trim();
    if (description) module.description = description.trim();
    if (duration !== undefined) module.duration = parseInt(duration);
    if (content !== undefined) module.content = content ? content.trim() : '';
    if (learningObjectives !== undefined) module.learningObjectives = learningObjectives;
    if (prerequisites !== undefined) module.prerequisites = prerequisites;
    if (resources !== undefined) module.resources = resources;
    if (order !== undefined) module.order = order;
    if (isActive !== undefined) module.isActive = isActive;
    
    await module.save();
    
    console.log('✅ Module updated:', module.moduleId);
    
    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: module
    });
  } catch (error) {
    console.error('❌ Update module error:', error);
    
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
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Admin
const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const module = await Module.findOne({ moduleId: id });
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Check if module is used in any subject
    const Subject = require('../models/Subject');
    const usedInSubjects = await Subject.find({
      'modules.moduleId': id
    }).select('subjectId name');
    
    if (usedInSubjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete module. It is used in ${usedInSubjects.length} subject(s)`,
        subjects: usedInSubjects
      });
    }
    
    await module.deleteOne();
    
    console.log('✅ Module deleted:', module.moduleId);
    
    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete module error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule
};