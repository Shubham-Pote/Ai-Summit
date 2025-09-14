import express from 'express';
import {
  getCurrentArticle,
  startReading,
  completeArticle,
  generateNextArticle,
  getReadingStats,
  getUserArticles,    // Add this
  getArticleById      // Add this
} from '../controllers/readingArticle.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Get all articles for user (completed + current)
router.get('/articles/:language', authMiddleware, getUserArticles);    // GET /api/reading/articles/spanish

// Get specific article by ID (for review)
router.get('/article/:articleId', authMiddleware, getArticleById);     // GET /api/reading/article/123

// Existing routes...
router.get('/current/:language', authMiddleware, getCurrentArticle);   
router.post('/start/:articleId', authMiddleware, startReading);        
router.post('/complete/:articleId', authMiddleware, completeArticle);  
router.post('/next/:language', authMiddleware, generateNextArticle);   
router.get('/stats/:language', authMiddleware, getReadingStats);       

export default router;
