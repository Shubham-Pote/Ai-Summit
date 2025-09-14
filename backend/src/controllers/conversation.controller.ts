// controllers/conversation.controller.ts - COMPLETE VERSION
import { Request, Response } from 'express';
import Conversation from '../models/conversation';
import Message from '../models/message';
import Character from '../models/character';
import CharacterRelationship from '../models/characterRelationship';
import { characterAIService } from '../services/characterAI.service';
import { voiceConversationService } from '../services/voiceConversation.service';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const startConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { characterId, scenario = 'casual_chat', conversationType = 'text' } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Verify character exists and is unlocked
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }
    
    const relationship = await CharacterRelationship.findOne({ userId, characterId });
    if (!relationship || !relationship.isUnlocked) {
      return res.status(403).json({
        success: false,
        message: 'Character not unlocked'
      });
    }
    
    // Create new conversation
    const conversation = new Conversation({
      userId,
      characterId,
      title: `Chat with ${character.name}`,
      scenario,
      difficultyLevel: character.difficultyLevel,
      focusAreas: ['conversation'],
      conversationType,
      conversationContext: `You are chatting with ${character.name}, a ${character.age}-year-old ${character.occupation} from ${character.location}. ${character.backstory}`
    });
    
    await conversation.save();
    
    // Generate initial character message
    const initialMessage = await characterAIService.generateConversationStarter(
      characterId,
      scenario
    );
    
    // Save initial message
    const message = new Message({
      conversationId: conversation._id,
      sender: 'character',
      content: initialMessage,
      characterEmotion: 'friendly'
    });
    
    await message.save();
    
    // Update conversation
    conversation.messagesCount = 1;
    conversation.lastMessageAt = new Date();
    await conversation.save();
    
    res.json({
      success: true,
      conversation: conversation.toObject(),
      initialMessage: message.toObject()
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting conversation'
    });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // conversation id
    const { content } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    const conversation = await Conversation.findOne({ _id: id, userId }).populate('characterId');
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const relationship = await CharacterRelationship.findOne({ 
      userId, 
      characterId: conversation.characterId._id 
    });
    
    // Save user message
    const userMessage = new Message({
      conversationId: id,
      sender: 'user',
      content,
      timestamp: new Date()
    });
    await userMessage.save();
    
    // Get recent conversation history
    const recentMessages = await Message.find({ conversationId: id })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('sender content');
    
    // Generate AI response
    const startTime = Date.now();
    const aiResponse = await characterAIService.generateResponse({
      characterId: conversation.characterId._id.toString(),
      userMessage: content,
      conversationHistory: recentMessages.reverse(),
      userLevel: conversation.difficultyLevel,
      relationshipLevel: relationship?.relationshipLevel || 0
    });
    const processingTime = Date.now() - startTime;
    
    // Save character response
    const characterMessage = new Message({
      conversationId: id,
      sender: 'character',
      content: aiResponse.response,
      grammarCorrections: aiResponse.corrections,
      vocabularyHighlights: aiResponse.vocabulary,
      characterEmotion: aiResponse.emotion,
      teachingMoment: aiResponse.teachingMoment,
      timestamp: new Date(),
      processingTime
    });
    
    await characterMessage.save();
    
    // Update conversation and relationship stats
    await updateConversationStats(conversation, aiResponse, relationship);
    
    res.json({
      success: true,
      userMessage: userMessage.toObject(),
      characterMessage: characterMessage.toObject()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

export const sendVoiceMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // conversation id
    const userId = req.user?.userId;
    const audioFile = req.file;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }
    
    const conversation = await Conversation.findOne({ _id: id, userId }).populate('characterId');
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Handle voice message using the voice conversation service
    const voiceResult = await voiceConversationService.handleVoiceMessage({
      characterId: conversation.characterId._id.toString(),
      userId,
      conversationId: id,
      audioFile,
      includeAudio: true
    });
    
    // Save user message with transcription
    const userMessage = new Message({
      conversationId: id,
      sender: 'user',
      content: voiceResult.userTranscript || '',
      transcriptionAccuracy: 0.95,
      audioProcessingTime: voiceResult.processingTime,
      timestamp: new Date()
    });
    await userMessage.save();
    
    // Save character response
    const characterMessage = new Message({
      conversationId: id,
      sender: 'character',
      content: voiceResult.characterResponse,
      characterAudioUrl: voiceResult.audioUrl,
      grammarCorrections: voiceResult.corrections,
      vocabularyHighlights: voiceResult.vocabulary,
      characterEmotion: voiceResult.emotion,
      teachingMoment: voiceResult.teachingMoment,
      timestamp: new Date(),
      processingTime: voiceResult.processingTime
    });
    
    await characterMessage.save();
    
    // Update conversation type to voice or mixed
    if (conversation.conversationType === 'text') {
      conversation.conversationType = 'voice';
    } else if (conversation.conversationType !== 'voice') {
      conversation.conversationType = 'mixed';
    }
    
    // Update voice stats
    conversation.voiceStats.totalVoiceMessages += 1;
    conversation.voiceStats.averageProcessingTime = 
      (conversation.voiceStats.averageProcessingTime + voiceResult.processingTime) / 2;
    
    await conversation.save();
    
    // Update relationship stats
    const relationship = await CharacterRelationship.findOne({ 
      userId, 
      characterId: conversation.characterId._id 
    });
    
    if (relationship) {
      relationship.totalMessages += 2;
      relationship.lastInteractionAt = new Date();
      relationship.voiceInteractionStats.totalVoiceMessages += 1;
      relationship.relationshipLevel = Math.min(100, relationship.relationshipLevel + 0.5);
      await relationship.save();
    }
    
    res.json({
      success: true,
      userMessage: userMessage.toObject(),
      characterMessage: characterMessage.toObject(),
      transcription: voiceResult.userTranscript,
      audioUrl: voiceResult.audioUrl
    });
  } catch (error) {
    console.error('Error sending voice message:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing voice message'
    });
  }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const conversation = await Conversation.findOne({ _id: id, userId })
      .populate('characterId');
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const messages = await Message.find({ conversationId: id })
      .sort({ timestamp: 1 });
    
    res.json({
      success: true,
      conversation: conversation.toObject(),
      messages: messages.map(m => m.toObject())
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation'
    });
  }
};

