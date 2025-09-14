import mongoose from 'mongoose';

export interface IProgress extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  language: 'japanese' | 'spanish';
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  currentStep: number;
  totalSteps: number;
  score: number;
  timeSpent: number;
  attempts: number;
  mistakes: string[];
  lastAccessed: Date;
  completedAt?: Date;
  xpAwarded: boolean; // NEW: Track if XP has been awarded
  createdAt?: Date;
  updatedAt?: Date;
  
  progress: number;
  completed: boolean;
}

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  language: {
    type: String,
    enum: ['japanese', 'spanish'],
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'mastered'],
    default: 'not_started'
  },
  currentStep: { 
    type: Number, 
    default: 0,
    min: 0
  },
  totalSteps: {
    type: Number,
    default: 5,
    min: 1
  },
  score: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  timeSpent: { 
    type: Number, 
    default: 0,
    min: 0
  },
  attempts: { 
    type: Number, 
    default: 1,
    min: 1
  },
  mistakes: {
    type: [String],
    default: []
  },
  lastAccessed: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: {
    type: Date
  },
  xpAwarded: { // NEW: Prevent duplicate XP awards
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Virtual for progress percentage
progressSchema.virtual('progress').get(function() {
  return this.totalSteps > 0 ? Math.round((this.currentStep / this.totalSteps) * 100) : 0;
});

// Virtual for completed status
progressSchema.virtual('completed').get(function() {
  return this.status === 'completed' || this.status === 'mastered';
});

progressSchema.set('toJSON', { virtuals: true });
progressSchema.set('toObject', { virtuals: true });

// Compound indexes
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ userId: 1, language: 1 });

// Pre-save middleware
progressSchema.pre('save', function(next) {
  const wasCompleted = this.status === 'completed' || this.status === 'mastered';
  
  // Update status based on progress
  if (this.currentStep >= this.totalSteps - 1 && this.score > 0) {
    this.status = this.score >= 90 ? 'mastered' : 'completed';
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else if (this.currentStep > 0) {
    this.status = 'in_progress';
  }
  
  this.lastAccessed = new Date();
  next();
});

export default mongoose.model<IProgress>('Progress', progressSchema);
