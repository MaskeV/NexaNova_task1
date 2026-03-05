// backend/src/controllers/enrollmentController.js - REPLACE ENTIRE FILE
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Course = require('../models/Course');

// @desc    Enroll a single student in a course
// @route   POST /api/enrollments
// @access  Admin
const enrollStudent = async (req, res) => {
  try {
    const { studentEmail, courseId } = req.body;  // CHANGED: Use email instead of studentId
    
    // Validation
    if (!studentEmail || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Student email and Course ID are required'
      });
    }
    
    // Find student by email
    const student = await User.findOne({ 
      email: studentEmail.toLowerCase().trim(),
      role: 'student'
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this email or user is not a student'
      });
    }
    
    // Verify course exists (can be either Course or Subject for backward compatibility)
    let courseExists = false;
    let courseName = '';
    
    // Check if it's a new Course
    const course = await Course.findOne({ courseId });
    if (course) {
      courseExists = true;
      courseName = course.name;
    } else {
      // Check if it's an old Subject (for backward compatibility)
      const subject = await Subject.findOne({ subjectId: courseId });
      if (subject) {
        courseExists = true;
        courseName = subject.name;
      }
    }
    
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: student._id,
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
      student: student._id,
      studentEmail: student.email,
      course: courseId,
      enrolledBy: req.user._id
    });
    
    // Populate student details
    await enrollment.populate('student', 'username email');
    
    console.log('✅ Student enrolled:', student.email, 'in', courseId);
    
    res.status(201).json({
      success: true,
      message: `Student ${student.email} enrolled successfully in ${courseName}`,
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
    const { studentEmails, courseId } = req.body;  // CHANGED: Use emails instead of IDs
    
    // Validation
    if (!studentEmails || !Array.isArray(studentEmails) || studentEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student emails array is required and must not be empty'
      });
    }
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }
    
    // Verify course exists
    let courseExists = false;
    let courseName = '';
    
    const course = await Course.findOne({ courseId });
    if (course) {
      courseExists = true;
      courseName = course.name;
    } else {
      const subject = await Subject.findOne({ subjectId: courseId });
      if (subject) {
        courseExists = true;
        courseName = subject.name;
      }
    }
    
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const results = {
      successful: [],
      failed: [],
      totalProcessed: studentEmails.length
    };
    
    // Process each student
    for (const email of studentEmails) {
      try {
        const studentEmail = email.toLowerCase().trim();
        
        // Find student by email
        const student = await User.findOne({ 
          email: studentEmail,
          role: 'student'
        });
        
        if (!student) {
          results.failed.push({
            email: studentEmail,
            reason: 'Student not found or user is not a student'
          });
          continue;
        }
        
        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
          student: student._id,
          course: courseId,
          status: 'active'
        });
        
        if (existingEnrollment) {
          results.failed.push({
            email: studentEmail,
            reason: 'Already enrolled in this course'
          });
          continue;
        }
        
        // Create enrollment
        const enrollment = await Enrollment.create({
          student: student._id,
          studentEmail: student.email,
          course: courseId,
          enrolledBy: req.user._id
        });
        
        results.successful.push({
          email: studentEmail,
          username: student.username,
          enrollmentId: enrollment._id
        });
        
        console.log('✅ Enrolled:', studentEmail, 'in', courseId);
      } catch (error) {
        console.error(`❌ Failed to enroll student ${email}:`, error);
        results.failed.push({
          email: email,
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
// @route   GET /api/enrollments/student/:studentEmail/courses
// @access  Private (Student or Admin)
const getStudentCourses = async (req, res) => {
  try {
    const { studentEmail } = req.params;
    
    // Find student by email
    const student = await User.findOne({ 
      email: studentEmail.toLowerCase().trim(),
      role: 'student'
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Check authorization: user can only view their own enrollments unless admin
    if (req.user.email !== student.email && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these enrollments'
      });
    }
    
    const enrollments = await Enrollment.find({
      student: student._id,
      status: 'active'
    }).populate('student', 'username email');
    
    // Get course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Try to find as Course first, then Subject
        let courseDetails = null;
        
        const course = await Course.findOne({ courseId: enrollment.course });
        if (course) {
          courseDetails = {
            courseId: course.courseId,
            name: course.name,
            description: course.description,
            category: course.category,
            duration: course.duration,
            level: course.level,
            totalHours: course.totalHours,
            type: 'course'
          };
        } else {
          const subject = await Subject.findOne({ subjectId: enrollment.course });
          if (subject) {
            courseDetails = {
              subjectId: subject.subjectId,
              name: subject.name,
              description: subject.description,
              duration: subject.totalDuration || subject.duration,
              level: subject.level,
              type: 'subject'
            };
          }
        }
        
        return {
          ...enrollment.toObject(),
          courseDetails
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
    
    // Get course name
    let courseName = '';
    const course = await Course.findOne({ courseId });
    if (course) {
      courseName = course.name;
    } else {
      const subject = await Subject.findOne({ subjectId: courseId });
      if (subject) {
        courseName = subject.name;
      }
    }
    
    res.status(200).json({
      success: true,
      courseName,
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
        let courseDetails = null;
        
        const course = await Course.findOne({ courseId: enrollment.course });
        if (course) {
          courseDetails = {
            courseId: course.courseId,
            name: course.name,
            category: course.category,
            level: course.level,
            type: 'course'
          };
        } else {
          const subject = await Subject.findOne({ subjectId: enrollment.course });
          if (subject) {
            courseDetails = {
              subjectId: subject.subjectId,
              name: subject.name,
              level: subject.level,
              type: 'subject'
            };
          }
        }
        
        return {
          ...enrollment.toObject(),
          courseDetails
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