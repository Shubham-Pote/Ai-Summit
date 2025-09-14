// models/characterRelationship.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICharacterRelationship extends Document {
  userId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  relationshipLevel: number;
  relationshipStatus: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'best_friend';
  totalConversations: number;
  totalMessages: number;
  totalTimeSpent: number;
  streakDays: number;
  lastInteractionAt: Date;
  vocabularyLearned: string[];
  grammarPointsLearned: string[];
  mistakesCorrected: number;
  voiceInteractionStats: {
    totalVoiceConversations: number;
    totalVoiceMessages: number;
    averageAccuracy: number;
    preferredConversationType: 'text' | 'voice' | 'mixed';
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterRelationshipSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  relationshipLevel: { type: Number, default: 0, min: 0, max: 100 },
  relationshipStatus: { 
    type: String, 
    enum: ['stranger', 'acquaintance', 'friend', 'close_friend', 'best_friend'],
    default: 'stranger'
  },
  totalConversations: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  lastInteractionAt: { type: Date },
  vocabularyLearned: [{ type: String }],
  grammarPointsLearned: [{ type: String }],
  mistakesCorrected: { type: Number, default: 0 },
  voiceInteractionStats: {
    totalVoiceConversations: { type: Number, default: 0 },
    totalVoiceMessages: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0, min: 0, max: 1 },
    preferredConversationType: { 
      type: String, 
      enum: ['text', 'voice', 'mixed'],
      default: 'text'
    }
  },
  isUnlocked: { type: Boolean, default: false },
  unlockedAt: { type: Date }
}, {
  timestamps: true
});

// Compound index for efficient queries
CharacterRelationshipSchema.index({ userId: 1, characterId: 1 }, { unique: true });

export default mongoose.model<ICharacterRelationship>('CharacterRelationship', CharacterRelationshipSchema);
