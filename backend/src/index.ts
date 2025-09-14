// src/server.ts - Just update the imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';

// Your existing routes
import authRoutes from './routes/auth.routes';
import lessonRoutes from './routes/lesson.routes';
import notesRoutes from './routes/notes.routes';
import readingArticleRoutes from './routes/readingArticle.routes';

// Character AI routes (make sure these files exist)
import characterSelectionRoutes from './routes/characterSelection.routes';
import characterRoutes from './routes/character.routes';
import conversationRoutes from './routes/conversation.routes';
import audioRoutes from './routes/audio.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Serve static audio files
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));
app.use('/character-audio', express.static(path.join(__dirname, '../uploads/audio')));

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Language Learning API with Character AI Support',
    features: [
      'Traditional Lessons',
      'Notes & Reading', 
      'Character AI Conversations',
      'Voice Chat Support'
    ]
  });
});

// Your existing routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/reading', readingArticleRoutes);

// Character AI routes
app.use('/api/character-setup', characterSelectionRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/audio', audioRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something broke!' 
    });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📚 Traditional learning: /api/lessons, /api/notes, /api/reading`);
  console.log(`🎭 Character AI: /api/characters, /api/conversations`);
  console.log(`🎵 Audio files: /audio/ (lessons) & /character-audio/ (AI voices)`);
  console.log(`🌐 Welcome endpoint: http://localhost:${port}/`);
});
