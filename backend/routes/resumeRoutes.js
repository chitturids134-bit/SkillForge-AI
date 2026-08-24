import express from 'express';
import {
  getResumeMe,
  createResume,
  updateResumeMe,
  deleteResumeMe,
  calculateAtsScore,
  getResumeHistory,
  getResumeVersion,
  restoreResumeVersion,
  deleteResumeVersion,
  compareResumeVersions,
  downloadResumeVersion,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All resume routes require authentication
router.use(protect);

router.post('/', createResume);
router.get('/me', getResumeMe);
router.put('/me', updateResumeMe);
router.delete('/me', deleteResumeMe);
router.post('/ats-score', calculateAtsScore);

// History Routes - Specific named subpaths MUST precede parameterized :versionId
router.get('/history', getResumeHistory);
router.post('/history/compare', compareResumeVersions);

router.get('/history/:versionId', getResumeVersion);
router.post('/history/:versionId/restore', restoreResumeVersion);
router.delete('/history/:versionId', deleteResumeVersion);
router.get('/history/:versionId/download', downloadResumeVersion);

export default router;
