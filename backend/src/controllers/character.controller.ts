// Character conversation APIs
import { Request, Response } from "express";
import CharacterConversation from "../models/characterConversation";
import CharacterSession from "../models/characterSession";
import { EmotionAnalysisService } from "../services/emotionAnalysis.service";
import { MultiLanguageDetectionService } from "../services/multiLanguageDetection.service";

const emotionService = new EmotionAnalysisService();
const languageService = new MultiLanguageDetectionService();

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const session = await CharacterSession.findOne({ 
      userId, 
      isActive: true 
    }).sort({ startTime: -1 });
    
    if (!session) {
      return res.status(404).json({ message: "No active session found" });
    }

    const messages = await CharacterConversation
      .find({ sessionId: session._id })
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: {
        session,
        messages: messages.reverse()
      }
    });
  } catch (error) {
    console.error('Error getting conversation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const clearHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find user's sessions and clear their conversations
    const sessions = await CharacterSession.find({ userId });
    const sessionIds = sessions.map(s => s._id);
    
    await CharacterConversation.deleteMany({ 
      sessionId: { $in: sessionIds } 
    });

    res.json({ 
      success: true,
      message: "History cleared successfully" 
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const startConversation = async (req: Request, res: Response) => {
  try {
    const { characterId = 'maria', language = 'mixed', personality = 'friendly' } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // End any existing active sessions
    await CharacterSession.updateMany(
      { userId, isActive: true },
      { isActive: false, endTime: new Date() }
    );

    // Create new session
    const session = await CharacterSession.create({
      userId,
      characterId,
      language,
      personality,
      startTime: new Date(),
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: { session }
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify session belongs to user
    const session = await CharacterSession.findOne({ 
      _id: sessionId, 
      userId, 
      isActive: true 
    });

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: "Session not found or inactive" 
      });
    }

    // Detect languages and emotions
    const detectedLanguages = await languageService.detectLanguages(message);
    const emotions = await emotionService.analyzeEmotion(message);

    // Save user message
    const userMessage = await CharacterConversation.create({
      sessionId,
      sender: 'user',
      message,
      detectedLanguages,
      emotions,
      timestamp: new Date()
    });

    // For now, return a simple response (actual AI integration can be added later)
    const characterResponse = session.characterId === 'akira' 
      ? 'こんにちは！日本語を学んでいますね。すばらしいです！'
      : '¡Hola! ¡Qué bueno verte practicando español!';

    const characterMessage = await CharacterConversation.create({
      sessionId,
      sender: 'character',
      message: characterResponse,
      detectedLanguages: [{ 
        language: session.characterId === 'akira' ? 'japanese' : 'spanish', 
        confidence: 0.95 
      }],
      emotions: [{ emotion: 'encouraging', intensity: 0.8, confidence: 0.9 }],
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: {
        userMessage,
        characterResponse: characterMessage
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const endConversation = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const session = await CharacterSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { isActive: false, endTime: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: "Session not found" 
      });
    }

    res.json({
      success: true,
      message: 'Conversation ended successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Error ending conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end conversation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
