// backend/src/controllers/evaluationController.js
const Evaluation = require('../models/Evaluation');
const Batch = require('../models/Batch');
const Technology = require('../models/Technology');
const User = require('../models/User');

// @desc    Assign evaluator to participant for a specific round
// @route   POST /api/evaluations/assign
// @access  Admin
const assignEvaluatorToParticipant = async (req, res) => {
  try {
    const { participantId, evaluatorId, batchId, roundNumber } = req.body;
    
    // Validate required fields
    if (!participantId || !evaluatorId || !batchId || !roundNumber) {
      return res.status(400).json({
        success: false,
        message: 'Participant, evaluator, batch, and round number are required'
      });
    }
    
    // Verify batch exists
    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Verify participant is in the batch
    if (!batch.participants.includes(participantId)) {
      return res.status(400).json({
        success: false,
        message: 'Participant is not in this batch'
      });
    }
    
    // Verify evaluator and participant exist and have correct roles
    const participant = await User.findById(participantId);
    const evaluator = await User.findById(evaluatorId);
    
    if (!participant || participant.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Participant not found or is not a student'
      });
    }
    
    if (!evaluator || (evaluator.role !== 'admin' && evaluator.role !== 'trainer')) {
      return res.status(404).json({
        success: false,
        message: 'Evaluator not found or does not have evaluator permissions'
      });
    }
    
    // Get technology details
    const technology = await Technology.findOne({ technologyId: batch.technology });
    if (!technology) {
      return res.status(404).json({
        success: false,
        message: 'Technology not found'
      });
    }
    
    // Validate round number
    if (roundNumber < 1 || roundNumber > technology.rounds) {
      return res.status(400).json({
        success: false,
        message: `Round number must be between 1 and ${technology.rounds}`
      });
    }
    
    // Check if evaluation already exists
    const existing = await Evaluation.findOne({
      participant: participantId,
      batch: batchId,
      roundNumber,
      technology: batch.technology
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Evaluation assignment already exists for this participant and round'
      });
    }
    
    // Generate evaluation ID
    const evaluationId = await Evaluation.generateEvaluationId();
    
    // Create evaluation assignment
    const evaluation = await Evaluation.create({
      evaluationId,
      participant: participantId,
      evaluator: evaluatorId,
      batch: batchId,
      technology: batch.technology,
      roundNumber,
      status: 'pending',
      scores: [] // Will be filled when evaluator submits
    });
    
    console.log('✅ Evaluator assigned:', evaluation.evaluationId);
    
    res.status(201).json({
      success: true,
      message: 'Evaluator assigned successfully',
      data: evaluation
    });
  } catch (error) {
    console.error('❌ Assign evaluator error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Submit evaluation scores and feedback
// @route   PUT /api/evaluations/:id/submit
// @access  Evaluator (Admin/Trainer assigned to this evaluation)
const submitEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { scores, feedback, strengths, areasForImprovement, duration } = req.body;
    
    // Validate required fields
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Scores array is required'
      });
    }
    
    const evaluation = await Evaluation.findOne({ evaluationId: id });
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }
    
    // Verify the logged-in user is the assigned evaluator
    if (evaluation.evaluator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit this evaluation'
      });
    }
    
    // Check if already submitted
    if (evaluation.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Evaluation has already been submitted'
      });
    }
    
    // Validate all scores
    for (const scoreItem of scores) {
      if (!scoreItem.criteriaName || scoreItem.score === undefined || scoreItem.maxScore === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Each score must have criteriaName, score, and maxScore'
        });
      }
      
      if (scoreItem.score < 0 || scoreItem.score > scoreItem.maxScore) {
        return res.status(400).json({
          success: false,
          message: `Score for ${scoreItem.criteriaName} must be between 0 and ${scoreItem.maxScore}`
        });
      }
    }
    
    // Update evaluation
    evaluation.scores = scores;
    evaluation.feedback = feedback || '';
    evaluation.strengths = strengths || [];
    evaluation.areasForImprovement = areasForImprovement || [];
    evaluation.duration = duration || undefined;
    evaluation.status = 'completed';
    evaluation.submittedAt = new Date();
    
    await evaluation.save(); // This will trigger pre-save hook to calculate totalScore
    
    console.log('✅ Evaluation submitted:', evaluation.evaluationId);
    
    res.status(200).json({
      success: true,
      message: 'Evaluation submitted successfully',
      data: evaluation
    });
  } catch (error) {
    console.error('❌ Submit evaluation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get evaluations assigned to evaluator
// @route   GET /api/evaluations/my-evaluations
// @access  Evaluator (Admin/Trainer)
const getMyEvaluations = async (req, res) => {
  try {
    const { status, batch } = req.query;
    
    const filter = { evaluator: req.user._id };
    if (status) filter.status = status;
    if (batch) filter.batch = batch;
    
    const evaluations = await Evaluation.find(filter)
      .populate('participant', 'username email')
      .populate('evaluator', 'username email')
      .sort({ evaluationDate: -1 });
    
    // Get batch and technology details for each evaluation
    const evaluationsWithDetails = await Promise.all(
      evaluations.map(async (evaluation) => {
        const batch = await Batch.findOne({ batchId: evaluation.batch });
        const technology = await Technology.findOne({ technologyId: evaluation.technology });
        
        return {
          ...evaluation.toObject(),
          batchDetails: batch ? {
            batchId: batch.batchId,
            name: batch.name,
            startDate: batch.startDate,
            endDate: batch.endDate
          } : null,
          technologyDetails: technology ? {
            technologyId: technology.technologyId,
            name: technology.name,
            rounds: technology.rounds,
            evaluationCriteria: technology.evaluationCriteria
          } : null
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: evaluationsWithDetails.length,
      data: evaluationsWithDetails
    });
  } catch (error) {
    console.error('❌ Get my evaluations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all evaluations (admin view)
// @route   GET /api/evaluations
// @access  Admin
const getAllEvaluations = async (req, res) => {
  try {
    const { batch, technology, participant, evaluator, status, roundNumber } = req.query;
    
    const filter = {};
    if (batch) filter.batch = batch;
    if (technology) filter.technology = technology;
    if (participant) filter.participant = participant;
    if (evaluator) filter.evaluator = evaluator;
    if (status) filter.status = status;
    if (roundNumber) filter.roundNumber = parseInt(roundNumber);
    
    const evaluations = await Evaluation.find(filter)
      .populate('participant', 'username email')
      .populate('evaluator', 'username email')
      .sort({ evaluationDate: -1 });
    
    // Get batch and technology details
    const evaluationsWithDetails = await Promise.all(
      evaluations.map(async (evaluation) => {
        const batch = await Batch.findOne({ batchId: evaluation.batch });
        const technology = await Technology.findOne({ technologyId: evaluation.technology });
        
        return {
          ...evaluation.toObject(),
          batchDetails: batch ? {
            batchId: batch.batchId,
            name: batch.name
          } : null,
          technologyDetails: technology ? {
            technologyId: technology.technologyId,
            name: technology.name
          } : null
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: evaluationsWithDetails.length,
      data: evaluationsWithDetails
    });
  } catch (error) {
    console.error('❌ Get all evaluations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Continue in part 2...