import { Button } from "@/components/ui/button";
import { Play, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string;
  text: string;
  pronunciation?: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, text, pronunciation, className = "" }) => {
  const handlePlay = () => {
    // For now, this is a placeholder since TTS integration isn't implemented
    console.log(`Playing audio for: ${text}`);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        size="sm"
        variant="outline"
        onClick={handlePlay}
        className="flex items-center gap-2"
      >
        <Volume2 className="w-4 h-4" />
        Listen
      </Button>
      {pronunciation && (
        <span className="text-sm text-muted-foreground">
          [{pronunciation}]
        </span>
      )}
      {audioUrl && (
        <span className="text-xs text-muted-foreground">
          Audio: {audioUrl.split('/').pop()}
        </span>
      )}
    </div>
  );
};

export default AudioPlayer;