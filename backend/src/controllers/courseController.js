// backend/src/controllers/courseController.js
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Enrollment = require('../models/Enrollment');

// Helper to generate course ID
const generateCourseId = async () => {
  try {
    const lastCourse = await Course.findOne().sort({ courseId: -1 });
    
    let nextNum = 1;
    if (lastCourse && lastCourse.courseId) {
      const match = lastCourse.courseId.match(/CRS(\d+)/);
      if (match) {
        nextNum = parseInt(match[1]) + 1;
      }
    }
    
    return `CRS${String(nextNum).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error generating courseId:', error);
    return 'CRS01';
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Admin
const createCourse = async (req, res) => {
  try {
    const { name, description, duration, level, modules } = req.body;
    
    // Validate modules if provided
    if (modules && modules.length > 0) {
      for (const module of modules) {
        const subject = await Subject.findOne({ subjectId: module.subjectId });
        if (!subject) {
          return res.status(400).json({
            success: false,
            message: `Subject ${module.subjectId} not found`
          });
        }
      }
    }
    
    // Generate course ID
    const courseId = await generateCourseId();
    
    // Create course
    const course = await Course.create({
      courseId,
      name: name.trim(),
      description: description.trim(),
      duration: parseInt(duration),
      level,
      modules: modules || [],
      createdBy: req.user._id
    });
    
    console.log('✅ Course created:', course.courseId);
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('❌ Create course error:', error);
    
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

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const { level, isActive } = req.query;
    
    const filter = {};
    if (level) filter.level = level;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const courses = await Course.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('❌ Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get course by ID with all modules populated
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findOne({ courseId: id });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Populate modules with full subject details and trainers
    const populatedModules = await Promise.all(
      course.modules.map(async (module) => {
        const subject = await Subject.findOne({ subjectId: module.subjectId });
        
        if (!subject) {
          return {
            subjectId: module.subjectId,
            sequenceOrder: module.sequenceOrder,
            notFound: true
          };
        }
        
        // Get trainers for this subject
        const Trainer = require('../models/Trainer');
        const trainers = await Trainer.find({
          subjects: subject.subjectId
        }).select('empId name email experience');
        
        return {
          subjectId: subject.subjectId,
          name: subject.name,
          description: subject.description,
          duration: subject.duration,
          level: subject.level,
          sequenceOrder: module.sequenceOrder,
          trainers: trainers
        };
      })
    );
    
    // Sort modules by sequence order
    populatedModules.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    
    // Get enrollment count
    const enrollmentCount = await Enrollment.countDocuments({
      course: course.courseId,
      status: 'active'
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...course.toObject(),
        populatedModules,
        enrollmentCount
      }
    });
  } catch (error) {
    console.error('❌ Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add module to course
// @route   POST /api/courses/:id/modules
// @access  Admin
const addModuleToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectId, sequenceOrder } = req.body;
    
    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID is required'
      });
    }
    
    // Verify subject exists
    const subject = await Subject.findOne({ subjectId });
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    const course = await Course.findOne({ courseId: id });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if module already exists
    const existingModule = course.modules.find(m => m.subjectId === subjectId);
    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: 'Module already exists in this course'
      });
    }
    
    // Determine sequence order
    const order = sequenceOrder || (course.modules.length + 1);
    
    // Add module
    course.modules.push({
      subjectId,
      sequenceOrder: order
    });
    
    await course.save();
    
    console.log('✅ Module added to course:', course.courseId, '→', subjectId);
    
    res.status(200).json({
      success: true,
      message: 'Module added to course successfully',
      data: course
    });
  } catch (error) {
    console.error('❌ Add module error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove module from course
// @route   DELETE /api/courses/:id/modules/:subjectId
// @access  Admin
const removeModuleFromCourse = async (req, res) => {
  try {
    const { id, subjectId } = req.params;
    
    const course = await Course.findOne({ courseId: id });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const moduleIndex = course.modules.findIndex(m => m.subjectId === subjectId);
    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found in this course'
      });
    }
    
    course.modules.splice(moduleIndex, 1);
    await course.save();
    
    console.log('✅ Module removed from course:', course.courseId, '→', subjectId);
    
    res.status(200).json({
      success: true,
      message: 'Module removed from course successfully',
      data: course
    });
  } catch (error) {
    console.error('❌ Remove module error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Admin
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, level, modules, isActive } = req.body;
    
    const course = await Course.findOne({ courseId: id });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Update fields
    if (name) course.name = name.trim();
    if (description) course.description = description.trim();
    if (duration !== undefined) course.duration = parseInt(duration);
    if (level) course.level = level;
    if (modules !== undefined) course.modules = modules;
    if (isActive !== undefined) course.isActive = isActive;
    
    await course.save();
    
    console.log('✅ Course updated:', course.courseId);
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('❌ Update course error:', error);
    
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

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Admin
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findOne({ courseId: id });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if there are active enrollments
    const activeEnrollments = await Enrollment.countDocuments({
      course: course.courseId,
      status: 'active'
    });
    
    if (activeEnrollments > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course with ${activeEnrollments} active enrollment(s). Please deactivate or transfer students first.`
      });
    }
    
    await course.deleteOne();
    
    console.log('✅ Course deleted:', course.courseId);
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete course error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all courses with full module hierarchy
// @route   GET /api/courses/hierarchy
// @access  Public
const getCoursesWithHierarchy = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ name: 1 });
    
    const coursesWithHierarchy = await Promise.all(
      courses.map(async (course) => {
        const populatedModules = await Promise.all(
          course.modules.map(async (module) => {
            const subject = await Subject.findOne({ subjectId: module.subjectId });
            
            if (!subject) return null;
            
            const Trainer = require('../models/Trainer');
            const trainers = await Trainer.find({
              subjects: subject.subjectId
            }).select('empId name experience');
            
            return {
              subjectId: subject.subjectId,
              name: subject.name,
              duration: subject.duration,
              level: subject.level,
              sequenceOrder: module.sequenceOrder,
              trainers: trainers
            };
          })
        );
        
        return {
          courseId: course.courseId,
          name: course.name,
          description: course.description,
          duration: course.duration,
          level: course.level,
          totalHours: course.totalHours,
          modules: populatedModules.filter(m => m !== null).sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: coursesWithHierarchy.length,
      data: coursesWithHierarchy
    });
  } catch (error) {
    console.error('❌ Get courses hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  addModuleToCourse,
  removeModuleFromCourse,
  updateCourse,
  deleteCourse,
  getCoursesWithHierarchy
};