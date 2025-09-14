import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  MessageCircle, 
  Star,
  BookOpen,
  Play,
  Lock,
  Crown,
  Heart,
  MapPin,
  Calendar
} from "lucide-react";

const Characters = () => {
  const characters = [
    {
      id: 1,
      name: "María González",
      age: 28,
      occupation: "Chef",
      location: "Madrid, Spain",
      personality: "Cheerful, passionate about cooking",
      backstory: "Runs a small family restaurant in Madrid's historic center. Loves sharing traditional recipes with visitors.",
      unlocked: true,
      relationshipLevel: 85,
      conversationsCompleted: 12,
      avatar: "👩‍🍳",
      specialties: ["Food vocabulary", "Restaurant conversations", "Spanish culture"],
      difficulty: "Beginner",
      lastInteraction: "2 hours ago"
    },
    {
      id: 2,
      name: "Carlos Mendoza",
      age: 35,
      occupation: "Travel Guide",
      location: "Barcelona, Spain", 
      personality: "Adventurous, knowledgeable, friendly",
      backstory: "Professional tour guide who has traveled across Spain and Latin America. Expert in history and local customs.",
      unlocked: true,
      relationshipLevel: 62,
      conversationsCompleted: 8,
      avatar: "🧔‍♂️",
      specialties: ["Travel vocabulary", "Directions", "History and culture"],
      difficulty: "Intermediate",
      lastInteraction: "1 day ago"
    },
    {
      id: 3,
      name: "Dr. Ana Ruiz",
      age: 42,
      occupation: "Doctor",
      location: "Buenos Aires, Argentina",
      personality: "Professional, caring, patient",
      backstory: "Works at a public hospital in Buenos Aires. Passionate about helping people and teaching medical Spanish to international students.",
      unlocked: true,
      relationshipLevel: 45,
      conversationsCompleted: 5,
      avatar: "👩‍⚕️",
      specialties: ["Medical vocabulary", "Formal conversations", "Argentinian Spanish"],
      difficulty: "Advanced",
      lastInteraction: "3 days ago"
    },
    {
      id: 4,
      name: "Javier Rivera",
      age: 22,
      occupation: "University Student",
      location: "Mexico City, Mexico",
      personality: "Energetic, modern, tech-savvy",
      backstory: "Computer science student who loves video games, social media, and pop culture. Speaks with modern slang and expressions.",
      unlocked: false,
      relationshipLevel: 0,
      conversationsCompleted: 0,
      avatar: "👨‍💻",
      specialties: ["Modern slang", "Technology", "Mexican culture"],
      difficulty: "Intermediate",
      lastInteraction: null,
      unlockRequirement: "Complete 15 conversations with other characters"
    },
    {
      id: 5,
      name: "Doña Carmen",
      age: 67,
      occupation: "Retired Teacher",
      location: "Sevilla, Spain",
      personality: "Wise, traditional, storyteller",
      backstory: "Retired Spanish literature teacher who loves sharing stories about old Spain. Speaks formally and uses traditional expressions.",
      unlocked: false,
      relationshipLevel: 0,
      conversationsCompleted: 0,
      avatar: "👵",
      specialties: ["Formal Spanish", "Literature", "Traditional culture"],
      difficulty: "Advanced",
      lastInteraction: null,
      unlockRequirement: "Reach Level 10"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-secondary text-secondary-foreground";
      case "Intermediate": return "bg-accent text-accent-foreground";
      case "Advanced": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRelationshipLevel = (level: number) => {
    if (level >= 80) return { label: "Best Friend", color: "text-xp-gold", icon: Crown };
    if (level >= 60) return { label: "Good Friend", color: "text-secondary", icon: Heart };
    if (level >= 40) return { label: "Friend", color: "text-accent", icon: Star };
    if (level >= 20) return { label: "Acquaintance", color: "text-primary", icon: Users };
    return { label: "Stranger", color: "text-muted-foreground", icon: Users };
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Interactive Characters</h1>
        <p className="text-muted-foreground">Practice conversations with diverse Spanish-speaking personalities</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{characters.filter(c => c.unlocked).length}</p>
                <p className="text-sm text-muted-foreground">Characters Unlocked</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{characters.reduce((sum, c) => sum + c.conversationsCompleted, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
              </div>
              <MessageCircle className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{Math.round(characters.filter(c => c.unlocked).reduce((sum, c) => sum + c.relationshipLevel, 0) / characters.filter(c => c.unlocked).length) || 0}%</p>
                <p className="text-sm text-muted-foreground">Avg. Relationship</p>
              </div>
              <Heart className="w-8 h-8 text-streak-fire" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{characters.filter(c => c.relationshipLevel >= 80).length}</p>
                <p className="text-sm text-muted-foreground">Best Friends</p>
              </div>
              <Crown className="w-8 h-8 text-xp-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {characters.map((character) => {
          const relationship = getRelationshipLevel(character.relationshipLevel);
          const RelationshipIcon = relationship.icon;

          return (
            <Card key={character.id} className={`bg-gradient-card hover:shadow-md transition-all ${!character.unlocked ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 text-2xl">
                      <AvatarFallback>{character.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{character.name}</CardTitle>
                        {!character.unlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{character.occupation}</span>
                        <span>•</span>
                        <span>{character.age} years old</span>
                      </CardDescription>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        {character.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getDifficultyColor(character.difficulty)}>
                      {character.difficulty}
                    </Badge>
                    {character.unlocked && (
                      <div className={`flex items-center gap-1 text-sm ${relationship.color}`}>
                        <RelationshipIcon className="w-4 h-4" />
                        {relationship.label}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Personality:</strong> {character.personality}
                </p>
                
                <p className="text-sm">
                  {character.backstory}
                </p>

                {/* Specialties */}
                <div>
                  <p className="text-sm font-medium mb-2">Specializes in:</p>
                  <div className="flex flex-wrap gap-1">
                    {character.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {character.unlocked ? (
                  <>
                    {/* Relationship Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Relationship Level</span>
                        <span>{character.relationshipLevel}%</span>
                      </div>
                      <Progress value={character.relationshipLevel} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {character.conversationsCompleted} conversations
                      </div>
                      {character.lastInteraction && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {character.lastInteraction}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Conversation
                      </Button>
                      <Button variant="outline">
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Unlock Requirements */}
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Character Locked</p>
                      <p className="text-xs text-muted-foreground">
                        {character.unlockRequirement}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conversation Starter Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Conversation Tips
          </CardTitle>
          <CardDescription>
            Get the most out of your character interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Ask About Their Work</h4>
              <p className="text-sm text-muted-foreground">
                Each character loves talking about their profession. Great for learning specialized vocabulary!
              </p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Share Your Interests</h4>
              <p className="text-sm text-muted-foreground">
                Tell them about your hobbies and interests. They'll respond with related vocabulary and cultural insights.
              </p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Ask for Corrections</h4>
              <p className="text-sm text-muted-foreground">
                Don't be afraid to make mistakes! Characters will gently correct you and explain grammar rules.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Characters;