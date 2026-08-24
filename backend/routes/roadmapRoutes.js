import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getRoadmap, selectCareerPath, updateMilestone } from '../controllers/roadmapController.js';

const router = express.Router();

router.use(protect);

router.get('/', getRoadmap);
router.put('/select', selectCareerPath);
router.put('/milestone', updateMilestone);

export default router;
