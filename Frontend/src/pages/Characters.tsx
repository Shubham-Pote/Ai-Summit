import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Globe, Star, Crown, Heart, Users } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { Character } from '@/types/character';
import CharacterViewer from '@/components/character/CharacterViewer';

const Characters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const { characters } = await profileAPI.getCharacters();
        
        // Sort characters: unlocked first, then locked, then by difficulty level
        const sortedCharacters = characters.sort((a, b) => {
          // First priority: unlocked status (free characters or explicitly unlocked)
          const aUnlocked = !a.isLocked || a.isUnlocked;
          const bUnlocked = !b.isLocked || b.isUnlocked;
          
          if (aUnlocked && !bUnlocked) return -1;
          if (!aUnlocked && bUnlocked) return 1;
          
          // Second priority: difficulty level
          const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };
          return difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel];
        });
        
        setCharacters(sortedCharacters);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch characters',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const handleUnlock = async (characterId: string) => {
    try {
      await profileAPI.unlockCharacter(characterId);
      const { characters: updatedCharacters } = await profileAPI.getCharacters();
      setCharacters(updatedCharacters);
      toast({
        title: 'Success',
        description: 'Character unlocked successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unlock character',
        variant: 'destructive',
      });
    }
  };

  const handleStartChat = (characterId: string) => {
    navigate(`/chat/${characterId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Language Learning Characters</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <Card key={character._id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{character.name}</span>
                <Badge variant={character.difficultyLevel === 'beginner' ? 'default' : 
                             character.difficultyLevel === 'intermediate' ? 'secondary' : 'destructive'}>
                  {character.difficultyLevel}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <div className="h-[300px] relative overflow-hidden rounded-md">
              <div className="relative w-full h-full bg-gradient-to-b from-muted/5 to-muted/20">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Loading 3D model...</span>
                    </div>
                  </div>
                }>
                  <CharacterViewer 
                    modelUrl="/models/character.glb"
                    className="w-full h-full"
                  />
                </Suspense>
              </div>
            </div>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{character.nationality}</span>
                </div>
                <div>
                  {character.age} years old
                </div>
              </div>

              <p className="text-sm">{character.backstory}</p>
              
              {character.relationshipLevel !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Relationship</span>
                    <span>{character.relationshipLevel}%</span>
                  </div>
                  <Progress value={character.relationshipLevel} className="h-2" />
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {character.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline">{specialty}</Badge>
                ))}
              </div>

              {(character.isLocked && !character.isUnlocked) ? (
                <div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium mb-2">🔒 Character Locked</p>
                    <p className="text-sm text-muted-foreground">
                      {character.unlockRequirement?.type === 'level' ? 
                        `Reach Level ${character.unlockRequirement.value}` :
                        character.unlockRequirement?.type === 'conversations' ?
                        `Complete ${character.unlockRequirement.value} Conversations` :
                        character.unlockRequirement?.type === 'points' ?
                        `Earn ${character.unlockRequirement.value} Points` :
                        'Premium Feature'}
                    </p>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => handleUnlock(character._id)}
                  >
                    Unlock Character
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {character.totalConversations !== undefined && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>{character.totalConversations} conversations</span>
                      </div>
                      {character.lastInteractionAt && (
                        <span>Last: {new Date(character.lastInteractionAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                  <Button 
                    className="w-full" 
                    onClick={() => handleStartChat(character._id)}
                  >
                    Start Conversation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Characters;