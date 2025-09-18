import Sentiment from "sentiment";

type Emotion = "happy" | "sad" | "excited" | "confused" | "neutral" | "angry" | "surprised" | "encouraging" | "frustrated" | "curious" | "confident" | "nervous";

interface EmotionResult {
  emotion: Emotion;
  intensity: number;
  confidence: number;
}

export class EmotionAnalysisService {
  private sentiment = new Sentiment();

  detect(text: string): Emotion {
    const score = this.sentiment.analyze(text).comparative;

    if (score > 0.75) return "excited";
    if (score > 0.2)  return "happy";
    if (score < -0.5) return "sad";
    if (score < -0.2) return "confused";
    return "neutral";
  }

  async analyzeEmotion(text: string, context?: string): Promise<EmotionResult[]> {
    try {
      const analysis = this.sentiment.analyze(text);
      const score = analysis.comparative;
      const words = text.toLowerCase();

      // Enhanced emotion detection based on keywords and sentiment
      let emotion: Emotion = "neutral";
      let intensity = Math.abs(score);
      let confidence = 0.7;

      // Keyword-based emotion detection
      if (words.includes('exciting') || words.includes('amazing') || words.includes('awesome')) {
        emotion = "excited";
        intensity = Math.max(0.8, intensity);
      } else if (words.includes('confused') || words.includes('understand') || words.includes('what')) {
        emotion = "confused";
        intensity = Math.max(0.6, intensity);
      } else if (words.includes('angry') || words.includes('mad') || words.includes('frustrated')) {
        emotion = "angry";
        intensity = Math.max(0.7, intensity);
      } else if (words.includes('surprised') || words.includes('wow') || words.includes('omg')) {
        emotion = "surprised";
        intensity = Math.max(0.7, intensity);
      } else if (score > 0.75) {
        emotion = "excited";
      } else if (score > 0.2) {
        emotion = "happy";
      } else if (score < -0.5) {
        emotion = "sad";
      } else if (score < -0.2) {
        emotion = "frustrated";
      }

      // Adjust confidence based on analysis quality
      if (analysis.tokens.length > 0) {
        confidence = Math.min(0.9, confidence + (analysis.tokens.length * 0.05));
      }

      return [{
        emotion,
        intensity: Math.max(0.1, Math.min(1.0, intensity)),
        confidence: Math.max(0.3, Math.min(1.0, confidence))
      }];
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      return [{
        emotion: 'neutral',
        intensity: 0.5,
        confidence: 0.3
      }];
    }
  }

  mapEmotionToCharacterResponse(emotion: string, intensity: number, characterType: 'maria' | 'akira'): any {
    const responseMap = {
      maria: {
        happy: { expression: 'big_smile', gesture: 'hands_up', voice: 'enthusiastic' },
        sad: { expression: 'concerned_frown', gesture: 'supportive_lean', voice: 'gentle' },
        excited: { expression: 'wide_eyes_smile', gesture: 'animated_hands', voice: 'energetic' },
        confused: { expression: 'tilted_head', gesture: 'questioning_hands', voice: 'patient' },
        neutral: { expression: 'warm_smile', gesture: 'open_hands', voice: 'friendly' },
        angry: { expression: 'concerned_frown', gesture: 'calming_hands', voice: 'soothing' },
        surprised: { expression: 'wide_eyes', gesture: 'hands_to_chest', voice: 'animated' }
      },
      akira: {
        happy: { expression: 'gentle_smile', gesture: 'respectful_bow', voice: 'warm' },
        sad: { expression: 'concerned_eyes', gesture: 'sympathetic_bow', voice: 'soft' },
        excited: { expression: 'bright_eyes', gesture: 'interested_lean', voice: 'engaged' },
        confused: { expression: 'polite_tilt', gesture: 'questioning_gesture', voice: 'patient' },
        neutral: { expression: 'calm_smile', gesture: 'neutral_posture', voice: 'steady' },
        angry: { expression: 'understanding_eyes', gesture: 'respectful_bow', voice: 'calming' },
        surprised: { expression: 'raised_eyebrows', gesture: 'slight_bow', voice: 'interested' }
      }
    };

    const characterMap = responseMap[characterType] || responseMap.maria;
    const emotionResponse = characterMap[emotion as keyof typeof characterMap] || characterMap.neutral;

    return {
      ...emotionResponse,
      intensity: intensity,
      duration: Math.max(1000, intensity * 3000)
    };
  }
}
