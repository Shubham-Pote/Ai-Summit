// Main AI character logic with full feature integration
import { GeminiManager } from "./geminiManager.service";
import { EmotionAnalysisService } from "./emotionAnalysis.service";
import { MultiLanguageDetectionService } from "./multiLanguageDetection.service";
import { CulturalContextService } from "./culturalContext.service";
import CharacterPersonality from "../models/characterPersonality";

const gemini = new GeminiManager();
const emotionService = new EmotionAnalysisService();
const languageService = new MultiLanguageDetectionService();
const culturalService = new CulturalContextService();

interface CharacterContext {
  characterId: 'maria' | 'akira';
  userId: string;
  sessionId: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}

interface StreamResponse {
  text: string;
  emotion?: string;
  animation?: any;
  culturalNote?: string;
  languageDetected?: string;
}

export class CharacterAIService {
  /**
   * Enhanced streaming response with personality, emotions, and cultural context
   */
  async streamResponse(context: CharacterContext) {
    try {
      // 1. Get character personality
      const personality = await CharacterPersonality.findOne({ 
        characterId: context.characterId 
      });

      if (!personality) {
        throw new Error(`Character ${context.characterId} not found`);
      }

      // 2. Analyze user's last message for emotion and language
      const lastUserMessage = context.conversationHistory
        .filter(msg => msg.role === 'user')
        .pop();

      let userEmotion: any = null;
      let detectedLanguages: any[] = [];
      let culturalContext: string = '';

      if (lastUserMessage) {
        // Emotion analysis
        const emotions = await emotionService.analyzeEmotion(lastUserMessage.content);
        userEmotion = emotions[0];

        // Language detection
        detectedLanguages = await languageService.detectLanguages(lastUserMessage.content);

        // Cultural context
        const primaryLang = detectedLanguages[0]?.language || 'english';
        if (primaryLang === 'spanish' || primaryLang === 'japanese') {
          culturalContext = culturalService.generateNote(
            lastUserMessage.content, 
            primaryLang as 'es' | 'ja'
          );
        }
      }

      // 3. Build personality-aware prompt  
      const personalityPrompt = this.buildPersonalityPrompt(personality, userEmotion);
      const enhancedContext = [
        ...context.conversationHistory,
        { role: "user" as const, content: personalityPrompt + "\n" + (lastUserMessage?.content || "") }
      ];

      // 4. Get streaming response from Gemini
      const { stream, fullTextPromise } = gemini.chatStream(enhancedContext);

      // 5. Create enhanced iterator with metadata
      const enhancedStream = this.createEnhancedStream(
        stream, 
        personality, 
        userEmotion, 
        culturalContext,
        detectedLanguages[0]?.language
      );

      // 6. Decorate with fullText method
      const iterator: AsyncIterable<StreamResponse> & { fullText(): Promise<string> } =
        Object.assign(enhancedStream, {
          fullText: () => fullTextPromise
        });

      return iterator;

    } catch (error) {
      console.error('CharacterAI Error:', error);
      throw error;
    }
  }

  /**
   * Build personality-specific system prompt
   */
  private buildPersonalityPrompt(personality: any, userEmotion: any): string {
    const character = personality.characterId === 'maria' ? 'María' : 'Akira';
    const culture = personality.characterId === 'maria' ? 'Mexican Spanish' : 'Japanese';
    
    let emotionalContext = '';
    if (userEmotion) {
      emotionalContext = `The user seems ${userEmotion.emotion} (intensity: ${userEmotion.intensity}). `;
      
      if (personality.characterId === 'maria') {
        emotionalContext += 'Respond with warmth and enthusiasm. ';
      } else {
        emotionalContext += 'Respond with polite understanding and respect. ';
      }
    }

    return `You are ${character}, a ${culture} language teacher with these personality traits:
- Warmth: ${personality.personality.warmth}/10
- Enthusiasm: ${personality.personality.enthusiasm}/10
- Cultural Pride: ${personality.personality.culturalPride}/10
${personality.characterId === 'akira' ? `- Formality: ${personality.personality.formality}/10\n- Respect: ${personality.personality.respect}/10` : ''}

${emotionalContext}

Teaching style: ${personality.culture.teachingStyle}
Cultural focus: ${personality.culture.culturalFocus.join(', ')}

Respond naturally in character, providing language learning support with cultural context.`;
  }

  /**
   * Create enhanced stream with animations and metadata
   */
  private async *createEnhancedStream(
    baseStream: AsyncIterable<string>,
    personality: any,
    userEmotion: any,
    culturalContext: string,
    detectedLanguage?: string
  ): AsyncGenerator<StreamResponse> {
    
    let isFirstChunk = true;
    
    for await (const chunk of baseStream) {
      const response: StreamResponse = {
        text: chunk
      };

      // Add animation data for first chunk
      if (isFirstChunk && userEmotion) {
        const characterType = personality.characterId as 'maria' | 'akira';
        response.animation = emotionService.mapEmotionToCharacterResponse(
          userEmotion.emotion,
          userEmotion.intensity,
          characterType
        );
        isFirstChunk = false;
      }

      // Add cultural context occasionally
      if (culturalContext && Math.random() < 0.3) {
        response.culturalNote = culturalContext;
      }

      // Add language detection info
      if (detectedLanguage && detectedLanguage !== 'english') {
        response.languageDetected = detectedLanguage;
      }

      yield response;
    }
  }
}
