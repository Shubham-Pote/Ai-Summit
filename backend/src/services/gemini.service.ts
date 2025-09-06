import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

console.log('🔥 GEMINI SERVICE LOADING...');

dotenv.config();

console.log('🔑 API Key exists:', !!process.env.GEMINI_API_KEY);
console.log('🔑 API Key preview:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...' || 'MISSING');

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

console.log('✅ Gemini AI initialized successfully');

// ✅ ENHANCED: JSON extraction with better error handling
function extractJSON(text: string): any {
    try {
        console.log('🔍 Extracting JSON from response...');
        console.log('📝 Response length:', text.length);
        console.log('📝 First 200 chars:', text.substring(0, 200));
        
        // Remove markdown code blocks properly
        let cleanText = text.replace(/``````/g, '').trim();
        
        // Find JSON object boundaries
        const jsonStart = cleanText.indexOf('{');
        const jsonEnd = cleanText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
            console.log('📤 Extracted JSON preview:', jsonStr.substring(0, 200));
            
            const parsed = JSON.parse(jsonStr);
            console.log('✅ JSON extraction successful');
            console.log('📊 Steps found:', parsed.steps?.length || 0);
            return parsed;
        }
        
        // Try parsing the whole cleaned text
        const parsed = JSON.parse(cleanText);
        console.log('✅ Direct JSON parsing successful');
        return parsed;
        
    } catch (error) {
        console.error('❌ Failed to extract JSON:', error);
        console.log('🔍 Problematic text:', text.substring(0, 500));
        throw new Error('Invalid JSON response from AI');
    }
}

// ✅ NEW: Validation function for lesson content
const validateLessonContent = (lesson: any, minSteps: number) => {
    console.log('🔍 Validating lesson content...');
    
    if (!lesson.steps || !Array.isArray(lesson.steps) || lesson.steps.length < minSteps) {
        throw new Error(`Lesson must have at least ${minSteps} steps, got ${lesson.steps?.length || 0}`);
    }
    
    let dialogueSteps = 0;
    let practiceSteps = 0;
    
    lesson.steps.forEach((step: any, index: number) => {
        console.log(`🔍 Validating step ${index + 1}: ${step.type}`);
        
        if (step.type === 'dialogue') {
            dialogueSteps++;
            if (!step.content?.dialogue || !Array.isArray(step.content.dialogue) || step.content.dialogue.length < 2) {
                throw new Error(`Dialogue step ${index + 1} must have at least 2 dialogue exchanges, got ${step.content?.dialogue?.length || 0}`);
            }
            
            // Validate each dialogue exchange has required fields
            step.content.dialogue.forEach((exchange: any, exchIndex: number) => {
                if (!exchange.speaker || !exchange.text || !exchange.translation) {
                    throw new Error(`Dialogue exchange ${exchIndex + 1} in step ${index + 1} missing required fields`);
                }
            });
        }
        
        if (step.type === 'practice') {
            practiceSteps++;
            if (!step.content?.exercises || !Array.isArray(step.content.exercises) || step.content.exercises.length < 2) {
                throw new Error(`Practice step ${index + 1} must have at least 2 exercises, got ${step.content?.exercises?.length || 0}`);
            }
            
            // Validate each exercise has required fields
            step.content.exercises.forEach((exercise: any, exIndex: number) => {
                if (!exercise.question || !exercise.type) {
                    throw new Error(`Exercise ${exIndex + 1} in step ${index + 1} missing required fields`);
                }
                
                if (exercise.type === 'multiple_choice') {
                    if (!exercise.options || !Array.isArray(exercise.options) || exercise.options.length < 3) {
                        throw new Error(`Multiple choice exercise ${exIndex + 1} needs at least 3 options`);
                    }
                    if (!exercise.correctAnswer || !exercise.explanation) {
                        throw new Error(`Multiple choice exercise ${exIndex + 1} missing correctAnswer or explanation`);
                    }
                }
                
                if (exercise.type === 'fill_in_the_blank') {
                    if (!exercise.answer || !exercise.explanation) {
                        throw new Error(`Fill in the blank exercise ${exIndex + 1} missing answer or explanation`);
                    }
                }
            });
        }
    });
    
    // Ensure we have at least one dialogue and one practice step
    if (dialogueSteps === 0) {
        throw new Error('Lesson must have at least 1 dialogue step');
    }
    if (practiceSteps === 0) {
        throw new Error('Lesson must have at least 1 practice step');
    }
    
    console.log(`✅ Validation passed: ${lesson.steps.length} steps, ${dialogueSteps} dialogue, ${practiceSteps} practice`);
    return lesson;
};

