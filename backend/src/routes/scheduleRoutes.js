// backend/src/routes/scheduleRoutes.js - FIXED: Admin only, students use timetable routes
const express = require('express');
const router = express.Router();
const {
  createSchedule,
  allocateSlot,
  getScheduleByWeek,
  getAllSchedules,
  deleteSchedule,
  deallocateSlot
} = require('../controllers/Schedulecontroller');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Logging middleware for debugging
router.use((req, res, next) => {
  console.log(`📅 Schedule Route: ${req.method} ${req.path}`);
  next();
});

// All routes require authentication AND admin role
router.use(protect);
router.use(authorize('admin')); // IMPORTANT: Only admins can access schedule routes

// GET all schedules (Admin only)
router.get('/', getAllSchedules);

// POST create a new schedule (Admin only)
router.post('/', createSchedule);

// GET schedule by week ID (Admin only)
router.get('/:weekId', getScheduleByWeek);

// DELETE schedule (Admin only)
router.delete('/:weekId', deleteSchedule);

// PUT allocate a slot (Admin only)
router.put('/slot/:slotId', allocateSlot);

// PUT deallocate a slot (Admin only)
router.put('/slot/:slotId/deallocate', deallocateSlot);

module.exports = router;