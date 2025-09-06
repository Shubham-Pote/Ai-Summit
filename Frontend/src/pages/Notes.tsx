import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { notesAPI, lessonsAPI } from "@/lib/api";
import { 
  StickyNote, 
  Plus, 
  Search, 
  BookOpen,
  Brain,
  Tag,
  Calendar,
  Edit,
  Trash2,
  Star,
  Loader2,
  X,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  Clock,
  Zap,
  Award,
  Hash,
  FileText,
  Maximize2,
  Copy,
  Check
} from "lucide-react";

interface Note {
  _id: string;
  title: string;
  content: string;
  topic: string;
  tags: string[];
  aiGenerated: boolean;
  starred: boolean;
  createdAt: string;
  language?: string;
  lessonId?: {
    _id: string;
    title: string;
    difficulty: string;
  };
}

interface Lesson {
  _id: string;
  id?: string;
  title: string;
  difficulty: string;
  estimatedMinutes: number;
  description?: string;
  hasNotes?: boolean;
}

const Notes = () => {
  const { user, switchLanguage } = useAuth();
  const { toast } = useToast();

  // State management
  const [notes, setNotes] = useState<Note[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedSection, setSelectedSection] = useState("all");
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showLessons, setShowLessons] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'masonry' | 'list'>('masonry');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['All']));
  const [showFilters, setShowFilters] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentLanguage = user?.currentLanguage || "spanish";

  // Form state
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    language: currentLanguage,
    topic: "Vocabulary",
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState("");

  const topics = ["Grammar", "Vocabulary", "Culture", "Pronunciation", "Beginner", "Intermediate", "Advanced"];
  const sections = [
    { value: "all", label: "All Notes" },
    { value: "my-notes", label: "My Notes" },
    { value: "ai-generated", label: "AI Generated" },
    { value: "starred", label: "Starred" }
  ];

  const commonTags = [
    "vocabulary", "grammar", "phrases", "pronunciation", "culture",
    "beginner", "intermediate", "advanced", "important", "review",
    "practice", "conversation", "writing", "reading", "listening"
  ];

  // API functions (keeping existing logic)
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params: any = { language: currentLanguage };
      if (searchTerm) params.search = searchTerm;
      if (selectedTopic !== "All") params.topic = selectedTopic;
      if (selectedSection !== "all") params.section = selectedSection;

      const data = await notesAPI.getNotes(params);
      setNotes(data.notes || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const data = await lessonsAPI.getLessonsByLanguage(currentLanguage);
      setLessons(data.lessons || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive",
      });
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await notesAPI.createNote(newNote);
      toast({
        title: "Success",
        description: "Note created successfully!",
      });
      
      setShowAddNote(false);
      setNewNote({
        title: "",
        content: "",
        language: currentLanguage,
        topic: "Vocabulary",
        tags: []
      });
      setTagInput("");
      
      fetchNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const generateNotes = async (lessonId: string) => {
    setGeneratingId(lessonId);
    try {
      const data = await notesAPI.generateNotes({
        lessonId,
        language: currentLanguage
      });

      if (data.alreadyExists) {
        toast({
          title: "Info",
          description: "Notes already exist for this lesson",
        });
      } else {
        toast({
          title: "Success",
          description: "AI study notes generated successfully!",
        });
      }
      
      fetchNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate notes",
        variant: "destructive",
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      await switchLanguage(newLanguage);
      toast({
        title: "Success",
        description: `Switched to ${newLanguage === 'japanese' ? 'Japanese 🇯🇵' : 'Spanish 🇪🇸'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch language",
        variant: "destructive",
      });
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !newNote.tags.includes(tag.trim()) && newNote.tags.length < 10) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, tag.trim()]
      });
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const toggleStar = async (noteId: string, currentStarred: boolean) => {
    try {
      await notesAPI.toggleStar(noteId);
      toast({
        title: "Success",
        description: currentStarred ? "Note unstarred" : "Note starred",
      });
      fetchNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesAPI.deleteNote(noteId);
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      fetchNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Note content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 border-green-300";
      case "Intermediate": return "bg-orange-100 text-orange-800 border-orange-300";
      case "Advanced": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTopicColor = (topic: string): string => {
    switch (topic) {
      case "Grammar": return "border-l-blue-500 bg-blue-50";
      case "Vocabulary": return "border-l-green-500 bg-green-50";
      case "Culture": return "border-l-purple-500 bg-purple-50";
      case "Pronunciation": return "border-l-orange-500 bg-orange-50";
      case "Beginner": return "border-l-emerald-500 bg-emerald-50";
      case "Intermediate": return "border-l-amber-500 bg-amber-50";
      case "Advanced": return "border-l-red-500 bg-red-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  const getTopicBadgeColor = (topic: string): string => {
    switch (topic) {
      case "Grammar": return "bg-blue-100 text-blue-800";
      case "Vocabulary": return "bg-green-100 text-green-800";
      case "Culture": return "bg-purple-100 text-purple-800";
      case "Pronunciation": return "bg-orange-100 text-orange-800";
      case "Beginner": return "bg-emerald-100 text-emerald-800";
      case "Intermediate": return "bg-amber-100 text-amber-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Filter and search logic
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchTerm || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTopic = selectedTopic === "All" || note.topic === selectedTopic;
    
    const matchesSection = selectedSection === "all" ||
      (selectedSection === "my-notes" && !note.aiGenerated) ||
      (selectedSection === "ai-generated" && note.aiGenerated) ||
      (selectedSection === "starred" && note.starred);
    
    return matchesSearch && matchesTopic && matchesSection;
  });

  useEffect(() => {
    if (user?.currentLanguage) {
      setNewNote(prev => ({
        ...prev,
        language: user.currentLanguage
      }));
    }
  }, [user?.currentLanguage]);

  useEffect(() => {
    fetchNotes();
  }, [searchTerm, selectedTopic, selectedSection, currentLanguage]);

  useEffect(() => {
    if (showLessons) {
      fetchLessons();
    }
  }, [showLessons, currentLanguage]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading user data...</span>
      </div>
    );
  }

  if (loading && notes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading notes...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Notebook</h1>
            <p className="text-gray-600">
              Welcome back, {user.displayName}! Your {currentLanguage === 'japanese' ? 'Japanese 🇯🇵' : 'Spanish 🇪🇸'} learning notes
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                <SelectItem value="japanese">🇯🇵 Japanese</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'masonry' ? 'list' : 'masonry')}
            >
              {viewMode === 'masonry' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>

            {/* ✅ ENHANCED CREATE NOTE DIALOG */}
            <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Plus className="w-4 h-4" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
                <DialogHeader className="pb-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">Create New Note</DialogTitle>
                      <DialogDescription className="text-base">
                        Capture your learning insights and organize them with tags
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Language</label>
                      <Select value={newNote.language} onValueChange={(value) => setNewNote({...newNote, language: value})}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                          <SelectItem value="japanese">🇯🇵 Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Topic</label>
                      <Select value={newNote.topic} onValueChange={(value) => setNewNote({...newNote, topic: value})}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {topics.map(topic => (
                            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Title</label>
                    <Input 
                      placeholder="Give your note a meaningful title..."
                      value={newNote.title}
                      onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                      className="h-12 text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Content</label>
                    <Textarea 
                      placeholder="Write your note content here. Be detailed and include examples, explanations, or anything that will help you remember..."
                      rows={12}
                      value={newNote.content}
                      onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                      className="resize-none text-base leading-relaxed"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Use markdown formatting if needed</span>
                      <span>{newNote.content.length} characters</span>
                    </div>
                  </div>
                  
                  {/* ✅ ENHANCED TAGS SECTION */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Tags ({newNote.tags.length}/10)
                    </label>
                    
                    {newNote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 rounded-lg border">
                        {newNote.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1 text-sm">
                            <Hash className="w-3 h-3" />
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-red-100"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="w-3 h-3 text-red-500" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2 mb-4">
                      <div className="relative flex-1">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder="Add a custom tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag(tagInput);
                            }
                          }}
                          className="pl-10 h-12"
                          disabled={newNote.tags.length >= 10}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => addTag(tagInput)}
                        disabled={!tagInput.trim() || newNote.tags.length >= 10}
                        className="h-12 px-6"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-3">Quick select popular tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {commonTags.map(tag => (
                          <Button
                            key={tag}
                            type="button"
                            variant="outline"
                            size="sm"
                            className={`text-xs transition-all ${
                              newNote.tags.includes(tag) 
                                ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => addTag(tag)}
                            disabled={newNote.tags.includes(tag) || newNote.tags.length >= 10}
                          >
                            <Hash className="w-3 h-3 mr-1" />
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button variant="outline" onClick={() => setShowAddNote(false)} className="px-6">
                      Cancel
                    </Button>
                    <Button 
                      onClick={createNote} 
                      disabled={!newNote.title.trim() || !newNote.content.trim()}
                      className="px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={() => setShowLessons(!showLessons)}>
              <Brain className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes, tags, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-32 bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section.value} value={section.value}>{section.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <Button
                key="All"
                variant={selectedTopic === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTopic("All")}
              >
                All Topics
              </Button>
              {topics.map((topic) => (
                <Button
                  key={topic}
                  variant={selectedTopic === topic ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* ✅ ENHANCED AI NOTE GENERATION */}
        {showLessons && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Generate AI Study Notes</h3>
                  <p className="text-gray-600">Transform your lessons into comprehensive study notes automatically</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => (
                  <div 
                    key={lesson._id} 
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={getDifficultyColor(lesson.difficulty)} variant="outline">
                              {lesson.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {lesson.estimatedMinutes}m
                            </div>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      {lesson.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {lesson.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                        <Sparkles className="w-3 h-3" />
                        <span>AI-powered note generation</span>
                      </div>
                      
                      <Button 
                        className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                        disabled={generatingId === lesson._id}
                        onClick={() => generateNotes(lesson._id)}
                      >
                        {generatingId === lesson._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Notes...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Generate Study Notes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {lessons.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">
                    No lessons available for note generation
                  </p>
                  <p className="text-gray-400 text-sm">
                    Complete some lessons first to generate AI study notes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes Display */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          /* Masonry Layout */
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className={`break-inside-avoid mb-4 rounded-xl p-4 shadow-sm border-l-4 transition-all hover:shadow-md cursor-pointer ${getTopicColor(note.topic)} bg-white/80 backdrop-blur-sm`}
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getTopicBadgeColor(note.topic)} variant="secondary">
                      {note.topic}
                    </Badge>
                    {note.aiGenerated && (
                      <Badge variant="outline" className="text-xs">
                        <Brain className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(note._id, note.starred);
                      }}
                    >
                      <Star className={`w-4 h-4 ${note.starred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note._id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {note.title}
                </h3>
                
                <p className="text-sm text-gray-700 mb-3 whitespace-pre-line line-clamp-6">
                  {note.content}
                </p>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                  
                  {note.aiGenerated && (
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Generated
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNotes.length === 0 && (
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <StickyNote className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No notes found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm ? "Try adjusting your search terms" : "Start creating notes to organize your learning"}
            </p>
            <Button onClick={() => setShowAddNote(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Note
            </Button>
          </div>
        )}

        {/* ✅ ENHANCED NOTE VIEW MODAL */}
        {selectedNote && (
          <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
              <DialogHeader className="pb-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTopicColor(selectedNote.topic)} border-l-0 border-4`}>
                        <FileText className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl text-gray-900 leading-tight">
                          {selectedNote.title}
                        </DialogTitle>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className={getTopicBadgeColor(selectedNote.topic)}>
                            {selectedNote.topic}
                          </Badge>
                          {selectedNote.aiGenerated && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              AI Generated
                            </Badge>
                          )}
                          {selectedNote.starred && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm text-yellow-600">Starred</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedNote.content)}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedNote.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto py-6">
                <div className="prose max-w-none">
                  <div className="text-base leading-relaxed whitespace-pre-wrap text-gray-800 bg-gray-50 rounded-lg p-6 border">
                    {selectedNote.content}
                  </div>
                </div>
                
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags ({selectedNote.tags.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          <Hash className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{selectedNote.content.length} characters</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      {selectedNote.aiGenerated ? (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>AI Generated</span>
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          <span>Personal Note</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Notes;
