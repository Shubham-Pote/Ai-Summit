// controllers/character.controller.ts - COMPLETE VERSION
import { Request, Response } from 'express';
import Character from '../models/character';
import CharacterRelationship from '../models/characterRelationship';
import User from '../models/user';

interface AuthRequest extends Request {
  user?: { userId: string; currentLanguage: string };
}

export const getCharacters = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await User.findById(userId);
    const currentLanguage = user?.currentLanguage || 'spanish';
    
    const characters = await Character.find({ 
      isActive: true,
      language: currentLanguage 
    }).sort({ difficultyLevel: 1 });
    
    const relationships = await CharacterRelationship.find({ userId });
    
    const relationshipMap = new Map();
    relationships.forEach(rel => {
      relationshipMap.set(rel.characterId.toString(), rel);
    });
    
    const charactersWithRelationships = characters.map(character => {
      const relationship = relationshipMap.get(character._id.toString());
      
      return {
        ...character.toObject(),
        relationshipLevel: relationship?.relationshipLevel || 0,
        relationshipStatus: relationship?.relationshipStatus || 'stranger',
        totalConversations: relationship?.totalConversations || 0,
        totalMessages: relationship?.totalMessages || 0,
        isUnlocked: relationship?.isUnlocked || false,
        lastInteractionAt: relationship?.lastInteractionAt || null
      };
    });
    
    res.json({
      success: true,
      characters: charactersWithRelationships,
      currentLanguage,
      message: `Showing ${currentLanguage} characters. Change language in settings to see other characters.`
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching characters'
    });
  }
};

// COMPLETE getCharacterById function
export const getCharacterById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const character = await Character.findById(id);
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }
    
    // Get user's relationship with this character
    const relationship = await CharacterRelationship.findOne({ userId, characterId: id });
    
    res.json({
      success: true,
      character: {
        ...character.toObject(),
        relationshipLevel: relationship?.relationshipLevel || 0,
        relationshipStatus: relationship?.relationshipStatus || 'stranger',
        totalConversations: relationship?.totalConversations || 0,
        totalMessages: relationship?.totalMessages || 0,
        isUnlocked: relationship?.isUnlocked || false,
        vocabularyLearned: relationship?.vocabularyLearned || [],
        grammarPointsLearned: relationship?.grammarPointsLearned || []
      }
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching character'
    });
  }
};

// COMPLETE unlockCharacter function  
export const unlockCharacter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const character = await Character.findById(id);
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }
    
    // Check if already unlocked
    let relationship = await CharacterRelationship.findOne({ userId, characterId: id });
    if (relationship && relationship.isUnlocked) {
      return res.json({
        success: true,
        message: 'Character already unlocked'
      });
    }
    
    // For free characters, auto-unlock
    if (!character.isLocked) {
      if (!relationship) {
        relationship = new CharacterRelationship({
          userId,
          characterId: id,
          isUnlocked: true,
          unlockedAt: new Date()
        });
      } else {
        relationship.isUnlocked = true;
        relationship.unlockedAt = new Date();
      }
      
      await relationship.save();
      
      return res.json({
        success: true,
        message: 'Character unlocked successfully'
      });
    }
    
    // For locked characters - check requirements
    // TODO: Add unlock requirement validation
    res.status(400).json({
      success: false,
      message: 'Character is locked. Complete more conversations to unlock.'
    });
  } catch (error) {
    console.error('Error unlocking character:', error);
    res.status(500).json({
      success: false,
      message: 'Error unlocking character'
    });
  }
};

// Auto-unlock function (same as you had)
export const autoUnlockFirstCharacter = async (userId: string, language: string) => {
  try {
    const firstCharacter = await Character.findOne({ 
      language, 
      isLocked: false,
      isActive: true 
    });
    
    if (firstCharacter) {
      const existingRelationship = await CharacterRelationship.findOne({ 
        userId, 
        characterId: firstCharacter._id 
      });
      
      if (!existingRelationship) {
        const newRelationship = new CharacterRelationship({
          userId,
          characterId: firstCharacter._id,
          isUnlocked: true,
          unlockedAt: new Date()
        });
        
        await newRelationship.save();
      }
    }
  } catch (error) {
    console.error('Error auto-unlocking character:', error);
  }
};

export const getCharacterStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const relationship = await CharacterRelationship.findOne({ userId, characterId: id });
    
    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'No relationship found with this character'
      });
    }
    
    res.json({
      success: true,
      stats: relationship.toObject()
    });
  } catch (error) {
    console.error('Error fetching character stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching character stats'
    });
  }
};
