import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ArrowRight
} from "lucide-react";
import { lessonsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.currentLanguage) {
      fetchDashboard();
    }
  }, [user?.currentLanguage]);

  // ✅ FIXED: Listen for lesson completion events to refresh dashboard
  useEffect(() => {
    const handleLessonCompleted = (event: any) => {
      console.log('📊 Lesson completed, refreshing dashboard...', event.detail);
      fetchDashboard();
    };

    window.addEventListener('lessonCompleted', handleLessonCompleted);
    
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, []);

  const fetchDashboard = async () => {
    if (!user?.currentLanguage) return;
    
    setLoading(true);
    try {
      const response = await lessonsAPI.getDashboard(user.currentLanguage);
      console.log('📊 Dashboard API Response:', response); // Debug log
      setDashboardData(response.dashboard);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading your progress...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No dashboard data available</p>
        <Button onClick={fetchDashboard} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // ✅ FIXED: Use backend-calculated XP progress
  const xpProgress = dashboardData?.xpProgress !== undefined 
    ? Math.min(100, (dashboardData.xpProgress / 100) * 100) // Convert to percentage
    : 0;
    
  const completionRate = (dashboardData?.completedLessons && dashboardData?.totalLessons) 
    ? Math.min(100, (dashboardData.completedLessons / dashboardData.totalLessons) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.displayName || user?.username || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue your {dashboardData.language || user?.currentLanguage} learning journey
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Level {dashboardData.level || 1}
          </Badge>
          <Badge className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500">
            <Flame className="w-4 h-4" />
            {dashboardData.currentStreak || 0} Day Streak
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* XP Progress */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Experience Points</CardTitle>
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-900">{dashboardData.totalXP || 0}</span>
                <span className="text-sm text-blue-600">/ {dashboardData.xpForNextLevel || 100}</span>
              </div>
              <Progress value={xpProgress} className="h-2 bg-blue-200" />
              <p className="text-xs text-blue-600">
                {dashboardData.xpNeededForNext || 0} XP to next level
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Completion Rate</CardTitle>
              <Target className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-900">{Math.round(completionRate)}%</span>
                <span className="text-sm text-green-600">{dashboardData.completedLessons || 0}/{dashboardData.totalLessons || 0}</span>
              </div>
              <Progress value={completionRate} className="h-2 bg-green-200" />
              <p className="text-xs text-green-600">
                {(dashboardData.totalLessons || 0) - (dashboardData.completedLessons || 0)} lessons remaining
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Study Time */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">Study Time</CardTitle>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className="text-2xl font-bold text-purple-900">{dashboardData.timeSpent || 0}m</span>
              <p className="text-xs text-purple-600">Total time invested</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-purple-600">Goal: {dashboardData.dailyGoal || 15}m/day</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-700">Performance</CardTitle>
              <BarChart3 className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className="text-2xl font-bold text-orange-900">{dashboardData.averageScore || 0}%</span>
              <p className="text-xs text-orange-600">Average lesson score</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-orange-600">Keep improving!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest learning sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentLessons?.length > 0 ? (
                dashboardData.recentLessons.map((lesson: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{lesson.title || 'Lesson'}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.timeSpent || 0}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {lesson.difficulty || 'Beginner'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.completed ? (
                        <Badge className="bg-green-100 text-green-800">
                          ✓ Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {lesson.progress || 0}% Done
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent activity. Start a lesson to see your progress!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Achievements
            </CardTitle>
            <CardDescription>Your learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Trophy className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                <h4 className="font-semibold text-yellow-800">{dashboardData.completedLessons || 0}</h4>
                <p className="text-xs text-yellow-600">Lessons Completed</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Star className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-800">Level {dashboardData.level || 1}</h4>
                <p className="text-xs text-blue-600">Current Level</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <Flame className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <h4 className="font-semibold text-red-800">{dashboardData.currentStreak || 0}</h4>
                <p className="text-xs text-red-600">Day Streak</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Clock className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <h4 className="font-semibold text-purple-800">{dashboardData.timeSpent || 0}m</h4>
                <p className="text-xs text-purple-600">Time Invested</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
