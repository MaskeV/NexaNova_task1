// backend/src/controllers/courseController.js - REPLACE ENTIRE FILE
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
    const { name, description, category, duration, level, subjects, prerequisites, outcomes } = req.body;
    
    // Validate subjects if provided
    if (subjects && subjects.length > 0) {
      for (const subjectRef of subjects) {
        const subject = await Subject.findOne({ subjectId: subjectRef.subjectId });
        if (!subject) {
          return res.status(400).json({
            success: false,
            message: `Subject ${subjectRef.subjectId} not found`
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
      category: category || 'Other',
      duration: parseInt(duration),
      level: level || 'Beginner',
      subjects: subjects || [],
      prerequisites: prerequisites || [],
      outcomes: outcomes || [],
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
    const { level, category, isActive } = req.query;
    
    const filter = {};
    if (level) filter.level = level;
    if (category) filter.category = category;
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

// @desc    Get course by ID with full hierarchy (subjects and modules)
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
    
    // Populate subjects with their modules
    const populatedSubjects = await Promise.all(
      course.subjects.map(async (subjectRef) => {
        const subject = await Subject.findOne({ subjectId: subjectRef.subjectId });
        
        if (!subject) {
          return {
            subjectId: subjectRef.subjectId,
            order: subjectRef.order,
            notFound: true
          };
        }
        
        // Get modules for this subject
        const Module = require('../models/Module');
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
        
        // Get trainers for this subject
        const Trainer = require('../models/Trainer');
        const trainers = await Trainer.find({
          subjects: subject.subjectId
        }).select('empId name email experience');
        
        return {
          subjectId: subject.subjectId,
          name: subject.name,
          description: subject.description,
          level: subject.level,
          totalDuration: subject.totalDuration,
          order: subjectRef.order,
          modules: modules.filter(m => m !== null).sort((a, b) => a.order - b.order),
          trainers: trainers
        };
      })
    );
    
    // Sort subjects by order
    populatedSubjects.sort((a, b) => a.order - b.order);
    
    // Get enrollment count
    const enrollmentCount = await Enrollment.countDocuments({
      course: course.courseId,
      status: 'active'
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...course.toObject(),
        populatedSubjects,
        enrollmentCount,
        stats: {
          subjectCount: populatedSubjects.filter(s => !s.notFound).length,
          totalModules: populatedSubjects.reduce((sum, s) => sum + (s.modules?.length || 0), 0),
          totalHours: course.totalHours
        }
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

// @desc    Add subject to course
// @route   POST /api/courses/:id/subjects
// @access  Admin
const addSubjectToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectId, order } = req.body;
    
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
    
    // Check if subject already exists
    const existingSubject = course.subjects.find(s => s.subjectId === subjectId);
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject already exists in this course'
      });
    }
    
    // Add subject
    course.subjects.push({
      subjectId,
      order: order || (course.subjects.length + 1)
    });
    
    await course.save();
    
    console.log('✅ Subject added to course:', course.courseId, '→', subjectId);
    
    res.status(200).json({
      success: true,
      message: 'Subject added to course successfully',
      data: course
    });
  } catch (error) {
    console.error('❌ Add subject error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove subject from course
// @route   DELETE /api/courses/:id/subjects/:subjectId
// @access  Admin
const removeSubjectFromCourse = async (req, res) => {
  try {
    const { id, subjectId } = req.params;
    
    const course = await Course.findOne({ courseId: id });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const subjectIndex = course.subjects.findIndex(s => s.subjectId === subjectId);
    if (subjectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found in this course'
      });
    }
    
    course.subjects.splice(subjectIndex, 1);
    await course.save();
    
    console.log('✅ Subject removed from course:', course.courseId, '→', subjectId);
    
    res.status(200).json({
      success: true,
      message: 'Subject removed from course successfully',
      data: course
    });
  } catch (error) {
    console.error('❌ Remove subject error:', error);
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
    const { name, description, category, duration, level, subjects, prerequisites, outcomes, isActive } = req.body;
    
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
    if (category) course.category = category;
    if (duration !== undefined) course.duration = parseInt(duration);
    if (level) course.level = level;
    if (subjects !== undefined) course.subjects = subjects;
    if (prerequisites !== undefined) course.prerequisites = prerequisites;
    if (outcomes !== undefined) course.outcomes = outcomes;
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

// @desc    Get all courses with full hierarchy
// @route   GET /api/courses/hierarchy
// @access  Public
const getCoursesWithHierarchy = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ name: 1 });
    
    const coursesWithHierarchy = await Promise.all(
      courses.map(async (course) => {
        const populatedSubjects = await Promise.all(
          course.subjects.map(async (subjectRef) => {
            const subject = await Subject.findOne({ subjectId: subjectRef.subjectId });
            
            if (!subject) return null;
            
            const Module = require('../models/Module');
            const modules = await Promise.all(
              subject.modules.map(async (moduleRef) => {
                const module = await Module.findOne({ moduleId: moduleRef.moduleId });
                if (!module) return null;
                
                return {
                  moduleId: module.moduleId,
                  name: module.name,
                  duration: module.duration,
                  order: moduleRef.order
                };
              })
            );
            
            const Trainer = require('../models/Trainer');
            const trainers = await Trainer.find({
              subjects: subject.subjectId
            }).select('empId name experience');
            
            return {
              subjectId: subject.subjectId,
              name: subject.name,
              level: subject.level,
              totalDuration: subject.totalDuration,
              order: subjectRef.order,
              modules: modules.filter(m => m !== null).sort((a, b) => a.order - b.order),
              trainers: trainers
            };
          })
        );
        
        return {
          courseId: course.courseId,
          name: course.name,
          description: course.description,
          category: course.category,
          duration: course.duration,
          level: course.level,
          totalHours: course.totalHours,
          subjects: populatedSubjects.filter(s => s !== null).sort((a, b) => a.order - b.order)
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
  addSubjectToCourse,
  removeSubjectFromCourse,
  updateCourse,
  deleteCourse,
  getCoursesWithHierarchy
};