import express from 'express';
import {
  getTemplates,
  getSessions,
  sendMessage,
  clearSession,
} from '../controllers/mentorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/templates', getTemplates);
router.get('/sessions', getSessions);
router.post('/message', sendMessage);
router.post('/clear', clearSession);

export default router;
