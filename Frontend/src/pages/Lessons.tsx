import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BookOpen,
  Clock,
  Star,
  Play,
  Lock,
  CheckCircle,
  Users,
  MessageCircle,
  Brain,
  Zap,
  Trophy,
  ArrowRight,
  Target,
  Award,
  Flame,
} from "lucide-react"
import { lessonsAPI } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface Lesson {
  _id?: string
  id?: string
  uniqueKey: string
  sequenceNumber: number
  title: string
  completed: boolean
  locked: boolean
  progress: number
  difficulty: string
  estimatedMinutes: number
  xpReward: number
  description?: string
  culturalNotes?: string
  steps?: Array<{
    type: string
    content?: {
      audio?: boolean
    }
  }>
}

const Lessons = () => {
  const [loading, setLoading] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState("japanese")
  const [lessons, setLessons] = useState<Lesson[]>([])
  const { user } = useAuth()

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
  }

  const getUniqueStepTypes = (lesson: Lesson): string[] => {
    if (!lesson.steps) return []
    const uniqueTypes = [...new Set(lesson.steps.map((step) => step.type))]
    return uniqueTypes
  }

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "Beginner":
        return "from-emerald-500 to-emerald-600"
      case "Intermediate":
        return "from-amber-500 to-orange-500"
      case "Advanced":
        return "from-red-500 to-pink-500"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  const getDifficultyBadgeColor = (difficulty: string): string => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "Intermediate":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      case "Advanced":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case "vocabulary":
        return <BookOpen className="w-4 h-4" />
      case "phrase":
        return <MessageCircle className="w-4 h-4" />
      case "dialogue":
        return <Users className="w-4 h-4" />
      case "practice":
        return <Brain className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const groupedLessons = lessons.reduce(
    (acc, lesson) => {
      const difficulty = lesson.difficulty || "Beginner"
      if (!acc[difficulty]) {
        acc[difficulty] = []
      }
      acc[difficulty].push(lesson)
      return acc
    },
    {} as Record<string, Lesson[]>,
  )

  const totalLessons = lessons.length
  const completedLessons = lessons.filter((l) => l.completed).length
  const inProgressLessons = lessons.filter((l) => l.progress > 0 && !l.completed).length
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await lessonsAPI.getLessonsByLanguage(selectedLanguage)
        const lessonsWithKeys = (response.lessons || []).map((lesson: any, index: number) => ({
          ...lesson,
          uniqueKey: `${lesson._id || lesson.id || index}-${index}`,
          sequenceNumber: index + 1,
        }))
        setLessons(lessonsWithKeys)
      } catch (error) {
        console.error("Failed to fetch lessons:", error)
        setLessons([])
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [selectedLanguage])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-400/30 rounded-full animate-spin border-t-emerald-400"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-blue-400/20 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Loading Your Learning Journey</h3>
              <p className="text-slate-400">Preparing your personalized lessons...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Learning Journey</h1>
                  <p className="text-slate-300 text-lg">
                    Master {selectedLanguage === "japanese" ? "Japanese 🇯🇵" : "Spanish 🇪🇸"} step by step
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[160px] bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="japanese" className="text-white hover:bg-slate-700">
                    🇯🇵 Japanese
                  </SelectItem>
                  <SelectItem value="spanish" className="text-white hover:bg-slate-700">
                    🇪🇸 Spanish
                  </SelectItem>
                </SelectContent>
              </Select>

              <Badge className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-white border-emerald-500/30 backdrop-blur-sm px-4 py-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-2" />
                Level {user?.level || 1}
              </Badge>
            </div>
          </div>

          {totalLessons > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{overallProgress}%</p>
                    <p className="text-emerald-300 text-sm">Overall Progress</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{completedLessons}</p>
                    <p className="text-blue-300 text-sm">Completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{inProgressLessons}</p>
                    <p className="text-amber-300 text-sm">In Progress</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {lessons.reduce((acc, lesson) => acc + (lesson.completed ? lesson.xpReward || 50 : 0), 0)}
                    </p>
                    <p className="text-purple-300 text-sm">Total XP</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/25">
              <BookOpen className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Begin Your Adventure!</h3>
            <p className="text-slate-300 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Start your {selectedLanguage === "japanese" ? "Japanese" : "Spanish"} learning journey with AI-powered
              lessons tailored just for you.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 py-4 text-lg shadow-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Create Your First Lesson
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedLessons).map(([difficulty, difficultyLessons]) => (
              <div key={difficulty} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-1 h-8 bg-gradient-to-b ${getDifficultyColor(difficulty)} rounded-full`}></div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{difficulty} Level</h2>
                    <p className="text-slate-400">
                      {difficultyLessons.filter((l) => l.completed).length} of {difficultyLessons.length} lessons
                      completed
                    </p>
                  </div>
                  <div className="flex-1">
                    <Progress
                      value={(difficultyLessons.filter((l) => l.completed).length / difficultyLessons.length) * 100}
                      className="h-2 bg-slate-700/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {difficultyLessons.map((lesson: Lesson) => {
                    const uniqueStepTypes = getUniqueStepTypes(lesson)

                    return (
                      <div key={lesson.uniqueKey} className="group">
                        <div
                          className={`relative rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm border-2 ${
                            lesson.completed
                              ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-400/50 shadow-lg shadow-emerald-500/10"
                              : lesson.progress > 0
                                ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30 hover:border-blue-400/50 shadow-lg shadow-blue-500/10"
                                : lesson.locked
                                  ? "bg-gradient-to-br from-slate-500/5 to-slate-600/5 border-slate-500/20 opacity-60"
                                  : "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-600/30 hover:border-slate-500/50 hover:shadow-xl hover:shadow-slate-500/10"
                          } hover:scale-[1.02] hover:-translate-y-1`}
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="relative flex-shrink-0">
                              <div
                                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                                  lesson.completed
                                    ? "border-emerald-500 bg-emerald-500/20"
                                    : lesson.locked
                                      ? "border-slate-500 bg-slate-500/20"
                                      : "border-slate-400 bg-slate-400/20"
                                }`}
                              >
                                {lesson.completed ? (
                                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                                ) : lesson.locked ? (
                                  <Lock className="w-6 h-6 text-slate-400" />
                                ) : (
                                  <span className="text-xl font-bold text-slate-300">{lesson.sequenceNumber}</span>
                                )}
                              </div>
                              {lesson.progress > 0 && !lesson.completed && (
                                <div className="absolute inset-0 rounded-full">
                                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="28"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      fill="none"
                                      className="text-blue-500"
                                      strokeDasharray={`${(lesson.progress / 100) * 175.93} 175.93`}
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">
                                  {lesson.title}
                                </h3>
                              </div>

                              <div className="flex items-center gap-3 mb-3">
                                <Badge className={getDifficultyBadgeColor(lesson.difficulty)}>
                                  {lesson.difficulty}
                                </Badge>
                                {lesson.completed && (
                                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                    ✅ Mastered
                                  </Badge>
                                )}
                                {lesson.progress > 0 && !lesson.completed && (
                                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                    {lesson.progress}% Complete
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-slate-300 mb-4">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{lesson.estimatedMinutes} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Zap className="w-4 h-4 text-yellow-400" />
                                  <span>{lesson.xpReward || 50} XP</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {uniqueStepTypes.slice(0, 4).map((type: string) => (
                                  <div
                                    key={type}
                                    className="flex items-center gap-1 px-3 py-1 bg-slate-700/50 rounded-full border border-slate-600/50 text-xs text-slate-300"
                                  >
                                    {getStepIcon(type)}
                                    <span className="capitalize">{type}</span>
                                  </div>
                                ))}
                                {uniqueStepTypes.length > 4 && (
                                  <div className="px-3 py-1 bg-slate-700/50 rounded-full border border-slate-600/50 text-xs text-slate-300">
                                    +{uniqueStepTypes.length - 4}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {lesson.progress > 0 && !lesson.completed && (
                            <div className="mb-4">
                              <Progress value={lesson.progress} className="h-2 bg-slate-700/50" />
                            </div>
                          )}

                          <div className="flex justify-end">
                            {lesson.locked ? (
                              <Button disabled className="bg-slate-600/30 text-slate-500 cursor-not-allowed">
                                <Lock className="w-4 h-4 mr-2" />
                                Locked
                              </Button>
                            ) : (
                              <Button
                                asChild
                                className={`font-semibold px-6 py-2 ${
                                  lesson.completed
                                    ? "bg-slate-700/60 text-slate-200 border border-slate-600/50 hover:bg-slate-600/70 hover:text-white"
                                    : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg"
                                }`}
                              >
                                <Link to={`/lesson/${lesson._id || lesson.id}`} className="flex items-center gap-2">
                                  {lesson.completed ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Review
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4" />
                                      Start
                                    </>
                                  )}
                                  <ArrowRight className="w-4 h-4" />
                                </Link>
                              </Button>
                            )}
                          </div>

                          {lesson.completed && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500/10 to-yellow-500/10 border border-emerald-500/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Trophy className="w-5 h-5 text-yellow-400" />
                                  <span className="font-semibold text-emerald-300">Lesson Mastered!</span>
                                </div>
                                <span className="text-emerald-200 font-semibold">+{lesson.xpReward || 50} XP</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Lessons
