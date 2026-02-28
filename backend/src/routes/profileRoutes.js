// backend/src/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
  deleteMyProfile
} = require('../controllers/profileController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// UPDATED: All routes require authentication AND trainer role
router.use(protect);
router.use(authorize('trainer')); // Only trainers can access profile routes

// My profile routes
router.get('/me', getMyProfile);
router.post('/', createMyProfile);
router.put('/', updateMyProfile);
router.delete('/', deleteMyProfile);

module.exports = router;