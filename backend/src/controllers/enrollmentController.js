// backend/src/controllers/enrollmentController.js
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Subject = require('../models/Subject');

// @desc    Enroll a single student in a course
// @route   POST /api/enrollments
// @access  Admin
const enrollStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    
    // Validation
    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Course ID are required'
      });
    }
    
    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Verify student role
    if (student.role !== 'user') {
      return res.status(400).json({
        success: false,
        message: 'User is not a student'
      });
    }
    
    // Verify course exists
    const course = await Subject.findOne({ subjectId: courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: 'active'
    });
    
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      studentEmail: student.email,
      course: courseId,
      enrolledBy: req.user._id
    });
    
    // Populate student and course details
    await enrollment.populate('student', 'username email');
    
    console.log('✅ Student enrolled:', student.email, 'in', courseId);
    
    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('❌ Enroll student error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk enroll students in a course
// @route   POST /api/enrollments/bulk
// @access  Admin
const bulkEnrollStudents = async (req, res) => {
  try {
    const { studentIds, courseId } = req.body;
    
    // Validation
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required and must not be empty'
      });
    }
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }
    
    // Verify course exists
    const course = await Subject.findOne({ subjectId: courseId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const results = {
      successful: [],
      failed: [],
      totalProcessed: studentIds.length
    };
    
    // Process each student
    for (const studentId of studentIds) {
      try {
        // Verify student exists
        const student = await User.findById(studentId);
        
        if (!student) {
          results.failed.push({
            studentId,
            reason: 'Student not found'
          });
          continue;
        }
        
        if (student.role !== 'user') {
          results.failed.push({
            studentId,
            email: student.email,
            reason: 'User is not a student'
          });
          continue;
        }
        
        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
          student: studentId,
          course: courseId,
          status: 'active'
        });
        
        if (existingEnrollment) {
          results.failed.push({
            studentId,
            email: student.email,
            reason: 'Already enrolled in this course'
          });
          continue;
        }
        
        // Create enrollment
        const enrollment = await Enrollment.create({
          student: studentId,
          studentEmail: student.email,
          course: courseId,
          enrolledBy: req.user._id
        });
        
        results.successful.push({
          studentId,
          email: student.email,
          enrollmentId: enrollment._id
        });
        
        console.log('✅ Enrolled:', student.email, 'in', courseId);
      } catch (error) {
        console.error(`❌ Failed to enroll student ${studentId}:`, error);
        results.failed.push({
          studentId,
          reason: error.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk enrollment completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: results
    });
  } catch (error) {
    console.error('❌ Bulk enroll error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all courses a student is enrolled in
// @route   GET /api/enrollments/student/:studentId/courses
// @access  Private (Student or Admin)
const getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check authorization: user can only view their own enrollments unless admin
    if (req.user._id.toString() !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these enrollments'
      });
    }
    
    const enrollments = await Enrollment.find({
      student: studentId,
      status: 'active'
    }).populate('student', 'username email');
    
    // Get course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await Subject.findOne({ subjectId: enrollment.course });
        return {
          ...enrollment.toObject(),
          courseDetails: course ? {
            subjectId: course.subjectId,
            name: course.name,
            description: course.description,
            duration: course.duration,
            level: course.level
          } : null
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: enrollmentsWithCourses.length,
      data: enrollmentsWithCourses
    });
  } catch (error) {
    console.error('❌ Get student courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all enrollments for a course
// @route   GET /api/enrollments/course/:courseId
// @access  Admin
const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'username email')
      .sort({ enrollmentDate: -1 });
    
    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    console.error('❌ Get course enrollments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all enrollments (admin view)
// @route   GET /api/enrollments
// @access  Admin
const getAllEnrollments = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }
    
    const enrollments = await Enrollment.find(filter)
      .populate('student', 'username email')
      .sort({ enrollmentDate: -1 });
    
    // Get course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await Subject.findOne({ subjectId: enrollment.course });
        return {
          ...enrollment.toObject(),
          courseDetails: course ? {
            subjectId: course.subjectId,
            name: course.name,
            level: course.level
          } : null
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: enrollmentsWithCourses.length,
      data: enrollmentsWithCourses
    });
  } catch (error) {
    console.error('❌ Get all enrollments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update enrollment status
// @route   PUT /api/enrollments/:enrollmentId
// @access  Admin
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['active', 'completed', 'dropped', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: active, completed, dropped, suspended'
      });
    }
    
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { status },
      { new: true, runValidators: true }
    ).populate('student', 'username email');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    console.log('✅ Enrollment status updated:', enrollmentId, 'to', status);
    
    res.status(200).json({
      success: true,
      message: 'Enrollment status updated successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('❌ Update enrollment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete an enrollment
// @route   DELETE /api/enrollments/:enrollmentId
// @access  Admin
const deleteEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    const enrollment = await Enrollment.findByIdAndDelete(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    console.log('✅ Enrollment deleted:', enrollmentId);
    
    res.status(200).json({
      success: true,
      message: 'Enrollment deleted successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('❌ Delete enrollment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  enrollStudent,
  bulkEnrollStudents,
  getStudentCourses,
  getCourseEnrollments,
  getAllEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment
};