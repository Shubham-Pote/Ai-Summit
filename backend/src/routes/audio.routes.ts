// routes/audio.routes.ts
import express from 'express';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Serve audio files (with optional auth for private files)
router.get('/:filename', (req, res) => {
  const { filename } = req.params;
  const audioPath = path.join(__dirname, '../../uploads/audio', filename);
  
  // Check if file exists
  if (!fs.existsSync(audioPath)) {
    return res.status(404).json({
      success: false,
      message: 'Audio file not found'
    });
  }
  
  // Set appropriate headers
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  
  // Stream the file
  const fileStream = fs.createReadStream(audioPath);
  fileStream.pipe(res);
});

export default router;
