// backend/src/app.js - ADD module routes
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const moduleRoutes = require('./routes/moduleRoutes'); // NEW LINE!
const courseRoutes = require('./routes/courseRoutes');
const profileRoutes = require('./routes/profileRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const studentRoutes = require('./routes/studentRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to NexaNova Training Management API',
    version: '3.0.0',
    status: 'Running',
    hierarchy: 'Course → Subject → Module',  // UPDATED!
    endpoints: {
      auth: '/auth',
      trainers: '/trainer',
      courses: '/courses',
      subjects: '/subject',
      modules: '/modules',  // NEW!
      students: '/students',
      profile: '/profile',
      schedules: '/schedule',
      enrollments: '/enrollments',
      timetable: '/timetable'
    },
    features: {
      authentication: '✅ Complete',
      trainers: '✅ Complete',
      courses: '✅ Hierarchical',
      subjects: '✅ Hierarchical',
      modules: '✅ New Feature',  // NEW!
      students: '✅ Complete',
      enrollments: '✅ Complete',
      schedules: '✅ Complete',
      timetables: '✅ Complete',
      bulkUpload: '✅ CSV/Excel'
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

// API Routes
app.use('/auth', authRoutes);
app.use('/trainer', trainerRoutes);
app.use('/courses', courseRoutes);
app.use('/subject', subjectRoutes);
app.use('/modules', moduleRoutes);  // NEW LINE!
app.use('/students', studentRoutes);
app.use('/profile', profileRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/timetable', timetableRoutes);

// Error Handling Middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;