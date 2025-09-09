import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  MessageCircle,
  Brain,
  Users,
  Trophy,
  Play,
  Globe,
  Zap,
  Target,
  Mic,
  Calendar,
  Sparkles,
  Heart,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AI Learn
            </span>
          </div>
          <Button className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 rounded-full shadow-lg">
            <a href="/signup" className="text-white no-underline">
              Get Started
            </a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-blue-100/50"></div>
        <div className="container mx-auto text-center max-w-4xl relative">
          <div className="mb-8">
            <Badge className="bg-yellow-400 text-gray-800 border-0 px-4 py-2 text-sm font-bold rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              The fun way to learn languages
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-800 mb-6 text-balance leading-tight">
            Learn languages
            <br />
            <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">with AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 text-pretty max-w-3xl mx-auto font-medium">
            Practice conversations with AI tutors, play interactive games, and master any language through personalized
            learning that adapts to you.
          </p>
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-12 py-4 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Play className="w-6 h-6 mr-3" />
            <a href="/signup" className="text-white no-underline">
              GET STARTED
            </a>
          </Button>
        </div>
      </section>

      {/* Why AI Learn Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">Why AI Learn works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered approach makes language learning effective, engaging, and fun
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">AI Conversations</h3>
              <p className="text-gray-600 text-lg">
                Chat with AI tutors that understand context and provide instant feedback on your language skills
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Interactive Characters</h3>
              <p className="text-gray-600 text-lg">
                Meet diverse AI personalities and practice real-world conversations in different scenarios
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Personalized Learning</h3>
              <p className="text-gray-600 text-lg">
                AI adapts to your pace and learning style, creating custom lessons that keep you motivated
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Study Tools Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">Your complete study toolkit</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to master languages, all in one place
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="font-bold text-lg mb-2">Reading</h3>
                <p className="text-sm opacity-90">Interactive stories</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="font-bold text-lg mb-2">Notes</h3>
                <p className="text-sm opacity-90">Study materials</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="font-bold text-lg mb-2">AI Chat</h3>
                <p className="text-sm opacity-90">Personal tutor</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="font-bold text-lg mb-2">Quiz</h3>
                <p className="text-sm opacity-90">Test knowledge</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="font-bold text-lg mb-2">Progress</h3>
                <p className="text-sm opacity-90">Track achievements</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="font-bold text-lg mb-2">Goals</h3>
                <p className="text-sm opacity-90">Set targets</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Mic className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="font-bold text-lg mb-2">Speech</h3>
                <p className="text-sm opacity-90">Practice pronunciation</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="font-bold text-lg mb-2">Daily Words</h3>
                <p className="text-sm opacity-90">New vocabulary</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">How it works</h2>
            <p className="text-xl text-gray-600">Start speaking a new language in minutes</p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg">
                  <span className="text-2xl font-black text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Choose your language</h3>
                <p className="text-lg text-gray-600">
                  Pick from dozens of languages and tell us your goals. Our AI will create a personalized learning path
                  just for you.
                </p>
              </div>
              <div className="flex-1">
                <div className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-lg">
                  <Globe className="w-24 h-24 text-green-500" />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg">
                  <span className="text-2xl font-black text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Meet your AI tutor</h3>
                <p className="text-lg text-gray-600">
                  Start conversations with AI characters who adapt to your level and interests. Practice real scenarios
                  you'll actually use.
                </p>
              </div>
              <div className="flex-1">
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-24 h-24 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg">
                  <span className="text-2xl font-black text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Track your progress</h3>
                <p className="text-lg text-gray-600">
                  Watch your skills grow with detailed progress tracking, achievements, and personalized feedback from
                  your AI tutor.
                </p>
              </div>
              <div className="flex-1">
                <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-24 h-24 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-500 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto text-center max-w-3xl relative">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Start your language journey today</h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Join millions of learners who are already speaking new languages with confidence. It's free, fun, and
            effective.
          </p>
          <Button
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 font-bold px-12 py-4 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Zap className="w-6 h-6 mr-3" />
            <a href="/signup" className="text-green-600 no-underline">
              GET STARTED FOR FREE
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-50 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  AI Learn
                </span>
              </div>
              <p className="text-gray-600">
                The fun way to learn languages with AI-powered tutors and interactive conversations.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Learn</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="/languages" className="hover:text-green-600 transition-colors">
                    Languages
                  </a>
                </li>
                <li>
                  <a href="/characters" className="hover:text-green-600 transition-colors">
                    AI Characters
                  </a>
                </li>
                <li>
                  <a href="/study-hub" className="hover:text-green-600 transition-colors">
                    Study Hub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="/about" className="hover:text-green-600 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/blog" className="hover:text-green-600 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/careers" className="hover:text-green-600 transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="/help" className="hover:text-green-600 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-green-600 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-green-600 transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
            <p>
              &copy; 2025 AI Learn. Made with <Heart className="w-4 h-4 inline text-red-500" /> for language learners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
