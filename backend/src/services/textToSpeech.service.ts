// services/textToSpeech.service.ts - GOOGLE CLOUD TTS VERSION
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';

interface TTSOptions {
  text: string;
  characterId: string;
  emotion?: string;
  speed?: number;
}

class TextToSpeechService {
  private client: TextToSpeechClient;
  private audioDir: string;

  constructor() {
    this.client = new TextToSpeechClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });
    this.audioDir = path.join(__dirname, '../../uploads/audio');
    
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async generateSpeech(options: TTSOptions): Promise<string> {
    const { text, characterId, emotion = 'neutral', speed = 1.0 } = options;
    
    const Character = require('../models/character').default;
    const character = await Character.findById(characterId);
    
    if (!character) {
      throw new Error('Character not found');
    }

    const voiceConfig = this.getCharacterVoiceConfig(character, emotion);
    const emotionSpeed = character.voiceSettings?.emotionMapping?.[emotion] || speed;

    try {
      const request = {
        input: { text },
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.voiceName,
          ssmlGender: voiceConfig.ssmlGender as any
        },
        audioConfig: {
          audioEncoding: 'MP3' as any,
          speakingRate: Math.max(0.25, Math.min(4.0, emotionSpeed * speed)),
          pitch: voiceConfig.pitch,
          volumeGainDb: 0.0
        }
      };

      const [response] = await this.client.synthesizeSpeech(request);
      
      const filename = `${characterId}_${Date.now()}.mp3`;
      const filepath = path.join(this.audioDir, filename);

      if (response.audioContent) {
        fs.writeFileSync(filepath, response.audioContent, 'binary');
      }

      return `/api/audio/${filename}`;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  private getCharacterVoiceConfig(character: any, emotion: string) {
    const { language, age, personality } = character;
    
    if (language === 'spanish') {
      // Spanish voices
      if (age < 30) {
        return {
          languageCode: 'es-ES',
          voiceName: personality.includes('energetic') ? 'es-ES-Standard-A' : 'es-ES-Standard-C',
          ssmlGender: 'FEMALE',
          pitch: emotion === 'excited' ? 2.0 : 0.0
        };
      } else {
        return {
          languageCode: 'es-ES',
          voiceName: 'es-ES-Standard-B',
          ssmlGender: 'MALE',
          pitch: emotion === 'happy' ? 1.0 : 0.0
        };
      }
    }
    
    if (language === 'japanese') {
      // Japanese voices
      if (age < 30) {
        return {
          languageCode: 'ja-JP',
          voiceName: 'ja-JP-Standard-A',
          ssmlGender: 'FEMALE',
          pitch: emotion === 'excited' ? 1.5 : -0.5
        };
      } else {
        return {
          languageCode: 'ja-JP',
          voiceName: 'ja-JP-Standard-C',
          ssmlGender: 'MALE',
          pitch: emotion === 'happy' ? 0.5 : -1.0
        };
      }
    }

    // Default fallback
    return {
      languageCode: 'en-US',
      voiceName: 'en-US-Standard-A',
      ssmlGender: 'FEMALE',
      pitch: 0.0
    };
  }
}

export const textToSpeechService = new TextToSpeechService();
