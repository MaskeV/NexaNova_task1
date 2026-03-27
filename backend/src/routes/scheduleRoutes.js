const express = require('express');
const router = express.Router();
const {
  createSchedule,
  allocateSlot,
  getScheduleByWeek,
  getAllSchedules,
  deleteSchedule,
  deallocateSlot
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use((req, res, next) => {
  console.log(`📅 Schedule Route: ${req.method} ${req.path}`);
  next();
});

router.use(protect);

router.get('/', authorize('admin'), getAllSchedules);
router.post('/', authorize('admin'), createSchedule);

// Slot routes MUST come before /:weekId
router.put('/slot/:slotId/deallocate', authorize('admin'), deallocateSlot);
router.put('/slot/:slotId', authorize('admin'), allocateSlot);

// weekId routes after
router.get('/:weekId', getScheduleByWeek);
router.delete('/:weekId', authorize('admin'), deleteSchedule);

module.exports = router;