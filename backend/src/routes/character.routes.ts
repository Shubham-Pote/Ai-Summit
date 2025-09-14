// routes/character.routes.ts - SIMPLE FIX
import express from 'express';
import { 
  getCharacters, 
  getCharacterById, 
  unlockCharacter,
  getCharacterStats 
} from '../controllers/character.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

// Simple wrapper functions to fix TypeScript errors
router.get('/', async (req, res) => {
  return getCharacters(req as any, res);
});

router.get('/:id', async (req, res) => {
  return getCharacterById(req as any, res);
});

router.post('/:id/unlock', async (req, res) => {
  return unlockCharacter(req as any, res);
});

router.get('/:id/stats', async (req, res) => {
  return getCharacterStats(req as any, res);
});

export default router;
