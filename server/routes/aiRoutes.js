import express from 'express';
import { generateTasks, enrichTask, searchTasks, enrichLink, generateBriefing } from '../controllers/aiController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateTasks);
router.post('/enrich-task', protect, enrichTask);
router.post('/search', protect, searchTasks);
router.post('/enrich-link', protect, enrichLink);
router.post('/briefing', protect, generateBriefing);

export default router;
