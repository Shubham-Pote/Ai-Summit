import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CharacterViewer from '@/components/CharacterViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { profileAPI } from '@/lib/api';
import type { Character, Message } from '@/types/character';
import { toast } from '@/hooks/use-toast';

export default function CharacterChat() {
  const { characterId } = useParams<{ characterId: string }>();
  const { user } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const data = await profileAPI.getCharacterById(characterId!);
        setCharacter(data.character);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch character details',
          variant: 'destructive',
        });
      }
    };

    fetchCharacter();
  }, [characterId]);

  useEffect(() => {
    const startNewConversation = async () => {
      try {
        const { conversationId: newConversationId } = await profileAPI.startConversation(characterId!);
        setConversationId(newConversationId);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to start conversation',
          variant: 'destructive',
        });
      }
    };

    if (character && !conversationId) {
      startNewConversation();
    }
  }, [character, characterId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    try {
      const response = await profileAPI.sendMessage(conversationId, input.trim());
      setMessages(prev => [...prev, response.message]);
      setInput('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        try {
          await profileAPI.uploadAudio(audioBlob, conversationId!);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to upload audio',
            variant: 'destructive',
          });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start recording',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!character) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Info & 3D Model */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            {character.modelUrl && (
              <CharacterViewer 
                modelUrl={character.modelUrl} 
                className="w-full h-[400px] mb-4"
              />
            )}
            <h2 className="text-2xl font-bold mb-2">{character.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{character.occupation} • {character.location}</p>
            <p className="mb-4">{character.backstory}</p>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                    {message.audioUrl && (
                      <audio controls className="mt-2">
                        <source src={message.audioUrl} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={isRecording ? 'destructive' : 'outline'}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit">Send</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}