import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Extract clean JSON from AI response
function extractJSON(text: string): any {
    try {
        // Remove markdown code blocks
        const cleanText = text.replace(/``````\n?/g, '').trim();
        
        // Find JSON object
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Failed to extract JSON:', error);
        throw new Error('Invalid JSON response from AI');
    }
}

export class AIArticleService {
    // Generate personalized article based on user progress
    static async generatePersonalizedArticle(params: {
        language: 'spanish' | 'japanese';
        userLevel: number;
        completedArticles: number;
        lastTopic?: string;
        preferredContentType?: string;
    }) {
        const { language, userLevel, completedArticles, lastTopic, preferredContentType } = params;

        // Determine difficulty based on user level and progress
        let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
        if (userLevel >= 3 || completedArticles >= 5) difficulty = 'Intermediate';
        if (userLevel >= 6 || completedArticles >= 15) difficulty = 'Advanced';

        // Determine content type based on progress
        const contentTypes = ['mini-stories', 'local-news', 'dialogue-reads', 'idioms-action', 'global-comparison'];
        const contentType = preferredContentType || contentTypes[completedArticles % contentTypes.length];

        // Generate topic progression
        const topicProgression = this.getTopicProgression(language, completedArticles, lastTopic);

        const culturalRegion = language === 'spanish' ? 'Spain' : 'Japan';

        const prompt = `Create a ${difficulty}-level ${language} reading article for a language learner.

User Context:
- Level: ${userLevel}
- Articles completed: ${completedArticles}  
- Content type: ${contentType}
- Topic focus: ${topicProgression.topic}
- Cultural region: ${culturalRegion}

Requirements:
- Make it engaging and culturally authentic
- Include ${difficulty}-appropriate vocabulary
- Add interactive elements for language learning
- Ensure content builds on previous learning
- Include cultural insights and context
- MUST include English translations for each sentence/paragraph

Return ONLY this JSON structure:
{
  "title": "Engaging article title in English",
  "language": "${language}",
  "difficulty": "${difficulty}",
  "contentType": "${contentType}",
  "topic": "${topicProgression.topic}",
  "estimatedReadTime": 4,
  "content": "Full article content in ${language} (400-600 words)",
  "contentWithTranslations": [
    {
      "originalText": "First sentence in ${language}",
      "translation": "English translation of first sentence",
      "type": "sentence"
    },
    {
      "originalText": "Second sentence in ${language}",
      "translation": "English translation of second sentence", 
      "type": "sentence"
    }
  ],
  "preview": "Brief preview of the first 150 characters",
  "culturalContext": {
    "country": "${culturalRegion}",
    "backgroundInfo": "Cultural background explanation",
    "culturalTips": ["Cultural insight 1", "Cultural insight 2", "Cultural insight 3"],
    "learningPoints": ["What students will learn culturally"]
  },
  "vocabulary": [
    {
      "word": "${language === 'japanese' ? 'example_word' : 'ejemplo'}",
      "definition": "English definition",
      "pronunciation": "${language === 'japanese' ? 'romaji' : 'phonetic'}",
      "difficulty": ${difficulty === 'Beginner' ? 1 : difficulty === 'Intermediate' ? 2 : 3},
      "contextSentence": "Example sentence using the word"
    }
  ],
  "grammarPoints": [
    {
      "concept": "Grammar concept being taught",
      "explanation": "How this grammar works",
      "examples": ["Example 1", "Example 2"]
    }
  ],
  "comprehensionQuestions": [
    {
      "question": "Question in ${language}",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 1,
      "explanation": "Why this answer is correct"
    }
  ],
  "interactiveElements": {
    "storyChoices": [
      {
        "choiceText": "Choice description",
        "outcome": "What happens with this choice",
        "vocabularyIntroduced": ["new word 1", "new word 2"]
      }
    ]
  }
}

CRITICAL: 
1. Content must be in ${language} with authentic cultural elements from ${culturalRegion}
2. MUST provide contentWithTranslations array with English translations for each sentence
3. Make it educational and engaging for ${difficulty} level learners`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            console.log(`✅ Generated personalized ${contentType} article for ${language} (${difficulty})`);
            return extractJSON(text);
        } catch (error) {
            console.error('❌ Article generation failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to generate personalized article: ${errorMessage}`);
        }
    }

