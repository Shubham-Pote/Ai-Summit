// VRM animation tracking
import { Schema, model, Types, Document } from "mongoose";

export interface IBlendshapeState {
  [key: string]: number; // blendshape name -> weight (0-1)
}

export interface IAnimationSequence {
  name: string;
  blendshapes: IBlendshapeState[];
  duration: number;
  timing: number[];
}

export interface IAnimationState extends Document {
  characterId: string; // 'maria' | 'akira'
  userId?: Types.ObjectId;
  sessionId?: Types.ObjectId;
  enableAnimations: boolean;
  animationSpeed: number;
  gestureFrequency: number;
  emotionBlendshapes: boolean;
  lipSync: boolean;
  eyeTracking: boolean;
  blinkRate: number;
  currentBlendshapes: IBlendshapeState;
  activeAnimations: string[];
  lastGesture?: string;
  lastGestureTime?: Date;
  idleAnimationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blendshapeStateSchema = new Schema({}, { strict: false, _id: false });

const animationStateSchema = new Schema<IAnimationState>(
  {
    characterId: { 
      type: String, 
      enum: ["maria", "akira"], 
      required: true 
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: Schema.Types.ObjectId, ref: "CharacterSession" },
    enableAnimations: { 
      type: Boolean, 
      default: true 
    },
    animationSpeed: { 
      type: Number, 
      min: 0.1, 
      max: 3, 
      default: 1.0 
    },
    gestureFrequency: { 
      type: Number, 
      min: 0, 
      max: 1, 
      default: 0.5 
    },
    emotionBlendshapes: { 
      type: Boolean, 
      default: true 
    },
    lipSync: { 
      type: Boolean, 
      default: true 
    },
    eyeTracking: { 
      type: Boolean, 
      default: true 
    },
    blinkRate: { 
      type: Number, 
      min: 0.5, 
      max: 10, 
      default: 3.0 
    },
    currentBlendshapes: { 
      type: blendshapeStateSchema, 
      default: {} 
    },
    activeAnimations: [String],
    lastGesture: String,
    lastGestureTime: Date,
    idleAnimationEnabled: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Indexes for better performance
animationStateSchema.index({ characterId: 1, userId: 1 });
animationStateSchema.index({ sessionId: 1 });

export default model<IAnimationState>(
  "AnimationState",
  animationStateSchema
);
