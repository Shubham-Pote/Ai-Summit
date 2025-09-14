import { Request, Response } from 'express';
import Lesson from '../models/lesson';
import Progress from '../models/progress';
import UserStats from '../models/userStats';
import User from '../models/user';
import { generateLessonContent } from '../services/gemini.service';

interface AuthRequest extends Request {
  user?: { userId: string };
}

// Define extended lesson type with progress properties
interface LessonWithProgress {
  _id: any;
  title: string;
  description: string;
  language: 'spanish' | 'japanese';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  level: number;
  estimatedMinutes: number;
  xpReward: number;
  prerequisites: any[];
  order: number;
  steps: any[];
  culturalNotes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Progress properties
  progress: number;
  completed: boolean;
  currentStep: number;
  score: number;
  timeSpent: number;
  status: string;
}

// Get lessons by language
export const getLessonsByLanguage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { language } = req.params;
    
    if (!['spanish', 'japanese'].includes(language)) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid language. Must be "spanish" or "japanese"' 
      });
      return;
    }

    const lessons = await Lesson.find({ language, isActive: true }).sort({ order: 1, level: 1 });
    
    let progress: any[] = [];
    if (req.user?.userId) {
      progress = await Progress.find({
        userId: req.user.userId,
        language: language
      });
    }

    const lessonsWithProgress: LessonWithProgress[] = lessons.map(lesson => {
      const userProgress = progress.find(p => 
        p.lessonId?.toString() === lesson._id.toString()
      );
      
      // Create a new object with both lesson data and progress data
      const lessonWithProgress: LessonWithProgress = {
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        language: lesson.language,
        difficulty: lesson.difficulty,
        level: lesson.level,
        estimatedMinutes: lesson.estimatedMinutes,
        xpReward: lesson.xpReward,
        prerequisites: lesson.prerequisites,
        order: lesson.order,
        steps: lesson.steps,
        culturalNotes: lesson.culturalNotes,
        isActive: lesson.isActive,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
        // Progress properties
        progress: userProgress?.progress || 0,
        completed: userProgress?.completed || false,
        currentStep: userProgress?.currentStep || 0,
        score: userProgress?.score || 0,
        timeSpent: userProgress?.timeSpent || 0,
        status: userProgress?.status || 'not_started'
      };
      
      return lessonWithProgress;
    });

    res.json({
      success: true,
      lessons: lessonsWithProgress,
      language: language
    });
  } catch (error: any) {
    console.error('Get lessons error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching lessons' 
    });
  }
};

// Get lesson by ID
export const getLessonById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      res.status(404).json({ 
        success: false, 
        message: 'Lesson not found' 
      });
      return;
    }

    let progress = null;
    if (req.user?.userId) {
      progress = await Progress.findOne({
        userId: req.user.userId,
        lessonId: lesson._id
      });
    }

    res.json({
      success: true,
      lesson: {
        ...lesson.toObject(),
        progress: progress ? {
          status: progress.status,
          currentStep: progress.currentStep,
          progress: progress.progress,
          completed: progress.completed,
          score: progress.score,
          timeSpent: progress.timeSpent
        } : null
      }
    });
  } catch (error: any) {
    console.error('Get lesson error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching lesson' 
    });
  }
};

