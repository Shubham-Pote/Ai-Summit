import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  Bot,
  User,
  Lightbulb,
  BookOpen,
  HelpCircle,
  Sparkles
} from "lucide-react";

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      content: "¡Hola! I'm your AI Spanish tutor. I'm here to help you learn Spanish through conversation. What would you like to practice today?",
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 2,
      sender: "user", 
      content: "Hi! I want to practice ordering food at a restaurant",
      timestamp: new Date(Date.now() - 4 * 60 * 1000)
    },
    {
      id: 3,
      sender: "ai",
      content: "¡Perfecto! Let's practice restaurant conversations. I'll be the waiter and you be the customer. Here's a scenario: You've just entered a Spanish restaurant and I approach your table. Ready? \n\n*As the waiter approaches* \n\n¡Buenas tardes! ¿Mesa para cuántas personas?",
      timestamp: new Date(Date.now() - 3 * 60 * 1000)
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    "Help me with grammar",
    "Practice conversation", 
    "Explain this word",
    "Give me a quiz"
  ];

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const userMessage = {
      id: messages.length + 1,
      sender: "user" as const,
      content: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage("");
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        sender: "ai" as const,
        content: "¡Muy bien! Let me help you with that. For ordering food, you can say: 'Quisiera...' (I would like...) or 'Me gustaría...' (I would like...). Try responding to my question about how many people you need the table for.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setNewMessage(prompt);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Conversational Tutor</h1>
          <p className="text-muted-foreground">Practice Spanish with your personal AI assistant</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          GPT-4 Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Conversation
            </CardTitle>
            <CardDescription>
              Chat in English or Spanish - I'll help you learn!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                  {message.sender === 'ai' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-primary text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-sm space-y-1 ${message.sender === 'user' ? 'order-2' : ''}`}>
                    <div className={`p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card border'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground px-2">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  {message.sender === 'user' && (
                    <Avatar className="w-8 h-8 order-3">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-primary text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card border p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Prompts */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick prompts:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-xs"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your message in English or Spanish..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Tutor Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your AI Tutor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-primary text-white">
                    <Bot className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Sofia</h3>
                  <p className="text-sm text-muted-foreground">Spanish Tutor AI</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  <span>Native Spanish speaker</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-secondary" />
                  <span>Certified language teacher</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <span>Available 24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What I can help with:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Grammar explanations</li>
                <li>• Vocabulary building</li>
                <li>• Conversation practice</li>
                <li>• Pronunciation tips</li>
                <li>• Cultural insights</li>
                <li>• Homework help</li>
                <li>• Quiz generation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Messages today:</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Corrections made:</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>New words learned:</span>
                <span className="font-semibold">7</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIChat;