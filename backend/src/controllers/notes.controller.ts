import { Request, Response } from 'express';
import Note from '../models/note';
import Lesson from '../models/lesson';
import UserStats from '../models/userStats';

interface AuthRequest extends Request {
  user?: { userId: string };
}

// Get user notes
export const getUserNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, starred, search, language, section } = req.query;
    
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    const filter: any = { userId: req.user.userId };
    
    if (topic && topic !== 'All') filter.topic = topic;
    if (starred === 'true') filter.starred = true;
    if (language) filter.language = language;
    
    if (section === 'ai-generated') {
      filter.aiGenerated = true;
    } else if (section === 'starred') {
      filter.starred = true;
    } else if (section === 'my-notes') {
      filter.aiGenerated = false;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const notes = await Note.find(filter)
      .sort({ starred: -1, createdAt: -1 })
      .populate('lessonId', 'title difficulty');

    res.json({
      success: true,
      notes: notes,
      total: notes.length
    });
  } catch (error: any) {
    console.error('❌ Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notes'
    });
  }
};

// Create note
export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, language, topic, tags } = req.body;

    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    if (!title || !content || !language || !topic) {
      res.status(400).json({
        success: false,
        message: 'Title, content, language, and topic are required'
      });
      return;
    }

    const note = new Note({
      userId: req.user.userId,
      title: title.trim(),
      content: content.trim(),
      language,
      topic: topic.trim(),
      tags: Array.isArray(tags) ? tags : [],
      aiGenerated: false,
      starred: false
    });

    await note.save();
    await updateNotesStats(req.user.userId, language, 'created');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note: note
    });
  } catch (error: any) {
    console.error('❌ Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating note'
    });
  }
};

// Generate AI notes
export const generateLessonNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId, language } = req.body;

    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    if (!lessonId || !language) {
      res.status(400).json({
        success: false,
        message: 'Lesson ID and language are required'
      });
      return;
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
      return;
    }

    const existingNote = await Note.findOne({
      userId: req.user.userId,
      lessonId: lesson._id,
      aiGenerated: true
    });

    if (existingNote) {
      res.status(200).json({
        success: true,
        message: 'Notes already exist for this lesson',
        note: existingNote,
        alreadyExists: true
      });
      return;
    }

    let noteContent = `# ${lesson.title}\n\n`;
    noteContent += `**Difficulty:** ${lesson.difficulty} | **Time:** ${lesson.estimatedMinutes} min\n\n`;
    
    if (lesson.description) {
      noteContent += `## 📖 Overview\n${lesson.description}\n\n`;
    }

    const vocabulary: string[] = [];
    const phrases: string[] = [];
    const grammar: string[] = [];

    lesson.steps.forEach((step) => {
      if (step.type === 'vocabulary' && step.content.word) {
        let vocabLine = `• **${step.content.word}** - ${step.content.translation}`;
        if (step.content.pronunciation) {
          vocabLine += ` *(${step.content.pronunciation})*`;
        }
        vocabulary.push(vocabLine);
        
        if (step.content.example) {
          vocabulary.push(`  💡 *${step.content.example}*`);
        }
      }
      
      if (step.type === 'phrase' && step.content.phrase) {
        let phraseLine = `• **${step.content.phrase}** - ${step.content.translation}`;
        if (step.content.pronunciation) {
          phraseLine += ` *(${step.content.pronunciation})*`;
        }
        phrases.push(phraseLine);
        
        if (step.content.example) {
          phrases.push(`  💡 *${step.content.example}*`);
        }
      }
      
      if (step.type === 'grammar' && (step.content.notes || step.title)) {
        grammar.push(`• **${step.title}**: ${step.content.notes || 'Grammar concept covered'}`);
      }

      if (step.type === 'dialogue' && step.content.dialogue) {
        step.content.dialogue.forEach((line: any) => {
          if (line.text && line.translation) {
            phrases.push(`• **${line.text}** - ${line.translation}`);
          }
        });
      }
    });

    if (vocabulary.length > 0) {
      noteContent += `## 🔤 Key Vocabulary\n${vocabulary.join('\n')}\n\n`;
    }
    
    if (phrases.length > 0) {
      noteContent += `## 💬 Essential Phrases\n${phrases.join('\n')}\n\n`;
    }
    
    if (grammar.length > 0) {
      noteContent += `## 📚 Grammar Points\n${grammar.join('\n')}\n\n`;
    }

    if (lesson.culturalNotes) {
      noteContent += `## 🌍 Cultural Context\n${lesson.culturalNotes}\n\n`;
    }

    noteContent += `## 📝 Study Tips\n`;
    noteContent += `• Review vocabulary daily for better retention\n`;
    noteContent += `• Practice phrases in different contexts\n`;
    noteContent += `• Focus on pronunciation using the guides\n`;
    noteContent += `• Create your own sentences with new words\n\n`;
    noteContent += `---\n*AI-generated notes from "${lesson.title}" lesson*`;

    const note = new Note({
      userId: req.user.userId,
      title: `${lesson.title} - Study Notes`,
      content: noteContent,
      language: language,
      topic: lesson.difficulty,
      tags: ['ai-generated', 'lesson-notes', lesson.difficulty.toLowerCase()],
      aiGenerated: true,
      lessonId: lesson._id,
      starred: false
    });

    await note.save();
    await updateNotesStats(req.user.userId, language, 'generated');

    res.status(201).json({
      success: true,
      message: 'AI study notes generated successfully',
      note: note
    });
  } catch (error: any) {
    console.error('❌ Generate lesson notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating lesson notes'
    });
  }
};

