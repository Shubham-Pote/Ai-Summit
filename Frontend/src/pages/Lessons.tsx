import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Clock, 
  Star, 
  Play,
  Lock,
  CheckCircle,
  RefreshCw,
  Volume2,
  Users,
  MessageCircle,
  Brain,
  Zap,
  Trophy,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from "lucide-react";
import { lessonsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Lessons = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  
  // ✅ FIX: Persistent language selection with localStorage
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    // Initialize from localStorage first, then fallback to user context or default
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      console.log('🔄 Restored language from localStorage:', savedLanguage);
      return savedLanguage;
    }
    return "japanese"; // Default fallback
  });
  
  // ✅ FIX: Track if we've initialized from user context to prevent overrides
  const hasInitializedFromUser = useRef(false);
  
  const { user, switchLanguage } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Add unique indexes to lessons to solve key uniqueness issue
  const addUniqueIndexes = (lessons: any[]) => {
    return lessons.map((lesson, index) => ({
      ...lesson,
      uniqueKey: `${lesson._id || lesson.id}-${index}`,
      sequenceNumber: index + 1
    }));
  };

  // ✅ FIX: Only initialize from user context if no saved preference exists
  useEffect(() => {
    if (user?.currentLanguage && !hasInitializedFromUser.current) {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      
      // Only use user context if no saved preference exists
      if (!savedLanguage) {
        console.log('🔄 Initializing language from user context:', user.currentLanguage);
        setSelectedLanguage(user.currentLanguage);
        localStorage.setItem('selectedLanguage', user.currentLanguage);
      }
      
      hasInitializedFromUser.current = true;
    }
  }, [user?.currentLanguage]);

  // ✅ FIX: Fetch lessons when selectedLanguage changes
  useEffect(() => {
    console.log('📚 Fetching lessons for language:', selectedLanguage);
    fetchLessons();
  }, [selectedLanguage]);

  // Handle location state refresh
  useEffect(() => {
    if (location.state?.refresh) {
      fetchLessons();
      navigate('/lessons', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // ✅ REMOVED: Problematic visibility change effect that was causing resets
  // The visibility change effect was refetching lessons and triggering re-renders

  // Handle lesson completion events
  useEffect(() => {
    const handleLessonCompleted = (event: any) => {
      console.log('📚 Lesson completed, refreshing lessons list...', event.detail);
      fetchLessons();
    };
    window.addEventListener('lessonCompleted', handleLessonCompleted);
    
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching lessons for:', selectedLanguage);
      const response = await lessonsAPI.getLessonsByLanguage(selectedLanguage);
      const lessonsWithIndexes = addUniqueIndexes(response.lessons || []);
      setLessons(lessonsWithIndexes);
      console.log('✅ Lessons loaded:', lessonsWithIndexes.length);
    } catch (error) {
      console.error('❌ Failed to fetch lessons:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Enhanced language change handler with localStorage persistence
  const handleLanguageChange = async (newLanguage: string) => {
    try {
      console.log('🌐 Switching language to:', newLanguage);
      
      // Update UI state immediately
      setSelectedLanguage(newLanguage);
      
      // ✅ PERSIST: Save to localStorage to prevent resets
      localStorage.setItem('selectedLanguage', newLanguage);
      
      // Update user context
      await switchLanguage(newLanguage);
      
      console.log('✅ Language switch successful and persisted');
      
    } catch (error) {
      console.error('❌ Language switch failed:', error);
      
      // Revert both state and localStorage on error
      const previousLanguage = user?.currentLanguage || "japanese";
      setSelectedLanguage(previousLanguage);
      localStorage.setItem('selectedLanguage', previousLanguage);
      
      toast({
        title: "Error", 
        description: "Failed to switch language",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (uniqueKey: string) => {
    setExpandedLesson(expandedLesson === uniqueKey ? null : uniqueKey);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500";
      case "Intermediate": return "bg-orange-500";
      case "Advanced": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case "vocabulary": return <BookOpen className="w-3 h-3" />;
      case "phrase": return <MessageCircle className="w-3 h-3" />;
      case "dialogue": return <Users className="w-3 h-3" />;
      case "practice": return <Brain className="w-3 h-3" />;
      default: return <BookOpen className="w-3 h-3" />;
    }
  };

  const getUniqueStepTypes = (lesson: any) => {
    if (!lesson.steps) return [];
    const uniqueTypes = [...new Set(lesson.steps.map((step: any) => step.type))];
    return uniqueTypes;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading lessons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Learning Path</h1>
          <p className="text-muted-foreground">
            Your {selectedLanguage === 'japanese' ? 'Japanese 🇯🇵' : 'Spanish 🇪🇸'} learning journey
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* ✅ FIX: Language selector with persistent state */}
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="japanese">🇯🇵 Japanese</SelectItem>
              <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            Level {user?.level || 1}
          </Badge>
        </div>
      </div>

      {/* Learning Path Timeline */}
      {lessons.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">Start Your Journey!</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Generate your first {selectedLanguage === 'japanese' ? 'Japanese' : 'Spanish'} lesson to begin learning
          </p>
          <Button size="lg">
            <Zap className="w-5 h-5 mr-2" />
            Generate First Lesson
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 opacity-20"></div>
          
          {/* Lessons */}
          <div className="space-y-6">
            {lessons.map((lesson, index) => {
              const isExpanded = expandedLesson === lesson.uniqueKey;
              const uniqueStepTypes = getUniqueStepTypes(lesson);

              return (
                <div key={lesson.uniqueKey} className="relative">
                  {/* Timeline Node */}
                  <div className="absolute left-6 top-8 w-4 h-4 rounded-full border-4 border-white shadow-lg z-10 flex items-center justify-center">
                    {lesson.completed ? (
                      <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    ) : lesson.locked ? (
                      <div className="w-full h-full bg-gray-400 rounded-full flex items-center justify-center">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                    ) : lesson.progress > 0 ? (
                      <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                        <Play className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-purple-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Lesson Content */}
                  <div className="ml-16 pb-8">
                    <div 
                      className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                        lesson.completed 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-300' 
                          : lesson.progress > 0
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-300'
                          : lesson.locked 
                          ? 'bg-gray-50 border-2 border-gray-200 opacity-60' 
                          : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg'
                      }`}
                      onClick={() => !lesson.locked && toggleExpand(lesson.uniqueKey)}
                    >
                      {/* Lesson Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-gray-400">
                              #{lesson.sequenceNumber.toString().padStart(2, '0')}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 flex-1">
                              {lesson.title}
                            </h3>
                            {lesson.completed && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                ✅ Completed
                              </Badge>
                            )}
                            {lesson.progress > 0 && !lesson.completed && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                {lesson.progress}% Done
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <div className={`w-3 h-3 rounded-full ${getDifficultyColor(lesson.difficulty)}`}></div>
                              <span className="font-medium">{lesson.difficulty}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{lesson.estimatedMinutes}m</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span>{lesson.xpReward || 50} XP</span>
                            </div>
                          </div>

                          {lesson.progress > 0 && !lesson.completed && (
                            <div className="mb-4">
                              <Progress value={lesson.progress} className="h-2" />
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex items-center gap-2">
                          {!lesson.locked && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(lesson.uniqueKey);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {uniqueStepTypes.slice(0, 3).map((type: string) => (
                          <div 
                            key={type}
                            className="flex items-center gap-1 px-3 py-1 bg-white/60 rounded-full border text-xs"
                          >
                            {getStepIcon(type)}
                            <span className="capitalize">{type}</span>
                          </div>
                        ))}
                        {uniqueStepTypes.length > 3 && (
                          <div className="px-3 py-1 bg-white/60 rounded-full border text-xs">
                            +{uniqueStepTypes.length - 3} more
                          </div>
                        )}
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-white/40 space-y-4">
                          <p className="text-gray-700 leading-relaxed">
                            {lesson.description || "Learn essential vocabulary and phrases through interactive exercises."}
                          </p>

                          {lesson.culturalNotes && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-semibold text-amber-800 mb-1">Cultural Insight:</p>
                                  <p className="text-amber-700 text-sm">
                                    {lesson.culturalNotes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {lesson.steps?.some((step: any) => step.content?.audio) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-lg">
                              <Volume2 className="w-4 h-4" />
                              <span>Audio pronunciation included</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="mt-6 flex justify-end">
                        {lesson.locked ? (
                          <Button disabled variant="ghost" className="opacity-50">
                            <Lock className="w-4 h-4 mr-2" />
                            Complete previous lessons
                          </Button>
                        ) : (
                          <Button 
                            asChild
                            variant={lesson.completed ? "outline" : "default"}
                            size="lg"
                            className="shadow-md"
                          >
                            <Link to={`/lesson/${lesson._id || lesson.id}`} className="flex items-center gap-2">
                              {lesson.completed ? (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Review Lesson
                                </>
                              ) : lesson.progress > 0 ? (
                                <>
                                  <Play className="w-4 h-4" />
                                  Continue Learning
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4" />
                                  Start Lesson
                                </>
                              )}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>

                      {/* Completion Celebration */}
                      {lesson.completed && (
                        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-yellow-600" />
                              <span className="font-semibold text-green-800">Lesson Mastered!</span>
                            </div>
                            <span className="text-sm text-green-700 font-medium">
                              +{lesson.xpReward || 50} XP Earned
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {lessons.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your Progress</h3>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">{lessons.filter(l => l.completed).length} Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">{lessons.filter(l => l.progress > 0 && !l.completed).length} In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="font-medium">{lessons.filter(l => l.locked).length} Upcoming</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">
                {lessons.reduce((acc, lesson) => acc + (lesson.completed ? (lesson.xpReward || 50) : 0), 0)} XP
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
