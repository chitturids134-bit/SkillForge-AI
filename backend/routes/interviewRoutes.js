import express from 'express';
import {
  startInterview,
  getActiveInterview,
  getInterviewById,
  submitAnswer,
  completeInterview,
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
  respondToInterviewController,
  respondToRescheduleController,
  recruiterDecisionController,
  submitRecruiterEvaluationController,
  submitRepositoryController,
} from '../controllers/interviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All interview routes require authentication
router.use(protect);

// Session endpoints
router.post('/start', startInterview);
router.get('/active', getActiveInterview);
router.get('/me', getInterviews);

// Lifecycle & Recruiter Evaluation Routes
router.patch('/:id/respond', respondToInterviewController);
router.post('/:id/reschedule-response', authorize('Recruiter'), respondToRescheduleController);
router.post('/:id/recruiter-evaluation', authorize('Recruiter'), submitRecruiterEvaluationController);
router.post('/recruiter/interviews/:id/decision', authorize('Recruiter'), recruiterDecisionController);
router.post('/:id/decision', authorize('Recruiter'), recruiterDecisionController);
router.post('/:id/repository', submitRepositoryController);

router.get('/:id', getInterviewById);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);

// CRUD endpoints for legacy compatibility
router.get('/', getInterviews);
router.post('/', createInterview);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

export default router;
