import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Star,
  Trophy,
  RotateCcw,
  Play,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const SpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);

  const exercises = [
    {
      id: 1,
      word: "Pronunciación",
      translation: "Pronunciation", 
      phonetic: "/pro.nun.θjaˈθjon/",
      difficulty: "Intermediate",
      targetScore: 85
    },
    {
      id: 2,
      word: "Restaurante",
      translation: "Restaurant",
      phonetic: "/res.tauˈɾan.te/",
      difficulty: "Beginner", 
      targetScore: 80
    },
    {
      id: 3,
      word: "Conversación",
      translation: "Conversation",
      phonetic: "/kon.ber.saˈθjon/",
      difficulty: "Advanced",
      targetScore: 90
    }
  ];

  const currentEx = exercises[currentExercise];
  
  const [results, setResults] = useState({
    accuracy: 92,
    fluency: 78,
    pronunciation: 85,
    overall: 85
  });

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
    }, 3000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
  };

  const handleNextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setHasRecorded(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-secondary";
    if (score >= 75) return "text-accent";
    if (score >= 60) return "text-xp-gold";
    return "text-destructive";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Speech Recognition</h1>
        <p className="text-muted-foreground">Improve your pronunciation with AI-powered feedback</p>
      </div>

      {/* Exercise Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Exercise Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentExercise + 1} of {exercises.length}
            </span>
          </div>
          <Progress value={((currentExercise + 1) / exercises.length) * 100} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Practice Word */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Practice Word</CardTitle>
              <Badge variant="outline">{currentEx.difficulty}</Badge>
            </div>
            <CardDescription>
              Listen carefully and repeat the pronunciation
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-gradient-primary text-white rounded-2xl p-8">
                <h2 className="text-4xl font-bold mb-2">{currentEx.word}</h2>
                <p className="text-xl opacity-90">{currentEx.translation}</p>
                <p className="text-sm opacity-75 mt-2">{currentEx.phonetic}</p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Listen
                </Button>
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Slow
                </Button>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="text-center space-y-4">
              <div className="text-lg font-medium">Now it's your turn!</div>
              
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-20 h-20 rounded-full ${
                    isRecording 
                      ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                      : "bg-secondary hover:bg-secondary/90"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {isRecording ? "Recording... Click to stop" : "Click to start recording"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results & Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              {hasRecorded ? "Here's how you performed" : "Record yourself to see results"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {hasRecorded ? (
              <>
                {/* Overall Score */}
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(results.overall)} mb-2`}>
                    {results.overall}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                  {results.overall >= currentEx.targetScore ? (
                    <Badge className="mt-2 bg-secondary text-secondary-foreground">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Target Reached!
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Keep Practicing
                    </Badge>
                  )}
                </div>

                {/* Detailed Scores */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pronunciation Accuracy</span>
                      <span className={getScoreColor(results.accuracy)}>{results.accuracy}%</span>
                    </div>
                    <Progress value={results.accuracy} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fluency</span>
                      <span className={getScoreColor(results.fluency)}>{results.fluency}%</span>
                    </div>
                    <Progress value={results.fluency} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Phoneme Accuracy</span>
                      <span className={getScoreColor(results.pronunciation)}>{results.pronunciation}%</span>
                    </div>
                    <Progress value={results.pronunciation} className="h-2" />
                  </div>
                </div>

                {/* Feedback */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">AI Feedback</h4>
                  <p className="text-sm text-muted-foreground">
                    Excellent pronunciation of the 'ción' sound! Try to speak a bit more slowly 
                    to improve fluency. The 'r' in 'Pronunciación' could be rolled more distinctly.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setHasRecorded(false)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={handleNextExercise}>
                    Next Exercise
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Start recording to receive detailed analysis and feedback on your pronunciation.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      {hasRecorded && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Session Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-secondary">{currentExercise + 1}</div>
                <div className="text-sm text-muted-foreground">Words Practiced</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">+{results.overall}</div>
                <div className="text-sm text-muted-foreground">XP Earned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-xp-gold">{Math.round(results.overall / 10)}</div>
                <div className="text-sm text-muted-foreground">Streak Bonus</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpeechRecognition;