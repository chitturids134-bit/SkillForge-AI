import express from 'express';
import {
  getAssessments,
  getActiveAssessment,
  startAssessment,
  getAttempt,
  submitAnswer,
  completeAssessment,
  getHistory,
  getReport,
  deleteAttempt,
} from '../controllers/assessmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Catalog & Active recovery
router.get('/', getAssessments);
router.get('/active', getActiveAssessment);

// Session endpoints
router.post('/:id/start', startAssessment);
router.get('/attempt/:attemptId', getAttempt);
router.post('/attempt/:attemptId/answer', submitAnswer);
router.post('/attempt/:attemptId/complete', completeAssessment);

// History & Report endpoints (Explicit paths before generic :id)
router.get('/history', getHistory);
router.get('/history/:attemptId', getReport);
router.delete('/history/:attemptId', deleteAttempt);

export default router;
