// routes/characterSelection.routes.ts - SIMPLE FIX
import express from 'express';
import { selectLanguageForCharacters, getAvailableLanguages } from '../controllers/languageSelection.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

// Simple wrapper functions to fix TypeScript errors
router.get('/languages', async (req, res) => {
  return getAvailableLanguages(req as any, res);
});

router.post('/select-language', async (req, res) => {
  return selectLanguageForCharacters(req as any, res);
});

export default router;
