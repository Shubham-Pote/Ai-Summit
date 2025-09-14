const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Token management functions
export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

// Profile API functions
export const profileAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  },

  // Character API functions
  getCharacters: async () => {
    const response = await fetch(`${API_BASE_URL}/characters`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch characters');
    }

    return await response.json();
  },

  getCharacterById: async (characterId: string) => {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch character');
    }

    return await response.json();
  },

  unlockCharacter: async (characterId: string) => {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/unlock`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to unlock character');
    }

    return await response.json();
  },

  getCharacterStats: async (characterId: string) => {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/stats`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch character stats');
    }

    return await response.json();
  },

  // Conversation API functions
  startConversation: async (characterId: string) => {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ characterId }),
    });

    if (!response.ok) {
      throw new Error('Failed to start conversation');
    }

    return await response.json();
  },

  sendMessage: async (conversationId: string, message: string, isAudio: boolean = false) => {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, isAudio }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  },

  getConversationHistory: async (characterId: string) => {
    const response = await fetch(`${API_BASE_URL}/conversations/history/${characterId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation history');
    }

    return await response.json();
  },

  // Audio API functions
  uploadAudio: async (audioBlob: Blob, conversationId: string) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('conversationId', conversationId);

    const response = await fetch(`${API_BASE_URL}/audio/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload audio');
    }

    return await response.json();
  },

  getAudioResponse: async (messageId: string) => {
    const response = await fetch(`${API_BASE_URL}/audio/${messageId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get audio response');
    }

    return await response.json();
  },

  updateProfile: async (data: { displayName: string; bio: string; location: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return await response.json();
  },
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

// Get auth headers for API requests
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Auth API functions
export const authAPI = {
  // Register new user - SIMPLIFIED (no username required)
  register: async (userData: {
    email: string;
    password: string;
    displayName: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return await response.json();
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return await response.json();
  },

  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  },

  // ✅ ADDED: Update user profile (MISSING FUNCTION)
  updateProfile: async (profileData: {
    displayName: string;
    bio: string;
    location: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return await response.json();
  },

  // Switch language
  switchLanguage: async (language: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/language`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ language }),
    });

    if (!response.ok) {
      throw new Error('Failed to switch language');
    }

    return await response.json();
  },

  // Get language stats
  getLanguageStats: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/language-stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch language stats');
    }

    return await response.json();
  },
};

// Lessons API functions
export const lessonsAPI = {
  // Get lessons by language
  getLessonsByLanguage: async (language: string) => {
    const response = await fetch(`${API_BASE_URL}/lessons/${language}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    
    const data = await response.json();
    
    // Transform _id to id for frontend compatibility
    const transformedLessons = data.lessons?.map((lesson: any) => ({
      ...lesson,
      id: lesson._id,
      duration: `${lesson.estimatedMinutes} min`,
      // Add mock progress data if not present
      progress: lesson.progress || 0,
      completed: lesson.completed || false,
      locked: lesson.locked || false,
    })) || [];
    
    return { lessons: transformedLessons };
  },

  // Get lesson details
  getLessonDetails: async (lessonId: string) => {
    const response = await fetch(`${API_BASE_URL}/lessons/lesson/${lessonId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch lesson details');
    }
    
    const data = await response.json();
    
    // Transform the response to match frontend expectations
    const transformedLesson = {
      ...data.lesson,
      id: data.lesson._id,
      totalSteps: data.lesson.steps?.length || 0,
      currentProgress: data.lesson.currentProgress || 0,
      progress: data.lesson.progress || 0,
    };
    
    return { lesson: transformedLesson };
  },

  // Update lesson progress
  updateProgress: async (lessonId: string, progressData: {
    currentStep: number;
    totalSteps: number;
    completed: boolean;
    timeSpent: number;
    language: string;
    score: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update progress');
    }
    
    return await response.json();
  },

  // Get dashboard data
  getDashboard: async (language: string) => {
    const response = await fetch(`${API_BASE_URL}/lessons/${language}/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard');
    }
    
    return await response.json();
  },

  // Generate new lesson
  generateLesson: async (lessonData: {
    language: string;
    topic: string;
    difficulty: string;
    lessonType: string;
    generateAudio?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/lessons/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(lessonData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate lesson');
    }
    
    return await response.json();
  },
};

// Notes API functions
export const notesAPI = {
  // Get all notes
  getNotes: async (params: {
    language?: string;
    section?: string;
    topic?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await fetch(`${API_BASE_URL}/notes?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    
    return await response.json();
  },

  // Create note
  createNote: async (noteData: {
    title: string;
    content: string;
    language: string;
    topic: string;
    tags: string[];
  }) => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(noteData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create note');
    }
    
    return await response.json();
  },

  // Generate AI notes
  generateNotes: async (data: { lessonId: string; language: string }) => {
    const response = await fetch(`${API_BASE_URL}/notes/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate notes');
    }
    
    return await response.json();
  },

  // Get notes stats
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/notes/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    return await response.json();
  },

  // Toggle star
  toggleStar: async (noteId: string) => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/star`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle star');
    }
    
    return await response.json();
  },

  // Delete note
  deleteNote: async (noteId: string) => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
    
    return await response.json();
  },
};

// Reading API functions
export const readingAPI = {
  // Get current article for user
  getCurrentArticle: async (language: string) => {
    const response = await fetch(`${API_BASE_URL}/reading/current/${language}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get current article');
    }
    
    return await response.json();
  },

  // Get all user articles (completed + current)
  getUserArticles: async (language: string) => {
    const response = await fetch(`${API_BASE_URL}/reading/articles/${language}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user articles');
    }
    
    return await response.json();
  },

  // Get article by ID (for review)
  getArticleById: async (articleId: string) => {
    const response = await fetch(`${API_BASE_URL}/reading/article/${articleId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get article');
    }
    
    return await response.json();
  },

  // Start reading an article
  startReading: async (articleId: string) => {
    const response = await fetch(`${API_BASE_URL}/reading/start/${articleId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to start reading');
    }
    
    return await response.json();
  },

  // Complete article and submit quiz
  completeArticle: async (articleId: string, data: { answers: number[]; timeSpent: number }) => {
    const response = await fetch(`${API_BASE_URL}/reading/complete/${articleId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete article');
    }
    
    return await response.json();
  },

  // Generate next article
  generateNextArticle: async (language: string) => {
    const response = await fetch(`${API_BASE_URL}/reading/next/${language}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate next article');
    }
    
    return await response.json();
  },

  // Get reading statistics
  getReadingStats: async (language: string) => {
    const response = await fetch(`${API_BASE_URL}/reading/stats/${language}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get reading stats');
    }
    
    return await response.json();
  },
};
