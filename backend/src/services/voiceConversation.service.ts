// services/voiceConversation.service.ts
import { characterAIService } from './characterAI.service';
import { textToSpeechService } from './textToSpeech.service';
import { speechToTextService } from './speechToText.service';

interface VoiceConversationOptions {
  characterId: string;
  userId: string;
  conversationId: string;
  audioFile?: Express.Multer.File;
  textMessage?: string;
  includeAudio?: boolean;
  speed?: number;
}

interface VoiceConversationResult {
  userTranscript?: string;
  characterResponse: string;
  audioUrl?: string;
  corrections: any[];
  vocabulary: any[];
  teachingMoment?: any;
  emotion: string;
  processingTime: number;
}

class VoiceConversationService {
  async handleVoiceMessage(options: VoiceConversationOptions): Promise<VoiceConversationResult> {
    const startTime = Date.now();
    let userMessage = options.textMessage;

    // Step 1: Convert speech to text if audio provided
    if (options.audioFile && !options.textMessage) {
      if (!speechToTextService.validateAudioFile(options.audioFile)) {
        throw new Error('Invalid audio file format or size');
      }

      const transcriptionResult = await speechToTextService.transcribeAudio({
        audioFile: options.audioFile,
        characterId: options.characterId
      });

      userMessage = transcriptionResult.transcript;
    }

    if (!userMessage) {
      throw new Error('No message content provided');
    }

    // Step 2: Get conversation history for context
    const conversationHistory = await this.getRecentMessages(options.conversationId);

    // Step 3: Get user's relationship level
    const relationshipLevel = await this.getRelationshipLevel(options.userId, options.characterId);

    // Step 4: Generate AI response
    const Character = require('../models/character').default;
    const character = await Character.findById(options.characterId);
    
    const aiResponse = await characterAIService.generateResponse({
      characterId: options.characterId,
      userMessage: userMessage,
      conversationHistory,
      userLevel: character.difficultyLevel,
      relationshipLevel
    });

    // Step 5: Convert response to speech if requested
    let audioUrl;
    if (options.includeAudio !== false) { // Default to true
      audioUrl = await textToSpeechService.generateSpeech({
        text: aiResponse.response,
        characterId: options.characterId,
        emotion: aiResponse.emotion,
        speed: options.speed || 1.0
      });
    }

    const processingTime = Date.now() - startTime;

    return {
      userTranscript: options.audioFile ? userMessage : undefined,
      characterResponse: aiResponse.response,
      audioUrl,
      corrections: aiResponse.corrections,
      vocabulary: aiResponse.vocabulary,
      teachingMoment: aiResponse.teachingMoment,
      emotion: aiResponse.emotion,
      processingTime
    };
  }

  private async getRecentMessages(conversationId: string, limit: number = 10): Promise<any[]> {
    const Message = require('../models/message').default;
    const messages = await Message.find({ conversationId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('sender content timestamp');
    
    return messages.reverse(); // Return in chronological order
  }

  private async getRelationshipLevel(userId: string, characterId: string): Promise<number> {
    const CharacterRelationship = require('../models/characterRelationship').default;
    const relationship = await CharacterRelationship.findOne({ userId, characterId });
    return relationship?.relationshipLevel || 0;
  }

  // Stream real-time conversation
  async handleStreamingConversation(options: {
    characterId: string;
    audioStream: NodeJS.ReadableStream;
  }): Promise<NodeJS.ReadableStream> {
    // This would handle real-time streaming conversations
    // Implementation depends on your WebSocket setup
    throw new Error('Streaming conversation not implemented yet');
  }
}

export const voiceConversationService = new VoiceConversationService();
