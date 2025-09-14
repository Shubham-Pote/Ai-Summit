export interface Character {
  _id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  nationality: string;
  language: 'spanish' | 'japanese';
  personality: string[];
  conversationStyle: 'formal' | 'casual' | 'friendly' | 'professional';
  backstory: string;
  interests: string[];
  specialties: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  teachingStyle: string;
  vocabularyFocus: string[];
  avatar: string;
  modelUrl?: string; // URL for the .glb model
  voiceSettings: {
    openaiVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    defaultSpeed: number;
    emotionMapping: {
      happy: number;
      sad: number;
      excited: number;
      neutral: number;
    };
  };
  isLocked: boolean;
  unlockRequirement: {
    type: 'level' | 'conversations' | 'points' | 'premium';
    value: number | string;
  };
  isActive: boolean;
  relationshipLevel?: number;
  relationshipStatus?: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'best_friend';
  totalConversations?: number;
  totalMessages?: number;
  isUnlocked?: boolean;
  lastInteractionAt?: string;
}

export interface CharacterStats {
  totalConversations: number;
  totalMessages: number;
  totalTimeSpent: number;
  streakDays: number;
  vocabularyLearned: string[];
  grammarPointsLearned: string[];
  mistakesCorrected: number;
  voiceInteractionStats: {
    totalVoiceConversations: number;
    totalVoiceMessages: number;
    averageAccuracy: number;
    preferredConversationType: 'text' | 'voice' | 'mixed';
  };
}

export interface Conversation {
  _id: string;
  userId: string;
  characterId: string;
  messages: Message[];
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: 'user' | 'character' | 'system';
  content: string;
  audioUrl?: string;
  createdAt: string;
}