import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => Promise<void>;
  disabled?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach(track => track.stop());
        await onRecordingComplete(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Failed to start recording. Please check your microphone permissions.');
      console.error('Recording error:', err);
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isRecording ? "destructive" : "secondary"}
        size="icon"
        disabled={disabled}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      
      {error && (
        <div className="flex items-center text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}