// Enhanced error recovery and fallback system
import { CharacterErrorMessages } from "../utils/characterErrorMessages";

export class ErrorRecoveryService {
  
  /**
   * Get character-appropriate error message
   */
  getCharacterErrorMessage(
    characterId: 'maria' | 'akira' | 'default',
    errorType: keyof typeof CharacterErrorMessages.maria
  ): string {
    const messages = CharacterErrorMessages[characterId] || CharacterErrorMessages.default;
    return messages[errorType] || messages.aiFailure;
  }

  /**
   * Determine error type from error object
   */
  categorizeError(error: any): keyof typeof CharacterErrorMessages.maria {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    // Network/Connection errors
    if (errorMessage.includes('network') || errorMessage.includes('timeout') || 
        errorMessage.includes('connection') || errorMessage.includes('fetch')) {
      return 'connectionIssue';
    }
    
    // AI/Gemini errors
    if (errorMessage.includes('gemini') || errorMessage.includes('ai') || 
        errorMessage.includes('model') || errorMessage.includes('generation')) {
      return 'aiFailure';
    }
    
    // Language detection errors
    if (errorMessage.includes('language') || errorMessage.includes('detection') || 
        errorMessage.includes('romaji') || errorMessage.includes('translation')) {
      return 'languageDetectionFailed';
    }
    
    // Default fallback
    return 'aiFailure';
  }

  /**
   * Create fallback response when AI completely fails
   */
  createFallbackResponse(characterId: 'maria' | 'akira', userMessage: string): any {
    const isQuestion = userMessage.includes('?') || userMessage.includes('¿') || 
                      userMessage.includes('か') || userMessage.toLowerCase().includes('what') ||
                      userMessage.toLowerCase().includes('how');
    
    if (characterId === 'maria') {
      if (isQuestion) {
        return {
          text: "¡Buena pregunta! Aunque no puedo responder ahora mismo, ¿qué tal si practicamos algo básico como saludos? 😊",
          emotion: "encouraging",
          animation: { expression: "warm_smile", gesture: "supportive_lean" }
        };
      } else {
        return {
          text: "¡Qué interesante! Me encanta escucharte. ¿Podemos practicar un poco de conversación básica? 💕",
          emotion: "happy",
          animation: { expression: "big_smile", gesture: "animated_hands" }
        };
      }
    } else { // akira
      if (isQuestion) {
        return {
          text: "良い質問ですね。今はお答えできませんが、基本的な日本語を練習しませんか？",
          emotion: "encouraging", 
          animation: { expression: "gentle_smile", gesture: "respectful_bow" }
        };
      } else {
        return {
          text: "そうですね。基本的な会話から始めましょうか？",
          emotion: "neutral",
          animation: { expression: "calm_smile", gesture: "formal_posture" }
        };
      }
    }
  }

  /**
   * Check if user input might be inappropriate or off-topic
   */
  validateUserInput(message: string): { isValid: boolean; errorType?: string } {
    const lowerMessage = message.toLowerCase();
    
    // Check for inappropriate content (basic filter)
    const inappropriateWords = ['hate', 'stupid', 'idiot', 'kill', 'die', 'damn', 'fuck'];
    if (inappropriateWords.some(word => lowerMessage.includes(word))) {
      return { isValid: false, errorType: 'inappropriateContent' };
    }
    
    // Check for completely off-topic content
    const offTopicIndicators = ['politics', 'religion', 'money', 'dating', 'sex', 'drugs'];
    if (offTopicIndicators.some(topic => lowerMessage.includes(topic))) {
      return { isValid: false, errorType: 'offTopic' };
    }
    
    // Check for empty or nonsensical input
    if (message.trim().length === 0 || message.trim().length < 2) {
      return { isValid: false, errorType: 'unclearInput' };
    }
    
    return { isValid: true };
  }

  /**
   * Generate encouraging response for confused users
   */
  generateEncouragementResponse(characterId: 'maria' | 'akira', attempts: number): any {
    if (characterId === 'maria') {
      if (attempts >= 3) {
        return {
          text: "¡Oye, no te frustres! Aprender es un proceso. ¿Qué tal si empezamos con algo súper fácil? Como decir 'Hola, ¿cómo estás?' 🌟",
          emotion: "encouraging",
          animation: { expression: "warm_smile", gesture: "supportive_hands" }
        };
      } else {
        return {
          text: "¡Está bien! Todos cometemos errores. Es así como aprendemos. ¿Intentamos de nuevo? 💪",
          emotion: "encouraging", 
          animation: { expression: "encouraging_smile", gesture: "thumbs_up" }
        };
      }
    } else { // akira
      if (attempts >= 3) {
        return {
          text: "心配しないでください。学習には時間がかかります。簡単なことから始めましょう。「こんにちは」から練習しませんか？",
          emotion: "encouraging",
          animation: { expression: "gentle_smile", gesture: "patient_gesture" }
        };
      } else {
        return {
          text: "大丈夫です。もう一度挑戦してみましょう。",
          emotion: "encouraging",
          animation: { expression: "supportive_smile", gesture: "encouraging_nod" }
        };
      }
    }
  }
}