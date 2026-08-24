import express from 'express';
import {
  getPortfolioMe,
  updatePortfolioMe,
  syncPortfolioFromResume,
  getPublicPortfolio,
} from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/public/:username', getPublicPortfolio);

// Protected routes
router.get('/me', protect, getPortfolioMe);
router.put('/me', protect, updatePortfolioMe);
router.post('/sync-resume', protect, syncPortfolioFromResume);

export default router;
