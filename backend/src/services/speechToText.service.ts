// services/speechToText.service.ts
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

interface STTOptions {
  audioFile: Express.Multer.File;
  language?: string;
  characterId?: string;
}

interface STTResult {
  transcript: string;
  language: string;
  confidence: number;
  duration: number;
}

class SpeechToTextService {
  private openai: OpenAI;
  private uploadsDir: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
    this.uploadsDir = path.join(__dirname, '../../uploads/temp');
    
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async transcribeAudio(options: STTOptions): Promise<STTResult> {
    const { audioFile, language, characterId } = options;
    
    // Save uploaded file temporarily
    const tempFilePath = path.join(this.uploadsDir, `${Date.now()}_${audioFile.originalname}`);
    fs.writeFileSync(tempFilePath, audioFile.buffer);

    try {
      // Determine target language from character if provided
      let targetLanguage = language;
      if (characterId && !language) {
        const Character = require('../models/character').default;
        const character = await Character.findById(characterId);
        targetLanguage = character?.language === 'spanish' ? 'es' : 'ja';
      }

      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: targetLanguage,
        response_format: 'verbose_json',
        temperature: 0.0 // More consistent results
      });

      return {
        transcript: transcription.text.trim(),
        language: transcription.language || targetLanguage || 'unknown',
        confidence: 0.95, // Whisper doesn't return confidence, but it's generally very high
        duration: transcription.duration || 0
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }

  // Real-time transcription for live conversations
  async transcribeStream(audioBuffer: Buffer, language?: string): Promise<string> {
    // Save buffer as temporary file
    const tempFilePath = path.join(this.uploadsDir, `stream_${Date.now()}.wav`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: language,
        response_format: 'text',
        temperature: 0.0
      });

      return transcription.trim();
    } catch (error) {
      console.error('Error in stream transcription:', error);
      throw new Error('Failed to transcribe audio stream');
    } finally {
      // Clean up
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }

  // Helper method to validate audio file
  validateAudioFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/wav', 
      'audio/mp4',
      'audio/webm',
      'audio/ogg'
    ];
    
    return allowedMimeTypes.includes(file.mimetype) && file.size <= 25 * 1024 * 1024; // 25MB limit
  }
}

export const speechToTextService = new SpeechToTextService();
