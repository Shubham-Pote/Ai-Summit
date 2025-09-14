// models/conversation.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  title: string;
  scenario: string;
  status: 'active' | 'completed' | 'paused';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  messagesCount: number;
  duration: number;
  mistakesMade: number;
  correctionsGiven: number;
  newVocabularyUsed: string[];
  conversationContext: string;
  characterMood: string;
  conversationType: 'text' | 'voice' | 'mixed';
  voiceStats: {
    totalVoiceMessages: number;
    totalAudioDuration: number;
    averageProcessingTime: number;
    transcriptionErrors: number;
  };
  startedAt: Date;
  lastMessageAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  title: { type: String, required: true },
  scenario: { type: String, default: 'casual_chat' },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  difficultyLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true 
  },
  focusAreas: [{ type: String }],
  messagesCount: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  mistakesMade: { type: Number, default: 0 },
  correctionsGiven: { type: Number, default: 0 },
  newVocabularyUsed: [{ type: String }],
  conversationContext: { type: String, default: '' },
  characterMood: { type: String, default: 'neutral' },
  conversationType: { 
    type: String, 
    enum: ['text', 'voice', 'mixed'],
    default: 'text'
  },
  voiceStats: {
    totalVoiceMessages: { type: Number, default: 0 },
    totalAudioDuration: { type: Number, default: 0 },
    averageProcessingTime: { type: Number, default: 0 },
    transcriptionErrors: { type: Number, default: 0 }
  },
  startedAt: { type: Date, default: Date.now },
  lastMessageAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
