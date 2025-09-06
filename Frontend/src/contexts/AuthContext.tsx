import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  currentLanguage: string;
  level: number;
  xp: number;
  streak: number;
  languages: string[];
  joinDate?: string;
  fullName?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
}

interface RegisterData {
  
  email: string;
  password: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>; // Added this line
  logout: () => void;
  updateUser: (userData: User) => void;
  switchLanguage: (language: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('🔍 App start - Token exists:', !!token);
    console.log('🔍 App start - User exists:', !!savedUser);
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('✅ User restored from localStorage:', userData.displayName);
      } catch (error) {
        console.error('❌ Failed to parse saved user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const updateUser = (userData: User) => {
    console.log('🔄 Updating user data:', userData.displayName);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Added register method
  const register = async (userData: RegisterData) => {
    try {
      console.log('🔐 Register attempt for:', userData.email);
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          throw { message: data.message, field: data.field };
        }
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        console.log('✅ Registration successful');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Login attempt for:', email);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        console.log('✅ Login successful');
      } else {
        throw new Error(data.message || 'No token received');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    console.log('🔓 Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const switchLanguage = async (language: string) => {
    try {
      console.log('🌍 Switching language to:', language);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://localhost:5000/api/auth/language', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ language })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to switch language: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        updateUser(data.user);
        console.log('✅ Language switched successfully:', language);
      } else {
        throw new Error(data.message || 'Failed to switch language');
      }
    } catch (error: any) {
      console.error('❌ Switch language error:', error);
      throw new Error(error.message || 'Failed to switch language');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register, // Added this line
    logout,
    updateUser,
    switchLanguage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

