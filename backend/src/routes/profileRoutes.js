const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
  deleteMyProfile
} = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

// My profile routes
router.get('/me', getMyProfile); // Changed from '/' to '/me'
router.post('/', createMyProfile);
router.put('/', updateMyProfile);
router.delete('/', deleteMyProfile);

module.exports = router;