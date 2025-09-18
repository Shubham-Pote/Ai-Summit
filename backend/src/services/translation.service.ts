// Learning translations
import { GoogleGenerativeAI } from '@google/generative-ai';

interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  explanation?: string;
  grammarNotes?: string[];
  culturalContext?: string;
  confidence: number;
}

export class TranslationService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for TranslationService');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async translateForLearning(
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string,
    includeExplanation: boolean = true
  ): Promise<TranslationResult> {
    try {
      const prompt = `
        Translate this text for language learning purposes:
        
        Text: "${text}"
        From: ${sourceLanguage}
        To: ${targetLanguage}
        
        ${includeExplanation ? `
        Please provide:
        1. Accurate translation
        2. Grammar explanation
        3. Cultural context if relevant
        4. Alternative expressions if applicable
        
        Return JSON format:
        {
          "translatedText": "translation here",
          "explanation": "grammar explanation",
          "grammarNotes": ["note1", "note2"],
          "culturalContext": "cultural explanation if relevant",
          "confidence": 0.0-1.0
        }
        ` : 'Just provide the translation in JSON format: {"translatedText": "translation here", "confidence": 0.0-1.0}'}
        
        Only return valid JSON, no other text.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const parsed = JSON.parse(response);
        return {
          translatedText: parsed.translatedText || text,
          sourceLanguage,
          targetLanguage,
          explanation: parsed.explanation,
          grammarNotes: parsed.grammarNotes || [],
          culturalContext: parsed.culturalContext,
          confidence: parsed.confidence || 0.8
        };
      } catch (parseError) {
        console.warn('Failed to parse translation response:', response);
        return {
          translatedText: text,
          sourceLanguage,
          targetLanguage,
          confidence: 0.3
        };
      }
    } catch (error) {
      console.error('Error translating text:', error);
      return {
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        confidence: 0.1
      };
    }
  }

  async detectAndTranslate(text: string, targetLanguage: string): Promise<TranslationResult> {
    try {
      // Simple language detection based on character patterns
      let sourceLanguage = 'english';
      
      if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
        sourceLanguage = 'japanese';
      } else if (/[ñáéíóúü¿¡]/.test(text.toLowerCase())) {
        sourceLanguage = 'spanish';
      }

      return await this.translateForLearning(text, sourceLanguage, targetLanguage);
    } catch (error) {
      console.error('Error in detect and translate:', error);
      return {
        translatedText: text,
        sourceLanguage: 'unknown',
        targetLanguage,
        confidence: 0.1
      };
    }
  }

  async translateToNative(text: string, userNativeLanguage: string = 'english'): Promise<string> {
    try {
      const result = await this.translateForLearning(text, 'auto', userNativeLanguage, false);
      return result.translatedText;
    } catch (error) {
      console.error('Error translating to native language:', error);
      return text;
    }
  }

  async explainGrammar(text: string, language: string): Promise<string[]> {
    try {
      const prompt = `
        Explain the grammar structures in this ${language} text for language learners:
        "${text}"
        
        Return an array of grammar explanations in JSON format:
        ["explanation1", "explanation2"]
        
        Only return valid JSON, no other text.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const explanations = JSON.parse(response);
        return Array.isArray(explanations) ? explanations : [];
      } catch (parseError) {
        return [];
      }
    } catch (error) {
      console.error('Error explaining grammar:', error);
      return [];
    }
  }
}
