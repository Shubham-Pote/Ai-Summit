import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Clock, 
  Star, 
  CheckCircle,
  XCircle,
  ArrowRight,
  Trophy,
  RefreshCw
} from "lucide-react";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const questions = [
    {
      id: 1,
      type: "multiple-choice",
      question: "What does '¡Hola!' mean in English?",
      options: ["Goodbye", "Hello", "Thank you", "Please"],
      correctAnswer: 1,
      explanation: "'¡Hola!' is the most common greeting in Spanish, equivalent to 'Hello' in English.",
      points: 10
    },
    {
      id: 2,
      type: "multiple-choice", 
      question: "Which is the correct pronunciation of 'Gracias'?",
      options: ["/ˈɡra.θjas/", "/ˈɡra.sjas/", "/ˈɡra.ʃjas/", "/ˈɡra.kjas/"],
      correctAnswer: 0,
      explanation: "In Castilian Spanish, 'Gracias' is pronounced with the 'th' sound for the 'c'.",
      points: 15
    },
    {
      id: 3,
      type: "image-choice",
      question: "Which image represents 'una mesa'?",
      options: ["🪑", "🛏️", "🪑", "🗂️"],
      correctAnswer: 2,
      explanation: "'Una mesa' means 'a table' in Spanish.",
      points: 10
    },
    {
      id: 4,
      type: "fill-blank",
      question: "Complete the sentence: 'Me _____ Maria' (My name is Maria)",
      options: ["llamo", "gusta", "tengo", "soy"],
      correctAnswer: 0,
      explanation: "'Me llamo' is used to say 'My name is' in Spanish.",
      points: 20
    },
    {
      id: 5,
      type: "multiple-choice",
      question: "What is the plural of 'el estudiante'?",
      options: ["los estudiante", "los estudiantes", "las estudiantes", "el estudiantes"],
      correctAnswer: 1,
      explanation: "The plural form adds '-s' and uses the plural article 'los'.",
      points: 15
    }
  ];

  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
      
      if (selectedAnswer === questions[currentQuestion].correctAnswer) {
        setScore(score + questions[currentQuestion].points);
      }
      
      setTimeout(() => {
        if (currentQuestion + 1 < totalQuestions) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          setQuizCompleted(true);
        }
      }, 2000);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const getScoreGrade = (finalScore: number, maxScore: number) => {
    const percentage = (finalScore / maxScore) * 100;
    if (percentage >= 90) return { grade: "A+", color: "text-secondary", message: "Excellent!" };
    if (percentage >= 80) return { grade: "A", color: "text-secondary", message: "Great job!" };
    if (percentage >= 70) return { grade: "B", color: "text-accent", message: "Good work!" };
    if (percentage >= 60) return { grade: "C", color: "text-xp-gold", message: "Keep practicing!" };
    return { grade: "D", color: "text-destructive", message: "Try again!" };
  };

  if (quizCompleted) {
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const scoreGrade = getScoreGrade(score, maxScore);
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${scoreGrade.color} mb-2`}>
                {scoreGrade.grade}
              </div>
              <div className="text-2xl font-semibold mb-1">
                {score} / {maxScore} points
              </div>
              <div className="text-muted-foreground">{scoreGrade.message}</div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary" />
                {questions.filter((_, i) => i <= currentQuestion).reduce((correct, q, i) => 
                  selectedAnswer === q.correctAnswer ? correct + 1 : correct, 0
                )} Correct
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Star className="w-4 h-4 text-xp-gold" />
                +{score} XP Earned
              </Badge>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="outline">
                Review Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isCorrect = selectedAnswer === currentQ.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spanish Quiz</h1>
          <p className="text-muted-foreground">Test your knowledge</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            5 min
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Star className="w-4 h-4 text-xp-gold" />
            {score} XP
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} of {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{currentQ.type.replace('-', ' ')}</Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="w-4 h-4" />
              {currentQ.points} points
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{currentQ.question}</h2>
            
            <div className="grid gap-3">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`p-4 h-auto text-left justify-start ${
                    selectedAnswer === index 
                      ? showResult
                        ? index === currentQ.correctAnswer
                          ? 'border-secondary bg-secondary/10 text-secondary'
                          : 'border-destructive bg-destructive/10 text-destructive'
                        : 'border-primary bg-primary/10'
                      : showResult && index === currentQ.correctAnswer
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : ''
                  } ${showResult ? 'pointer-events-none' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-sm">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                    {showResult && (
                      <div>
                        {index === currentQ.correctAnswer ? (
                          <CheckCircle className="w-5 h-5 text-secondary" />
                        ) : selectedAnswer === index ? (
                          <XCircle className="w-5 h-5 text-destructive" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {showResult && (
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-secondary/10' : 'bg-destructive/10'}`}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`font-medium mb-1 ${isCorrect ? 'text-secondary' : 'text-destructive'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null || showResult}
              className="flex items-center gap-2"
            >
              {currentQuestion + 1 === totalQuestions ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;