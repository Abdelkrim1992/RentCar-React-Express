import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// LocalStorage keys
const USER_STORAGE_KEY = 'ether_auth_user';

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AuthResponse {
  success: boolean;
  data: User;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper functions for localStorage
const saveUserToStorage = (user: User): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

const removeUserFromStorage = (): void => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

const getUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState<User | null>(() => getUserFromStorage());
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Update user state and localStorage
  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      saveUserToStorage(newUser);
    } else {
      removeUserFromStorage();
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data: AuthResponse = await apiRequest('POST', '/api/auth/login', { username, password });
      
      if (data && data.success) {
        updateUser(data.data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      updateUser(null);
      setLocation('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if there was an error
      updateUser(null);
      setLocation('/admin/login');
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);
    
    // First check if we have user data in localStorage
    const storedUser = getUserFromStorage();
    
    if (storedUser) {
      // Verify the stored user with the server
      try {
        const data: AuthResponse = await apiRequest('GET', '/api/auth/me');
        
        if (data && data.success) {
          // Update with the latest user data from server
          updateUser(data.data);
          setIsLoading(false);
          return true;
        }
        
        // If server says not authenticated, clear localStorage
        updateUser(null);
        setIsLoading(false);
        return false;
      } catch (error) {
        // If server error or 401, clear localStorage
        console.error('Verify auth error:', error);
        updateUser(null);
        setIsLoading(false);
        return false;
      }
    } else {
      // No stored user, check with server
      try {
        const data: AuthResponse = await apiRequest('GET', '/api/auth/me');
        
        if (data && data.success) {
          updateUser(data.data);
          setIsLoading(false);
          return true;
        }
        
        setIsLoading(false);
        return false;
      } catch (apiError) {
        // Handle 401 separately (not authenticated)
        if (apiError instanceof Error && apiError.message.includes('401')) {
          updateUser(null);
          setIsLoading(false);
          return false;
        }
        
        // Handle other errors
        console.error('Check auth error:', apiError);
        updateUser(null);
        setIsLoading(false);
        return false;
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route component to wrap admin routes
interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [initialCheck, setInitialCheck] = useState(false);
  const [loginTransition, setLoginTransition] = useState(true);

  useEffect(() => {
    // Check authentication status when component mounts
    const verifyAuth = async () => {
      const isAuthed = await checkAuth();
      if (!isAuthed) {
        setLocation('/admin/login');
      }
      // Mark initial check as complete
      setInitialCheck(true);
      // Give a slight delay to ensure smooth transition
      setTimeout(() => {
        setLoginTransition(false);
      }, 500);
    };
    
    verifyAuth();
  }, [checkAuth, setLocation]);

  // Show loading during:
  // 1. Initial authentication check
  // 2. Any loading state before initial complete check
  // 3. Login transition (first 500ms after auth to avoid flicker)
  if (isLoading || !initialCheck || loginTransition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-[#6843EC] border-b-[#D2FF3A] border-l-[#6843EC] border-r-[#D2FF3A] rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};