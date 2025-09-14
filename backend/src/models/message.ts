// models/message.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: 'user' | 'character';
  content: string;
  translatedContent?: string;
  userAudioUrl?: string;
  characterAudioUrl?: string;
  audioProcessingTime?: number;
  transcriptionAccuracy?: number;
  grammarCorrections: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  vocabularyHighlights: {
    word: string;
    definition: string;
    context: string;
  }[];
  characterEmotion: string;
  teachingMoment?: {
    type: 'grammar' | 'vocabulary' | 'culture' | 'pronunciation';
    explanation: string;
  };
  timestamp: Date;
  processingTime: number;
}

const MessageSchema: Schema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: String, enum: ['user', 'character'], required: true },
  content: { type: String, required: true },
  translatedContent: { type: String },
  userAudioUrl: { type: String },
  characterAudioUrl: { type: String },
  audioProcessingTime: { type: Number, default: 0 },
  transcriptionAccuracy: { type: Number, min: 0, max: 1 },
  grammarCorrections: [{
    original: { type: String },
    corrected: { type: String },
    explanation: { type: String }
  }],
  vocabularyHighlights: [{
    word: { type: String },
    definition: { type: String },
    context: { type: String }
  }],
  characterEmotion: { type: String, default: 'neutral' },
  teachingMoment: {
    type: {
      type: String,
      enum: ['grammar', 'vocabulary', 'culture', 'pronunciation']
    },
    explanation: { type: String }
  },
  timestamp: { type: Date, default: Date.now },
  processingTime: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IMessage>('Message', MessageSchema);
