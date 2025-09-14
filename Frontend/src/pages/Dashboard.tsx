import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Zap,
  Target,
  Trophy,
  Flame,
  BookOpen,
  BarChart3,
  RefreshCw,
} from "lucide-react"
import { lessonsAPI } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.currentLanguage) {
      fetchDashboard()
    }
  }, [user?.currentLanguage])

  // ✅ FIXED: Listen for lesson completion events to refresh dashboard
  useEffect(() => {
    const handleLessonCompleted = (event: any) => {
      console.log("📊 Lesson completed, refreshing dashboard...", event.detail)
      fetchDashboard()
    }

    window.addEventListener("lessonCompleted", handleLessonCompleted)

    return () => {
      window.removeEventListener("lessonCompleted", handleLessonCompleted)
    }
  }, [])

  const fetchDashboard = async () => {
    if (!user?.currentLanguage) return

    setLoading(true)
    try {
      const response = await lessonsAPI.getDashboard(user.currentLanguage)
      console.log("📊 Dashboard API Response:", response) // Debug log
      setDashboardData(response.dashboard)
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="ml-3 text-slate-300">Loading your progress...</span>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-300">No dashboard data available</p>
          <Button onClick={fetchDashboard} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // ✅ FIXED: Use backend-calculated XP progress
  const xpProgress =
    dashboardData?.xpProgress !== undefined
      ? Math.min(100, (dashboardData.xpProgress / 100) * 100) // Convert to percentage
      : 0

  const completionRate =
    dashboardData?.completedLessons && dashboardData?.totalLessons
      ? Math.min(100, (dashboardData.completedLessons / dashboardData.totalLessons) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.displayName || user?.username || "User"}! 
            </h1>
            <p className="text-slate-300 text-lg">
              Continue your {dashboardData.language || user?.currentLanguage} learning journey
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              <Trophy className="w-4 h-4" />
              Level {dashboardData.level || 1}
            </Badge>
            <Badge className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <Flame className="w-4 h-4" />
              {dashboardData.currentStreak || 0} Day Streak
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* XP Progress */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-300">Experience Points</CardTitle>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">{dashboardData.totalXP || 0}</span>
                  <span className="text-sm text-blue-300">/ {dashboardData.xpForNextLevel || 100}</span>
                </div>
                <Progress value={xpProgress} className="h-3 bg-slate-700" />
                <p className="text-xs text-blue-300">{dashboardData.xpNeededForNext || 0} XP to next level</p>
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-emerald-300">Completion Rate</CardTitle>
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">{Math.round(completionRate)}%</span>
                  <span className="text-sm text-emerald-300">
                    {dashboardData.completedLessons || 0}/{dashboardData.totalLessons || 0}
                  </span>
                </div>
                <Progress value={completionRate} className="h-3 bg-slate-700" />
                <p className="text-xs text-emerald-300">
                  {(dashboardData.totalLessons || 0) - (dashboardData.completedLessons || 0)} lessons remaining
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Study Time */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-300">Study Time</CardTitle>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <span className="text-3xl font-bold text-white">{dashboardData.timeSpent || 0}m</span>
                <p className="text-xs text-purple-300">Total time invested</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-xs text-purple-300">Goal: {dashboardData.dailyGoal || 15}m/day</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-300">Performance</CardTitle>
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-orange-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <span className="text-3xl font-bold text-white">{dashboardData.averageScore || 0}%</span>
                <p className="text-xs text-orange-300">Average lesson score</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-orange-300">Keep improving!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-slate-300">Your latest learning sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentLessons?.length > 0 ? (
                  dashboardData.recentLessons.map((lesson: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-slate-600"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{lesson.title || "Lesson"}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-300 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.timeSpent || 0}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {lesson.difficulty || "Beginner"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.completed ? (
                          <Badge className="bg-emerald-600 text-white border-0">✓ Completed</Badge>
                        ) : (
                          <Badge className="bg-slate-600 text-slate-200 border-slate-500">
                            {lesson.progress || 0}% Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-300 text-center py-8">
                    No recent activity. Start a lesson to see your progress!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Achievements
              </CardTitle>
              <CardDescription className="text-slate-300">Your learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                  <Trophy className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                  <h4 className="font-semibold text-white text-lg">{dashboardData.completedLessons || 0}</h4>
                  <p className="text-xs text-yellow-300">Lessons Completed</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                  <Star className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                  <h4 className="font-semibold text-white text-lg">Level {dashboardData.level || 1}</h4>
                  <p className="text-xs text-blue-300">Current Level</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30">
                  <Flame className="w-8 h-8 mx-auto text-red-400 mb-2" />
                  <h4 className="font-semibold text-white text-lg">{dashboardData.currentStreak || 0}</h4>
                  <p className="text-xs text-red-300">Day Streak</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl border border-purple-500/30">
                  <Clock className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                  <h4 className="font-semibold text-white text-lg">{dashboardData.timeSpent || 0}m</h4>
                  <p className="text-xs text-purple-300">Time Invested</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
