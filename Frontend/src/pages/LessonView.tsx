import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle,
  ArrowRight,
  Star,
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
  XCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { lessonsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

// ✅ Enhanced Audio Player Class (unchanged)
class LessonAudioPlayer {
  private synthesis: SpeechSynthesis
  private currentAudio: HTMLAudioElement | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isPlaying = false

  constructor() {
    this.synthesis = window.speechSynthesis
  }

  async playAudio(audioPath: string | undefined, text: string, language = "japanese"): Promise<void> {
    try {
      this.stop()
      console.log(`🔊 Playing audio: ${audioPath || text}`)

      if (audioPath?.startsWith("tts:")) {
        const [, encodedText, lang] = audioPath.split(":")
        const textToSpeak = decodeURIComponent(encodedText)
        await this.speakText(textToSpeak, lang)
        return
      }

      if (audioPath?.startsWith("/audio/")) {
        try {
          await this.playAudioFile(audioPath)
          return
        } catch (audioError) {
          console.warn("🔄 Audio file failed, falling back to TTS:", audioError)
        }
      }

      if (text) {
        await this.speakText(text, language)
      }
    } catch (error) {
      console.error("❌ Audio playback error:", error)
      throw error
    }
  }

  private async playAudioFile(audioPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentAudio = new Audio(audioPath)

      this.currentAudio.addEventListener("ended", () => {
        this.isPlaying = false
        this.currentAudio = null
        resolve()
      })

      this.currentAudio.addEventListener("error", (e) => {
        console.error("❌ Audio file error:", e)
        this.isPlaying = false
        this.currentAudio = null
        reject(new Error("Audio file could not be loaded"))
      })

      this.currentAudio
        .play()
        .then(() => {
          this.isPlaying = true
        })
        .catch(reject)
    })
  }

  private async speakText(text: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"))
        return
      }

      this.synthesis.cancel()
      this.currentUtterance = new SpeechSynthesisUtterance(text)

      const voices = this.synthesis.getVoices()
      let targetLang = "en-US"

      if (language === "japanese") {
        targetLang = "ja-JP"
      } else if (language === "spanish") {
        targetLang = "es-ES"
      }

      const voice = voices.find((v) => v.lang.startsWith(targetLang.split("-")[0]))
      if (voice) {
        this.currentUtterance.voice = voice
      }

      this.currentUtterance.rate = 0.8
      this.currentUtterance.pitch = 1.0
      this.currentUtterance.volume = 1.0

      this.currentUtterance.onstart = () => {
        this.isPlaying = true
        console.log(`🗣️ Speaking: "${text}"`)
      }

      this.currentUtterance.onend = () => {
        this.isPlaying = false
        this.currentUtterance = null
        resolve()
      }

      this.currentUtterance.onerror = (event) => {
        this.isPlaying = false
        this.currentUtterance = null
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      this.synthesis.speak(this.currentUtterance)
    })
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }

    if (this.synthesis) {
      this.synthesis.cancel()
    }

    this.isPlaying = false
    this.currentUtterance = null
  }

  getPlayingState(): boolean {
    return this.isPlaying
  }
}

const audioPlayer = new LessonAudioPlayer()

