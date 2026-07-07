import express from 'express';
import { getProfileMe, createProfile, updateProfileMe } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All profile routes require authentication
router.use(protect);

router.post('/', createProfile);
router.get('/me', getProfileMe);
router.put('/me', updateProfileMe);

export default router;
