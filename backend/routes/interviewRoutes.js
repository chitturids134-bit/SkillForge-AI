import express from 'express';
import { getInterviews, createInterview, updateInterview, deleteInterview } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All interview routes require authentication
router.use(protect);

router.post('/', createInterview);
router.get('/me', getInterviews);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

export default router;
