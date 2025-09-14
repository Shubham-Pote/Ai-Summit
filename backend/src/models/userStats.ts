import mongoose from 'mongoose';

interface LanguageStats {
  level: number;
  totalXP: number;
  streak: number;
  lessonsCompleted: number;
  averageScore: number;
  timeSpent: number;
  weakAreas: string[];
  strongAreas: string[];
  studyMore: StudyMoreStats;
}

export interface IUserStats extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  spanish: LanguageStats;
  japanese: LanguageStats;
  preferences: {
    dailyGoal: number;
    reminderTime: string;
    difficultyPreference: 'adaptive' | 'challenging' | 'comfortable';
  };
  [key: string]: any;
}

interface StudyMoreStats {
  notesCreated: number;
  lessonSummaries: number;
  articlesCompleted: number;
  wordsLearned: number;
  currentWordStreak: number;
  totalReadingTime: number;
  lastWordDate?: Date;
}

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  spanish: {
    level: { type: Number, default: 1 },
    totalXP: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    weakAreas: [String],
    strongAreas: [String],
    studyMore: {
      notesCreated: { type: Number, default: 0 },
      lessonSummaries: { type: Number, default: 0 },
      articlesCompleted: { type: Number, default: 0 },
      wordsLearned: { type: Number, default: 0 },
      currentWordStreak: { type: Number, default: 0 },
      totalReadingTime: { type: Number, default: 0 },
      lastWordDate: Date
    }
  },
  japanese: {
    level: { type: Number, default: 1 },
    totalXP: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    weakAreas: [String],
    strongAreas: [String],
    studyMore: {
      notesCreated: { type: Number, default: 0 },
      lessonSummaries: { type: Number, default: 0 },
      articlesCompleted: { type: Number, default: 0 },
      wordsLearned: { type: Number, default: 0 },
      currentWordStreak: { type: Number, default: 0 },
      totalReadingTime: { type: Number, default: 0 },
      lastWordDate: Date
    }
  },
  preferences: {
    dailyGoal: { type: Number, default: 15 },
    reminderTime: { type: String, default: '19:00' },
    difficultyPreference: {
      type: String,
      enum: ['adaptive', 'challenging', 'comfortable'],
      default: 'adaptive'
    }
  }
}, { timestamps: true });

export default mongoose.model<IUserStats>('UserStats', userStatsSchema);
