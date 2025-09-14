// controllers/languageSelection.controller.ts
import { Request, Response } from 'express';
import User from '../models/user';

interface AuthRequest extends Request {
  user?: { userId: string; currentLanguage: string };
}

export const selectLanguageForCharacters = async (req: AuthRequest, res: Response) => {
  try {
    const { language } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    if (!['spanish', 'japanese'].includes(language)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid language. Must be "spanish" or "japanese"' 
      });
    }

    // Update user's current language
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { currentLanguage: language },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: `Language set to ${language}. You can now chat with ${language} characters!`,
      currentLanguage: language,
      availableCharacters: language === 'spanish' ? ['friendly_spanish_character'] : ['friendly_japanese_character']
    });
  } catch (error) {
    console.error('Language selection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating language preference' 
    });
  }
};

export const getAvailableLanguages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await User.findById(userId).select('currentLanguage');
    
    res.json({
      success: true,
      languages: [
        {
          code: 'spanish',
          name: 'Spanish',
          flag: '🇪🇸',
          description: 'Learn Spanish with native speakers',
          characterCount: 1, // Will increase as you add more
          isSelected: user?.currentLanguage === 'spanish'
        },
        {
          code: 'japanese', 
          name: 'Japanese',
          flag: '🇯🇵',
          description: 'Learn Japanese with native speakers',
          characterCount: 1, // Will increase as you add more
          isSelected: user?.currentLanguage === 'japanese'
        }
      ],
      currentLanguage: user?.currentLanguage || 'spanish'
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available languages'
    });
  }
};