// Toggle star
export const toggleNoteStar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;

    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    const note = await Note.findOne({ _id: noteId, userId: req.user.userId });
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    note.starred = !note.starred;
    await note.save();

    res.json({
      success: true,
      message: `Note ${note.starred ? 'starred' : 'unstarred'}`,
      starred: note.starred
    });
  } catch (error: any) {
    console.error('❌ Toggle star error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating note star status'
    });
  }
};

// Delete note
export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;

    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    const note = await Note.findOneAndDelete({ _id: noteId, userId: req.user.userId });
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting note'
    });
  }
};

// Get stats
export const getNotesStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    const totalNotes = await Note.countDocuments({ userId: req.user.userId });
    const aiGenerated = await Note.countDocuments({ userId: req.user.userId, aiGenerated: true });
    const starred = await Note.countDocuments({ userId: req.user.userId, starred: true });
    const myNotes = await Note.countDocuments({ userId: req.user.userId, aiGenerated: false });
    const uniqueTags = await Note.distinct('tags', { userId: req.user.userId });

    res.json({
      success: true,
      stats: {
        totalNotes,
        aiGenerated,
        starred,
        myNotes,
        uniqueTags: uniqueTags.length
      }
    });
  } catch (error: any) {
    console.error('❌ Notes stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notes statistics'
    });
  }
};

// Helper function
async function updateNotesStats(userId: string, language: string, action: 'created' | 'generated') {
  try {
    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      const defaultStudyMore = {
        notesCreated: 0, lessonSummaries: 0, articlesCompleted: 0,
        wordsLearned: 0, currentWordStreak: 0, totalReadingTime: 0
      };

      userStats = new UserStats({
        userId,
        japanese: { 
          level: 1, totalXP: 0, streak: 0, lessonsCompleted: 0, 
          averageScore: 0, timeSpent: 0, weakAreas: [], strongAreas: [],
          studyMore: defaultStudyMore
        },
        spanish: { 
          level: 1, totalXP: 0, streak: 0, lessonsCompleted: 0, 
          averageScore: 0, timeSpent: 0, weakAreas: [], strongAreas: [],
          studyMore: defaultStudyMore
        },
        preferences: { dailyGoal: 15, reminderTime: '19:00', difficultyPreference: 'adaptive' }
      });
    }

    const langStats = userStats[language as keyof typeof userStats];
    if (langStats && typeof langStats === 'object') {
      if (!langStats.studyMore) {
        langStats.studyMore = {
          notesCreated: 0, lessonSummaries: 0, articlesCompleted: 0,
          wordsLearned: 0, currentWordStreak: 0, totalReadingTime: 0
        };
      }

      if (action === 'created') {
        langStats.studyMore.notesCreated = (langStats.studyMore.notesCreated || 0) + 1;
      } else if (action === 'generated') {
        langStats.studyMore.lessonSummaries = (langStats.studyMore.lessonSummaries || 0) + 1;
      }
    }

    await userStats.save();
  } catch (error) {
    console.error('⚠️ Error updating notes stats:', error);
  }
}
