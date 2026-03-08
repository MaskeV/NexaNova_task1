// backend/src/routes/moduleRoutes.js
const express = require('express');
const router = express.Router();
const {
  createModule,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule
} = require('../controllers/moduleController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Logging middleware
router.use((req, res, next) => {
  console.log(`📦 Module Route: ${req.method} ${req.path}`);
  next();
});

// Public routes
router.get('/', getAllModules);
router.get('/:id', getModuleById);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createModule);
router.put('/:id', protect, authorize('admin'), updateModule);
router.delete('/:id', protect, authorize('admin'), deleteModule);

module.exports = router;