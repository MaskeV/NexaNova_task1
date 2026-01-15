// src/middlewares/errorHandler.js

// 404 Not Found Handler
const notFound = (req, res, ) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  (error);
};

// Global Error Handler
const errorHandler = (err, req, res, ) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };