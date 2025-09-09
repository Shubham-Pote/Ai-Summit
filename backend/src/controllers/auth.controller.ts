import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import UserStats from '../models/userStats';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthRequest extends Request {
  user?: { userId: string };
}

const createDefaultUserStats = (userId: string) => {
  return new UserStats({
    userId,
    japanese: {
      level: 1, totalXP: 0, streak: 0, lessonsCompleted: 0,
      averageScore: 0, timeSpent: 0, weakAreas: [], strongAreas: []
    },
    spanish: {
      level: 1, totalXP: 0, streak: 0, lessonsCompleted: 0,
      averageScore: 0, timeSpent: 0, weakAreas: [], strongAreas: []
    },
    preferences: {
      dailyGoal: 15, reminderTime: '19:00', difficultyPreference: 'adaptive'
    }
  });
};

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, displayName } = req.body;

        // ✅ FIXED: Better validation
        if (!email || !password || !displayName) {
            res.status(400).json({ 
                success: false, 
                message: 'Email, password, and display name are required' 
            });
            return;
        }

        // ✅ FIXED: Trim and validate displayName
        const trimmedDisplayName = displayName.trim();
        if (trimmedDisplayName.length < 2) {
            res.status(400).json({ 
                success: false, 
                message: 'Display name must be at least 2 characters long' 
            });
            return;
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
            return;
        }

        // ✅ FIXED: Create user with proper field mapping
        const user = new User({
            email: email.toLowerCase(),
            password,
            displayName: trimmedDisplayName,
            currentLanguage: 'spanish'
        });

        await user.save();

        const userStats = createDefaultUserStats(user._id);
        await userStats.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                level: user.level,
                currentLanguage: user.currentLanguage
            }
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        
        // ✅ FIXED: Handle specific MongoDB errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            res.status(400).json({ 
                success: false, 
                message: `${field} already exists` 
            });
            return;
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Error creating user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
            return;
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
            return;
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                level: user.level,
                currentLanguage: user.currentLanguage
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error logging in' 
        });
    }
};

// Get Profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    const userStats = await UserStats.findOne({ userId: req.user.userId });
    
    let aggregatedStats = {
      level: 1,
      totalXP: 0,
      streak: 0,
      lessonsCompleted: 0,
      timeSpent: 0,
      averageScore: 0
    };

    if (userStats && user.currentLanguage) {
      const currentLangStats = userStats[user.currentLanguage as keyof typeof userStats];
      if (currentLangStats && typeof currentLangStats === 'object') {
        aggregatedStats = {
          level: currentLangStats.level || 1,
          totalXP: currentLangStats.totalXP || 0,
          streak: currentLangStats.streak || 0,
          lessonsCompleted: currentLangStats.lessonsCompleted || 0,
          timeSpent: Math.round((currentLangStats.timeSpent || 0) / 60),
          averageScore: currentLangStats.averageScore || 0
        };
      }
    }

    const achievements = await calculateAchievements(req.user.userId, aggregatedStats);

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio || '',
        location: user.location || '',
        avatarUrl: user.avatarUrl || '/avatars/default.jpg',
        currentLanguage: user.currentLanguage,
        joinDate: user.joinDate || user.createdAt
      },
      stats: aggregatedStats,
      achievements: achievements
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update Profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { displayName, bio, location, avatarUrl } = req.body;

    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    if (displayName && displayName.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Display name must be less than 100 characters'
      });
      return;
    }

    if (bio && bio.length > 500) {
      res.status(400).json({
        success: false,
        message: 'Bio must be less than 500 characters'
      });
      return;
    }

    if (location && location.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Location must be less than 100 characters'
      });
      return;
    }

    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim();

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        location: updatedUser.location,
        avatarUrl: updatedUser.avatarUrl,
        currentLanguage: updatedUser.currentLanguage,
        joinDate: updatedUser.joinDate
      }
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

