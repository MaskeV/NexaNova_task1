// backend/src/controllers/enrollmentController.js - CORRECTED VERSION
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Course = require('../models/Course');

// ADD THESE MISSING IMPORTS
const path = require('path');
const fs = require('fs').promises;
const csv = require('csv-parser');
const XLSX = require('xlsx');

// @desc    Bulk upload students from CSV/Excel file
// @route   POST /api/enrollments/bulk-upload-students
// @access  Admin
const bulkUploadStudents = async (req, res) => {
  let uploadedFile = null;
  
  try {
    console.log('📤 Bulk Upload Students Request');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    uploadedFile = req.file.path;
    console.log('📁 File uploaded:', req.file.originalname);

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let students = [];

    // Parse CSV
    if (fileExtension === '.csv') {
      students = await parseCSV(uploadedFile);
    } 
    // Parse Excel
    else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      students = await parseExcel(uploadedFile);
    } 
    else {
      throw new Error('Unsupported file format. Please upload CSV or Excel file.');
    }

    console.log(`📊 Parsed ${students.length} students from file`);

    if (students.length === 0) {
      await fs.unlink(uploadedFile);
      return res.status(400).json({
        success: false,
        message: 'No valid student data found in file'
      });
    }

    // Validate and create students
    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.username || !studentData.email || !studentData.password) {
          results.failed.push({
            data: studentData,
            reason: 'Missing required fields (username, email, or password)'
          });
          continue;
        }

        // Normalize email
        const normalizedEmail = studentData.email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          results.skipped.push({
            email: normalizedEmail,
            reason: 'User already exists'
          });
          continue;
        }

        // Create new student user
        const user = await User.create({
          username: studentData.username.trim(),
          email: normalizedEmail,
          password: studentData.password,
          role: 'student'
        });

        results.success.push({
          username: user.username,
          email: user.email,
          _id: user._id
        });

        console.log('✅ Created student:', user.email);

      } catch (error) {
        console.error(`❌ Failed to create student:`, error.message);
        results.failed.push({
          data: studentData,
          reason: error.message
        });
      }
    }

    // Clean up uploaded file
    try {
      await fs.unlink(uploadedFile);
      console.log('🗑️ Cleaned up uploaded file');
    } catch (unlinkError) {
      console.error('Failed to delete uploaded file:', unlinkError);
    }

    res.status(200).json({
      success: true,
      message: 'Bulk upload completed',
      results: {
        total: students.length,
        successful: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      details: results
    });

  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    
    // Clean up uploaded file on error
    if (uploadedFile) {
      try {
        await fs.unlink(uploadedFile);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Bulk upload failed',
      error: error.message
    });
  }
};

// Helper: Parse CSV file
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const fileStream = require('fs').createReadStream(filePath);

    fileStream
      .pipe(csv())
      .on('data', (data) => {
        // Normalize column names (trim and lowercase)
        const normalized = {};
        for (const [key, value] of Object.entries(data)) {
          normalized[key.trim().toLowerCase()] = value;
        }
        results.push(normalized);
      })
      .on('end', () => {
        console.log(`📄 CSV parsed: ${results.length} rows`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('CSV parse error:', error);
        reject(error);
      });
  });
}

// Helper: Parse Excel file
async function parseExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Normalize column names
    const normalized = data.map(row => {
      const normalizedRow = {};
      for (const [key, value] of Object.entries(row)) {
        normalizedRow[key.trim().toLowerCase()] = value;
      }
      return normalizedRow;
    });
    
    console.log(`📊 Excel parsed: ${normalized.length} rows`);
    return normalized;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

// @desc    Bulk enroll selected students in course
// @route   POST /api/enrollments/bulk-enroll
// @access  Admin
const bulkEnrollSelectedStudents = async (req, res) => {
  try {
    const { studentIds, courseId } = req.body;

    console.log('📚 Bulk Enroll Selected Students Request');
    console.log('Student IDs:', studentIds);
    console.log('Course ID:', courseId);

    // Validate input
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of student IDs'
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a course ID'
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
      success: [],
      failed: [],
      skipped: []
    };

    // Process each student
    for (const studentId of studentIds) {
      try {
        // Find student by ID
        const student = await User.findById(studentId);
        
        if (!student) {
          results.failed.push({
            studentId,
            reason: 'Student not found'
          });
          continue;
        }

        if (student.role !== 'student') {
          results.failed.push({
            studentId,
            email: student.email,
            reason: 'User is not a student'
          });
          continue;
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
          student: student._id,
          course: courseId
        });

        if (existingEnrollment) {
          results.skipped.push({
            studentId,
            email: student.email,
            reason: 'Already enrolled in this course'
          });
          continue;
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
          student: student._id,
          studentEmail: student.email,
          course: courseId,
          status: 'active',
          enrolledBy: req.user._id
        });

        // Populate student data
        await enrollment.populate('student', 'username email');

        results.success.push({
          studentId,
          email: student.email,
          username: student.username,
          enrollmentId: enrollment._id
        });

        console.log('✅ Enrolled:', student.email, 'in', courseName);

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
      message: 'Bulk enrollment completed',
      results: {
        total: studentIds.length,
        successful: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      details: results
    });

  } catch (error) {
    console.error('❌ Bulk enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk enrollment failed',
      error: error.message
    });
  }
};

// @desc    Enroll a single student in a course
// @route   POST /api/enrollments
// @access  Admin
const enrollStudent = async (req, res) => {
  try {
    const { studentEmail, courseId } = req.body;
    
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

// @desc    Bulk enroll students in a course (by emails)
// @route   POST /api/enrollments/bulk
// @access  Admin
const bulkEnrollStudents = async (req, res) => {
  try {
    const { studentEmails, courseId } = req.body;
    
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
    
    // Check authorization
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

// @desc    Bulk enroll students by IDs in a course
// @route   POST /api/enrollments/bulk-by-ids
// @access  Admin
const bulkEnrollStudentsByIds = async (req, res) => {
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
      totalProcessed: studentIds.length
    };
    
    // Process each student
    for (const studentId of studentIds) {
      try {
        // Find student by ID
        const student = await User.findById(studentId);
        
        if (!student || student.role !== 'student') {
          results.failed.push({
            studentId,
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
            studentId,
            email: student.email,
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
          studentId: student._id,
          email: student.email,
          username: student.username,
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
    console.error('❌ Bulk enroll by IDs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  enrollStudent,
  bulkEnrollStudents,
  bulkEnrollStudentsByIds,
  getStudentCourses,
  getCourseEnrollments,
  getAllEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment,
  bulkEnrollSelectedStudents,
  bulkUploadStudents
};