const LessonView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeSpent, setTimeSpent] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showCompletionScreen, setShowCompletionScreen] = useState(false)
  const [isFirstTimeCompletion, setIsFirstTimeCompletion] = useState(false)
  const [audioStates, setAudioStates] = useState<{ [key: string]: boolean }>({})
  const [userInputs, setUserInputs] = useState<{ [key: string]: string }>({})

  // ✅ FIX: Add state to track if current step exercises are completed
  const [currentStepCompleted, setCurrentStepCompleted] = useState(false)
  const [answeredExercises, setAnsweredExercises] = useState<Set<string>>(new Set())

  const { toast } = useToast()
  const { user } = useAuth()

  const setAudioState = (key: string, isPlayingState: boolean) => {
    setAudioStates((prev) => ({
      ...prev,
      [key]: isPlayingState,
    }))
  }

  const playAudio = async (audioPath: string | undefined, text: string, buttonKey?: string) => {
    try {
      if (buttonKey) setAudioState(buttonKey, true)
      setIsPlaying(true)

      await audioPlayer.playAudio(audioPath, text, lesson?.language || "japanese")

      toast({
        title: "🔊 Audio Playing",
        description: `Playing: "${text}"`,
      })
    } catch (error) {
      console.error("Audio playback failed:", error)
      toast({
        title: "⚠️ Audio Unavailable",
        description: "Could not play audio for this content",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setIsPlaying(false)
        if (buttonKey) setAudioState(buttonKey, false)
      }, 2000)
    }
  }

  useEffect(() => {
    return () => {
      audioPlayer.stop()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showCompletionScreen) {
        setTimeSpent((prev) => prev + 1)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [showCompletionScreen])

  useEffect(() => {
    if (id) {
      fetchLesson()
    }
  }, [id])

  // ✅ FIX: Reset step states when moving between steps
  useEffect(() => {
    setSelectedAnswer(null)
    setShowResult(false)
    setUserInputs({})
    setCurrentStepCompleted(false)
    setAnsweredExercises(new Set())
  }, [currentStep])

  const fetchLesson = async () => {
    if (!id) return

    setLoading(true)
    try {
      const response = await lessonsAPI.getLessonDetails(id)
      setLesson(response.lesson)
      setCurrentStep(response.lesson.currentProgress || 0)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lesson details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async () => {
    if (!lesson || !id) return

    try {
      const isCompleted = currentStep >= lesson.totalSteps - 1
      const wasAlreadyCompleted = lesson.completed

      await lessonsAPI.updateProgress(id, {
        currentStep: currentStep,
        totalSteps: lesson.totalSteps,
        completed: isCompleted,
        timeSpent: Math.max(timeSpent, 1),
        language: lesson.language,
        score: Math.round((currentStep / lesson.totalSteps) * 100),
      })

      if (isCompleted && !showCompletionScreen) {
        setIsFirstTimeCompletion(!wasAlreadyCompleted)
        setLesson((prev) => ({ ...prev, completed: true }))
        setShowCompletionScreen(true)

        window.dispatchEvent(
          new CustomEvent("lessonCompleted", {
            detail: { lessonId: id, language: lesson.language, xpEarned: lesson.xpReward || 50 },
          }),
        )

        toast({
          title: "🎉 Lesson Completed!",
          description: `Congratulations! You earned ${lesson.xpReward || 50} XP!`,
        })
      }
    } catch (error) {
      console.error("Progress update error:", error)
      toast({
        title: "Warning",
        description: "Progress couldn't be saved",
        variant: "destructive",
      })
    }
  }

  // ✅ FIX: Modified handleNext to not auto-advance on practice steps
  const handleNext = () => {
    const currentStepData = lesson.steps?.[currentStep]

    // For practice steps, check if all exercises are completed
    if (currentStepData?.type === "practice") {
      const hasExercises =
        currentStepData.content?.exercises &&
        Array.isArray(currentStepData.content.exercises) &&
        currentStepData.content.exercises.length > 0

      if (hasExercises && !currentStepCompleted) {
        toast({
          title: "Complete all exercises",
          description: "Please answer all questions before proceeding",
          variant: "destructive",
        })
        return
      }
    }

    if (currentStep < lesson.totalSteps - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      updateProgress()
    } else {
      updateProgress()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (exerciseId: string, value: string) => {
    setUserInputs((prev) => ({
      ...prev,
      [exerciseId]: value,
    }))
  }

  // ✅ FIX: Modified answer selection to not auto-submit
  const handleAnswerSelect = (answer: string, correctAnswer: string, exerciseId: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)

    // Mark this exercise as answered
    setAnsweredExercises((prev) => new Set([...prev, exerciseId]))

    const isCorrect = answer === correctAnswer

    if (isCorrect) {
      toast({
        title: "Correct! ✅",
        description: "Great job! You're making progress.",
      })
    } else {
      toast({
        title: "Not quite right 🤔",
        description: "Try again or check the explanation.",
        variant: "destructive",
      })
    }

    // ✅ FIX: Check if all exercises are completed
    checkIfStepCompleted(exerciseId)
  }

  const handleFillBlankCheck = (userAnswer: string, correctAnswer: string, exerciseId: string) => {
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()
    setShowResult(true)

    // Mark this exercise as answered
    setAnsweredExercises((prev) => new Set([...prev, exerciseId]))

    if (isCorrect) {
      toast({
        title: "Perfect! ✅",
        description: "You got it right!",
      })
    } else {
      toast({
        title: "Try again 🤔",
        description: `Correct answer: ${correctAnswer}`,
        variant: "destructive",
      })
    }

    // ✅ FIX: Check if all exercises are completed
    checkIfStepCompleted(exerciseId)
  }

  // ✅ FIX: New function to check if current step is completed
  const checkIfStepCompleted = (exerciseId: string) => {
    const currentStepData = lesson.steps?.[currentStep]
    const exercises = currentStepData?.content?.exercises || []

    if (exercises.length === 0) {
      setCurrentStepCompleted(true)
      return
    }

    // Check if all exercises have been answered
    const newAnsweredExercises = new Set([...answeredExercises, exerciseId])
    const allAnswered = exercises.every((exercise: any) =>
      newAnsweredExercises.has(exercise.id || `exercise-${exercises.indexOf(exercise)}`),
    )

    if (allAnswered) {
      setCurrentStepCompleted(true)
      toast({
        title: "Step Complete! 🎉",
        description: "All exercises completed. You can now proceed to the next step.",
      })
    }
  }

  const handleBackToLessons = () => {
    navigate("/lessons", { state: { refresh: true } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <RefreshCw className="w-12 h-12 animate-spin text-emerald-400" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-emerald-400/20 rounded-full animate-pulse"></div>
          </div>
          <span className="text-white/80 text-lg font-medium">Loading lesson...</span>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 mx-auto text-slate-400" />
          <h2 className="text-2xl font-bold text-white">Lesson Not Found</h2>
          <p className="text-slate-300 mb-6">This lesson might have been moved or deleted</p>
          <Link to="/lessons">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (showCompletionScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Link to="/lessons">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lessons
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center space-y-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-yellow-500/25 animate-bounce">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
                <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 animate-ping"></div>
              </div>

              <div>
                <h1 className="text-4xl font-bold text-white mb-4">🎉 Lesson Mastered!</h1>
                <p className="text-xl text-white/80 mb-2">Congratulations on completing</p>
                <h2 className="text-2xl font-semibold text-emerald-300">{lesson.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
                  <Zap className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                  <p className="text-3xl font-bold text-yellow-300 mb-2">
                    {isFirstTimeCompletion ? `+${lesson.xpReward || 50}` : "0"}
                  </p>
                  <p className="text-yellow-200/80">XP Earned</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
                  <Clock className="w-12 h-12 mx-auto text-blue-400 mb-4" />
                  <p className="text-3xl font-bold text-blue-300 mb-2">{timeSpent}m</p>
                  <p className="text-blue-200/80">Time Spent</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/30">
                  <Target className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
                  <p className="text-3xl font-bold text-emerald-300 mb-2">100%</p>
                  <p className="text-emerald-200/80">Complete</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(0)
                    setShowCompletionScreen(false)
                    setSelectedAnswer(null)
                    setShowResult(false)
                  }}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  Review Lesson
                </Button>

                <Link to="/lessons" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg">
                    Back to Lessons
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentStepData = lesson.steps?.[currentStep]
  const progress = lesson.totalSteps > 0 ? ((currentStep + 1) / lesson.totalSteps) * 100 : 0
  const isLastStep = currentStep >= lesson.totalSteps - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/lessons">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lessons
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
              <p className="text-white/70">{lesson.description}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-yellow-500/30">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-semibold">+{lesson.xpReward || 50} XP</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-white">Lesson Progress</span>
            <span className="text-white/70">
              Step {currentStep + 1} of {lesson.totalSteps}
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/25"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-white/60 mt-2">
              <span>{Math.round(progress)}% Complete</span>
              <span>{timeSpent}m spent</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl min-h-[600px]">
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-white">{currentStepData?.title || `Step ${currentStep + 1}`}</h2>
                <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30">
                  {currentStep + 1}/{lesson.totalSteps}
                </div>
              </div>
              <p className="text-white/70 text-lg">
                {currentStepData?.type === "vocabulary" && "Learn new vocabulary with examples and pronunciation"}
                {currentStepData?.type === "phrase" && "Master essential phrases for real conversations"}
                {currentStepData?.type === "dialogue" && "Practice interactive conversations"}
                {currentStepData?.type === "practice" && "Test your knowledge with exercises"}
              </p>
            </div>

            <div className="space-y-8">
              {currentStepData ? (
                <>
                  {currentStepData.type === "vocabulary" && currentStepData.content && (
                    <div className="text-center space-y-8">
                      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-3xl p-12 max-w-lg mx-auto shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-transform duration-300">
                        <div className="space-y-6">
                          <h3 className="text-5xl font-bold mb-4">
                            {currentStepData.content.word || "No word available"}
                          </h3>
                          <p className="text-2xl opacity-90">
                            {currentStepData.content.translation || "No translation"}
                          </p>
                          {currentStepData.content.pronunciation && (
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
                              <p className="text-lg opacity-90">{currentStepData.content.pronunciation}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {currentStepData.content.example && (
                        <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                          <div className="flex items-start gap-3">
                            <MessageCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-lg font-semibold text-blue-300 mb-2">Example Usage:</p>
                              <p className="text-xl text-white">{currentStepData.content.example}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStepData.content.notes && (
                        <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-lg font-semibold text-amber-300 mb-2">Learning Note:</p>
                              <p className="text-white/90">{currentStepData.content.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-center gap-4">
                        <Button
                          size="lg"
                          onClick={() =>
                            playAudio(currentStepData.content.audio, currentStepData.content.word, "vocab-listen")
                          }
                          disabled={audioStates["vocab-listen"] || isPlaying}
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg px-8 py-3"
                        >
                          {audioStates["vocab-listen"] || isPlaying ? (
                            <Pause className="w-5 h-5 mr-2" />
                          ) : (
                            <Volume2 className="w-5 h-5 mr-2" />
                          )}
                          {audioStates["vocab-listen"] || isPlaying ? "Playing..." : "Listen"}
                        </Button>

                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() =>
                            playAudio(currentStepData.content.audio, currentStepData.content.word, "vocab-repeat")
                          }
                          disabled={audioStates["vocab-repeat"] || isPlaying}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-3"
                        >
                          <RotateCcw className="w-5 h-5 mr-2" />
                          Repeat
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStepData.type === "phrase" && currentStepData.content && (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-3xl p-12 shadow-2xl shadow-emerald-500/25 transform hover:scale-105 transition-transform duration-300">
                        <div className="text-center space-y-6">
                          <h3 className="text-4xl font-bold">
                            {currentStepData.content.phrase || "No phrase available"}
                          </h3>
                          <p className="text-2xl opacity-90">
                            {currentStepData.content.translation || "No translation"}
                          </p>
                          {currentStepData.content.pronunciation && (
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
                              <p className="text-lg opacity-90">{currentStepData.content.pronunciation}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {currentStepData.content.example && (
                        <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6">
                          <p className="text-lg font-semibold text-emerald-300 mb-3">Example in Context:</p>
                          <p className="text-xl text-white">{currentStepData.content.example}</p>
                        </div>
                      )}

                      {currentStepData.content.notes && (
                        <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6">
                          <p className="text-lg font-semibold text-amber-300 mb-3">Usage Note:</p>
                          <p className="text-white/90">{currentStepData.content.notes}</p>
                        </div>
                      )}

                      <div className="flex justify-center">
                        <Button
                          size="lg"
                          onClick={() =>
                            playAudio(currentStepData.content.audio, currentStepData.content.phrase, "phrase-listen")
                          }
                          disabled={audioStates["phrase-listen"] || isPlaying}
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg px-8 py-3"
                        >
                          <Volume2 className="w-5 h-5 mr-2" />
                          {audioStates["phrase-listen"] || isPlaying ? "Playing..." : "Listen & Repeat"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStepData.type === "dialogue" && currentStepData.content?.dialogue && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                          <Users className="w-8 h-8 text-blue-400" />
                          Conversation Practice
                        </h3>
                        <p className="text-white/70 text-lg">Practice this real-world conversation</p>
                      </div>

                      <div className="space-y-6 max-w-3xl mx-auto">
                        {currentStepData.content.dialogue.map((line: any, index: number) => (
                          <div key={index} className={`flex ${index % 2 === 1 ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-sm rounded-2xl p-6 backdrop-blur-sm border shadow-lg ${
                                index % 2 === 1
                                  ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30 text-white"
                                  : "bg-white/10 border-white/20 text-white"
                              }`}
                            >
                              <div className="text-sm font-medium mb-3 opacity-75">
                                {line.speaker || `Speaker ${index + 1}`}
                              </div>
                              <div className="text-lg mb-3 font-medium">{line.text}</div>
                              {line.translation && (
                                <div className="text-sm opacity-75 italic mb-3">{line.translation}</div>
                              )}
                              {line.pronunciation && (
                                <div className="text-xs opacity-60 font-mono mb-4 bg-black/20 rounded px-2 py-1">
                                  [{line.pronunciation}]
                                </div>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => playAudio(line.audio, line.text, `dialogue-${index}`)}
                                disabled={audioStates[`dialogue-${index}`] || isPlaying}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                              >
                                <Volume2 className="w-3 h-3 mr-2" />
                                {audioStates[`dialogue-${index}`] || isPlaying ? "Playing..." : "Listen"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center">
                        <Button
                          size="lg"
                          onClick={async () => {
                            setIsPlaying(true)
                            for (let i = 0; i < currentStepData.content.dialogue.length; i++) {
                              const line = currentStepData.content.dialogue[i]
                              try {
                                await audioPlayer.playAudio(line.audio, line.text, lesson?.language || "japanese")
                                await new Promise((resolve) => setTimeout(resolve, 1000))
                              } catch (error) {
                                console.error("Error playing dialogue line:", error)
                              }
                            }
                            setIsPlaying(false)
                          }}
                          disabled={isPlaying}
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg px-8 py-3"
                        >
                          <Volume2 className="w-5 h-5 mr-2" />
                          {isPlaying ? "Playing..." : "Play Full Conversation"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStepData.type === "practice" && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                          <Brain className="w-8 h-8 text-purple-400" />
                          Practice Exercises
                        </h3>
                        <p className="text-white/70 text-lg">Test your understanding</p>
                      </div>

                      {currentStepData.content?.exercises &&
                      Array.isArray(currentStepData.content.exercises) &&
                      currentStepData.content.exercises.length > 0 ? (
                        <div className="space-y-8">
                          {currentStepData.content.exercises.map((exercise: any, index: number) => {
                            const exerciseId = exercise.id || `exercise-${index}`
                            const isAnswered = answeredExercises.has(exerciseId)

                            return (
                              <div
                                key={exerciseId}
                                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
                              >
                                <div className="flex items-center justify-between mb-6">
                                  <h4 className="text-xl font-semibold text-white">{exercise.question}</h4>
                                  {isAnswered && (
                                    <div className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium border border-emerald-500/30 flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      Answered
                                    </div>
                                  )}
                                </div>

                                {/* Multiple Choice */}
                                {exercise.type === "multiple_choice" && exercise.options && (
                                  <>
                                    <div className="space-y-3 mb-6">
                                      {exercise.options.map((option: string, optIndex: number) => {
                                        const isSelected = selectedAnswer === option
                                        const isCorrect = option === exercise.correctAnswer
                                        const showCorrect = showResult && isCorrect && isAnswered
                                        const showWrong = showResult && isSelected && !isCorrect && isAnswered

                                        return (
                                          <button
                                            key={optIndex}
                                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                              showCorrect
                                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                                : showWrong
                                                  ? "bg-red-500/20 border-red-500/50 text-red-300"
                                                  : isSelected
                                                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                                    : "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                                            } ${isAnswered ? "cursor-default" : "cursor-pointer hover:scale-105"}`}
                                            onClick={() =>
                                              !isAnswered &&
                                              handleAnswerSelect(option, exercise.correctAnswer, exerciseId)
                                            }
                                            disabled={isAnswered}
                                          >
                                            <div className="flex items-center gap-4">
                                              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold">
                                                {String.fromCharCode(65 + optIndex)}
                                              </div>
                                              <span className="flex-1 text-lg">{option}</span>

                                              {showCorrect && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                                              {showWrong && <XCircle className="w-6 h-6 text-red-400" />}
                                            </div>
                                          </button>
                                        )
                                      })}
                                    </div>

                                    {showResult && exercise.explanation && isAnswered && (
                                      <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                                        <div className="flex items-start gap-3">
                                          <Lightbulb className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                                          <div>
                                            <p className="text-lg font-semibold text-blue-300 mb-2">Explanation:</p>
                                            <p className="text-white/90">{exercise.explanation}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Fill in the Blank */}
                                {exercise.type === "fill_in_the_blank" && (
                                  <>
                                    <div className="space-y-4 mb-6">
                                      <input
                                        type="text"
                                        value={userInputs[exerciseId] || ""}
                                        onChange={(e) => handleInputChange(exerciseId, e.target.value)}
                                        placeholder="Type your answer..."
                                        disabled={isAnswered}
                                        className="w-full p-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                                        onKeyPress={(e) => {
                                          if (e.key === "Enter" && !isAnswered && userInputs[exerciseId]?.trim()) {
                                            handleFillBlankCheck(
                                              userInputs[exerciseId],
                                              exercise.answer || exercise.correctAnswer,
                                              exerciseId,
                                            )
                                          }
                                        }}
                                      />
                                      <Button
                                        onClick={() =>
                                          handleFillBlankCheck(
                                            userInputs[exerciseId] || "",
                                            exercise.answer || exercise.correctAnswer,
                                            exerciseId,
                                          )
                                        }
                                        disabled={isAnswered || !userInputs[exerciseId]?.trim()}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg py-3"
                                      >
                                        Check Answer
                                      </Button>
                                    </div>

                                    {showResult && isAnswered && (
                                      <div
                                        className={`backdrop-blur-sm rounded-xl p-6 border ${
                                          userInputs[exerciseId]?.trim().toLowerCase() ===
                                          (exercise.answer || exercise.correctAnswer)?.toLowerCase()
                                            ? "bg-emerald-500/10 border-emerald-500/30"
                                            : "bg-red-500/10 border-red-500/30"
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          {userInputs[exerciseId]?.trim().toLowerCase() ===
                                          (exercise.answer || exercise.correctAnswer)?.toLowerCase() ? (
                                            <CheckCircle className="w-6 h-6 text-emerald-400 mt-1 flex-shrink-0" />
                                          ) : (
                                            <XCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                                          )}
                                          <div>
                                            <p className="text-lg font-semibold mb-2 text-white">
                                              {userInputs[exerciseId]?.trim().toLowerCase() ===
                                              (exercise.answer || exercise.correctAnswer)?.toLowerCase()
                                                ? "Correct! ✅"
                                                : "Try again 🤔"}
                                            </p>
                                            {userInputs[exerciseId]?.trim().toLowerCase() !==
                                              (exercise.answer || exercise.correctAnswer)?.toLowerCase() && (
                                              <p className="text-white/90 mb-2">
                                                <strong>Correct answer:</strong>{" "}
                                                {exercise.answer || exercise.correctAnswer}
                                              </p>
                                            )}
                                            {exercise.explanation && (
                                              <p className="text-white/80">{exercise.explanation}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )
                          })}

                          {currentStepCompleted && (
                            <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
                              <div className="flex items-center justify-center gap-3 text-emerald-300">
                                <CheckCircle className="w-6 h-6" />
                                <span className="text-lg font-semibold">
                                  All exercises completed! You can now proceed to the next step.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 max-w-2xl mx-auto">
                            <Trophy className="w-20 h-20 mx-auto text-emerald-400 mb-8" />
                            <h3 className="text-3xl font-bold text-white mb-4">Excellent Progress!</h3>
                            <p className="text-white/80 mb-8 text-xl">
                              You've mastered all the content in this lesson.
                            </p>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
                              <h4 className="text-xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                                What You've Learned:
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-white/80">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                  Essential vocabulary
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  Common phrases
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                  Pronunciation practice
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                                  Cultural understanding
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 mb-8">
                              <div className="flex items-center justify-center gap-3 text-yellow-300">
                                <Zap className="w-6 h-6" />
                                <span className="text-xl font-semibold">Ready to earn {lesson.xpReward || 50} XP!</span>
                              </div>
                            </div>

                            <p className="text-emerald-300 font-semibold text-lg">
                              Click "Complete Lesson" to finish and earn your reward!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">No Content Available</h3>
                  <p className="text-white/70 mb-6">This step might need content regeneration.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-white/70 font-medium">
                Step {currentStep + 1} of {lesson.totalSteps}
              </span>
              {currentStepData?.type === "practice" &&
                !currentStepCompleted &&
                currentStepData.content?.exercises?.length > 0 && (
                  <div className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm font-medium border border-orange-500/30">
                    Complete all exercises to proceed
                  </div>
                )}
            </div>

            <Button
              onClick={handleNext}
              className={`px-6 py-3 ${isLastStep ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700" : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"} text-white shadow-lg`}
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
        </div>

        {lesson.culturalNotes && (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <div className="flex items-start gap-4">
              <Lightbulb className="w-8 h-8 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-purple-300 mb-4">Cultural Insight</h3>
                <p className="text-white/90 text-lg leading-relaxed">{lesson.culturalNotes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonView
