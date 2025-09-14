// models/character.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICharacter extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  occupation: { type: String, required: true },
  location: { type: String, required: true },
  nationality: { type: String, required: true },
  language: { type: String, enum: ['spanish', 'japanese'], required: true },
  personality: [{ type: String }],
  conversationStyle: { 
    type: String, 
    enum: ['formal', 'casual', 'friendly', 'professional'],
    default: 'friendly'
  },
  backstory: { type: String, required: true },
  interests: [{ type: String }],
  specialties: [{ type: String }],
  difficultyLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true 
  },
  teachingStyle: { type: String, required: true },
  vocabularyFocus: [{ type: String }],
  avatar: { type: String, required: true },
  voiceSettings: {
    openaiVoice: { 
      type: String, 
      enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      default: 'alloy'
    },
    defaultSpeed: { type: Number, default: 1.0, min: 0.25, max: 4.0 },
    emotionMapping: {
      happy: { type: Number, default: 1.1 },
      sad: { type: Number, default: 0.9 },
      excited: { type: Number, default: 1.2 },
      neutral: { type: Number, default: 1.0 }
    }
  },
  isLocked: { type: Boolean, default: false },
  unlockRequirement: {
    type: {
      type: String,
      enum: ['level', 'conversations', 'points', 'premium']
    },
    value: Schema.Types.Mixed
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<ICharacter>('Character', CharacterSchema);
