import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Calendar,
  Flame,
  Star,
  BarChart3,
  Clock,
  Award,
  BookOpen
} from "lucide-react";

const Progress = () => {
  const stats = {
    totalXP: 1250,
    currentLevel: 5,
    xpToNextLevel: 750,
    currentStreak: 7,
    longestStreak: 15,
    accuracy: 92,
    fluency: 78,
    lessonsCompleted: 24,
    totalStudyTime: 42.5
  };

  const weeklyProgress = [
    { day: "Mon", xp: 120, time: 45 },
    { day: "Tue", xp: 85, time: 30 },
    { day: "Wed", xp: 150, time: 60 },
    { day: "Thu", xp: 95, time: 35 },
    { day: "Fri", xp: 180, time: 75 },
    { day: "Sat", xp: 140, time: 55 },
    { day: "Sun", xp: 110, time: 40 }
  ];

  const achievements = [
    { 
      title: "First Steps", 
      description: "Complete your first lesson",
      earned: true,
      icon: BookOpen,
      date: "2 weeks ago"
    },
    { 
      title: "Week Warrior", 
      description: "Study for 7 consecutive days",
      earned: true,
      icon: Flame,
      date: "1 week ago"
    },
    { 
      title: "Perfect Score", 
      description: "Get 100% accuracy in a quiz",
      earned: true,
      icon: Star,
      date: "3 days ago"
    },
    { 
      title: "Speed Learner", 
      description: "Complete 5 lessons in one day",
      earned: false,
      icon: Trophy,
      date: null
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Progress Tracking</h1>
        <p className="text-muted-foreground">Monitor your learning journey and achievements</p>
      </div>

      {/* Level & XP Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Trophy className="h-4 w-4 text-xp-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {stats.currentLevel}</div>
            <p className="text-xs text-muted-foreground">
              {stats.xpToNextLevel} XP to Level {stats.currentLevel + 1}
            </p>
            <ProgressBar value={65} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Star className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +180 this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-streak-fire" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Best: {stats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudyTime}h</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Skill Progress
            </CardTitle>
            <CardDescription>
              Your performance in different areas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span>{stats.accuracy}%</span>
              </div>
              <ProgressBar value={stats.accuracy} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fluency</span>
                <span>{stats.fluency}%</span>
              </div>
              <ProgressBar value={stats.fluency} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vocabulary</span>
                <span>85%</span>
              </div>
              <ProgressBar value={85} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Grammar</span>
                <span>73%</span>
              </div>
              <ProgressBar value={73} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Activity
            </CardTitle>
            <CardDescription>
              Your daily XP and study time this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-sm font-medium">{day.day}</div>
                    <div className="flex-1 bg-muted rounded-full h-2 min-w-[100px]">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full"
                        style={{ width: `${Math.min((day.xp / 200) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-accent font-medium">{day.xp} XP</span>
                    <span className="text-muted-foreground">{day.time}m</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
          <CardDescription>
            Unlock badges by reaching learning milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className={`flex items-center gap-4 p-4 rounded-lg border ${
                  achievement.earned ? 'bg-secondary/10 border-secondary/20' : 'bg-muted/50 border-muted opacity-60'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.earned ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.earned && achievement.date && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Earned {achievement.date}
                      </Badge>
                    )}
                  </div>
                  {achievement.earned && (
                    <div className="text-secondary">
                      <Trophy className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Progress;