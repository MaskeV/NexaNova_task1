// src/app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const profileRoutes = require('./routes/profileRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const  enrollmentRoutes = require('./routes/enrollmentRoutes')
const timetableRoutes = require('./routes/timetableRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { protect } = require('./middlewares/authMiddleware');



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to NexaNova Trainer Management API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      auth: '/auth',
      trainers: '/trainer',
      subjects: '/subject',
      profile: '/profile'
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

// Protected routes - require authentication
app.use('/trainer', trainerRoutes);
app.use('/subject', subjectRoutes);
app.use('/profile', profileRoutes);


app.use('/schedule', scheduleRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/timetable', timetableRoutes);

// Error Handling Middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;