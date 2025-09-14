import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Character } from '@/types/character';

interface CharacterCardProps {
  character: Character;
  onUnlock: (characterId: string) => Promise<void>;
  onStartChat: (characterId: string) => void;
}

export default function CharacterCard({ character, onUnlock, onStartChat }: CharacterCardProps) {
  const difficultyColor = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-red-500'
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{character.name}</CardTitle>
          <Badge variant={
            character.difficultyLevel === 'beginner' ? 'default' :
            character.difficultyLevel === 'intermediate' ? 'secondary' : 'destructive'
          }>
            {character.difficultyLevel}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {character.occupation} • {character.nationality}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="text-sm">{character.backstory}</div>
          
          {character.relationshipLevel !== undefined && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Relationship Level</span>
                <span>{character.relationshipStatus}</span>
              </div>
              <Progress value={character.relationshipLevel * 10} className="h-2" />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {character.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline">
                {specialty}
              </Badge>
            ))}
          </div>

          {character.totalConversations !== undefined && (
            <div className="text-sm text-muted-foreground">
              Total conversations: {character.totalConversations}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        {character.isLocked ? (
          <Button 
            onClick={() => onUnlock(character._id)}
            variant="secondary" 
            className="w-full"
          >
            Unlock ({character.unlockRequirement.value} {character.unlockRequirement.type})
          </Button>
        ) : (
          <Button 
            onClick={() => onStartChat(character._id)}
            className="w-full"
          >
            Start Conversation
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}