// FIXED: Update lesson progress with proper XP and time tracking
export const updateLessonProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const { currentStep, totalSteps, score, timeSpent, language, mistakes, completed } = req.body;

    console.log('📝 Update progress request:', {
      lessonId, currentStep, totalSteps, score, timeSpent, language, completed, userId: req.user?.userId
    });

    if (!language || !['spanish', 'japanese'].includes(language)) {
      res.status(400).json({
        success: false,
        message: 'Valid language is required'
      });
      return;
    }

    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    // Validate lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
      return;
    }

    const actualTotalSteps = totalSteps || lesson.steps?.length || 5;
    const actualCurrentStep = Math.max(0, Math.min(currentStep || 0, actualTotalSteps));
    const actualScore = Math.max(0, Math.min(100, score || 0));
    const actualTimeSpent = Math.max(0, timeSpent || 0); // FIXED: Ensure time is always positive

    // Find existing progress
    let progress = await Progress.findOne({
      userId: req.user.userId,
      lessonId: lessonId
    });

    const isFirstCompletion = !progress || !progress.xpAwarded;
    const isCompletingNow = completed === true || (actualCurrentStep >= actualTotalSteps - 1 && actualScore > 0);

    if (!progress) {
      // Create new progress
      progress = new Progress({
        userId: req.user.userId,
        lessonId: lessonId,
        language: language,
        currentStep: actualCurrentStep,
        totalSteps: actualTotalSteps,
        score: actualScore,
        timeSpent: actualTimeSpent, // FIXED: Use validated time
        attempts: 1,
        mistakes: Array.isArray(mistakes) ? mistakes : [],
        xpAwarded: false
      });
    } else {
      // Update existing progress
      progress.currentStep = Math.max(progress.currentStep, actualCurrentStep);
      progress.totalSteps = actualTotalSteps;
      progress.score = Math.max(progress.score, actualScore); // Keep best score
      
      // FIXED: Always add time spent, don't check if > 0
      if (actualTimeSpent) {
        progress.timeSpent += actualTimeSpent;
      }
      
      if (mistakes && Array.isArray(mistakes)) {
        const uniqueMistakes = [...new Set([...progress.mistakes, ...mistakes])];
        progress.mistakes = uniqueMistakes;
      }
      
      progress.attempts += 1;
    }

    await progress.save();
    console.log('✅ Progress saved successfully');

    // Award XP only once when lesson is completed for the first time
    if (isCompletingNow && isFirstCompletion) {
      console.log('🏆 Lesson completed for first time, awarding XP...');
      
      try {
        // Mark XP as awarded to prevent duplicates
        progress.xpAwarded = true;
        await progress.save();

        // Update UserStats with XP
        await updateUserStatsWithXP(req.user.userId, language, lesson.xpReward || 50, actualTimeSpent, progress.score);
        
        console.log('✅ XP awarded successfully:', lesson.xpReward || 50);
      } catch (statsError: any) {
        console.error('⚠️ Stats update error:', statsError);
      }
    } else if (!isCompletingNow && actualTimeSpent > 0) {
      // FIXED: Update time spent even if lesson not completed
      try {
        await updateTimeSpentOnly(req.user.userId, language, actualTimeSpent);
        console.log('⏱️ Time updated:', actualTimeSpent);
      } catch (timeError: any) {
        console.error('⚠️ Time update error:', timeError);
      }
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress: {
        currentStep: progress.currentStep,
        totalSteps: progress.totalSteps,
        status: progress.status,
        score: progress.score,
        timeSpent: progress.timeSpent,
        attempts: progress.attempts,
        progress: progress.progress,
        completed: progress.completed,
        xpAwarded: isCompletingNow && isFirstCompletion ? lesson.xpReward || 50 : 0
      }
    });

  } catch (error: any) {
    console.error('❌ Update progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// FIXED: Helper function to update only time spent
async function updateTimeSpentOnly(userId: string, language: string, timeSpent: number) {
  let userStats = await UserStats.findOne({ userId });
  
  if (!userStats) {
    userStats = new UserStats({
      userId,
      japanese: { level: 1, totalXP: 0, streak: 0, lessonsCompleted: 0, averageScore: 0, timeSpent: 0, weakAreas: [], strongAreas: [] },
      spanish: { level: 1, totalXP: 0, streak: 0, lessonsCompleted: 0, averageScore: 0, timeSpent: 0, weakAreas: [], strongAreas: [] },
      preferences: { dailyGoal: 15, reminderTime: '19:00', difficultyPreference: 'adaptive' }
    });
  }

  const langStats = userStats[language as keyof typeof userStats];
  if (langStats && typeof langStats === 'object') {
    langStats.timeSpent = (langStats.timeSpent || 0) + timeSpent;
    await userStats.save();
  }
}

// FIXED: Helper function to update user stats with proper level calculation and streak
async function updateUserStatsWithXP(userId: string, language: string, xpReward: number, timeSpent: number, score: number) {
  let userStats = await UserStats.findOne({ userId });
  
  if (!userStats) {
    userStats = new UserStats({
      userId,
      japanese: { level: 1, totalXP: 0, streak: 0, lessonsCompleted: 0, averageScore: 0, timeSpent: 0, weakAreas: [], strongAreas: [] },
      spanish: { level: 1, totalXP: 0, streak: 0, lessonsCompleted: 0, averageScore: 0, timeSpent: 0, weakAreas: [], strongAreas: [] },
      preferences: { dailyGoal: 15, reminderTime: '19:00', difficultyPreference: 'adaptive' }
    });
  }

  const langStats = userStats[language as keyof typeof userStats];
  if (langStats && typeof langStats === 'object') {
    // Award XP and update lesson count
    langStats.totalXP = (langStats.totalXP || 0) + xpReward;
    langStats.lessonsCompleted = (langStats.lessonsCompleted || 0) + 1;
    langStats.timeSpent = (langStats.timeSpent || 0) + timeSpent;
    
    // FIXED: Proper average score calculation
    const completedCount = langStats.lessonsCompleted;
    if (completedCount === 1) {
      langStats.averageScore = score;
    } else {
      const oldAvg = langStats.averageScore || 0;
      langStats.averageScore = Math.round(((oldAvg * (completedCount - 1)) + score) / completedCount);
    }
    
    // Level calculation
    langStats.level = Math.max(1, Math.floor(langStats.totalXP / 100) + 1);

    // FIXED: Day streak calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check completed lessons for today and yesterday
    const completedToday = await Progress.countDocuments({
      userId,
      language,
      status: { $in: ['completed', 'mastered'] },
      completedAt: { 
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const completedYesterday = await Progress.countDocuments({
      userId,
      language,
      status: { $in: ['completed', 'mastered'] },
      completedAt: { 
        $gte: yesterday,
        $lt: today
      }
    });

    // Update streak only if this is the first lesson completed today
    if (completedToday === 1) {
      if (completedYesterday > 0) {
        // Continue streak
        langStats.streak = (langStats.streak || 0) + 1;
      } else {
        // Start new streak
        langStats.streak = 1;
      }
    }

    await userStats.save();
    console.log('✅ User stats updated:', {
      language,
      totalXP: langStats.totalXP,
      level: langStats.level,
      lessonsCompleted: langStats.lessonsCompleted,
      streak: langStats.streak,
      averageScore: langStats.averageScore
    });
  }
}

// FIXED: Proper streak calculation function
async function updateStreak(userId: string, language: string, langStats: any) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if user completed any lesson today
  const completedToday = await Progress.countDocuments({
    userId,
    language,
    status: { $in: ['completed', 'mastered'] },
    completedAt: { 
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  // Check if user completed any lesson yesterday
  const completedYesterday = await Progress.countDocuments({
    userId,
    language,
    status: { $in: ['completed', 'mastered'] },
    completedAt: { 
      $gte: yesterday,
      $lt: today
    }
  });

  if (completedToday === 1) { // First lesson completed today
    if (completedYesterday > 0) {
      // Continue streak
      langStats.streak = (langStats.streak || 0) + 1;
    } else {
      // Start new streak
      langStats.streak = 1;
    }
  }
  // If this is not the first lesson today, don't change streak
}

// Get user dashboard with accurate data
export const getUserDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { language } = req.params;

    if (!['spanish', 'japanese'].includes(language)) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid language. Must be "spanish" or "japanese"' 
      });
      return;
    }

    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    console.log(`📊 Getting dashboard for language: ${language}, user: ${req.user.userId}`);

    // Get or create user stats
    let userStats = await UserStats.findOne({ userId: req.user.userId });
    
    if (!userStats) {
      console.log('Creating new user stats...');
      userStats = new UserStats({
        userId: req.user.userId,
        japanese: { level: 1, totalXP: 0, streak: 0, lessonsCompleted: 0, averageScore: 0, timeSpent: 0, weakAreas: [], strongAreas: [] },
        spanish: { level: 1, totalXP: 0, streak: 0, lessonsCompleted: 0, averageScore: 0, timeSpent: 0, weakAreas: [], strongAreas: [] },
        preferences: { dailyGoal: 15, reminderTime: '19:00', difficultyPreference: 'adaptive' }
      });
      await userStats.save();
    }

    const langStats = userStats[language as keyof typeof userStats];

    // Get recent progress
    const recentProgress = await Progress.find({
      userId: req.user.userId,
      language: language,
      status: { $ne: 'not_started' }
    })
    .sort({ lastAccessed: -1 })
    .limit(5)
    .populate('lessonId', 'title difficulty');

    // Get lesson counts
    const totalLessons = await Lesson.countDocuments({ language, isActive: true });
    const completedLessons = await Progress.countDocuments({
      userId: req.user.userId,
      language: language,
      status: { $in: ['completed', 'mastered'] }
    });

    // FIXED: Build dashboard response with corrected level calculation
    const currentLevel = langStats?.level || 1;
    const currentXP = langStats?.totalXP || 0;
    
    // FIXED: Level calculation for display
    const actualLevel = Math.max(1, Math.floor(currentXP / 100) + 1);
    const xpForCurrentLevel = (actualLevel - 1) * 100;
    const xpForNextLevel = actualLevel * 100;
    const xpProgress = Math.max(0, currentXP - xpForCurrentLevel);
    const xpNeededForNext = Math.max(0, xpForNextLevel - currentXP);

    const dashboardResponse = {
      success: true,
      dashboard: {
        language: language,
        level: actualLevel, // FIXED: Use recalculated level
        totalXP: currentXP,
        xpForNextLevel: xpForNextLevel,
        xpProgress: xpProgress,
        xpNeededForNext: xpNeededForNext,
        currentStreak: langStats?.streak || 0,
        completedLessons: completedLessons,
        totalLessons: totalLessons,
        timeSpent: Math.round((langStats?.timeSpent || 0) / 60), // FIXED: Convert to minutes and round
        averageScore: langStats?.averageScore || 0,
        dailyGoal: userStats.preferences?.dailyGoal || 15,
        recentLessons: recentProgress.map(p => ({
          title: (p.lessonId as any)?.title || 'Lesson',
          difficulty: (p.lessonId as any)?.difficulty || 'Beginner',
          timeSpent: Math.round((p.timeSpent || 0) / 60), // FIXED: Convert to minutes
          progress: p.progress || 0,
          completed: p.completed || false,
          score: p.score || 0
        }))
      }
    };

    console.log('✅ Dashboard response prepared for user:', req.user.userId);
    res.json(dashboardResponse);
    
  } catch (error: any) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
};

// ✅ FIXED: Generate lesson content controller
export const generateLessonContentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language, topic, difficulty, lessonType, generateAudio } = req.body;

    console.log('🎯 Lesson generation request:', { language, topic, difficulty, lessonType });

    // Validate required parameters
    if (!language || !['spanish', 'japanese'].includes(language)) {
      res.status(400).json({ 
        success: false, 
        message: 'Valid language is required. Must be "spanish" or "japanese"' 
      });
      return;
    }

    if (!topic || topic.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
      return;
    }

    if (!difficulty || !['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
      res.status(400).json({
        success: false,
        message: 'Valid difficulty is required. Must be "Beginner", "Intermediate", or "Advanced"'
      });
      return;
    }

    // Generate lesson content using the fixed AI service
    console.log('🤖 Calling AI service...');
    const lessonData = await generateLessonContent({
      language: language as 'spanish' | 'japanese',
      lessonType: lessonType || 'practice',
      difficulty,
      topic: topic.trim(),
      generateAudio: generateAudio || false
    });

    console.log('✅ AI generation successful, creating lesson...');

    // Create and save the lesson
    const lesson = new Lesson(lessonData);
    await lesson.save();

    console.log('✅ Lesson saved to database with ID:', lesson._id);

    res.status(201).json({
      success: true,
      message: 'Lesson content generated successfully',
      lesson: lesson,
      debug: {
        aiGenerated: true,
        stepsGenerated: lessonData.steps?.length || 0,
        hasRealContent: lessonData.steps?.some((step: any) => 
          step.content && 
          step.content.word !== 'Example' && 
          step.content.phrase !== 'Example phrase'
        ) || false
      }
    });

  } catch (error: any) {
    console.error('❌ Lesson generation failed:', error);
    
    // Don't use fallback - let it fail properly so we can debug
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate lesson content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      debug: {
        timestamp: new Date().toISOString(),
        endpoint: 'generateLessonContent'
      }
    });
  }
};
