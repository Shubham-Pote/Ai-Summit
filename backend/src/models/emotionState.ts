// Emotion tracking
import { Schema, model, Types, Document } from "mongoose";

export interface IEmotionHistory {
  emotion: string;
  intensity: number;
  timestamp: Date;
  context?: string;
}

export interface IEmotionState extends Document {
  characterId: string; // 'maria' | 'akira' 
  userId?: Types.ObjectId;
  sessionId?: Types.ObjectId;
  currentEmotion: string;
  intensity: number;
  emotionHistory: IEmotionHistory[];
  transitionSpeed: number;
  emotionSensitivity: number;
  autoDecay: boolean;
  decayRate: number;
  lastTransition: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emotionHistorySchema = new Schema({
  emotion: { type: String, required: true },
  intensity: { type: Number, min: 0, max: 1, required: true },
  timestamp: { type: Date, default: Date.now },
  context: String
}, { _id: false });

const emotionStateSchema = new Schema<IEmotionState>(
  {
    characterId: { 
      type: String, 
      enum: ["maria", "akira"], 
      required: true 
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: Schema.Types.ObjectId, ref: "CharacterSession" },
    currentEmotion: { 
      type: String, 
      enum: ["neutral", "happy", "sad", "excited", "confused", "angry", "surprised", "encouraging"],
      default: "neutral" 
    },
    intensity: { 
      type: Number, 
      min: 0, 
      max: 1, 
      default: 0.5 
    },
    emotionHistory: [emotionHistorySchema],
    transitionSpeed: { 
      type: Number, 
      min: 0.1, 
      max: 5, 
      default: 1.0 
    },
    emotionSensitivity: { 
      type: Number, 
      min: 0, 
      max: 1, 
      default: 0.7 
    },
    autoDecay: { 
      type: Boolean, 
      default: true 
    },
    decayRate: { 
      type: Number, 
      min: 0, 
      max: 1, 
      default: 0.1 
    },
    lastTransition: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Indexes for better performance
emotionStateSchema.index({ characterId: 1, userId: 1 });
emotionStateSchema.index({ sessionId: 1 });
emotionStateSchema.index({ lastTransition: -1 });

export default model<IEmotionState>(
  "EmotionState",
  emotionStateSchema
);