    // Generate starter article for new users
    static async generateStarterArticle(language: 'spanish' | 'japanese') {
        const starterTopics = {
            spanish: { topic: 'Daily Greetings and Introductions', region: 'Spain' },
            japanese: { topic: 'Japanese Greetings and Politeness', region: 'Japan' }
        };

        const { topic, region } = starterTopics[language];

        const prompt = `Create a perfect starter article for someone beginning to learn ${language}.

Topic: ${topic}
Cultural Region: ${region}
Difficulty: Beginner
Content Type: mini-stories

Make it:
- Very beginner-friendly with basic vocabulary
- Culturally authentic and welcoming
- Include fundamental greetings and expressions
- Add pronunciation guides
- Make it encouraging and motivating
- MUST include English translations for each sentence

Return ONLY this JSON:
{
  "title": "${topic}",
  "language": "${language}",
  "difficulty": "Beginner", 
  "contentType": "mini-stories",
  "topic": "${topic}",
  "estimatedReadTime": 3,
  "content": "Beginner-friendly article content in ${language} (200-300 words)",
  "contentWithTranslations": [
    {
      "originalText": "First greeting sentence in ${language}",
      "translation": "English translation",
      "type": "sentence"
    },
    {
      "originalText": "Second sentence in ${language}",
      "translation": "English translation",
      "type": "sentence"
    }
  ],
  "preview": "Welcome to your first ${language} reading experience! Learn essential greetings and cultural basics.",
  "culturalContext": {
    "country": "${region}",
    "backgroundInfo": "Introduction to ${language === 'spanish' ? 'Spanish-speaking' : 'Japanese'} culture and language basics",
    "culturalTips": ["Cultural tip 1", "Cultural tip 2", "Cultural tip 3"],
    "learningPoints": ["What beginners will learn"]
  },
  "vocabulary": [
    {
      "word": "${language === 'japanese' ? 'こんにちは' : 'Hola'}",
      "definition": "Hello",
      "pronunciation": "${language === 'japanese' ? 'kon-ni-chi-wa' : '/ˈo.la/'}", 
      "difficulty": 1,
      "contextSentence": "Example sentence with this greeting"
    }
  ],
  "grammarPoints": [
    {
      "concept": "Basic greetings structure",
      "explanation": "How greetings work in ${language}",
      "examples": ["Example 1", "Example 2"]
    }
  ],
  "comprehensionQuestions": [
    {
      "question": "Simple comprehension question in ${language}",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Explanation for beginners"
    }
  ],
  "interactiveElements": {
    "storyChoices": [
      {
        "choiceText": "Practice greeting formally",
        "outcome": "Learn polite greeting expressions",
        "vocabularyIntroduced": ["polite greeting 1", "polite greeting 2"]
      }
    ]
  }
}

CRITICAL: MUST include contentWithTranslations array with English translations for each sentence.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            console.log(`✅ Generated starter article for ${language}`);
            return extractJSON(text);
        } catch (error) {
            console.error('❌ Starter article generation failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to generate starter article: ${errorMessage}`);
        }
    }

    // Get topic progression based on user progress
    private static getTopicProgression(language: string, completedArticles: number, lastTopic?: string) {
        const progressionPaths = {
            spanish: [
                { topic: 'Daily Greetings', level: 'basic' },
                { topic: 'Family and Home', level: 'basic' },
                { topic: 'Food and Restaurants', level: 'basic' },
                { topic: 'Shopping and Markets', level: 'intermediate' },
                { topic: 'Travel and Transportation', level: 'intermediate' },
                { topic: 'Work and Career', level: 'intermediate' },
                { topic: 'Spanish Festivals and Traditions', level: 'advanced' },
                { topic: 'History and Culture', level: 'advanced' },
                { topic: 'Current Events in Spain', level: 'advanced' }
            ],
            japanese: [
                { topic: 'Japanese Greetings and Politeness', level: 'basic' },
                { topic: 'Japanese Family Structure', level: 'basic' },
                { topic: 'Japanese Food Culture', level: 'basic' },
                { topic: 'Tokyo Daily Life', level: 'intermediate' },
                { topic: 'Japanese Work Culture', level: 'intermediate' },
                { topic: 'Seasonal Celebrations', level: 'intermediate' },
                { topic: 'Traditional vs Modern Japan', level: 'advanced' },
                { topic: 'Japanese Technology and Innovation', level: 'advanced' },
                { topic: 'Japanese Literature and Arts', level: 'advanced' }
            ]
        };

        const path = progressionPaths[language as keyof typeof progressionPaths];
        const topicIndex = Math.min(completedArticles, path.length - 1);
        
        return path[topicIndex];
    }
}
