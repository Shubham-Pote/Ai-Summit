import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ReadingArticle from '../models/readingArticle';
import ReadingProgress from '../models/readingProgress';
import { AIArticleService } from '../services/aiArticleGeneration.service';
import UserStats from '../models/userStats';

interface AuthRequest extends Request {
  user?: { userId: string; level?: number; currentLanguage?: string };
}

// Get all articles for user (completed + current)
export const getUserArticles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { language } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Get all user's progress for this language
    const allProgress = await ReadingProgress.find({
      userId,
      language
    })
    .populate('articleId')
    .sort({ createdAt: -1 }); // Newest first

    // Separate completed and current articles
    const completedArticles = allProgress.filter(p => p.status === 'completed');
    const currentArticle = allProgress.find(p => p.status === 'not_started' || p.status === 'reading');

    res.json({
      success: true,
      currentArticle: currentArticle ? {
        article: currentArticle.articleId,
        progress: {
          status: currentArticle.status,
          timeSpent: currentArticle.timeSpent,
          startedAt: currentArticle.startedAt,
          quizScore: currentArticle.quizScore
        }
      } : null,
      completedArticles: completedArticles.map(p => ({
        article: p.articleId,
        progress: {
          status: p.status,
          timeSpent: p.timeSpent,
          completedAt: p.completedAt,
          quizScore: p.quizScore,
          quizAttempts: p.quizAttempts
        }
      })),
      totalCompleted: completedArticles.length
    });

  } catch (error: any) {
    console.error('❌ Get user articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get articles',
      error: error.message
    });
  }
};

// Get specific article by ID (for review)
export const getArticleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const article = await ReadingArticle.findById(articleId);
    const progress = await ReadingProgress.findOne({
      userId,
      articleId
    });

    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    res.json({
      success: true,
      article,
      progress
    });

  } catch (error: any) {
    console.error('❌ Get article by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get article'
    });
  }
};

// Get current article for user (starter or next)
export const getCurrentArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { language } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Check if user has any article in progress
    const currentProgress = await ReadingProgress.findOne({
      userId,
      language,
      status: { $in: ['not_started', 'reading'] }
    }).populate('articleId');

    if (currentProgress && currentProgress.articleId) {
      res.json({
        success: true,
        article: currentProgress.articleId,
        progress: {
          status: currentProgress.status,
          timeSpent: currentProgress.timeSpent,
          startedAt: currentProgress.startedAt
        },
        isNew: false
      });
      return;
    }

    // Check if user needs a starter article
    const completedCount = await ReadingProgress.countDocuments({
      userId,
      language,
      status: 'completed'
    });

    let article;
    
    if (completedCount === 0) {
      // Generate starter article
      console.log(`🌟 Generating starter article for new user: ${userId}`);
      const starterData = await AIArticleService.generateStarterArticle(language as 'spanish' | 'japanese');
      
      article = new ReadingArticle({
        ...starterData,
        generatedFor: userId,
        isStarterArticle: true,
        generationMetadata: {
          aiGenerated: true,
          generatedAt: new Date(),
          userLevel: req.user?.level || 1,
          completedArticles: 0
        }
      });
    } else {
      // Generate next personalized article
      console.log(`🎯 Generating personalized article for user: ${userId}, completed: ${completedCount}`);
      
      const lastArticle = await ReadingProgress.findOne({
        userId,
        language,
        status: 'completed'
      }).sort({ completedAt: -1 }).populate('articleId');

      const personalizedData = await AIArticleService.generatePersonalizedArticle({
        language: language as 'spanish' | 'japanese',
        userLevel: req.user?.level || 1,
        completedArticles: completedCount,
        lastTopic: (lastArticle?.articleId as any)?.topic,
        preferredContentType: undefined
      });
      
      article = new ReadingArticle({
        ...personalizedData,
        generatedFor: userId,
        isStarterArticle: false,
        generationMetadata: {
          aiGenerated: true,
          generatedAt: new Date(),
          userLevel: req.user?.level || 1,
          completedArticles: completedCount
        }
      });
    }

    await article.save();

    // Create reading progress
    const progress = new ReadingProgress({
      userId,
      articleId: article._id,
      language,
      status: 'not_started',
      startedAt: new Date()
    });

    await progress.save();

    res.json({
      success: true,
      article,
      progress: {
        status: 'not_started',
        timeSpent: 0,
        startedAt: new Date()
      },
      isNew: true,
      isStarter: article.isStarterArticle
    });

  } catch (error: any) {
    console.error('❌ Get current article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current article',
      error: error.message
    });
  }
};

// Start reading an article
export const startReading = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, articleId },
      { status: 'reading', startedAt: new Date() },
      { new: true }
    );

    if (!progress) {
      res.status(404).json({
        success: false,
        message: 'Reading progress not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Reading started',
      progress: {
        status: progress.status,
        startedAt: progress.startedAt,
        timeSpent: progress.timeSpent
      }
    });
  } catch (error: any) {
    console.error('❌ Start reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start reading'
    });
  }
};

