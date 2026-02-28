// backend/src/routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSchedule,
  allocateSlot,
  getScheduleByWeek,
  getAllSchedules,
  deleteSchedule,
  deallocateSlot
} = require('../controllers/scheduleController'); // ✅ FIXED: lowercase 's'
const { protect, authorize } = require('../middlewares/authMiddleware');

// Logging middleware for debugging
router.use((req, res, next) => {
  console.log(`📅 Schedule Route: ${req.method} ${req.path}`);
  next();
});

// All routes require authentication
router.use(protect);

// GET all schedules (Admin only)
router.get('/', authorize('admin'), getAllSchedules);

// POST create a new schedule (Admin only)
router.post('/', authorize('admin'), createSchedule);

// GET schedule by week ID (All authenticated users)
router.get('/:weekId', getScheduleByWeek);

// DELETE schedule (Admin only)
router.delete('/:weekId', authorize('admin'), deleteSchedule);

// PUT allocate a slot (Admin only)
router.put('/slot/:slotId', authorize('admin'), allocateSlot);

// PUT deallocate a slot (Admin only)
router.put('/slot/:slotId/deallocate', authorize('admin'), deallocateSlot);

module.exports = router;