import express from 'express';
import {
  getSettings,
  updateSettings,
  changePassword,
  deleteAccount
} from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All settings routes require authentication
router.use(protect);

router.get('/', getSettings);
router.patch('/', updateSettings);
router.patch('/password', changePassword);
router.delete('/account', deleteAccount);

export default router;
