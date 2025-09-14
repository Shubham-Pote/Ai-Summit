// src/routes/lesson.routes.ts
import express from 'express';
import {
  getLessonsByLanguage,
  getLessonById,
  updateLessonProgress,
  getUserDashboard,
  generateLessonContentController
} from '../controllers/lesson.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// ✅ PROTECTED: Only authenticated users can see lessons with their progress
router.get('/:language', authMiddleware, getLessonsByLanguage);
router.get('/lesson/:lessonId', authMiddleware, getLessonById);

// ✅ PROTECTED: Dashboard and progress updates require authentication  
router.get('/:language/dashboard', authMiddleware, getUserDashboard);
router.put('/:lessonId/progress', authMiddleware, updateLessonProgress);

// Admin routes
router.post('/generate', generateLessonContentController);

export default router;
