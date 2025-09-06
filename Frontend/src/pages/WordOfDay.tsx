import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Star, 
  Volume2,
  BookOpen,
  Globe,
  TrendingUp,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  Lightbulb
} from "lucide-react";

const WordOfDay = () => {
  const [currentDate] = useState(new Date());
  const [savedWords, setSavedWords] = useState<number[]>([]);

  const todaysWord = {
    id: 1,
    word: "Saudade",
    translation: "A deep emotional state of longing for something absent",
    pronunciation: "/sa.uˈða.ðe/",
    partOfSpeech: "noun (feminine)",
    difficulty: "Advanced",
    origin: "Portuguese origin, commonly used in Spanish",
    examples: [
      {
        spanish: "Siento una gran saudade por mi ciudad natal.",
        english: "I feel a great saudade for my hometown."
      },
      {
        spanish: "La saudade de sus abuelos la visitaba cada noche.", 
        english: "The saudade for her grandparents visited her every night."
      }
    ],
    culturalNote: "Saudade is a Portuguese word that has been adopted into Spanish, especially in literature. It describes a unique feeling of longing that is both melancholic and beautiful, often for something that may never return.",
    relatedWords: [
      { word: "nostalgia", meaning: "nostalgia" },
      { word: "añoranza", meaning: "yearning, longing" },
      { word: "melancolía", meaning: "melancholy" }
    ],
    funFact: "This word is considered untranslatable in many languages because it captures such a specific emotional state."
  };

  const weekHistory = [
    {
      date: "Yesterday",
      word: "Madrugada",
      meaning: "Early hours of the morning (around 2-6 AM)",
      difficulty: "Intermediate"
    },
    {
      date: "2 days ago", 
      word: "Estrenar",
      meaning: "To wear or use something for the first time",
      difficulty: "Beginner"
    },
    {
      date: "3 days ago",
      word: "Sobremesa", 
      meaning: "Time spent chatting after a meal",
      difficulty: "Intermediate"
    },
    {
      date: "4 days ago",
      word: "Puente",
      meaning: "Long weekend (literally 'bridge')",
      difficulty: "Beginner"
    }
  ];

  const languageFacts = [
    "Spanish is spoken by over 500 million people worldwide",
    "The Spanish alphabet has 27 letters, including 'ñ'",
    "Spanish is the official language in 21 countries",
    "There are over 50,000 words in Spanish that start with 'a'",
    "The fastest recorded Spanish speaker spoke 11.2 syllables per second"
  ];

  const randomFact = languageFacts[Math.floor(Math.random() * languageFacts.length)];

  const handleSaveWord = (wordId: number) => {
    setSavedWords(prev => 
      prev.includes(wordId) 
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-secondary text-secondary-foreground";
      case "Intermediate": return "bg-accent text-accent-foreground";  
      case "Advanced": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Word of the Day</h1>
        <p className="text-muted-foreground">Expand your vocabulary with daily Spanish words and cultural insights</p>
      </div>

      {/* Today's Featured Word */}
      <Card className="bg-gradient-card shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          
          <CardTitle className="text-3xl mb-4">{todaysWord.word}</CardTitle>
          
          <div className="flex justify-center gap-2 mb-4">
            <Badge className={getDifficultyColor(todaysWord.difficulty)}>
              {todaysWord.difficulty}
            </Badge>
            <Badge variant="outline">{todaysWord.partOfSpeech}</Badge>
          </div>
          
          <CardDescription className="text-lg">
            {todaysWord.translation}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Pronunciation */}
          <div className="text-center">
            <div className="text-muted-foreground mb-2">{todaysWord.pronunciation}</div>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm">
                <Volume2 className="w-4 h-4 mr-2" />
                Listen
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Repeat
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSaveWord(todaysWord.id)}
                className={savedWords.includes(todaysWord.id) ? "bg-xp-gold text-white" : ""}
              >
                <Star className={`w-4 h-4 mr-2 ${savedWords.includes(todaysWord.id) ? "fill-current" : ""}`} />
                {savedWords.includes(todaysWord.id) ? "Saved" : "Save"}
              </Button>
            </div>
          </div>

          {/* Examples */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Examples in Context
            </h3>
            <div className="space-y-4">
              {todaysWord.examples.map((example, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium mb-1">{example.spanish}</p>
                  <p className="text-sm text-muted-foreground italic">{example.english}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cultural Note */}
          <div className="bg-ai-purple/10 border border-ai-purple/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-ai-purple">
              <Globe className="w-5 h-5" />
              Cultural Insight
            </h4>
            <p className="text-sm">{todaysWord.culturalNote}</p>
          </div>

          {/* Related Words */}
          <div>
            <h4 className="font-semibold mb-3">Related Words</h4>
            <div className="flex flex-wrap gap-2">
              {todaysWord.relatedWords.map((related, index) => (
                <Badge key={index} variant="outline" className="text-sm p-2">
                  <span className="font-medium">{related.word}</span>
                  <span className="mx-1">•</span>
                  <span className="text-muted-foreground">{related.meaning}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Fun Fact */}
          <div className="bg-gradient-success/10 border border-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-secondary">
              <Lightbulb className="w-5 h-5" />
              Did You Know?
            </h4>
            <p className="text-sm">{todaysWord.funFact}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Previous Words */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Words
            </CardTitle>
            <CardDescription>
              Review words from this week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {weekHistory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div>
                  <div className="font-medium">{item.word}</div>
                  <div className="text-sm text-muted-foreground">{item.meaning}</div>
                </div>
                <div className="text-right">
                  <Badge className={getDifficultyColor(item.difficulty)} variant="outline">
                    {item.difficulty}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">{item.date}</div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full mt-4">
              <ArrowRight className="w-4 h-4 mr-2" />
              View All Previous Words
            </Button>
          </CardContent>
        </Card>

        {/* Daily Language Fact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Daily Language Fact
            </CardTitle>
            <CardDescription>
              Interesting facts about the Spanish language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-hero/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium">{randomFact}</p>
            </div>
            
            {/* Progress Stats */}
            <div className="space-y-3">
              <h4 className="font-semibold">Your Progress</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-secondary">23</div>
                  <div className="text-xs text-muted-foreground">Words Learned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">7</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-xp-gold">12</div>
                  <div className="text-xs text-muted-foreground">Words Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">85%</div>
                  <div className="text-xs text-muted-foreground">Retention Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
          <CardDescription>
            Take action with today's word
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Practice Quiz</span>
              <span className="text-xs text-muted-foreground">Test your knowledge</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <BookOpen className="w-6 h-6" />
              <span className="font-medium">Create Sentences</span>
              <span className="text-xs text-muted-foreground">Use in your own examples</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Volume2 className="w-6 h-6" />
              <span className="font-medium">Pronunciation Practice</span>
              <span className="text-xs text-muted-foreground">Perfect your accent</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WordOfDay;