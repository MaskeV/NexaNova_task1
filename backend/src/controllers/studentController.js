// backend/src/controllers/studentController.js
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @desc    Get all students
// @route   GET /api/students
// @access  Admin
const getAllStudents = async (req, res) => {
  try {
    const { search, status } = req.query;
    
    // Build query
    const query = { role: 'student' };
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.isActive = status === 'active';
    }
    
    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get enrollment count for each student
    const studentsWithEnrollments = await Promise.all(
      students.map(async (student) => {
        const enrollmentCount = await Enrollment.countDocuments({
          student: student._id,
          status: 'active'
        });
        
        return {
          ...student.toObject(),
          enrollmentCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: studentsWithEnrollments.length,
      data: studentsWithEnrollments
    });
  } catch (error) {
    console.error('❌ Get all students error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get student by ID with profile details
// @route   GET /api/students/:id
// @access  Admin or Own Profile
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check authorization
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }
    
    const student = await User.findById(id).select('-password');
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get student's enrollments
    const enrollments = await Enrollment.find({
      student: id,
      status: 'active'
    }).populate('student', 'username email');
    
    // Get enrollment details with course info
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const Subject = require('../models/Subject');
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
      data: {
        student: student.toObject(),
        enrollments: enrollmentsWithCourses,
        stats: {
          totalEnrollments: enrollmentsWithCourses.length,
          activeEnrollments: enrollmentsWithCourses.filter(e => e.status === 'active').length,
          completedEnrollments: enrollmentsWithCourses.filter(e => e.status === 'completed').length
        }
      }
    });
  } catch (error) {
    console.error('❌ Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk upload students from CSV/Excel
// @route   POST /api/students/bulk-upload
// @access  Admin
const bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV or Excel file'
      });
    }
    
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let students = [];
    
    // Parse CSV
    if (fileExtension === '.csv') {
      students = await parseCSV(filePath);
    } 
    // Parse Excel
    else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      students = await parseExcel(filePath);
    } else {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Please upload CSV or Excel file.'
      });
    }
    
    // Validate and process students
    const results = {
      successful: [],
      failed: [],
      totalProcessed: students.length
    };
    
    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.username || !studentData.email || !studentData.password) {
          results.failed.push({
            email: studentData.email || 'N/A',
            reason: 'Missing required fields (username, email, or password)'
          });
          continue;
        }
        
        // Check if student already exists
        const existingUser = await User.findOne({
          $or: [
            { email: studentData.email.toLowerCase() },
            { username: studentData.username }
          ]
        });
        
        if (existingUser) {
          results.failed.push({
            email: studentData.email,
            reason: 'User already exists with this email or username'
          });
          continue;
        }
        
        // Create student
        const student = await User.create({
          username: studentData.username.trim(),
          email: studentData.email.trim().toLowerCase(),
          password: studentData.password,
          role: 'student'
        });
        
        results.successful.push({
          id: student._id,
          username: student.username,
          email: student.email
        });
        
        console.log('✅ Student created:', student.email);
      } catch (error) {
        console.error(`❌ Failed to create student ${studentData.email}:`, error);
        results.failed.push({
          email: studentData.email || 'N/A',
          reason: error.message
        });
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      success: true,
      message: `Bulk upload completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: results
    });
  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper: Parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const students = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        students.push({
          username: row.username || row.Username,
          email: row.email || row.Email,
          password: row.password || row.Password
        });
      })
      .on('end', () => {
        resolve(students);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Helper: Parse Excel file
const parseExcel = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const students = data.map(row => ({
        username: row.username || row.Username,
        email: row.email || row.Email,
        password: row.password || row.Password
      }));
      
      resolve(students);
    } catch (error) {
      reject(error);
    }
  });
};

// @desc    Update student status (activate/deactivate)
// @route   PUT /api/students/:id/status
// @access  Admin
const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }
    
    const student = await User.findById(id).select('-password');
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    student.isActive = isActive;
    await student.save();
    
    console.log(`✅ Student ${isActive ? 'activated' : 'deactivated'}:`, student.email);
    
    res.status(200).json({
      success: true,
      message: `Student ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: student
    });
  } catch (error) {
    console.error('❌ Update student status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Admin
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await User.findById(id);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Delete all enrollments
    await Enrollment.deleteMany({ student: id });
    
    // Delete student
    await student.deleteOne();
    
    console.log('✅ Student deleted:', student.email);
    
    res.status(200).json({
      success: true,
      message: 'Student and all enrollments deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete student error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats
// @access  Admin
const getStudentStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    const inactiveStudents = totalStudents - activeStudents;
    
    const totalEnrollments = await Enrollment.countDocuments();
    const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
    
    // Students with no enrollments
    const allStudents = await User.find({ role: 'student' }).select('_id');
    const studentIds = allStudents.map(s => s._id);
    
    const enrolledStudentIds = await Enrollment.distinct('student');
    const unenrolledCount = studentIds.filter(id => 
      !enrolledStudentIds.some(enrolledId => enrolledId.equals(id))
    ).length;
    
    res.status(200).json({
      success: true,
      data: {
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents,
          unenrolled: unenrolledCount
        },
        enrollments: {
          total: totalEnrollments,
          active: activeEnrollments
        }
      }
    });
  } catch (error) {
    console.error('❌ Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  bulkUploadStudents,
  updateStudentStatus,
  deleteStudent,
  getStudentStats,
  upload // Export multer middleware
};