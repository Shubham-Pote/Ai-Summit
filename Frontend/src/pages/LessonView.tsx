import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw,
  Volume2,
  CheckCircle,
  ArrowRight,
  Star,
  Mic,
  RefreshCw,
  BookOpen,
  MessageCircle,
  Users,
  Brain,
  Lightbulb,
  Trophy,
  Zap,
  Clock,
  Target,
  XCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { lessonsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// ✅ Enhanced Audio Player Class (unchanged)
class LessonAudioPlayer {
  private synthesis: SpeechSynthesis;
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  async playAudio(audioPath: string | undefined, text: string, language: string = 'japanese'): Promise<void> {
    try {
      this.stop();
      console.log(`🔊 Playing audio: ${audioPath || text}`);
      
      if (audioPath?.startsWith('tts:')) {
        const [, encodedText, lang] = audioPath.split(':');
        const textToSpeak = decodeURIComponent(encodedText);
        await this.speakText(textToSpeak, lang);
        return;
      }

      if (audioPath?.startsWith('/audio/')) {
        try {
          await this.playAudioFile(audioPath);
          return;
        } catch (audioError) {
          console.warn('🔄 Audio file failed, falling back to TTS:', audioError);
        }
      }

      if (text) {
        await this.speakText(text, language);
      }
    } catch (error) {
      console.error('❌ Audio playback error:', error);
      throw error;
    }
  }

  private async playAudioFile(audioPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentAudio = new Audio(audioPath);
      
      this.currentAudio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.currentAudio = null;
        resolve();
      });

      this.currentAudio.addEventListener('error', (e) => {
        console.error('❌ Audio file error:', e);
        this.isPlaying = false;
        this.currentAudio = null;
        reject(new Error('Audio file could not be loaded'));
      });

      this.currentAudio.play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch(reject);
    });
  }

  private async speakText(text: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      this.synthesis.cancel();
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      
      const voices = this.synthesis.getVoices();
      let targetLang = 'en-US';
      
      if (language === 'japanese') {
        targetLang = 'ja-JP';
      } else if (language === 'spanish') {
        targetLang = 'es-ES';
      }
      
      const voice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
      if (voice) {
        this.currentUtterance.voice = voice;
      }
      
      this.currentUtterance.rate = 0.8;
      this.currentUtterance.pitch = 1.0;
      this.currentUtterance.volume = 1.0;
      
      this.currentUtterance.onstart = () => {
        this.isPlaying = true;
        console.log(`🗣️ Speaking: "${text}"`);
      };
      
      this.currentUtterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        resolve();
      };
      
      this.currentUtterance.onerror = (event) => {
        this.isPlaying = false;
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      this.synthesis.speak(this.currentUtterance);
    });
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    
    this.isPlaying = false;
    this.currentUtterance = null;
  }

  getPlayingState(): boolean {
    return this.isPlaying;
  }
}

