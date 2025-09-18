// Chat message storage
import { Schema, model, Types, Document } from "mongoose";

export interface IDetectedLanguage {
  language: string;
  confidence: number;
  script?: string; // 'romaji', 'hiragana', 'katakana', 'kanji'
}

export interface IEmotion {
  emotion: string;
  intensity: number;
}

export interface ICulturalContext {
  explanation?: string;
  customsNote?: string;
  regionalVariation?: string;
  politenessLevel?: string;
}

export interface IAnimationData {
  facial?: string[];
  gestures?: string[];
  timing?: number[];
}

export interface ICharacterConversation extends Document {
  sessionId: Types.ObjectId;
  sender: "user" | "character";
  message: string;
  detectedLanguages?: IDetectedLanguage[];
  emotions?: IEmotion[];
  audioUrl?: string;
  animations?: IAnimationData;
  culturalContext?: ICulturalContext;
  translation?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const detectedLanguageSchema = new Schema({
  language: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  script: { type: String, enum: ['romaji', 'hiragana', 'katakana', 'kanji', 'latin', 'cyrillic'] }
}, { _id: false });

const emotionSchema = new Schema({
  emotion: { type: String, required: true },
  intensity: { type: Number, required: true, min: 0, max: 1 }
}, { _id: false });

const culturalContextSchema = new Schema({
  explanation: String,
  customsNote: String,
  regionalVariation: String,
  politenessLevel: { type: String, enum: ['casual', 'polite', 'respectful', 'honorific'] }
}, { _id: false });

const animationDataSchema = new Schema({
  facial: [String],
  gestures: [String],
  timing: [Number]
}, { _id: false });

const characterConversationSchema = new Schema<ICharacterConversation>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "CharacterSession", required: true },
    sender: { type: String, enum: ["user", "character"], required: true },
    message: { type: String, required: true },
    detectedLanguages: [detectedLanguageSchema],
    emotions: [emotionSchema],
    audioUrl: String,
    animations: animationDataSchema,
    culturalContext: culturalContextSchema,
    translation: String,
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for better performance
characterConversationSchema.index({ sessionId: 1, timestamp: -1 });
characterConversationSchema.index({ sender: 1 });

export default model<ICharacterConversation>(
  "CharacterConversation",
  characterConversationSchema
);
