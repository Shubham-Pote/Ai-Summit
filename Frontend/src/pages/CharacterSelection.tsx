import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Volume2, Brain, Sparkles } from "lucide-react"

interface Character {
  id: 'maria' | 'akira'
  name: string
  language: string
  description: string
  personality: string
  flag: string
  specialties: string[]
  level: string
  accent: string
}

const characters: Character[] = [
  {
    id: 'maria',
    name: 'María González',
    language: 'Spanish',
    description: 'A warm and energetic Spanish teacher from Barcelona who loves sharing her culture through conversation.',
    personality: 'Friendly, enthusiastic, patient, and culturally rich',
    flag: '🇪🇸',
    specialties: ['Spanish Grammar', 'Cultural Context', 'Slang & Expressions', 'Latin American Culture'],
    level: 'Beginner to Advanced',
    accent: 'Barcelonan Spanish'
  },
  {
    id: 'akira',
    name: 'Akira Tanaka',
    language: 'Japanese',
    description: 'A respectful and knowledgeable Japanese language expert from Tokyo who teaches with precision and cultural depth.',
    personality: 'Respectful, patient, detail-oriented, and traditionally mindful',
    flag: '🇯🇵',
    specialties: ['Japanese Grammar', 'Kanji & Hiragana', 'Business Japanese', 'Cultural Etiquette'],
    level: 'Beginner to Advanced',
    accent: 'Tokyo Standard Japanese'
  }
]

const CharacterSelection = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId)
  }

  const handleStartConversation = () => {
    if (selectedCharacter) {
      navigate(`/character-chat/${selectedCharacter}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Choose Your Language Partner
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Meet our AI language tutors who will guide you through immersive conversations. 
            Each character has their own personality, teaching style, and cultural background.
          </p>
        </div>

        {/* Character Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {characters.map((character) => (
            <Card 
              key={character.id}
              className={`relative overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                selectedCharacter === character.id
                  ? 'ring-4 ring-emerald-500 bg-slate-800/90 shadow-2xl shadow-emerald-500/20'
                  : 'bg-slate-800/70 hover:bg-slate-800/90 border-slate-700'
              }`}
              onClick={() => handleCharacterSelect(character.id)}
            >
              {/* Selection indicator */}
              {selectedCharacter === character.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl">{character.flag}</span>
                  <div>
                    <CardTitle className="text-2xl text-white">{character.name}</CardTitle>
                    <CardDescription className="text-emerald-400 font-medium">
                      {character.language} Teacher
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit bg-purple-500/20 text-purple-300">
                  {character.level}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  {character.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-slate-400">Personality:</span>
                    <span className="text-sm text-slate-200">{character.personality}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Accent:</span>
                    <span className="text-sm text-slate-200">{character.accent}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-slate-400">Specialties:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {character.specialties.map((specialty, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs border-slate-600 text-slate-300"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  variant={selectedCharacter === character.id ? "default" : "outline"}
                  className={`w-full transition-all duration-300 ${
                    selectedCharacter === character.id
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCharacterSelect(character.id)
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {selectedCharacter === character.id ? 'Selected' : 'Select Character'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Start Conversation Button */}
        {selectedCharacter && (
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleStartConversation}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 py-3 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Conversation with {characters.find(c => c.id === selectedCharacter)?.name}
            </Button>
          </div>
        )}

        {/* Features Preview */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">What You'll Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <MessageCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">Real-time Chat</h4>
              <p className="text-slate-400 text-sm">Live streaming conversations with instant responses</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <Volume2 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">Voice Synthesis</h4>
              <p className="text-slate-400 text-sm">Hear characters speak with native pronunciation</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <Brain className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">3D Avatars</h4>
              <p className="text-slate-400 text-sm">Interactive 3D models with emotion-based animations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterSelection