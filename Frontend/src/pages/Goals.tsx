import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Plus, 
  Calendar,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Trophy,
  Flame,
  Edit,
  Trash2
} from "lucide-react";

const Goals = () => {
  const [showAddGoal, setShowAddGoal] = useState(false);

  const goals = [
    {
      id: 1,
      title: "Complete 5 lessons this week",
      description: "Finish interactive lessons to improve vocabulary and grammar",
      type: "Weekly",
      progress: 3,
      target: 5,
      deadline: "2024-01-21",
      priority: "High",
      category: "Lessons",
      completed: false,
      streakCount: 2,
      xpReward: 100
    },
    {
      id: 2, 
      title: "Practice conversation for 30 minutes daily",
      description: "Use AI chat or character conversations to improve speaking skills",
      type: "Daily",
      progress: 25,
      target: 30,
      deadline: "2024-01-15",
      priority: "High", 
      category: "Speaking",
      completed: false,
      streakCount: 7,
      xpReward: 50
    },
    {
      id: 3,
      title: "Learn 50 new vocabulary words",
      description: "Expand vocabulary through word of the day and lessons",
      type: "Monthly",
      progress: 32,
      target: 50,
      deadline: "2024-01-31",
      priority: "Medium",
      category: "Vocabulary",
      completed: false,
      streakCount: 0,
      xpReward: 250
    },
    {
      id: 4,
      title: "Achieve 90% accuracy in quizzes",
      description: "Maintain high accuracy to demonstrate understanding",
      type: "Ongoing",
      progress: 87,
      target: 90,
      deadline: null,
      priority: "Medium",
      category: "Assessment",
      completed: false,
      streakCount: 0,
      xpReward: 150
    },
    {
      id: 5,
      title: "Complete beginner course",
      description: "Finish all beginner-level lessons and assessments",
      type: "Long-term",
      progress: 24,
      target: 30,
      deadline: "2024-03-01",
      priority: "Low",
      category: "Course",
      completed: false,
      streakCount: 0,
      xpReward: 500
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-destructive text-destructive-foreground";
      case "Medium": return "bg-accent text-accent-foreground";
      case "Low": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Daily": return "text-streak-fire";
      case "Weekly": return "text-accent";
      case "Monthly": return "text-secondary";
      case "Ongoing": return "text-primary";
      case "Long-term": return "text-ai-purple";
      default: return "text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Lessons": return BookOpen;
      case "Speaking": return Target;
      case "Vocabulary": return Star;
      case "Assessment": return Trophy;
      case "Course": return TrendingUp;
      default: return Target;
    }
  };

  const isOverdue = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const daysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Learning Goals</h1>
          <p className="text-muted-foreground">Set and track personalized learning objectives with reminders</p>
        </div>
        <Button onClick={() => setShowAddGoal(!showAddGoal)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Goal
        </Button>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{goals.filter(g => g.completed).length}</p>
                <p className="text-sm text-muted-foreground">Completed Goals</p>
              </div>
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{goals.filter(g => !g.completed).length}</p>
                <p className="text-sm text-muted-foreground">Active Goals</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{goals.filter(g => g.streakCount > 0).length}</p>
                <p className="text-sm text-muted-foreground">On Streak</p>
              </div>
              <Flame className="w-8 h-8 text-streak-fire" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{goals.reduce((sum, g) => sum + g.xpReward, 0)}</p>
                <p className="text-sm text-muted-foreground">Total XP Rewards</p>
              </div>
              <Star className="w-8 h-8 text-xp-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Goal Form */}
      {showAddGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
            <CardDescription>Set a personalized learning objective</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input id="title" placeholder="e.g., Complete 10 lessons" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option>Lessons</option>
                  <option>Speaking</option>
                  <option>Vocabulary</option>
                  <option>Assessment</option>
                  <option>Course</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Describe what you want to achieve" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Long-term</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Input id="target" type="number" placeholder="e.g., 10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button>Create Goal</Button>
              <Button variant="outline" onClick={() => setShowAddGoal(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Goals</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {goals.filter(goal => !goal.completed).map((goal) => {
            const IconComponent = getCategoryIcon(goal.category);
            const progressPercentage = (goal.progress / goal.target) * 100;
            const daysLeft = daysUntilDeadline(goal.deadline);
            const overdue = isOverdue(goal.deadline);
            
            return (
              <Card key={goal.id} className="bg-gradient-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(goal.priority)} variant="outline">
                        {goal.priority}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress} / {goal.target}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Goal Details */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className={getTypeColor(goal.type)}>{goal.type}</span>
                      </div>
                      
                      {goal.deadline && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className={overdue ? "text-destructive" : daysLeft && daysLeft <= 3 ? "text-accent" : "text-muted-foreground"}>
                            {overdue ? "Overdue" : daysLeft === 0 ? "Due today" : daysLeft === 1 ? "Due tomorrow" : `${daysLeft} days left`}
                          </span>
                        </div>
                      )}
                      
                      {goal.streakCount > 0 && (
                        <div className="flex items-center gap-1 text-streak-fire">
                          <Flame className="w-4 h-4" />
                          <span>{goal.streakCount} day streak</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xp-gold">
                      <Star className="w-4 h-4" />
                      <span>{goal.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    {progressPercentage >= 100 ? (
                      <Button className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete
                      </Button>
                    ) : (
                      <Button variant="outline">
                        Continue Progress
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Goal Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Templates</CardTitle>
          <CardDescription>Quick start with pre-made learning objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <BookOpen className="w-6 h-6" />
              <span className="font-medium">Daily Learner</span>
              <span className="text-xs text-muted-foreground">Complete 1 lesson per day</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Target className="w-6 h-6" />
              <span className="font-medium">Conversation Master</span>
              <span className="text-xs text-muted-foreground">30 minutes of speaking practice daily</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Star className="w-6 h-6" />
              <span className="font-medium">Vocabulary Builder</span>
              <span className="text-xs text-muted-foreground">Learn 5 new words daily</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;