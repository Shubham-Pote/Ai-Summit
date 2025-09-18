// Mixed language conversation tracking
import { Schema, model, Types, Document } from "mongoose";

export interface ILanguageSegment {
  text: string;
  language: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  script?: string;
  isTransliterated?: boolean;
}

export interface ILearningContext {
  newWords?: string[];
  grammarPoints?: string[];
  culturalReferences?: string[];
  difficultyLevel?: number;
}

export interface ILanguageMixing extends Document {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  messageId: Types.ObjectId;
  originalText: string;
  detectedSegments: ILanguageSegment[];
  primaryLanguage: string;
  secondaryLanguages: string[];
  mixingType: "code_switching" | "transliteration" | "borrowing" | "interference";
  learningContext: ILearningContext;
  correctionSuggestions?: string[];
  translationProvided: boolean;
  culturalExplanationGiven: boolean;
  userLevel: "beginner" | "intermediate" | "advanced";
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const languageSegmentSchema = new Schema({
  text: { type: String, required: true },
  language: { type: String, required: true },
  confidence: { type: Number, min: 0, max: 1, required: true },
  startIndex: { type: Number, required: true },
  endIndex: { type: Number, required: true },
  script: { 
    type: String, 
    enum: ['latin', 'hiragana', 'katakana', 'kanji', 'romaji', 'cyrillic', 'arabic'] 
  },
  isTransliterated: { type: Boolean, default: false }
}, { _id: false });

const learningContextSchema = new Schema({
  newWords: [String],
  grammarPoints: [String],
  culturalReferences: [String],
  difficultyLevel: { type: Number, min: 1, max: 10 }
}, { _id: false });

const languageMixingSchema = new Schema<ILanguageMixing>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "CharacterSession", required: true },
    messageId: { type: Schema.Types.ObjectId, ref: "CharacterConversation", required: true },
    originalText: { type: String, required: true },
    detectedSegments: [languageSegmentSchema],
    primaryLanguage: { 
      type: String, 
      enum: ["english", "spanish", "japanese"],
      required: true 
    },
    secondaryLanguages: [{ 
      type: String, 
      enum: ["english", "spanish", "japanese"] 
    }],
    mixingType: { 
      type: String, 
      enum: ["code_switching", "transliteration", "borrowing", "interference"],
      required: true 
    },
    learningContext: learningContextSchema,
    correctionSuggestions: [String],
    translationProvided: { type: Boolean, default: false },
    culturalExplanationGiven: { type: Boolean, default: false },
    userLevel: { 
      type: String, 
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate" 
    },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for better performance
languageMixingSchema.index({ userId: 1, timestamp: -1 });
languageMixingSchema.index({ sessionId: 1 });
languageMixingSchema.index({ primaryLanguage: 1, mixingType: 1 });

export default model<ILanguageMixing>(
  "LanguageMixing",
  languageMixingSchema
);
