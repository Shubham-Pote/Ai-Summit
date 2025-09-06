import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Brain, 
  MessageCircle, 
  BarChart3, 
  Target, 
  Mic, 
  BookOpen,
  Trophy,
  Zap,
  Users,
  Star
} from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect to dashboard if already logged in
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }
  const features = [
    {
      icon: BookOpen,
      title: "Interactive Lessons",
      description: "Personalized learning paths tailored to your pace and style"
    },
    {
      icon: MessageCircle,
      title: "AI Conversational Tutor",
      description: "Chat with your AI tutor for instant help and explanations"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Visual charts showing your accuracy, fluency, and improvement"
    },
    {
      icon: Mic,
      title: "Speech Recognition",
      description: "Advanced phoneme scoring and accent evaluation"
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "Earn XP points, maintain streaks, and unlock achievements"
    },
    {
      icon: Target,
      title: "Smart Goals",
      description: "Set and track personalized learning goals with reminders"
    }
  ];

  const stats = [
    { number: "10M+", label: "Active Learners" },
    { number: "50+", label: "Languages" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm">Powered by Advanced AI Technology</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Master Any Language with
            <span className="block bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              AI-Powered Learning
            </span>
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Experience the future of language learning with our AI-based platform. 
            Personalized lessons, real-time feedback, and gamified progress tracking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white shadow-glow">
              <Link to="/signup">Start Learning Now</Link>
            </Button>
            <Button size="lg" asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Everything You Need to Learn
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Our comprehensive platform includes all the tools and features 
            you need for successful language learning.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 p-6 hover:bg-white/15 transition-colors">
                <div className="bg-gradient-primary rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Loved by Millions of Learners
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-white/80 mb-4">
                "This platform completely transformed my language learning journey. 
                The AI tutor is incredibly helpful and the gamification keeps me motivated!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-success rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">Sarah Johnson</div>
                  <div className="text-sm text-white/60">Spanish Learner</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-white/70">
            Join millions of learners and experience the future of language education.
          </p>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-white shadow-glow">
            <Link to="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;