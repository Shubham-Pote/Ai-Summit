import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  sender: 'user' | 'character' | 'system';
  audioUrl?: string;
  timestamp?: string;
  characterName?: string;
  isProcessing?: boolean;
}

export default function MessageBubble({
  content,
  sender,
  audioUrl,
  timestamp,
  characterName,
  isProcessing = false
}: MessageBubbleProps) {
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onerror = () => setAudioError(true);
    }
  }, []);

  const getBubbleStyle = () => {
    const baseStyle = 'rounded-lg p-4 max-w-[80%] break-words';
    
    switch (sender) {
      case 'user':
        return `${baseStyle} bg-primary text-primary-foreground ml-auto`;
      case 'character':
        return `${baseStyle} bg-muted mr-auto`;
      case 'system':
        return `${baseStyle} bg-secondary text-secondary-foreground mx-auto text-center`;
      default:
        return baseStyle;
    }
  };

  return (
    <div className={`mb-4 ${sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className={getBubbleStyle()}>
        {sender === 'character' && characterName && (
          <div className="text-sm font-medium mb-1">{characterName}</div>
        )}
        
        <div className={isProcessing ? 'opacity-70' : ''}>
          {content}
        </div>

        {audioUrl && !audioError && (
          <div className="mt-2">
            <audio ref={audioRef} controls className="w-full max-w-[200px]">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {audioError && (
          <div className="flex items-center text-destructive text-sm mt-2">
            <AlertCircle className="h-4 w-4 mr-1" />
            Failed to load audio
          </div>
        )}

        {timestamp && (
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}