const audioPlayer = new LessonAudioPlayer();

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [isFirstTimeCompletion, setIsFirstTimeCompletion] = useState(false);
  const [audioStates, setAudioStates] = useState<{[key: string]: boolean}>({});
  const [userInputs, setUserInputs] = useState<{[key: string]: string}>({});
  
  // ✅ FIX: Add state to track if current step exercises are completed
  const [currentStepCompleted, setCurrentStepCompleted] = useState(false);
  const [answeredExercises, setAnsweredExercises] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();
  const { user } = useAuth();

  const setAudioState = (key: string, isPlayingState: boolean) => {
    setAudioStates(prev => ({
      ...prev,
      [key]: isPlayingState
    }));
  };

  const playAudio = async (audioPath: string | undefined, text: string, buttonKey?: string) => {
    try {
      if (buttonKey) setAudioState(buttonKey, true);
      setIsPlaying(true);
      
      await audioPlayer.playAudio(audioPath, text, lesson?.language || 'japanese');
      
      toast({
        title: "🔊 Audio Playing",
        description: `Playing: "${text}"`,
      });
    } catch (error) {
      console.error('Audio playback failed:', error);
      toast({
        title: "⚠️ Audio Unavailable",
        description: "Could not play audio for this content",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsPlaying(false);
        if (buttonKey) setAudioState(buttonKey, false);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      audioPlayer.stop();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showCompletionScreen) {
        setTimeSpent(prev => prev + 1);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [showCompletionScreen]);

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  // ✅ FIX: Reset step states when moving between steps
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setUserInputs({});
    setCurrentStepCompleted(false);
    setAnsweredExercises(new Set());
  }, [currentStep]);

  const fetchLesson = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await lessonsAPI.getLessonDetails(id);
      setLesson(response.lesson);
      setCurrentStep(response.lesson.currentProgress || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lesson details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async () => {
    if (!lesson || !id) return;
    
    try {
      const isCompleted = currentStep >= lesson.totalSteps - 1;
      const wasAlreadyCompleted = lesson.completed;

      await lessonsAPI.updateProgress(id, {
        currentStep: currentStep,
        totalSteps: lesson.totalSteps,
        completed: isCompleted,
        timeSpent: Math.max(timeSpent, 1),
        language: lesson.language,
        score: Math.round((currentStep / lesson.totalSteps) * 100)
      });

      if (isCompleted && !showCompletionScreen) {
        setIsFirstTimeCompletion(!wasAlreadyCompleted);
        setLesson(prev => ({ ...prev, completed: true }));
        setShowCompletionScreen(true);
        
        window.dispatchEvent(new CustomEvent('lessonCompleted', {
          detail: { lessonId: id, language: lesson.language, xpEarned: lesson.xpReward || 50 }
        }));
        
        toast({
          title: "🎉 Lesson Completed!",
          description: `Congratulations! You earned ${lesson.xpReward || 50} XP!`,
        });
      }
    } catch (error) {
      console.error('Progress update error:', error);
      toast({
        title: "Warning",
        description: "Progress couldn't be saved",
        variant: "destructive",
      });
    }
  };

  // ✅ FIX: Modified handleNext to not auto-advance on practice steps
  const handleNext = () => {
    const currentStepData = lesson.steps?.[currentStep];
    
    // For practice steps, check if all exercises are completed
    if (currentStepData?.type === "practice") {
      const hasExercises = currentStepData.content?.exercises && 
                          Array.isArray(currentStepData.content.exercises) && 
                          currentStepData.content.exercises.length > 0;
                          
      if (hasExercises && !currentStepCompleted) {
        toast({
          title: "Complete all exercises",
          description: "Please answer all questions before proceeding",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep < lesson.totalSteps - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      updateProgress();
    } else {
      updateProgress();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (exerciseId: string, value: string) => {
    setUserInputs(prev => ({
      ...prev,
      [exerciseId]: value
    }));
  };

  // ✅ FIX: Modified answer selection to not auto-submit
  const handleAnswerSelect = (answer: string, correctAnswer: string, exerciseId: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    
    // Mark this exercise as answered
    setAnsweredExercises(prev => new Set([...prev, exerciseId]));
    
    const isCorrect = answer === correctAnswer;
    
    if (isCorrect) {
      toast({
        title: "Correct! ✅",
        description: "Great job! You're making progress.",
      });
    } else {
      toast({
        title: "Not quite right 🤔",
        description: "Try again or check the explanation.",
        variant: "destructive",
      });
    }
    
    // ✅ FIX: Check if all exercises are completed
    checkIfStepCompleted(exerciseId);
  };

  const handleFillBlankCheck = (userAnswer: string, correctAnswer: string, exerciseId: string) => {
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    setShowResult(true);
    
    // Mark this exercise as answered
    setAnsweredExercises(prev => new Set([...prev, exerciseId]));
    
    if (isCorrect) {
      toast({
        title: "Perfect! ✅",
        description: "You got it right!",
      });
    } else {
      toast({
        title: "Try again 🤔",
        description: `Correct answer: ${correctAnswer}`,
        variant: "destructive",
      });
    }
    
    // ✅ FIX: Check if all exercises are completed
    checkIfStepCompleted(exerciseId);
  };

  // ✅ FIX: New function to check if current step is completed
  const checkIfStepCompleted = (exerciseId: string) => {
    const currentStepData = lesson.steps?.[currentStep];
    const exercises = currentStepData?.content?.exercises || [];
    
    if (exercises.length === 0) {
      setCurrentStepCompleted(true);
      return;
    }
    
    // Check if all exercises have been answered
    const newAnsweredExercises = new Set([...answeredExercises, exerciseId]);
    const allAnswered = exercises.every((exercise: any) => 
      newAnsweredExercises.has(exercise.id || `exercise-${exercises.indexOf(exercise)}`)
    );
    
    if (allAnswered) {
      setCurrentStepCompleted(true);
      toast({
        title: "Step Complete! 🎉",
        description: "All exercises completed. You can now proceed to the next step.",
      });
    }
  };

  const handleBackToLessons = () => {
    navigate('/lessons', { state: { refresh: true } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <p className="ml-3 text-muted-foreground">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Lesson not found</p>
        <Button onClick={handleBackToLessons}>Back to Lessons</Button>
      </div>
    );
  }

  // Completion Screen (unchanged)
  if (showCompletionScreen) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToLessons}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>
        </div>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Trophy className="w-20 h-20 text-yellow-500 animate-bounce" />
            </div>
            
            <CardTitle className="text-3xl font-bold text-green-800 mb-2">
              🎉 Lesson Completed!
            </CardTitle>
            
            <CardDescription className="text-lg text-green-700">
              Congratulations! You've mastered this lesson.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-primary mb-2">
                {lesson.title}
              </h3>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                Completed
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Zap className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold text-yellow-800">
                  {isFirstTimeCompletion ? `+${lesson.xpReward || 50}` : '0'}
                </p>
                <p className="text-sm text-yellow-600">XP Earned</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-800">{timeSpent}m</p>
                <p className="text-sm text-blue-600">Time Spent</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <Target className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-800">100%</p>
                <p className="text-sm text-green-600">Complete</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setShowCompletionScreen(false)}
                variant="outline"
                className="flex-1"
              >
                Review Lesson
              </Button>
              
              <Button 
                onClick={handleBackToLessons}
                className="flex-1"
              >
                Back to Lessons
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepData = lesson.steps?.[currentStep];
  const progress = lesson.totalSteps > 0 ? ((currentStep + 1) / lesson.totalSteps) * 100 : 0;
  const isLastStep = currentStep >= lesson.totalSteps - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToLessons}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">{lesson.description}</p>
          </div>
        </div>
        
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          +{lesson.xpReward || 50} XP
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Lesson Progress</span>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {lesson.totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-3 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}% Complete</span>
            <span>{timeSpent}m spent</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStepData?.title || `Step ${currentStep + 1}`}
            <Badge variant="secondary">{currentStep + 1}/{lesson.totalSteps}</Badge>
          </CardTitle>
          <CardDescription>
            {currentStepData?.type === "vocabulary" && "Learn new vocabulary with examples and pronunciation"}
            {currentStepData?.type === "phrase" && "Master essential phrases for real conversations"}
            {currentStepData?.type === "dialogue" && "Practice interactive conversations"}
            {currentStepData?.type === "practice" && "Test your knowledge with exercises"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData ? (
            <>
              {/* VOCABULARY STEP (unchanged) */}
              {currentStepData.type === "vocabulary" && currentStepData.content && (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white rounded-3xl p-8 max-w-md mx-auto shadow-lg">
                    <div className="space-y-4">
                      <h2 className="text-4xl font-bold mb-2">
                        {currentStepData.content.word || "No word available"}
                      </h2>
                      <p className="text-xl opacity-90">
                        {currentStepData.content.translation || "No translation"}
                      </p>
                      {currentStepData.content.pronunciation && (
                        <p className="text-sm opacity-75 bg-white/20 rounded-full px-4 py-2 inline-block">
                          {currentStepData.content.pronunciation}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {currentStepData.content.example && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                          <MessageCircle className="w-4 h-4 text-blue-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-blue-800 mb-1">Example Usage:</p>
                            <p className="text-lg text-blue-900">{currentStepData.content.example}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {currentStepData.content.notes && (
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-amber-800 mb-1">Learning Note:</p>
                            <p className="text-sm text-amber-900">{currentStepData.content.notes}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    <Button 
                      size="lg" 
                      onClick={() => playAudio(currentStepData.content.audio, currentStepData.content.word, 'vocab-listen')}
                      disabled={audioStates['vocab-listen'] || isPlaying}
                    >
                      {audioStates['vocab-listen'] || isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      {audioStates['vocab-listen'] || isPlaying ? "Playing..." : "Listen"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => playAudio(currentStepData.content.audio, currentStepData.content.word, 'vocab-repeat')}
                      disabled={audioStates['vocab-repeat'] || isPlaying}
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Repeat
                    </Button>
                  </div>
                </div>
              )}

              {/* PHRASE STEP (unchanged) */}
              {currentStepData.type === "phrase" && currentStepData.content && (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <CardContent className="pt-6 text-center">
                      <h3 className="text-3xl font-semibold mb-3">
                        {currentStepData.content.phrase || "No phrase available"}
                      </h3>
                      <p className="text-xl opacity-90 mb-2">
                        {currentStepData.content.translation || "No translation"}
                      </p>
                      {currentStepData.content.pronunciation && (
                        <p className="text-sm opacity-75 bg-white/20 rounded-full px-4 py-2 inline-block">
                          {currentStepData.content.pronunciation}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {currentStepData.content.example && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium text-green-800 mb-1">Example in Context:</p>
                        <p className="text-lg text-green-900">{currentStepData.content.example}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {currentStepData.content.notes && (
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium text-amber-800 mb-1">Usage Note:</p>
                        <p className="text-sm text-amber-900">{currentStepData.content.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    <Button 
                      size="lg" 
                      onClick={() => playAudio(currentStepData.content.audio, currentStepData.content.phrase, 'phrase-listen')}
                      disabled={audioStates['phrase-listen'] || isPlaying}
                    >
                      <Volume2 className="w-5 h-5 mr-2" />
                      {audioStates['phrase-listen'] || isPlaying ? "Playing..." : "Listen & Repeat"}
                    </Button>
                  </div>
                </div>
              )}

              {/* DIALOGUE STEP (unchanged) */}
              {currentStepData.type === "dialogue" && currentStepData.content?.dialogue && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">🗣️ Conversation Practice</h3>
                    <p className="text-muted-foreground">Practice this real-world conversation</p>
                  </div>
                  
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {currentStepData.content.dialogue.map((line: any, index: number) => (
                      <Card key={index} className={`max-w-sm ${index % 2 === 1 ? "ml-auto" : ""} ${
                        index % 2 === 1 ? "bg-blue-500 text-white" : "bg-gray-100"
                      }`}>
                        <CardContent className="p-4">
                          <div className="font-medium text-sm mb-2 opacity-75">
                            {line.speaker || `Speaker ${index + 1}`}
                          </div>
                          <div className="text-lg mb-2">{line.text}</div>
                          {line.translation && (
                            <div className="text-sm opacity-75 italic mb-2">{line.translation}</div>
                          )}
                          {line.pronunciation && (
                            <div className="text-xs opacity-60 font-mono mb-2">
                              [{line.pronunciation}]
                            </div>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => playAudio(line.audio, line.text, `dialogue-${index}`)}
                            disabled={audioStates[`dialogue-${index}`] || isPlaying}
                            className={index % 2 === 1 ? "border-white/20 text-white hover:bg-white/10" : ""}
                          >
                            <Volume2 className="w-3 h-3 mr-1" />
                            {audioStates[`dialogue-${index}`] || isPlaying ? "Playing..." : "Listen"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button 
                      size="lg"
                      onClick={async () => {
                        setIsPlaying(true);
                        for (let i = 0; i < currentStepData.content.dialogue.length; i++) {
                          const line = currentStepData.content.dialogue[i];
                          try {
                            await audioPlayer.playAudio(line.audio, line.text, lesson?.language || 'japanese');
                            await new Promise(resolve => setTimeout(resolve, 1000));
                          } catch (error) {
                            console.error('Error playing dialogue line:', error);
                          }
                        }
                        setIsPlaying(false);
                      }}
                      disabled={isPlaying}
                    >
                      <Volume2 className="w-5 h-5 mr-2" />
                      {isPlaying ? "Playing..." : "Play Conversation"}
                    </Button>
                  </div>
                </div>
              )}

              {/* ✅ FIXED: PRACTICE STEP WITH PROPER CONTROL */}
              {currentStepData.type === "practice" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                      <Brain className="w-5 h-5" />
                      Practice Exercises
                    </h3>
                    <p className="text-muted-foreground">Test your understanding</p>
                  </div>
                  
                  {currentStepData.content?.exercises && 
                   Array.isArray(currentStepData.content.exercises) && 
                   currentStepData.content.exercises.length > 0 ? (
                    
                    <div className="space-y-6">
                      {currentStepData.content.exercises.map((exercise: any, index: number) => {
                        const exerciseId = exercise.id || `exercise-${index}`;
                        const isAnswered = answeredExercises.has(exerciseId);
                        
                        return (
                          <Card key={exerciseId} className="border-2">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center justify-between">
                                {exercise.question}
                                {isAnswered && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Answered
                                  </Badge>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Multiple Choice */}
                              {exercise.type === "multiple_choice" && exercise.options && (
                                <>
                                  <div className="space-y-2">
                                    {exercise.options.map((option: string, optIndex: number) => {
                                      const isSelected = selectedAnswer === option;
                                      const isCorrect = option === exercise.correctAnswer;
                                      const showCorrect = showResult && isCorrect && isAnswered;
                                      const showWrong = showResult && isSelected && !isCorrect && isAnswered;
                                      
                                      return (
                                        <Button
                                          key={optIndex}
                                          variant={showCorrect ? "default" : showWrong ? "destructive" : "outline"}
                                          className="w-full justify-start text-left p-4 h-auto relative"
                                          onClick={() => handleAnswerSelect(option, exercise.correctAnswer, exerciseId)}
                                          disabled={isAnswered}
                                        >
                                          <div className="flex items-center gap-3 w-full">
                                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold">
                                              {String.fromCharCode(65 + optIndex)}
                                            </div>
                                            <span className="flex-1">{option}</span>
                                            
                                            {showCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                                            {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
                                          </div>
                                        </Button>
                                      );
                                    })}
                                  </div>
                                  
                                  {showResult && exercise.explanation && isAnswered && (
                                    <Card className="bg-blue-50 border-blue-200">
                                      <CardContent className="pt-4">
                                        <div className="flex items-start gap-2">
                                          <Lightbulb className="w-4 h-4 text-blue-600 mt-1" />
                                          <div>
                                            <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                                            <p className="text-sm text-blue-900">{exercise.explanation}</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </>
                              )}

                              {/* Fill in the Blank */}
                              {exercise.type === "fill_in_the_blank" && (
                                <>
                                  <div className="space-y-3">
                                    <Input
                                      value={userInputs[exerciseId] || ""}
                                      onChange={(e) => handleInputChange(exerciseId, e.target.value)}
                                      placeholder="Type your answer..."
                                      disabled={isAnswered}
                                      className="text-lg"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !isAnswered && userInputs[exerciseId]?.trim()) {
                                          handleFillBlankCheck(userInputs[exerciseId], exercise.answer || exercise.correctAnswer, exerciseId);
                                        }
                                      }}
                                    />
                                    <Button 
                                      onClick={() => handleFillBlankCheck(userInputs[exerciseId] || "", exercise.answer || exercise.correctAnswer, exerciseId)}
                                      disabled={isAnswered || !userInputs[exerciseId]?.trim()}
                                      className="w-full"
                                    >
                                      Check Answer
                                    </Button>
                                  </div>
                                  
                                  {showResult && isAnswered && (
                                    <Card className={userInputs[exerciseId]?.trim().toLowerCase() === (exercise.answer || exercise.correctAnswer)?.toLowerCase() ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                                      <CardContent className="pt-4">
                                        <div className="flex items-start gap-2">
                                          {userInputs[exerciseId]?.trim().toLowerCase() === (exercise.answer || exercise.correctAnswer)?.toLowerCase() ? (
                                            <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                                          ) : (
                                            <XCircle className="w-4 h-4 text-red-600 mt-1" />
                                          )}
                                          <div>
                                            <p className="text-sm font-medium mb-1">
                                              {userInputs[exerciseId]?.trim().toLowerCase() === (exercise.answer || exercise.correctAnswer)?.toLowerCase() ? "Correct! ✅" : "Try again 🤔"}
                                            </p>
                                            {userInputs[exerciseId]?.trim().toLowerCase() !== (exercise.answer || exercise.correctAnswer)?.toLowerCase() && (
                                              <p className="text-sm mb-2">
                                                <strong>Correct answer:</strong> {exercise.answer || exercise.correctAnswer}
                                              </p>
                                            )}
                                            {exercise.explanation && <p className="text-sm">{exercise.explanation}</p>}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                      
                      {/* ✅ FIX: Step completion indicator */}
                      {currentStepCompleted && (
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-center gap-2 text-green-800">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold">All exercises completed! You can now proceed to the next step.</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    /* Enhanced fallback for empty exercises */
                    <div className="text-center py-12">
                      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="pt-8 pb-8">
                          <Trophy className="w-16 h-16 mx-auto text-green-600 mb-6" />
                          <h3 className="text-2xl font-bold text-green-800 mb-3">Excellent Progress!</h3>
                          <p className="text-green-700 mb-6 text-lg">
                            You've mastered all the content in this lesson.
                          </p>
                          
                          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                            <h4 className="font-bold text-green-800 mb-4 flex items-center justify-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              What You've Learned:
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Essential vocabulary
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Common phrases
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Pronunciation practice
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Cultural understanding
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200 mb-6">
                            <div className="flex items-center justify-center gap-2 text-orange-800">
                              <Zap className="w-5 h-5" />
                              <span className="font-semibold">Ready to earn {lesson.xpReward || 50} XP!</span>
                            </div>
                          </div>
                          
                          <p className="text-green-600 font-medium">
                            Click "Complete Lesson" to finish and earn your reward!
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No content available for this step</p>
              <p className="text-sm text-muted-foreground">This step might need content regeneration.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ FIXED: Navigation with proper control */}
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {lesson.totalSteps}</span>
          {currentStepData?.type === "practice" && !currentStepCompleted && currentStepData.content?.exercises?.length > 0 && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Complete all exercises to proceed
            </Badge>
          )}
        </div>
        
        <Button 
          onClick={handleNext}
          className={isLastStep ? "bg-green-600 hover:bg-green-700" : ""}
          disabled={
            currentStepData?.type === "practice" && 
            !currentStepCompleted && 
            currentStepData.content?.exercises?.length > 0
          }
        >
          {isLastStep ? (
            <>
              Complete Lesson
              <Trophy className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Cultural Notes */}
      {lesson.culturalNotes && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Lightbulb className="w-5 h-5" />
              Cultural Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-900">{lesson.culturalNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LessonView;
