// src/app.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running!',
    status: 'OK'
  });
});

// MongoDB connection test route
app.get('/test-db', (req, res) => {
  const mongoose = require('mongoose');
  
  if (mongoose.connection.readyState === 1) {
    res.json({
      message: 'MongoDB is connected!',
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } else {
    res.status(500).json({
      message: 'MongoDB is NOT connected',
      readyState: mongoose.connection.readyState
    });
  }
});

module.exports = app;