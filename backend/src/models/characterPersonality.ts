// Personality definitions
import { Schema, model, Document } from "mongoose";

export interface IPersonalityTraits {
  warmth: number;
  enthusiasm: number;
  directness: number;
  playfulness: number;
  patience: number;
  culturalPride: number;
  formality?: number;
  respect?: number;
  precision?: number;
  wisdom?: number;
}

export interface ICulture {
  region: string;
  greetings: string[];
  expressions: string[];
  teachingStyle: "immersive" | "structured";
  culturalFocus: string[];
}

export interface IVoiceSettings {
  elevenLabsVoiceId?: string;
  speed: number;
  pitch: number;
  emotionalRange: number;
}

export interface IMovements {
  happy: string[];
  sad: string[];
  excited: string[];
  encouraging: string[];
  explaining: string[];
  confused: string[];
}

export interface ILanguageHandling {
  encouragement: string[];
  corrections: string[];
  culturalExplanations: boolean;
  spanishSlang?: string[];
  romajiConversion?: Record<string, string>;
  politenessLevels?: string[];
  regionalVariations?: string[];
}

export interface ICharacterPersonality extends Document {
  characterId: string; // 'maria' | 'akira'
  name: string;
  description?: string;
  personality: IPersonalityTraits;
  culture: ICulture;
  voice: IVoiceSettings;
  movements: IMovements;
  languageHandling: ILanguageHandling;
  isPreset: boolean;
  isCustom: boolean;
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const personalityTraitsSchema = new Schema({
  warmth: { type: Number, min: 0, max: 10, required: true },
  enthusiasm: { type: Number, min: 0, max: 10, required: true },
  directness: { type: Number, min: 0, max: 10, required: true },
  playfulness: { type: Number, min: 0, max: 10, required: true },
  patience: { type: Number, min: 0, max: 10, required: true },
  culturalPride: { type: Number, min: 0, max: 10, required: true },
  formality: { type: Number, min: 0, max: 10 },
  respect: { type: Number, min: 0, max: 10 },
  precision: { type: Number, min: 0, max: 10 },
  wisdom: { type: Number, min: 0, max: 10 }
}, { _id: false });

const cultureSchema = new Schema({
  region: { type: String, required: true },
  greetings: [String],
  expressions: [String],
  teachingStyle: { type: String, enum: ["immersive", "structured"], required: true },
  culturalFocus: [String]
}, { _id: false });

const voiceSettingsSchema = new Schema({
  elevenLabsVoiceId: String,
  speed: { type: Number, min: 0.1, max: 3, default: 1 },
  pitch: { type: Number, min: 0.1, max: 3, default: 1 },
  emotionalRange: { type: Number, min: 0, max: 2, default: 1 }
}, { _id: false });

const movementsSchema = new Schema({
  happy: [String],
  sad: [String],
  excited: [String],
  encouraging: [String],
  explaining: [String],
  confused: [String]
}, { _id: false });

const languageHandlingSchema = new Schema({
  encouragement: [String],
  corrections: [String],
  culturalExplanations: { type: Boolean, default: true },
  spanishSlang: [String],
  romajiConversion: Schema.Types.Mixed,
  politenessLevels: [String],
  regionalVariations: [String]
}, { _id: false });

const characterPersonalitySchema = new Schema<ICharacterPersonality>(
  {
    characterId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    personality: { type: personalityTraitsSchema, required: true },
    culture: { type: cultureSchema, required: true },
    voice: { type: voiceSettingsSchema, required: true },
    movements: { type: movementsSchema, required: true },
    languageHandling: { type: languageHandlingSchema, required: true },
    isPreset: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

characterPersonalitySchema.index({ characterId: 1 });
characterPersonalitySchema.index({ isPreset: 1 });

export default model<ICharacterPersonality>(
  "CharacterPersonality",
  characterPersonalitySchema
);
