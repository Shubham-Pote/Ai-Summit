"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { readingAPI } from "@/lib/api"
import {
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Newspaper,
  Globe,
  MessageCircle,
  Lightbulb,
  Zap,
  RefreshCw,
  Trophy,
  Loader2,
  ArrowLeft,
  Brain,
  History,
  Languages,
  Award,
  ChevronRight,
  RotateCcw,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface ContentWithTranslation {
  originalText: string
  translation: string
  type: "sentence" | "paragraph"
}

interface Article {
  _id: string
  title: string
  language: "spanish" | "japanese"
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  contentType: "mini-stories" | "local-news" | "dialogue-reads" | "idioms-action" | "global-comparison"
  topic: string
  content: string
  contentWithTranslations?: ContentWithTranslation[]
  preview: string
  estimatedReadTime: number
  culturalContext: {
    country: string
    backgroundInfo: string
    culturalTips: string[]
    learningPoints: string[]
  }
  vocabulary: Array<{
    word: string
    definition: string
    pronunciation: string
    difficulty: number
    contextSentence: string
  }>
  grammarPoints: Array<{
    concept: string
    explanation: string
    examples: string[]
  }>
  comprehensionQuestions: Array<{
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }>
  interactiveElements: {
    storyChoices: Array<{
      choiceText: string
      outcome: string
      vocabularyIntroduced: string[]
    }>
  }
  isStarterArticle: boolean
  createdAt?: string
}

interface ReadingProgress {
  status: "not_started" | "reading" | "completed"
  timeSpent: number
  startedAt: Date
  completedAt?: Date
  quizScore?: number
  quizAttempts?: number
}

interface UserArticleData {
  article: Article
  progress: ReadingProgress
}

interface ReadingStats {
  totalCompleted: number
  averageScore: number
  totalTimeSpent: number
  currentStreak: number
  language: string
}

const Reading = () => {
  const { user, switchLanguage } = useAuth()
  const { toast } = useToast()

  // Main state
  const [currentArticle, setCurrentArticle] = useState<UserArticleData | null>(null)
  const [completedArticles, setCompletedArticles] = useState<UserArticleData[]>([])
  const [stats, setStats] = useState<ReadingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(user?.currentLanguage || "spanish")

  // View state
  const [currentView, setCurrentView] = useState<"dashboard" | "article">("dashboard")
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null)
  const [viewingProgress, setViewingProgress] = useState<ReadingProgress | null>(null)

  // Reading session state
  const [readingStarted, setReadingStarted] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizPassed, setQuizPassed] = useState(false)
  const [showTranslations, setShowTranslations] = useState(false)
  const [canRetakeQuiz, setCanRetakeQuiz] = useState(false)

  // Interactive elements
  const [storyChoice, setStoryChoice] = useState<number | null>(null)
  const [readingTime, setReadingTime] = useState(0)

  const contentTypes = [
    {
      value: "mini-stories",
      label: "Interactive Stories",
      icon: BookOpen,
      description: "Stories with choices and multiple endings",
    },
    { value: "local-news", label: "Cultural News", icon: Newspaper, description: "Simple news from native countries" },
    {
      value: "dialogue-reads",
      label: "Real Conversations",
      icon: MessageCircle,
      description: "Natural dialogues and daily conversations",
    },
    {
      value: "idioms-action",
      label: "Idioms in Context",
      icon: Lightbulb,
      description: "Learn idioms through engaging stories",
    },
    {
      value: "global-comparison",
      label: "Cultural Bridges",
      icon: Globe,
      description: "Compare cultures and traditions",
    },
  ]

  // ✅ FIXED: New function to handle "Get Reading Content" button
  const handleGetReadingContent = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log("🚀 Generating new reading content...")

      // First try to get existing articles
      const userArticlesResponse = await readingAPI.getUserArticles(selectedLanguage)

      if (userArticlesResponse.success && userArticlesResponse.currentArticle) {
        // User already has an article
        setCurrentArticle(userArticlesResponse.currentArticle)
        setCompletedArticles(userArticlesResponse.completedArticles || [])

        toast({
          title: "Article Found! 📖",
          description: "You have an existing article ready to read.",
        })
        return
      }

      // No current article, generate a new one using getCurrentArticle
      console.log("📝 No existing article, generating new one...")
      const response = await readingAPI.getCurrentArticle(selectedLanguage)

      if (response.success && response.article) {
        const articleData = {
          article: response.article,
          progress: response.progress,
        }
        setCurrentArticle(articleData)
        setCompletedArticles([])

        toast({
          title: response.isStarter ? "Welcome! 🌟" : "New Article Generated! 🎯",
          description: response.isStarter
            ? "Here's your starter article to get started!"
            : "A personalized article based on your progress!",
        })
      } else {
        throw new Error("Failed to generate article - no article received")
      }
    } catch (error: any) {
      console.error("❌ Failed to get reading content:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate reading content. Please check your API configuration.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // API calls - Updated to fetch all user articles
  const fetchUserArticles = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await readingAPI.getUserArticles(selectedLanguage)

      if (response.success) {
        setCurrentArticle(response.currentArticle)
        setCompletedArticles(response.completedArticles || [])

        if (response.currentArticle?.article.isStarterArticle) {
          toast({
            title: "Welcome! 🌟",
            description: "Here's your starter article to begin your journey!",
          })
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch articles:", error)
      // Fallback to getCurrentArticle if getUserArticles fails
      try {
        const fallbackResponse = await readingAPI.getCurrentArticle(selectedLanguage)
        if (fallbackResponse.success) {
          const articleData = {
            article: fallbackResponse.article,
            progress: fallbackResponse.progress,
          }
          setCurrentArticle(articleData)
          setCompletedArticles([])

          if (fallbackResponse.isNew) {
            toast({
              title: fallbackResponse.isStarter ? "Welcome! 🌟" : "New Article Generated! 🎯",
              description: fallbackResponse.isStarter
                ? "Here's your starter article to get started!"
                : "A personalized article based on your progress!",
            })
          }
        }
      } catch (fallbackError) {
        toast({
          title: "Error",
          description: "Failed to load articles. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const viewArticleById = async (articleId: string) => {
    try {
      const response = await readingAPI.getArticleById(articleId)
      if (response.success) {
        setViewingArticle(response.article)
        setViewingProgress(response.progress)
        setCurrentView("article")
        setReadingStarted(false) // Completed articles shouldn't auto-start
        setShowQuiz(false)
        setQuizSubmitted(false)
        setSelectedAnswers({})
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load article.",
        variant: "destructive",
      })
    }
  }

  // Auto-start reading when going to current article view
  const goToCurrentArticle = () => {
    if (!currentArticle) return

    setViewingArticle(currentArticle.article)
    setViewingProgress(currentArticle.progress)
    setCurrentView("article")

    if (currentArticle.progress.status === "not_started") {
      // Auto-start reading for new articles
      setTimeout(() => {
        startReading()
      }, 500)
    } else if (currentArticle.progress.status === "reading") {
      setReadingStarted(true)
    }
  }

  const startReading = async () => {
    const article = viewingArticle || currentArticle?.article
    if (!article) return

    try {
      await readingAPI.startReading(article._id)

      setReadingStarted(true)
      if (viewingProgress) {
        setViewingProgress({ ...viewingProgress, status: "reading" })
      }
      if (currentArticle) {
        setCurrentArticle({
          ...currentArticle,
          progress: { ...currentArticle.progress, status: "reading" },
        })
      }

      toast({
        title: "Reading Started! 📖",
        description: "Take your time and enjoy learning!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to start reading session.",
        variant: "destructive",
      })
    }
  }

  const completeReading = () => {
    setShowQuiz(true)
  }

  const submitQuiz = async () => {
    const article = viewingArticle || currentArticle?.article
    if (!article || quizSubmitted) return

    const answers = Object.values(selectedAnswers)
    if (answers.length !== article.comprehensionQuestions.length) {
      toast({
        title: "Please answer all questions",
        description: "Make sure to select an answer for each question.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await readingAPI.completeArticle(article._id, {
        answers,
        timeSpent: readingTime,
      })

      if (response.success) {
        const results = response.results
        setQuizSubmitted(true)
        setQuizPassed(results.passed)
        setCanRetakeQuiz(!results.passed)

        if (results.passed) {
          toast({
            title: "Great Job! 🎉",
            description: `Score: ${results.score}% - You passed! Ready for the next article.`,
          })
          // Refresh data
          fetchUserArticles()
          fetchStats()
        } else {
          toast({
            title: "Keep Practicing! 💪",
            description: `Score: ${results.score}% - You need 70% to pass. Try reading again!`,
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
    }
  }

  const retakeLesson = () => {
    setShowQuiz(false)
    setQuizSubmitted(false)
    setQuizPassed(false)
    setSelectedAnswers({})
    setReadingTime(0)
    setCanRetakeQuiz(false)
    setReadingStarted(true)

    toast({
      title: "Lesson Reset! 📚",
      description: "Read through the material again and retake the quiz.",
    })
  }

  const generateNextArticle = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await readingAPI.generateNextArticle(selectedLanguage)

      if (response.success) {
        await fetchUserArticles()
        setCurrentView("dashboard")
        resetReadingState()

        toast({
          title: "New Article Generated! 🎯",
          description: "Ready for your next learning adventure!",
        })
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to generate next article"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      const response = await readingAPI.getReadingStats(selectedLanguage)
      if (response.success) {
        setStats(response.stats)
      }
    } catch (error: any) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      await switchLanguage(newLanguage)
      setSelectedLanguage(newLanguage)

      setCurrentArticle(null)
      setCompletedArticles([])
      setCurrentView("dashboard")
      resetReadingState()

      toast({
        title: "Language Changed! 🌍",
        description: `Switched to ${newLanguage === "japanese" ? "Japanese 🇯🇵" : "Spanish 🇪🇸"}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch language",
        variant: "destructive",
      })
    }
  }

  const resetReadingState = () => {
    setViewingArticle(null)
    setViewingProgress(null)
    setReadingStarted(false)
    setShowQuiz(false)
    setQuizSubmitted(false)
    setQuizPassed(false)
    setSelectedAnswers({})
    setStoryChoice(null)
    setReadingTime(0)
    setShowTranslations(false)
    setCanRetakeQuiz(false)
  }

  const goBackToDashboard = () => {
    setCurrentView("dashboard")
    resetReadingState()
  }

  // Helper functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Intermediate":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Advanced":
        return "bg-rose-50 text-rose-700 border-rose-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const getContentTypeIcon = (type: string) => {
    const typeData = contentTypes.find((ct) => ct.value === type)
    const IconComponent = typeData?.icon || BookOpen
    return <IconComponent className="w-4 h-4" />
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Enhanced text rendering with proper translations
  const renderContentWithTranslations = () => {
    const article = viewingArticle || currentArticle?.article
    if (!article) return null

    if (article.contentWithTranslations && article.contentWithTranslations.length > 0) {
      return (
        <div className="space-y-6">
          {article.contentWithTranslations.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="mb-3">
                <p className="text-lg leading-relaxed text-gray-900 font-medium">{item.originalText}</p>
              </div>

              {showTranslations && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">English Translation:</span>
                  </div>
                  <p className="text-gray-600 italic leading-relaxed">{item.translation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    } else {
      const sentences = article.content.split(/(?<=[.!?])\s+/)
      return (
        <div className="space-y-4">
          {sentences.map((sentence, index) => (
            <div key={index} className="bg-white border border-blue-200 rounded-lg p-4">
              <p className="text-lg leading-relaxed text-gray-900 font-medium">{sentence.trim()}</p>
              {showTranslations && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">English Translation:</span>
                  </div>
                  <p className="text-gray-600 italic">[Translation would appear here]</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }
  }

  // Effects
  useEffect(() => {
    if (user && selectedLanguage) {
      fetchUserArticles()
      fetchStats()
    }
  }, [user, selectedLanguage])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (readingStarted && !showQuiz) {
      interval = setInterval(() => {
        setReadingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [readingStarted, showQuiz])

  // Loading state
  if (loading && !currentArticle && completedArticles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading your reading content...</span>
      </div>
    )
  }

  // Article View (same as your current implementation)
  if (currentView === "article") {
    const article = viewingArticle || currentArticle?.article
    const progress = viewingProgress || currentArticle?.progress

    if (!article) return null

    return (
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={goBackToDashboard} className="hover:bg-slate-100/80">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>

              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(article.difficulty)}>{article.difficulty}</Badge>
                <Badge variant="outline" className="border-slate-200 bg-slate-50/50">
                  {getContentTypeIcon(article.contentType)}
                  <span className="ml-1">{contentTypes.find((ct) => ct.value === article.contentType)?.label}</span>
                </Badge>
                {article.isStarterArticle && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200"
                  >
                    🌟 Starter Article
                  </Badge>
                )}
                {progress?.status === "completed" && (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed ({progress.quizScore}%)
                  </Badge>
                )}
              </div>
            </div>

            {/* Translation Toggle */}
            <Button
              variant={showTranslations ? "default" : "outline"}
              onClick={() => setShowTranslations(!showTranslations)}
              className={showTranslations ? "bg-slate-900 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"}
            >
              <Languages className="w-4 h-4 mr-2" />
              {showTranslations ? "Hide" : "Show"} Translations
            </Button>
          </div>

          {/* Title and Info */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              {getContentTypeIcon(article.contentType)}
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.estimatedReadTime} min read
              </span>
              <span>•</span>
              <span>{article.topic}</span>
              <span>•</span>
              <span>{article.culturalContext.country}</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <Progress
                value={progress?.status === "completed" ? 100 : showQuiz ? 90 : readingStarted ? 50 : 10}
                className="h-2 bg-slate-100"
              />
            </div>
            <div className="text-sm text-slate-600">
              {progress?.status === "completed"
                ? "✅ Completed"
                : showQuiz
                  ? "📝 Quiz Time"
                  : readingStarted
                    ? "📖 Reading..."
                    : "🚀 Ready"}
            </div>
          </div>
        </div>

        {/* Reading Timer */}
        {readingStarted && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Reading Time: </span>
              <span className="text-xl font-mono text-amber-900">
                {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        )}

        {/* Cultural Context */}
        {!showQuiz && (
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/60 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5" />
              Cultural Context - {article.culturalContext.country}
            </h3>
            <p className="text-blue-800 mb-4">{article.culturalContext.backgroundInfo}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Cultural Tips:</h4>
                <ul className="space-y-1">
                  {article.culturalContext.culturalTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 text-blue-600 mt-1 flex-shrink-0" />
                      <span className="text-sm text-blue-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Learning Points:</h4>
                <ul className="space-y-1">
                  {article.culturalContext.learningPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="w-3 h-3 text-blue-600 mt-1 flex-shrink-0" />
                      <span className="text-sm text-blue-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!showQuiz && (
          <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-900">
              <BookOpen className="w-5 h-5" />
              Article Content
            </h3>
            {renderContentWithTranslations()}
          </div>
        )}

        {/* Interactive Story Choices */}
        {!showQuiz && article.contentType === "mini-stories" && article.interactiveElements.storyChoices.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50/80 to-yellow-50/80 backdrop-blur-sm border border-amber-200/60 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Choose Your Path
            </h4>
            <div className="space-y-3">
              {article.interactiveElements.storyChoices.map((choice, index) => (
                <Button
                  key={index}
                  variant={storyChoice === index ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto p-4 transition-all ${
                    storyChoice === index
                      ? "bg-slate-900 hover:bg-slate-800 text-white"
                      : "border-slate-200 hover:bg-slate-50 bg-white/80"
                  }`}
                  onClick={() => setStoryChoice(index)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm bg-white/90 text-slate-900 rounded px-2 py-1">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {choice.choiceText}
                  </div>
                </Button>
              ))}
            </div>
            {storyChoice !== null && (
              <div className="mt-4 p-4 bg-amber-100/80 backdrop-blur-sm rounded-lg border border-amber-300/60">
                <p className="text-amber-900 font-medium mb-2">
                  {article.interactiveElements.storyChoices[storyChoice].outcome}
                </p>
                <div className="text-sm text-amber-700">
                  <strong>New vocabulary:</strong>{" "}
                  {article.interactiveElements.storyChoices[storyChoice].vocabularyIntroduced.join(", ")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Vocabulary Section */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 backdrop-blur-sm border border-emerald-200/60 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Key Vocabulary ({article.vocabulary.length} words)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {article.vocabulary.map((vocab, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-emerald-200/60 hover:shadow-md transition-all hover:bg-white/90"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-emerald-900 text-lg">{vocab.word}</h4>
                  <Badge
                    variant="outline"
                    className={`${
                      vocab.difficulty === 1
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : vocab.difficulty === 2
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {vocab.difficulty === 1 ? "Basic" : vocab.difficulty === 2 ? "Intermediate" : "Advanced"}
                  </Badge>
                </div>
                <p className="text-emerald-700 font-medium mb-1">{vocab.definition}</p>
                <p className="text-emerald-600 italic text-sm mb-2">Pronunciation: {vocab.pronunciation}</p>
                <div className="bg-emerald-100/80 rounded p-2">
                  <p className="text-emerald-800 text-sm">
                    <strong>Example:</strong> {vocab.contextSentence}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar Points */}
        <div className="bg-gradient-to-br from-purple-50/80 to-violet-50/80 backdrop-blur-sm border border-purple-200/60 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Grammar Insights
          </h3>
          <div className="space-y-4">
            {article.grammarPoints.map((grammar, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-purple-200/60">
                <h4 className="font-bold text-purple-900 mb-2">{grammar.concept}</h4>
                <p className="text-purple-700 mb-3">{grammar.explanation}</p>
                <div className="bg-purple-100/80 rounded p-3">
                  <p className="text-purple-800 text-sm">
                    <strong>Examples:</strong> {grammar.examples.join(" • ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Quiz Section */}
        {showQuiz && (
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                <Award className="w-6 h-6" />
                Comprehension Quiz
              </h3>
              <div className="text-right">
                <p className="text-sm text-slate-600">Pass with 70% or higher</p>
                <p className="text-lg font-mono text-slate-900">
                  {Object.keys(selectedAnswers).length}/{article.comprehensionQuestions.length}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {article.comprehensionQuestions.map((question, qIndex) => (
                <div key={qIndex} className="bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6">
                  <h4 className="font-semibold mb-4 text-lg text-slate-900">
                    Question {qIndex + 1}: {question.question}
                  </h4>

                  <div className="space-y-3">
                    {question.options.map((option, optIndex) => {
                      const isSelected = selectedAnswers[qIndex] === optIndex
                      const isCorrect = question.correctAnswer === optIndex
                      const isWrong = quizSubmitted && isSelected && !isCorrect
                      const showCorrect = quizSubmitted && isCorrect

                      return (
                        <Button
                          key={optIndex}
                          variant="outline"
                          className={`w-full justify-start h-auto p-4 text-left transition-all bg-white/80 backdrop-blur-sm ${
                            isSelected && !quizSubmitted ? "border-blue-500 bg-blue-50/80" : "border-slate-200"
                          } ${showCorrect ? "border-emerald-500 bg-emerald-50/80 text-emerald-800" : ""} ${
                            isWrong ? "border-rose-500 bg-rose-50/80 text-rose-800" : ""
                          }`}
                          onClick={() =>
                            !quizSubmitted && setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))
                          }
                          disabled={quizSubmitted}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <span className="font-mono bg-white/90 rounded px-2 py-1 text-sm text-slate-900">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span>{option}</span>
                            </div>
                            {showCorrect && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                            {isWrong && <XCircle className="w-5 h-5 text-rose-600" />}
                          </div>
                        </Button>
                      )
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-4 p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/60">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-blue-900 mb-1">Explanation:</p>
                          <p className="text-blue-800">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quiz Actions */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200/60">
              <div className="text-sm text-slate-600">
                {quizSubmitted && (
                  <span>
                    {quizPassed ? (
                      <span className="text-emerald-600 font-medium">🎉 Great job! You passed!</span>
                    ) : (
                      <span className="text-rose-600 font-medium">💪 Keep practicing! You can retake this lesson.</span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                {!quizSubmitted ? (
                  <Button
                    onClick={submitQuiz}
                    className="flex items-center gap-2"
                    disabled={Object.keys(selectedAnswers).length !== article.comprehensionQuestions.length}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Submit Quiz
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    {canRetakeQuiz && !quizPassed && (
                      <Button variant="outline" onClick={retakeLesson}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retake Lesson
                      </Button>
                    )}

                    <Button variant="outline" onClick={goBackToDashboard}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>

                    {quizPassed && (
                      <Button onClick={generateNextArticle} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Generate Next Article
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reading Actions */}
        {!showQuiz && (
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div className="text-slate-600">
                {progress?.status === "completed" ? (
                  <span className="text-emerald-600 font-medium">✅ Article completed successfully!</span>
                ) : readingStarted ? (
                  <span className="text-blue-600 font-medium">📖 Take your time reading...</span>
                ) : (
                  <span className="text-slate-600">🚀 Reading will start automatically</span>
                )}
              </div>

              {readingStarted && progress?.status !== "completed" && (
                <Button onClick={completeReading} size="lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  I'm Ready for the Quiz
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Dashboard View with Completed Articles
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Interactive Reading</h1>
          <p className="text-muted-foreground">AI-powered reading content tailored to your learning level</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
              <SelectItem value="japanese">🇯🇵 Japanese</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            Level {user?.level || 1}
          </Badge>
        </div>
      </div>

      {/* Reading Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.totalCompleted}</p>
                  <p className="text-sm text-muted-foreground">Articles Completed</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.averageScore}%</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.totalTimeSpent}m</p>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current/In-Progress Article Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Current Reading</h2>

        {currentArticle ? (
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200"
            onClick={goToCurrentArticle}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {getContentTypeIcon(currentArticle.article.contentType)}
                    {currentArticle.article.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <Badge className={getDifficultyColor(currentArticle.article.difficulty)}>
                      {currentArticle.article.difficulty}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentArticle.article.estimatedReadTime} min
                    </span>
                    <Badge variant="outline">{currentArticle.article.topic}</Badge>
                    {currentArticle.article.isStarterArticle && <Badge variant="secondary">🌟 Starter Article</Badge>}
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      📖 In Progress
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground mb-4">{currentArticle.article.preview}</p>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="capitalize">{currentArticle.progress.status.replace("_", " ")}</span>
                </div>
                <Progress
                  value={
                    currentArticle.progress.status === "completed"
                      ? 100
                      : currentArticle.progress.status === "reading"
                        ? 50
                        : 0
                  }
                  className="h-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {currentArticle.progress.status === "completed" && currentArticle.progress.quizScore ? (
                    <>✅ Completed (Score: {currentArticle.progress.quizScore}%)</>
                  ) : currentArticle.progress.status === "reading" ? (
                    "📖 Continue reading..."
                  ) : (
                    "🆕 Ready to start"
                  )}
                </div>
                <Button size="lg">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Article
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No active article</h3>
              <p className="text-muted-foreground mb-4">Ready to start your {selectedLanguage} reading journey?</p>
              {/* ✅ FIXED: Updated button to use new function */}
              <Button onClick={handleGetReadingContent} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Article...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Get Reading Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Articles Section */}
      {completedArticles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Completed Articles ({completedArticles.length})</h2>
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {completedArticles.length} completed
            </Badge>
          </div>

          <div className="grid gap-4">
            {completedArticles.map((articleData, index) => (
              <Card
                key={articleData.article._id}
                className="hover:shadow-md transition-shadow cursor-pointer border border-green-200 bg-green-50/20"
                onClick={() => viewArticleById(articleData.article._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getContentTypeIcon(articleData.article.contentType)}
                        <h3 className="font-semibold">{articleData.article.title}</h3>
                        <Badge className={getDifficultyColor(articleData.article.difficulty)}>
                          {articleData.article.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ✅ Completed
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{articleData.article.preview}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Topic: {articleData.article.topic}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-green-700 font-medium">
                          <Trophy className="w-3 h-3" />
                          Score: {articleData.progress.quizScore}%
                        </span>
                        <span>•</span>
                        <span>Time: {Math.round((articleData.progress.timeSpent || 0) / 60)}m</span>
                        {articleData.progress.completedAt && (
                          <>
                            <span>•</span>
                            <span>Completed: {formatDate(articleData.progress.completedAt)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${
                          (articleData.progress.quizScore || 0) >= 90
                            ? "bg-green-100 text-green-800"
                            : (articleData.progress.quizScore || 0) >= 80
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        {articleData.progress.quizScore}%
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State for No Completed Articles */}
      {completedArticles.length === 0 && currentArticle && (
        <div className="text-center py-12">
          <History className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold mb-1">No completed articles yet</h3>
          <p className="text-sm text-muted-foreground">
            Complete your current article to start building your reading history!
          </p>
        </div>
      )}
    </div>
  )
}

export default Reading
