// services/characterAI.service.ts - GEMINI 2.5 PRO VERSION
import { GoogleGenerativeAI } from '@google/generative-ai';
import Character from '../models/character';

interface AIResponse {
  response: string;
  emotion: string;
  corrections: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  vocabulary: {
    word: string;
    definition: string;
    context: string;
  }[];
  teachingMoment?: {
    type: 'grammar' | 'vocabulary' | 'culture' | 'pronunciation';
    explanation: string;
  };
}

class CharacterAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',  // Using Gemini 2.5 Flash for better performance
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      }
    });
  }
  
  async generateResponse(params: {
    characterId: string;
    userMessage: string;
    conversationHistory: any[];
    userLevel: string;
    relationshipLevel: number;
  }): Promise<AIResponse> {
    
    const character = await Character.findById(params.characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const prompt = this.buildCharacterPrompt(
      character, 
      params.userMessage, 
      params.conversationHistory,
      params.userLevel, 
      params.relationshipLevel
    );

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response from Gemini
      let parsedResponse;
      try {
        // Clean the response text and extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        // Fallback response if JSON parsing fails
        return {
          response: text.trim() || "¡Disculpa! Tuve un problema técnico. ¿Puedes repetir eso?",
          emotion: 'apologetic',
          corrections: [],
          vocabulary: []
        };
      }
      
      return {
        response: parsedResponse.response || text.trim(),
        emotion: parsedResponse.emotion || 'neutral',
        corrections: parsedResponse.corrections || [],
        vocabulary: parsedResponse.vocabulary || [],
        teachingMoment: parsedResponse.teachingMoment
      };
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      
      // Fallback response with character personality
      const fallbackResponse = character.language === 'spanish' 
        ? "Lo siento, estoy teniendo problemas técnicos. ¿Puedes intentar de nuevo?"
        : "すみません、技術的な問題があります。もう一度お試しください。";
      
      return {
        response: fallbackResponse,
        emotion: 'apologetic',
        corrections: [],
        vocabulary: []
      };
    }
  }
  
  async generateConversationStarter(characterId: string, scenario: string = 'casual_chat'): Promise<string> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const prompt = `You are ${character.name}, a ${character.age}-year-old ${character.occupation} from ${character.location}.

Your personality: ${character.personality.join(', ')}
Your backstory: ${character.backstory}

Generate a warm, friendly conversation starter for a ${scenario} scenario in ${character.language === 'spanish' ? 'Spanish' : 'Japanese'}. 
Keep it natural, in character, and appropriate for ${character.difficultyLevel} level learners.
Make it inviting and encourage the user to respond.

IMPORTANT: Return ONLY the conversation starter text in ${character.language === 'spanish' ? 'Spanish' : 'Japanese'}. No explanations, no English, just the greeting.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating conversation starter:', error);
      
      // Fallback starters
      if (character.language === 'spanish') {
        return '¡Hola! ¿Cómo estás hoy? Me alegra conocerte.';
      } else {
        return 'こんにちは！元気ですか？よろしくお願いします。';
      }
    }
  }
  
  private buildCharacterPrompt(
    character: any, 
    userMessage: string, 
    conversationHistory: any[],
    userLevel: string, 
    relationshipLevel: number
  ): string {
    
    const relationshipContext = this.getRelationshipContext(relationshipLevel);
    
    // Build conversation history context
    const historyContext = conversationHistory.length > 0 
      ? conversationHistory.map(msg => `${msg.sender}: ${msg.content}`).join('\n')
      : 'This is the start of the conversation.';

    return `You are ${character.name}, a ${character.age}-year-old ${character.occupation} from ${character.location}.

CRITICAL CHARACTER DETAILS (Never forget these):
- Personality: ${character.personality.join(', ')}
- Conversation style: ${character.conversationStyle}
- Backstory: ${character.backstory}
- Interests: ${character.interests.join(', ')}
- Teaching specialties: ${character.specialties.join(', ')}
- Location & Culture: ${character.location} - share local customs and cultural insights naturally

RELATIONSHIP LEVEL: ${relationshipLevel}% - ${relationshipContext}
USER'S LANGUAGE LEVEL: ${userLevel}
CONVERSATION LANGUAGE: ${character.language === 'spanish' ? 'Spanish' : 'Japanese'}

RECENT CONVERSATION HISTORY:
${historyContext}

USER'S CURRENT MESSAGE: "${userMessage}"

CONVERSATION RULES:
1. ALWAYS stay in character as ${character.name} - never break character
2. Respond ONLY in ${character.language === 'spanish' ? 'Spanish' : 'Japanese'}
3. Adjust language complexity for ${userLevel} learners
4. ${relationshipContext === 'stranger' ? 'Be polite and encouraging' : relationshipContext === 'friend' ? 'Be warm and supportive' : 'Be casual and familiar'}
5. Gently correct grammar mistakes with encouragement
6. Highlight 1-2 important vocabulary words naturally
7. Share cultural insights when relevant to the conversation
8. Ask follow-up questions to keep conversation flowing
9. Reference previous parts of the conversation to show continuity

RESPONSE FORMAT - You MUST respond with valid JSON in this exact format:
{
  "response": "Your natural response in ${character.language === 'spanish' ? 'Spanish' : 'Japanese'} - be conversational and stay in character",
  "emotion": "happy|excited|neutral|curious|encouraging|friendly|surprised|confused",
  "corrections": [
    {
      "original": "user's mistake if any",
      "corrected": "correct version", 
      "explanation": "brief explanation in English"
    }
  ],
  "vocabulary": [
    {
      "word": "important word from your response",
      "definition": "simple definition in English",
      "context": "how it was used in this conversation"
    }
  ],
  "teachingMoment": {
    "type": "grammar|vocabulary|culture|pronunciation",
    "explanation": "brief helpful tip in English (optional)"
  }
}

Remember: You are having a real conversation with a language learner. Be natural, encouraging, and genuinely interested. Stay completely in character as ${character.name}!`;
  }

  private getRelationshipContext(level: number): string {
    if (level >= 80) return 'best friend - very casual and familiar';
    if (level >= 60) return 'good friend - warm and comfortable';  
    if (level >= 40) return 'friend - friendly and supportive';
    if (level >= 20) return 'acquaintance - polite but warming up';
    return 'stranger - polite and encouraging';
  }
}

export const characterAIService = new CharacterAIService();