export const getUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const conversations = await Conversation.find({ userId })
      .populate('characterId')
      .sort({ lastMessageAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Conversation.countDocuments({ userId });
    
    res.json({
      success: true,
      conversations: conversations.map(c => c.toObject()),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalConversations: total
      }
    });
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
};

export const completeConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    conversation.status = 'completed';
    conversation.completedAt = new Date();
    await conversation.save();
    
    // Update relationship stats for completing a conversation
    const relationship = await CharacterRelationship.findOne({ 
      userId, 
      characterId: conversation.characterId 
    });
    
    if (relationship) {
      relationship.totalConversations += 1;
      relationship.relationshipLevel = Math.min(100, relationship.relationshipLevel + 2); // Bonus for completing
      await relationship.save();
    }
    
    res.json({
      success: true,
      message: 'Conversation completed successfully',
      bonusXP: 10
    });
  } catch (error) {
    console.error('Error completing conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing conversation'
    });
  }
};

// Helper function
const updateConversationStats = async (conversation: any, aiResponse: any, relationship: any) => {
  conversation.messagesCount += 2;
  conversation.lastMessageAt = new Date();
  if (aiResponse.corrections && aiResponse.corrections.length > 0) {
    conversation.correctionsGiven += aiResponse.corrections.length;
  }
  await conversation.save();
  
  if (relationship) {
    relationship.totalMessages += 2;
    relationship.lastInteractionAt = new Date();
    
    if (aiResponse.vocabulary && aiResponse.vocabulary.length > 0) {
      const newVocab = aiResponse.vocabulary.map((v: any) => v.word);
      relationship.vocabularyLearned = [...new Set([...relationship.vocabularyLearned, ...newVocab])];
    }
    
    relationship.relationshipLevel = Math.min(100, relationship.relationshipLevel + 0.5);
    await relationship.save();
  }
};