// Complete article reading and submit quiz
export const completeArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { articleId } = req.params;
    const { answers, timeSpent = 0 } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const article = await ReadingArticle.findById(articleId);
    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    // Calculate quiz score
    let correctAnswers = 0;
    const totalQuestions = article.comprehensionQuestions.length;

    answers.forEach((userAnswer: number, index: number) => {
      if (article.comprehensionQuestions[index]?.correctAnswer === userAnswer) {
        correctAnswers++;
      }
    });

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;
    const passed = score >= 70;

    // Update reading progress - only mark completed if passed
    if (passed) {
      await ReadingProgress.findOneAndUpdate(
        { userId, articleId },
        {
          status: 'completed',
          completedAt: new Date(),
          timeSpent: timeSpent,
          quizScore: score,
          quizAttempts: 1
        }
      );

      // Update user stats
      await updateReadingStats(userId, article.language, 'completed');
    } else {
      // If failed, just update the quiz score but keep status as reading
      await ReadingProgress.findOneAndUpdate(
        { userId, articleId },
        {
          timeSpent: timeSpent,
          quizScore: score,
          quizAttempts: 1
        }
      );
    }

    res.json({
      success: true,
      results: {
        score,
        correctAnswers,
        totalQuestions,
        passed,
        timeSpent,
        canGenerateNext: passed
      },
      message: passed ? 'Great job! You can now generate your next article!' : 'Keep practicing! Try again to unlock the next article.'
    });
  } catch (error: any) {
    console.error('❌ Complete article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete article'
    });
  }
};

// Generate next article (only after completing current one)
export const generateNextArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { language } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Check if user can generate next article (completed previous one)
    const lastProgress = await ReadingProgress.findOne({
      userId,
      language
    }).sort({ createdAt: -1 });

    if (!lastProgress || lastProgress.status !== 'completed' || (lastProgress.quizScore || 0) < 70) {
      res.status(400).json({
        success: false,
        message: 'Complete your current article with a passing score first'
      });
      return;
    }

    // Check if already has a new article
    const existingProgress = await ReadingProgress.findOne({
      userId,
      language,
      status: { $in: ['not_started', 'reading'] }
    });

    if (existingProgress) {
      res.status(400).json({
        success: false,
        message: 'You already have an article in progress'
      });
      return;
    }

    // Generate next article
    const completedCount = await ReadingProgress.countDocuments({
      userId,
      language,
      status: 'completed'
    });

    const lastArticle = await ReadingProgress.findOne({
      userId,
      language,
      status: 'completed'
    }).sort({ completedAt: -1 }).populate('articleId');

    const personalizedData = await AIArticleService.generatePersonalizedArticle({
      language: language as 'spanish' | 'japanese',
      userLevel: req.user?.level || 1,
      completedArticles: completedCount,
      lastTopic: (lastArticle?.articleId as any)?.topic
    });

    const article = new ReadingArticle({
      ...personalizedData,
      generatedFor: userId,
      isStarterArticle: false,
      generationMetadata: {
        aiGenerated: true,
        generatedAt: new Date(),
        userLevel: req.user?.level || 1,
        completedArticles: completedCount
      }
    });

    await article.save();

    // Create new progress
    const progress = new ReadingProgress({
      userId,
      articleId: article._id,
      language,
      status: 'not_started',
      startedAt: new Date()
    });

    await progress.save();

    res.json({
      success: true,
      message: 'New personalized article generated!',
      article,
      progress: {
        status: 'not_started',
        timeSpent: 0,
        startedAt: new Date()
      }
    });
  } catch (error: any) {
    console.error('❌ Generate next article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate next article',
      error: error.message
    });
  }
};

// Get user's reading statistics
export const getReadingStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { language } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const totalCompleted = await ReadingProgress.countDocuments({
      userId,
      language,
      status: 'completed'
    });

    const avgScore = await ReadingProgress.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          language,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$quizScore' },
          totalTime: { $sum: '$timeSpent' }
        }
      }
    ]);

    const currentStreak = await calculateReadingStreak(userId, language);

    res.json({
      success: true,
      stats: {
        totalCompleted,
        averageScore: avgScore[0]?.avgScore ? Math.round(avgScore[0].avgScore) : 0,
        totalTimeSpent: Math.round((avgScore[0]?.totalTime || 0) / 60), // minutes
        currentStreak,
        language
      }
    });
  } catch (error: any) {
    console.error('❌ Get reading stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reading statistics'
    });
  }
};

// Helper functions
async function updateReadingStats(userId: string, language: string, action: string) {
  try {
    const userStats = await UserStats.findOne({ userId });
    if (userStats && userStats[language as keyof typeof userStats]) {
      const langStats = userStats[language as keyof typeof userStats] as any;
      if (langStats.studyMore) {
        langStats.studyMore.articlesCompleted = (langStats.studyMore.articlesCompleted || 0) + 1;
        await userStats.save();
      }
    }
  } catch (error) {
    console.error('Error updating reading stats:', error);
  }
}

async function calculateReadingStreak(userId: string, language: string): Promise<number> {
  const recentProgress = await ReadingProgress.find({
    userId,
    language,
    status: 'completed'
  }).sort({ completedAt: -1 }).limit(10);

  let streak = 0;
  let lastDate: Date | null = null;

  for (const progress of recentProgress) {
    if (!progress.completedAt) continue;
    
    const currentDate = new Date(progress.completedAt);
    currentDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      streak = 1;
      lastDate = currentDate;
    } else {
      const daysDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        streak++;
        lastDate = currentDate;
      } else {
        break;
      }
    }
  }

  return streak;
}
