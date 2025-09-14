import mongoose from 'mongoose';

export interface IReadingArticle extends mongoose.Document {
  title: string;
  language: 'spanish' | 'japanese';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  contentType: 'mini-stories' | 'local-news' | 'dialogue-reads' | 'idioms-action' | 'global-comparison';
  topic: string;
  content: string;
  contentWithTranslations: Array<{
    originalText: string;
    translation: string;
    type: 'sentence' | 'paragraph';
  }>;
  preview: string;
  estimatedReadTime: number;
  
  culturalContext: {
    country: string;
    backgroundInfo: string;
    culturalTips: string[];
    learningPoints: string[];
  };
  
  vocabulary: Array<{
    word: string;
    definition: string;
    pronunciation: string;
    difficulty: number;
    contextSentence: string;
  }>;
  
  grammarPoints: Array<{
    concept: string;
    explanation: string;
    examples: string[];
  }>;
  
  comprehensionQuestions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  
  interactiveElements: {
    storyChoices: Array<{
      choiceText: string;
      outcome: string;
      vocabularyIntroduced: string[];
    }>;
  };
  
  // Generation metadata
  generatedFor?: mongoose.Types.ObjectId;
  isStarterArticle: boolean;
  generationMetadata: {
    aiGenerated: boolean;
    generatedAt: Date;
    userLevel?: number;
    completedArticles?: number;
  };
  
  isActive: boolean;
}

const readingArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  language: {
    type: String,
    enum: ['spanish', 'japanese'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  contentType: {
    type: String,
    enum: ['mini-stories', 'local-news', 'dialogue-reads', 'idioms-action', 'global-comparison'],
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 3000
  },
  contentWithTranslations: [{
    originalText: {
      type: String,
      required: true
    },
    translation: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['sentence', 'paragraph'],
      default: 'sentence'
    }
  }],
  preview: {
    type: String,
    required: true,
    maxlength: 200
  },
  estimatedReadTime: {
    type: Number,
    required: true,
    min: 1,
    max: 15
  },
  
  culturalContext: {
    country: String,
    backgroundInfo: String,
    culturalTips: [String],
    learningPoints: [String]
  },
  
  vocabulary: [{
    word: String,
    definition: String,
    pronunciation: String,
    difficulty: Number,
    contextSentence: String
  }],
  
  grammarPoints: [{
    concept: String,
    explanation: String,
    examples: [String]
  }],
  
  comprehensionQuestions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  
  interactiveElements: {
    storyChoices: [{
      choiceText: String,
      outcome: String,
      vocabularyIntroduced: [String]
    }]
  },
  
  generatedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isStarterArticle: {
    type: Boolean,
    default: false
  },
  generationMetadata: {
    aiGenerated: {
      type: Boolean,
      default: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    userLevel: Number,
    completedArticles: Number
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes
readingArticleSchema.index({ language: 1, difficulty: 1 });
readingArticleSchema.index({ generatedFor: 1, createdAt: -1 });
readingArticleSchema.index({ isStarterArticle: 1, language: 1 });

export default mongoose.model<IReadingArticle>('ReadingArticle', readingArticleSchema);
