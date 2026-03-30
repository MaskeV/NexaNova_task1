// backend/src/routes/scheduleRoutes.js - FIXED: Route ordering to prevent conflicts
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

router.use((req, res, next) => {
  console.log(`📅 Schedule Route: ${req.method} ${req.path}`);
  next();
});

router.use(protect);
router.use(authorize('admin'));

// IMPORTANT: Specific/static routes MUST come before dynamic /:weekId routes.
// Without this order, Express matches GET /slot/xyz as weekId="slot" instead
// of the intended slot handlers.

router.get('/', getAllSchedules);
router.post('/', createSchedule);

// Slot routes — defined BEFORE /:weekId so they are not swallowed by it
router.put('/slot/:slotId/deallocate', deallocateSlot);
router.put('/slot/:slotId', allocateSlot);

// Dynamic routes last
router.get('/:weekId', getScheduleByWeek);
router.delete('/:weekId', deleteSchedule);

module.exports = router;