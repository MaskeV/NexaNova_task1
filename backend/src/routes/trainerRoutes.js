// src/routes/trainerRoutes.js
const express = require('express');
const router = express.Router();
const {
  addTrainer,
  getAllTrainers,
  deleteTrainer,
  getTrainerById,
  getTrainersBySubject
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Apply protect middleware to all routes
router.use(protect);
    
// /trainer routes
router.post('/', authorize('admin'), addTrainer);
router.get('/', getAllTrainers);
router.delete('/', authorize('admin'), deleteTrainer);

// ✅ FIX: Add PUT route for updating a trainer by empId
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const Trainer = require('../models/Trainer');
    const Subject = require('../models/Subject');
    const { id } = req.params;
    const { name, email, phone, subjects, experience } = req.body;

    const trainer = await Trainer.findOne({ empId: id });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const oldSubjects = trainer.subjects || [];

    if (name) trainer.name = name.trim();
    if (email) trainer.email = email.trim().toLowerCase();
    if (phone) trainer.phone = phone.trim();
    if (experience !== undefined) trainer.experience = parseInt(experience);
    if (subjects !== undefined) trainer.subjects = subjects;

    await trainer.save();

    // Sync subject-trainer relationships
    if (subjects !== undefined) {
      const newSubjects = subjects || [];
      const toRemove = oldSubjects.filter(s => !newSubjects.includes(s));
      const toAdd = newSubjects.filter(s => !oldSubjects.includes(s));

      if (toRemove.length > 0) {
        await Subject.updateMany(
          { subjectId: { $in: toRemove } },
          { $pull: { trainers: id } }
        );
      }
      if (toAdd.length > 0) {
        await Subject.updateMany(
          { subjectId: { $in: toAdd } },
          { $addToSet: { trainers: id } }
        );
      }
    }

    res.status(200).json({ success: true, message: 'Trainer updated successfully', data: trainer });
  } catch (error) {
    console.error('Update trainer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// /trainer/:id
router.get('/:id', getTrainerById);

// /trainer/:subject/topic
router.get('/:subject/topic', getTrainersBySubject);

module.exports = router;