const ensureAudioDirectory = (language: string): string => {
    const audioDir = path.join(process.cwd(), 'public', 'audio', language);
    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
    }
    return audioDir;
};

const generateAudioFile = async (
    text: string, 
    language: string, 
    stepIndex: number, 
    topic: string
): Promise<string> => {
    try {
        const audioDir = ensureAudioDirectory(language);
        const fileName = `${topic.replace(/\s+/g, '-').toLowerCase()}-step-${stepIndex}-${Date.now()}.mp3`;
        const audioPath = `/audio/${language}/${fileName}`;
        
        console.log(`🎵 Creating audio marker for: "${text}"`);
        const ttsMarker = `tts:${encodeURIComponent(text)}:${language}`;
        console.log(`🔊 Audio marker created: ${ttsMarker}`);
        
        return ttsMarker;
        
    } catch (error) {
        console.error('❌ Failed to generate audio:', error);
        return `tts:${encodeURIComponent(text)}:${language}`;
    }
};

// ✅ ENHANCED: Main lesson generation with comprehensive prompts and validation
export const generateLessonContent = async (params: {
    language: 'spanish' | 'japanese';
    lessonType: string;
    difficulty: string;
    topic: string;
    generateAudio?: boolean;
}) => {
    const { language, lessonType, difficulty, topic, generateAudio = false } = params;
    
    console.log('🎯 Starting ENHANCED lesson generation with params:', params);
    
    const minSteps = 6;
    const maxSteps = 10;
    
    const languageInstructions = {
        spanish: `Generate a comprehensive Spanish language lesson with rich, complete content:
- Include actual Spanish words with proper accent marks and authentic pronunciation
- Provide detailed cultural context from Spanish-speaking countries
- Create engaging dialogue conversations with real-world scenarios (minimum 3 exchanges per dialogue)
- Design meaningful practice exercises with clear questions, multiple options, and detailed explanations`,
        japanese: `Generate a comprehensive Japanese language lesson with rich, complete content:
- Include actual Japanese text in hiragana, katakana, and kanji as appropriate
- Provide romaji pronunciation and cultural context relevant to Japan
- Create engaging dialogue conversations with real-world scenarios (minimum 3 exchanges per dialogue)
- Design meaningful practice exercises with clear questions, multiple options, and detailed explanations`
    };

    const enhancedPrompt = `${languageInstructions[language]}

Topic: ${topic}
Type: ${lessonType}
Difficulty: ${difficulty}

ABSOLUTE REQUIREMENTS - THESE ARE MANDATORY:
1. Generate between ${minSteps} and ${maxSteps} steps for comprehensive learning
2. Title and description MUST be in English only
3. EVERY step must have complete, real content - NO EMPTY ARRAYS OR PLACEHOLDER TEXT
4. For dialogue steps: MUST include minimum 3 realistic dialogue exchanges between speakers
5. For practice steps: MUST include minimum 3 exercises with complete questions, options, and detailed explanations
6. All ${language} text must be authentic and accurate - no placeholder or example text

REQUIRED STEP DISTRIBUTION:
- 2-3 vocabulary steps with real ${language} words and detailed explanations
- 2-3 phrase steps with practical expressions and usage contexts
- 1-2 dialogue steps with COMPLETE conversations (minimum 3 exchanges each)
- 1-2 practice steps with COMPLETE exercises (minimum 3 exercises each with full content)

Generate this EXACT JSON structure - DO NOT modify field names or structure:
{
  "title": "Engaging English lesson title about ${topic}",
  "description": "Detailed English description explaining what students will learn about ${topic}",
  "language": "${language}",
  "difficulty": "${difficulty}",
  "estimatedMinutes": 30,
  "level": ${difficulty === 'Beginner' ? 1 : difficulty === 'Intermediate' ? 2 : 3},
  "xpReward": 50,
  "order": 0,
  "steps": [
    {
      "stepNumber": 1,
      "type": "vocabulary",
      "title": "Essential Vocabulary",
      "content": {
        "word": "authentic ${language} word - NOT placeholder",
        "translation": "accurate English translation",
        "pronunciation": "detailed pronunciation guide",
        "example": "realistic example sentence in ${language}",
        "notes": "helpful cultural and usage notes"
      }
    },
    {
      "stepNumber": 2,
      "type": "vocabulary", 
      "title": "Additional Vocabulary",
      "content": {
        "word": "different authentic ${language} word",
        "translation": "accurate English translation",
        "pronunciation": "detailed pronunciation guide", 
        "example": "realistic example sentence in ${language}",
        "notes": "helpful cultural and usage notes"
      }
    },
    {
      "stepNumber": 3,
      "type": "phrase",
      "title": "Common Phrases",
      "content": {
        "phrase": "authentic ${language} phrase",
        "translation": "accurate English translation",
        "pronunciation": "detailed pronunciation guide",
        "example": "realistic usage example in ${language}",
        "notes": "when and how to use this phrase appropriately"
      }
    },
    {
      "stepNumber": 4,
      "type": "dialogue",
      "title": "Real Conversation Practice", 
      "content": {
        "dialogue": [
          {
            "speaker": "Person A",
            "text": "authentic ${language} dialogue line",
            "translation": "accurate English translation",
            "pronunciation": "clear pronunciation guide"
          },
          {
            "speaker": "Person B",
            "text": "natural ${language} response",
            "translation": "accurate English translation",
            "pronunciation": "clear pronunciation guide"
          },
          {
            "speaker": "Person A", 
            "text": "continued authentic ${language} dialogue",
            "translation": "accurate English translation",
            "pronunciation": "clear pronunciation guide"
          }
        ]
      }
    },
    {
      "stepNumber": 5,
      "type": "practice",
      "title": "Knowledge Assessment",
      "content": {
        "exercises": [
          {
            "id": "ex1",
            "type": "multiple_choice",
            "question": "Specific question about lesson content in English",
            "options": ["Realistic option 1", "Realistic option 2", "Realistic option 3", "Realistic option 4"],
            "correctAnswer": "Realistic option 1",
            "explanation": "Detailed explanation of why this answer is correct with educational context"
          },
          {
            "id": "ex2", 
            "type": "fill_in_the_blank",
            "question": "Complete this ${language} phrase: _____ means [specific meaning]",
            "answer": "exact ${language} word or phrase",
            "explanation": "Clear explanation of usage and context with cultural notes"
          },
          {
            "id": "ex3",
            "type": "multiple_choice",
            "question": "Another specific question testing different concept from lesson",
            "options": ["Different option A", "Different option B", "Different option C", "Different option D"],
            "correctAnswer": "Different option A", 
            "explanation": "Thorough explanation reinforcing learning objectives"
          }
        ]
      }
    }
  ],
  "culturalNotes": "Rich cultural context about ${language === 'japanese' ? 'Japanese' : 'Spanish-speaking'} culture, customs, and social norms specifically related to ${topic} with practical insights",
  "isActive": true
}

CRITICAL VALIDATION CHECKLIST - VERIFY EACH POINT:
✓ Title and description are in English only
✓ Every dialogue array has minimum 3 complete exchanges with speaker, text, translation, pronunciation
✓ Every exercises array has minimum 3 complete exercises with all required fields
✓ Every multiple choice exercise has 4 options, correctAnswer, and explanation
✓ Every fill_in_the_blank exercise has answer and explanation
✓ All ${language} content is authentic and contextually appropriate
✓ All translations are accurate and natural
✓ Cultural context is meaningful and educational
✓ NO empty arrays [], placeholder text, or missing fields anywhere

GENERATE COMPLETE, HIGH-QUALITY CONTENT ONLY - incomplete lessons will be rejected and regenerated.`;

    // ✅ ENHANCED: Generation with retry logic and validation
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
        try {
            attempts++;
            console.log(`🤖 ENHANCED lesson generation attempt ${attempts}/${maxAttempts}...`);
            
            const result = await model.generateContent(enhancedPrompt);
            const response = await result.response;
            const text = response.text();
            
            console.log('📥 Raw Gemini response received, length:', text.length);
            
            const parsedResponse = extractJSON(text);
            
            // ✅ VALIDATE: Ensure content meets all requirements
            const validatedLesson = validateLessonContent(parsedResponse, minSteps);
            
            // ✅ GENERATE AUDIO: Add audio markers if requested
            if (generateAudio && validatedLesson.steps) {
                console.log('🎵 Adding audio markers to validated lesson...');
                
                validatedLesson.steps = await Promise.all(
                    validatedLesson.steps.map(async (step: any, index: number) => {
                        if ((step.type === 'vocabulary' || step.type === 'phrase') && step.content) {
                            try {
                                const textToSpeak = step.content.word || step.content.phrase;
                                if (textToSpeak) {
                                    const audioPath = await generateAudioFile(
                                        textToSpeak,
                                        language,
                                        index,
                                        topic
                                    );
                                    
                                    step.content.audio = audioPath;
                                    console.log(`🔊 Audio marker added for step ${index + 1}`);
                                }
                            } catch (audioError) {
                                console.error(`❌ Audio generation failed for step ${index + 1}:`, audioError);
                            }
                        }
                        return step;
                    })
                );
            }

            console.log('✅ HIGH-QUALITY lesson generated and validated successfully!');
            console.log('📊 Total steps generated:', validatedLesson.steps?.length || 0);
            console.log('🗣️ Dialogue steps:', validatedLesson.steps?.filter((s: any) => s.type === 'dialogue').length || 0);
            console.log('🧠 Practice steps:', validatedLesson.steps?.filter((s: any) => s.type === 'practice').length || 0);
            console.log('📝 Vocabulary steps:', validatedLesson.steps?.filter((s: any) => s.type === 'vocabulary').length || 0);
            console.log('💬 Phrase steps:', validatedLesson.steps?.filter((s: any) => s.type === 'phrase').length || 0);
            
            return validatedLesson;
            
        } catch (error) {
            console.error(`❌ Lesson generation attempt ${attempts} failed:`, error);
            
            if (attempts >= maxAttempts) {
                throw new Error(`Failed to generate complete lesson after ${maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            
            console.log(`🔄 Retrying lesson generation... (attempt ${attempts + 1}/${maxAttempts})`);
        }
    }
};

// ✅ KEEP: Your existing functions unchanged
export const generateLearningPath = async (userProfile: any, currentProgress: any) => {
    try {
        const prompt = `
You are an AI learning path designer for language education.

User Profile:
- Current Level: ${userProfile.level || 1}
- Languages: ${userProfile.languages?.join(', ') || 'Japanese'}
- Progress: ${currentProgress.completedLessons || 0} lessons completed

Generate the next 5 lessons as JSON:
{
  "learningPath": [
    {
      "title": "Lesson Title",
      "type": "vocabulary|grammar|conversation",
      "difficulty": "Beginner|Intermediate|Advanced", 
      "estimatedTime": 20,
      "priority": "high|medium|low",
      "reasoning": "Why this lesson is recommended"
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const cleanedJson = extractJSON(text);
        return cleanedJson;
    } catch (error) {
        console.error('Error generating learning path:', error);
        return {
            learningPath: [
                {
                    title: "Basic Vocabulary Review",
                    type: "vocabulary",
                    difficulty: "Beginner",
                    estimatedTime: 15,
                    priority: "high",
                    reasoning: "Strengthen foundation vocabulary"
                }
            ],
            error: "Fallback: Could not generate personalized path"
        };
    }
};

export const analyzeUserPerformance = async (userActivity: any) => {
    try {
        const prompt = `
Analyze learning performance:

Activity Data:
- Lessons Completed: ${userActivity.completedLessons || 0}
- Average Score: ${userActivity.averageScore || 0}%
- Time Spent: ${userActivity.totalMinutes || 0} minutes

Provide analysis as JSON:
{
  "performance": {
    "overallProgress": "${userActivity.averageScore || 0}%",
    "strengths": ["vocabulary", "pronunciation"],
    "improvementAreas": ["grammar", "listening"],
    "learningVelocity": "moderate"
  },
  "recommendations": [
    {
      "suggestion": "Focus on grammar exercises",
      "reason": "Low scores in grammar sections"
    }
  ],
  "motivationalMessage": "Great progress! Keep practicing daily."
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const cleanedJson = extractJSON(text);
        return cleanedJson;
    } catch (error) {
        console.error('Error analyzing performance:', error);
        return {
            performance: {
                overallProgress: "0%",
                strengths: ["dedication"],
                improvementAreas: ["consistency"],
                learningVelocity: "getting started"
            },
            recommendations: [
                {
                    suggestion: "Continue with basic lessons",
                    reason: "Build a strong foundation"
                }
            ],
            motivationalMessage: "Every journey begins with a single step!",
            error: "Fallback: Could not generate personalized analysis"
        };
    }
};
