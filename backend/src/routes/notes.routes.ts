import express from 'express';
import {
  getUserNotes,
  createNote,
  generateLessonNotes,
  toggleNoteStar,
  deleteNote,
  getNotesStats
} from '../controllers/notes.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authMiddleware, getUserNotes);
router.post('/', authMiddleware, createNote);
router.post('/generate', authMiddleware, generateLessonNotes);
router.put('/:noteId/star', authMiddleware, toggleNoteStar);
router.delete('/:noteId', authMiddleware, deleteNote);
router.get('/stats', authMiddleware, getNotesStats);

export default router;
