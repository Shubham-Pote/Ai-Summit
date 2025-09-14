import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Character, CharacterStats } from '@/types/character';

interface CharacterProfileProps {
  character: Character;
  stats?: CharacterStats;
}

export default function CharacterProfile({ character, stats }: CharacterProfileProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{character.name}</span>
          <Badge variant={
            character.difficultyLevel === 'beginner' ? 'default' :
            character.difficultyLevel === 'intermediate' ? 'secondary' : 'destructive'
          }>
            {character.difficultyLevel}
          </Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {character.age} years old • {character.occupation}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-medium mb-2">About</h3>
          <div className="space-y-2">
            <div><span className="text-muted-foreground">From:</span> {character.location}</div>
            <div><span className="text-muted-foreground">Language:</span> {character.language}</div>
            <div><span className="text-muted-foreground">Teaching Style:</span> {character.teachingStyle}</div>
          </div>
        </div>

        {/* Backstory */}
        <div>
          <h3 className="font-medium mb-2">Background</h3>
          <p className="text-sm">{character.backstory}</p>
        </div>

        {/* Interests & Specialties */}
        <div>
          <h3 className="font-medium mb-2">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {character.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline">{specialty}</Badge>
            ))}
          </div>
        </div>

        {/* Relationship & Stats */}
        {character.relationshipLevel !== undefined && (
          <div>
            <h3 className="font-medium mb-2">Relationship</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Level {Math.floor(character.relationshipLevel)}</span>
                  <span>{character.relationshipStatus}</span>
                </div>
                <Progress value={character.relationshipLevel * 10} className="h-2" />
              </div>
            </div>
          </div>
        )}

        {/* Learning Stats */}
        {stats && (
          <div>
            <h3 className="font-medium mb-2">Learning Progress</h3>
            <div className="space-y-2 text-sm">
              <div>Total Conversations: {stats.totalConversations}</div>
              <div>Messages Exchanged: {stats.totalMessages}</div>
              <div>Time Spent: {Math.round(stats.totalTimeSpent / 60)} minutes</div>
              <div>Current Streak: {stats.streakDays} days</div>
              <div>Mistakes Corrected: {stats.mistakesCorrected}</div>
            </div>

            {stats.vocabularyLearned.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recently Learned Vocabulary</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.vocabularyLearned.slice(0, 5).map((word, index) => (
                    <Badge key={index} variant="secondary">{word}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}