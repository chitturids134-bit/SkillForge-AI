import express from 'express';
import { getResumeMe, createResume, updateResumeMe, deleteResumeMe } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All resume routes require authentication
router.use(protect);

router.post('/', createResume);
router.get('/me', getResumeMe);
router.put('/me', updateResumeMe);
router.delete('/me', deleteResumeMe);

export default router;
