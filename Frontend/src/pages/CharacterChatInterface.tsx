import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import VRMViewer from "@/components/VRMViewer"
import characterSocketService from "@/services/characterSocket.service"
import { 
  Send, 
  Settings, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  MessageSquare, 
  ArrowLeft,
  Mic,
  MicOff,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: 'user' | 'character'
  content: string
  timestamp: Date
  isStreaming?: boolean
  emotion?: string
  animation?: string
  isError?: boolean
  fallback?: boolean
}

interface Character {
  id: 'maria' | 'akira'
  name: string
  language: string
  flag: string
  greeting: string
}

const characters: Record<string, Character> = {
  maria: {
    id: 'maria',
    name: 'María González',
    language: 'Spanish',
    flag: '🇪🇸',
    greeting: '¡Hola! ¿Cómo estás? I\'m María, and I\'m excited to help you learn Spanish!'
  },
  akira: {
    id: 'akira',
    name: 'Akira Tanaka',
    language: 'Japanese',
    flag: '🇯🇵',
    greeting: 'こんにちは！Hello! I\'m Akira, and I look forward to teaching you Japanese!'
  }
}

const CharacterChatInterface = () => {
  const { characterId } = useParams<{ characterId: string }>()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isCharacterThinking, setIsCharacterThinking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState("neutral")
  const [showConversationLog, setShowConversationLog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const character = characterId ? characters[characterId] : null

  useEffect(() => {
    if (!character) {
      navigate('/characters')
      return
    }

    // Setup WebSocket event listeners
    const setupSocketListeners = () => {
      // Connection status
      characterSocketService.on('connection_status', ({ connected }: { connected: boolean }) => {
        setIsConnected(connected)
      })

      // Character thinking
      characterSocketService.on('character_thinking', (thinking: boolean) => {
        setIsCharacterThinking(thinking)
      })

      // Streaming response
      characterSocketService.on('character_stream', ({ text, isComplete }: { text: string; isComplete: boolean }) => {
        if (isComplete) {
          setStreamingMessage("")
        } else {
          setStreamingMessage(prev => prev + text)
        }
      })

      // Final character response
      characterSocketService.on('character_response', (data: { 
        text: string; 
        emotion?: string; 
        isError?: boolean; 
        fallback?: boolean 
      }) => {
        const characterMessage: Message = {
          id: Date.now().toString(),
          role: 'character',
          content: data.text,
          timestamp: new Date(),
          emotion: data.emotion || 'neutral',
          isError: data.isError,
          fallback: data.fallback
        }
        
        setMessages(prev => [...prev, characterMessage])
        setIsCharacterThinking(false)
        setCurrentEmotion(data.emotion || 'neutral')
        setStreamingMessage("")

        // Play voice if enabled
        if (isVoiceEnabled && !data.isError) {
          characterSocketService.requestVoice(data.text, data.emotion || 'neutral')
        }
      })

      // VRM animation
      characterSocketService.on('vrm_animation', (data: { 
        emotion: string; 
        animation: string; 
        duration?: number 
      }) => {
        setCurrentEmotion(data.emotion)
      })

      // Voice audio
      characterSocketService.on('voice_audio', (data: { 
        audioUrl: string; 
        text: string; 
        emotion: string 
      }) => {
        if (isVoiceEnabled) {
          const audio = new Audio(data.audioUrl)
          audio.play().catch(console.error)
          setCurrentAudio(audio)
        }
      })

      // Performance metrics
      characterSocketService.on('performance_metrics', (data: { 
        responseTime: number; 
        isSlowResponse: boolean; 
        timestamp: string 
      }) => {
        if (data.isSlowResponse) {
          console.warn('Slow response detected:', data.responseTime + 'ms')
        }
      })

      // Stream warnings
      characterSocketService.on('stream_warning', (data: { message: string; duration: number }) => {
        console.warn('Stream warning:', data.message)
      })

      // Errors
      characterSocketService.on('error', (data: { message: string; type?: string }) => {
        console.error('Socket error:', data.message)
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'character',
          content: `Sorry, I encountered an error: ${data.message}`,
          timestamp: new Date(),
          isError: true
        }
        setMessages(prev => [...prev, errorMessage])
        setIsCharacterThinking(false)
      })
    }

    setupSocketListeners()

    // Switch to the selected character
    characterSocketService.switchCharacter(character.id)

    // Add initial greeting message
    const initialMessage: Message = {
      id: '1',
      role: 'character',
      content: character.greeting,
      timestamp: new Date(),
      emotion: 'happy'
    }
    setMessages([initialMessage])

    // Cleanup function
    return () => {
      // Remove all event listeners
      characterSocketService.off('connection_status', () => {})
      characterSocketService.off('character_thinking', () => {})
      characterSocketService.off('character_stream', () => {})
      characterSocketService.off('character_response', () => {})
      characterSocketService.off('vrm_animation', () => {})
      characterSocketService.off('voice_audio', () => {})
      characterSocketService.off('performance_metrics', () => {})
      characterSocketService.off('stream_warning', () => {})
      characterSocketService.off('error', () => {})
      
      // Stop any playing audio
      if (currentAudio) {
        currentAudio.pause()
        setCurrentAudio(null)
      }
    }
  }, [character, navigate, isVoiceEnabled])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !character || !isConnected) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")

    // Send message through WebSocket
    characterSocketService.sendMessage(userMessage.content)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceRecognition = () => {
    setIsListening(!isListening)
    // Implement voice recognition logic here
  }

  const clearConversation = () => {
    if (character) {
      characterSocketService.clearConversation()
      
      const initialMessage: Message = {
        id: '1',
        role: 'character',
        content: character.greeting,
        timestamp: new Date(),
        emotion: 'happy'
      }
      setMessages([initialMessage])
    }
  }

  if (!character) {
    return <div>Loading...</div>
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/characters')}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-2xl">{character.flag}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{character.name}</h2>
                <p className="text-sm text-emerald-400">{character.language} Teacher</p>
              </div>
              <Badge variant="secondary" className={cn(
                "ml-2 animate-pulse",
                currentEmotion === 'happy' && "bg-yellow-500/20 text-yellow-400",
                currentEmotion === 'excited' && "bg-orange-500/20 text-orange-400",
                currentEmotion === 'thoughtful' && "bg-blue-500/20 text-blue-400",
                currentEmotion === 'encouraging' && "bg-green-500/20 text-green-400",
                currentEmotion === 'neutral' && "bg-gray-500/20 text-gray-400"
              )}>
                {currentEmotion}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1">
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">Disconnected</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConversationLog(!showConversationLog)}
                className="text-slate-400 hover:text-white"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 3D Character Area */}
        <div className="h-1/2 bg-gradient-to-b from-slate-800 to-slate-900 relative border-b border-slate-700">
          <VRMViewer
            characterId={character.id}
            emotion={currentEmotion}
            isThinking={isCharacterThinking}
            className="w-full h-full"
          />

          {/* Character thinking indicator */}
          {isCharacterThinking && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-slate-800/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 border border-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span className="text-sm text-slate-300">Character is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl p-4 shadow-lg",
                  message.role === 'user'
                    ? "bg-emerald-500 text-white"
                    : message.isError
                    ? "bg-red-800/70 text-red-100 border border-red-600"
                    : message.fallback
                    ? "bg-yellow-800/70 text-yellow-100 border border-yellow-600"
                    : "bg-slate-800 text-slate-100 border border-slate-700"
                )}
              >
                {message.role === 'character' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{character.flag}</span>
                    <span className="text-sm font-medium text-emerald-400">
                      {character.name}
                    </span>
                    {message.isError && (
                      <Badge variant="destructive" className="text-xs">Error</Badge>
                    )}
                    {message.fallback && (
                      <Badge variant="secondary" className="text-xs bg-yellow-600">Fallback</Badge>
                    )}
                    {isVoiceEnabled && !message.isError && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6 text-slate-400 hover:text-white"
                        onClick={() => characterSocketService.requestVoice(message.content, message.emotion)}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
                <p className="leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl p-4 shadow-lg bg-slate-800/70 text-slate-100 border border-slate-700 border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{character.flag}</span>
                  <span className="text-sm font-medium text-emerald-400">
                    {character.name}
                  </span>
                  <Badge variant="secondary" className="text-xs animate-pulse">
                    Typing...
                  </Badge>
                </div>
                <p className="leading-relaxed">{streamingMessage}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-slate-800/90 backdrop-blur-md border-t border-slate-700 p-4">
          <div className="flex items-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceRecognition}
              className={cn(
                "text-slate-400 hover:text-white",
                isListening && "text-red-400 animate-pulse"
              )}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>

            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 min-h-[40px] max-h-32 resize-none bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500"
              rows={1}
            />

            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isCharacterThinking || !isConnected}
              className={cn(
                "px-4 py-2 h-10",
                isConnected 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                  : "bg-slate-600 text-slate-400 cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-slate-500 hover:text-white text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Conversation Log Panel */}
      {showConversationLog && (
        <div className="w-80 bg-slate-800/95 backdrop-blur-md border-l border-slate-700 p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg text-white flex items-center justify-between">
              Conversation Log
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConversationLog(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-2">
            {messages.map((message, index) => (
              <div key={index} className="text-sm">
                <span className={cn(
                  "font-medium",
                  message.role === 'user' ? "text-emerald-400" : "text-blue-400"
                )}>
                  {message.role === 'user' ? 'You' : character.name}:
                </span>
                <p className="text-slate-300 mt-1 pl-2 border-l border-slate-600">
                  {message.content}
                </p>
              </div>
            ))}
          </CardContent>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-80 bg-slate-800/95 backdrop-blur-md border-l border-slate-700 p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg text-white flex items-center justify-between">
              Settings
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-6">
            {/* Voice Settings */}
            <div>
              <h4 className="text-sm font-medium text-slate-200 mb-3">Audio</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Voice Responses</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={cn(
                    "text-slate-400 hover:text-white",
                    isVoiceEnabled && "text-emerald-400"
                  )}
                >
                  {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Character Info */}
            <div>
              <h4 className="text-sm font-medium text-slate-200 mb-3">Character</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="text-slate-300">{character.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Language:</span>
                  <span className="text-slate-300">{character.language}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emotion:</span>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    currentEmotion === 'happy' && "border-yellow-400 text-yellow-400",
                    currentEmotion === 'excited' && "border-orange-400 text-orange-400",
                    currentEmotion === 'thoughtful' && "border-blue-400 text-blue-400",
                    currentEmotion === 'encouraging' && "border-green-400 text-green-400",
                    currentEmotion === 'neutral' && "border-gray-400 text-gray-400"
                  )}>
                    {currentEmotion}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div>
              <h4 className="text-sm font-medium text-slate-200 mb-3">Connection</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status:</span>
                  <div className="flex items-center gap-1">
                    {isConnected ? (
                      <>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-emerald-400">Connected</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-xs text-red-400">Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
                {!isConnected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => characterSocketService.reconnect()}
                    className="w-full text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Reconnect
                  </Button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h4 className="text-sm font-medium text-slate-200 mb-3">Actions</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearConversation}
                  className="w-full text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear Conversation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => characterSocketService.getConversationHistory()}
                  className="w-full text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Load History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/characters')}
                  className="w-full text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Switch Character
                </Button>
              </div>
            </div>

            {/* Debug Info */}
            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-200 mb-2">Debug</h4>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Messages: {messages.length}</p>
                <p>Thinking: {isCharacterThinking ? 'Yes' : 'No'}</p>
                <p>Streaming: {streamingMessage ? 'Yes' : 'No'}</p>
                <p>Voice: {isVoiceEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </CardContent>
        </div>
      )}
    </div>
  )
}

export default CharacterChatInterface