async function calculateAchievements(userId: string, stats: any) {
  const achievements = [];

  if (stats.lessonsCompleted >= 1) {
    achievements.push({
      id: 'first_lesson',
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: 'Star',
      color: 'text-yellow-500',
      earned: true,
      earnedAt: new Date()
    });
  }

  if (stats.streak >= 3) {
    achievements.push({
      id: 'three_days',
      name: 'Getting Started',
      description: '3 day learning streak',
      icon: 'Flame',
      color: 'text-orange-500',
      earned: true,
      earnedAt: new Date()
    });
  }

  if (stats.lessonsCompleted >= 5) {
    achievements.push({
      id: 'five_lessons',
      name: 'Quick Learner',
      description: 'Complete 5 lessons',
      icon: 'BookOpen',
      color: 'text-blue-500',
      earned: true,
      earnedAt: new Date()
    });
  }

  if (stats.averageScore >= 75) {
    achievements.push({
      id: 'good_score',
      name: 'Good Student',
      description: 'Maintain 75%+ average score',
      icon: 'Award',
      color: 'text-green-500',
      earned: true,
      earnedAt: new Date()
    });
  }

  if (stats.timeSpent >= 15) {
    achievements.push({
      id: 'study_time',
      name: 'Study Time',
      description: 'Study for 15+ minutes total',
      icon: 'Clock',
      color: 'text-purple-500',
      earned: true,
      earnedAt: new Date()
    });
  }

  if (stats.streak >= 7) {
    achievements.push({
      id: 'week_streak',
      name: 'Dedicated',
      description: '7 day learning streak',
      icon: 'Flame',
      color: 'text-red-500',
      earned: true,
      earnedAt: new Date()
    });
  }

  if (stats.level >= 2) {
    achievements.push({
      id: 'level_two',
      name: 'Level Up',
      description: 'Reach level 2',
      icon: 'Trophy',
      color: 'text-gold-500',
      earned: true,
      earnedAt: new Date()
    });
  }

  return achievements;
}

// Set Language
export const setActiveLanguage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { language } = req.body;
        
        if (!['spanish', 'japanese'].includes(language)) {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid language. Must be "spanish" or "japanese"' 
            });
            return;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user!.userId, 
            { currentLanguage: language },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
            return;
        }

        res.json({
            success: true,
            message: 'Language preference updated successfully',
            currentLanguage: language,
            user: {
                id: updatedUser._id,
                displayName: updatedUser.displayName,
                currentLanguage: updatedUser.currentLanguage
            }
        });
    } catch (error) {
        console.error('Language update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating language preference' 
        });
    }
};

// Get Language Stats
export const getUserLanguageStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let userStats = await UserStats.findOne({ userId: req.user!.userId });
        
        if (!userStats) {
            userStats = createDefaultUserStats(req.user!.userId);
            await userStats.save();
        }
        
        const currentUser = await User.findById(req.user!.userId);
        
        res.json({
            success: true,
            languages: {
                japanese: {
                    level: userStats.japanese.level,
                    totalXP: userStats.japanese.totalXP,
                    streak: userStats.japanese.streak,
                    lessonsCompleted: userStats.japanese.lessonsCompleted,
                    averageScore: userStats.japanese.averageScore,
                    timeSpent: userStats.japanese.timeSpent,
                    weakAreas: userStats.japanese.weakAreas,
                    strongAreas: userStats.japanese.strongAreas
                },
                spanish: {
                    level: userStats.spanish.level,
                    totalXP: userStats.spanish.totalXP,
                    streak: userStats.spanish.streak,
                    lessonsCompleted: userStats.spanish.lessonsCompleted,
                    averageScore: userStats.spanish.averageScore,
                    timeSpent: userStats.spanish.timeSpent,
                    weakAreas: userStats.spanish.weakAreas,
                    strongAreas: userStats.spanish.strongAreas
                }
            },
            preferences: userStats.preferences,
            currentLanguage: currentUser?.currentLanguage || 'spanish'
        });
    } catch (error) {
        console.error('Language stats fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching language statistics' 
        });
    }
};

// Update Preferences
export const updateUserPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { dailyGoal, reminderTime, difficultyPreference } = req.body;

        const userStats = await UserStats.findOneAndUpdate(
            { userId: req.user!.userId },
            {
                $set: {
                    'preferences.dailyGoal': dailyGoal || 15,
                    'preferences.reminderTime': reminderTime || '19:00',
                    'preferences.difficultyPreference': difficultyPreference || 'adaptive'
                }
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: userStats.preferences
        });
    } catch (error) {
        console.error('Preferences update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating preferences'
        });
    }
};