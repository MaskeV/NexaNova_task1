// backend/src/app.js - UPDATED with Mock Evaluation Routes
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const courseRoutes = require('./routes/courseRoutes');
const profileRoutes = require('./routes/profileRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const studentRoutes = require('./routes/studentRoutes');
const batchRoutes = require('./routes/batchRoutes');
const technologyRoutes = require('./routes/technologyRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to NexaNova Training & Mock Evaluation Management API',
    version: '4.0.0',
    status: 'Running',
    features: {
      // Training Management
      training: {
        hierarchy: 'Course → Subject → Module',
        authentication: '✅ Complete',
        trainers: '✅ Complete',
        courses: '✅ Hierarchical',
        subjects: '✅ Hierarchical',
        modules: '✅ Complete',
        students: '✅ Complete',
        enrollments: '✅ Complete',
        schedules: '✅ Complete',
        timetables: '✅ Complete',
        bulkUpload: '✅ CSV/Excel'
      },
      // Mock Evaluation System
      mockEvaluation: {
        batches: '✅ Complete',
        technologies: '✅ Complete',
        evaluations: '✅ Complete',
        reports: '✅ Complete',
        rounds: '✅ Configurable'
      }
    },
    endpoints: {
      // Training Management
      auth: '/auth',
      trainers: '/trainer',
      courses: '/courses',
      subjects: '/subject',
      modules: '/modules',
      students: '/students',
      profile: '/profile',
      schedules: '/schedule',
      enrollments: '/enrollments',
      timetable: '/timetable',
      // Mock Evaluation
      batches: '/batches',
      technologies: '/technologies',
      evaluations: '/evaluations',
      reports: '/reports'
    }
  });
});

// Database test route
app.get('/test-db', (req, res) => {
  const mongoose = require('mongoose');
  
  if (mongoose.connection.readyState === 1) {
    res.json({
      success: true,
      message: 'MongoDB is connected!',
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'MongoDB is NOT connected',
      readyState: mongoose.connection.readyState
    });
  }
});

// Training Management API Routes
app.use('/auth', authRoutes);
app.use('/trainer', trainerRoutes);
app.use('/courses', courseRoutes);
app.use('/subject', subjectRoutes);
app.use('/modules', moduleRoutes);
app.use('/students', studentRoutes);
app.use('/profile', profileRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/timetable', timetableRoutes);

// Mock Evaluation API Routes
app.use('/batches', batchRoutes);
app.use('/technologies', technologyRoutes);
app.use('/evaluations', evaluationRoutes);
app.use('/reports', reportRoutes);

// Error Handling Middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;