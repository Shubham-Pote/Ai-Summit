import { useNavigate } from "react-router-dom";
import { 
  Newspaper,
  StickyNote,
  MessageCircle,
  Brain,
  Mic,
  Trophy,
  Target,
  Calendar,
  ArrowRight,
  Sparkles
} from "lucide-react";

const StudyHub = () => {
  const navigate = useNavigate();

  const studyFeatures = [
    {
      id: "reading",
      title: "Reading",
      description: "Practice with interactive stories and articles",
      icon: Newspaper,
      gradient: "from-blue-500 to-blue-600",
      route: "/reading"
    },
    {
      id: "notes",
      title: "Notes",
      description: "Create and organize your study notes",
      icon: StickyNote,
      gradient: "from-emerald-500 to-emerald-600",
      route: "/notes"
    },
    {
      id: "ai-chat",
      title: "AI Chat",
      description: "Chat with your personal language tutor",
      icon: MessageCircle,
      gradient: "from-purple-500 to-purple-600",
      route: "/ai-chat"
    },
    {
      id: "quiz",
      title: "Quiz",
      description: "Test your knowledge with smart quizzes",
      icon: Brain,
      gradient: "from-orange-500 to-orange-600",
      route: "/quiz"
    },
    {
      id: "progress",
      title: "Progress",
      description: "Track your learning achievements",
      icon: Trophy,
      gradient: "from-amber-500 to-amber-600",
      route: "/progress"
    },
    {
      id: "goals",
      title: "Goals",
      description: "Set and achieve your learning targets",
      icon: Target,
      gradient: "from-indigo-500 to-indigo-600",
      route: "/goals"
    },
    {
      id: "speech",
      title: "Speech",
      description: "Practice pronunciation and speaking",
      icon: Mic,
      gradient: "from-teal-500 to-teal-600",
      route: "/speech-recognition"
    },
    {
      id: "word-of-day",
      title: "Word of the Day",
      description: "Learn new vocabulary daily",
      icon: Calendar,
      gradient: "from-rose-500 to-rose-600",
      route: "/word-of-day"
    }
  ];

  const handleFeatureClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Simple Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Study Hub</h1>
          <p className="text-gray-600 text-lg">Choose a feature to continue learning</p>
        </div>

        {/* Navigation Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {studyFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className="group cursor-pointer bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                onClick={() => handleFeatureClick(feature.route)}
              >
                {/* Header with gradient */}
                <div className={`h-20 bg-gradient-to-r ${feature.gradient} relative`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">Get Started</span>
                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simple Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            {studyFeatures.length} learning tools available
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyHub;