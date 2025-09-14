// routes/conversation.routes.ts
import express from 'express';
import multer from 'multer';
import { 
  startConversation,
  sendMessage,
  sendVoiceMessage,
  getConversation,
  getUserConversations,
  completeConversation
} from '../controllers/conversation.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
router.use(authMiddleware);

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'audio/mpeg', 'audio/wav', 'audio/mp4', 
      'audio/webm', 'audio/ogg', 'audio/m4a'
    ];
    cb(null, allowedMimeTypes.includes(file.mimetype));
  }
});

// Conversation routes
router.post('/start', startConversation);                    // POST /api/conversations/start
router.get('/user', getUserConversations);                   // GET /api/conversations/user
router.get('/:id', getConversation);                         // GET /api/conversations/:id
router.post('/:id/message', sendMessage);                    // POST /api/conversations/:id/message
router.post('/:id/voice', upload.single('audio'), sendVoiceMessage); // POST /api/conversations/:id/voice
router.put('/:id/complete', completeConversation);           // PUT /api/conversations/:id/complete

export default router;
