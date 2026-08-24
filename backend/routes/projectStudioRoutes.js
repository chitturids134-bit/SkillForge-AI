import express from 'express';
import {
  generateIdeas,
  getUserProjects,
  saveProject,
  updateProgress,
  addNote,
  toggleBookmark,
} from '../controllers/projectStudioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/ideas', generateIdeas);
router.get('/me', getUserProjects);
router.post('/', saveProject);
router.put('/:id/progress', updateProgress);
router.post('/:id/notes', addNote);
router.post('/:id/bookmark', toggleBookmark);

export default router;
