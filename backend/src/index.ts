import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import authRoutes from './routes/auth.routes';
import lessonRoutes from './routes/lesson.routes';
import notesRoutes from './routes/notes.routes';
import readingArticleRoutes from './routes/readingArticle.routes';

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

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Language Learning API with Audio Support' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/reading', readingArticleRoutes);

// Basic error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something broke!' 
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Audio files will be served from /audio/`);
});
