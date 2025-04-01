import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// LocalStorage keys
const USER_STORAGE_KEY = 'ether_auth_user';
const TOKEN_STORAGE_KEY = 'ether_auth_token';

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AuthResponse {
  success: boolean;
  data: User;
  token?: string;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  getAuthToken: () => string | null;
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

const saveTokenToStorage = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error('Error saving token to localStorage:', error);
  }
};

const removeUserFromStorage = (): void => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

const removeTokenFromStorage = (): void => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
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

const getTokenFromStorage = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
};

// Use the apiRequest function directly
// The queryClient.ts version already handles the token

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState<User | null>(() => getUserFromStorage());
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Update user state and localStorage
  const updateUser = (newUser: User | null, token?: string) => {
    setUser(newUser);
    if (newUser) {
      saveUserToStorage(newUser);
      if (token) {
        saveTokenToStorage(token);
      }
    } else {
      removeUserFromStorage();
      removeTokenFromStorage();
    }
  };

  const getAuthToken = (): string | null => {
    return getTokenFromStorage();
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data: AuthResponse = await apiRequest('POST', '/api/auth/login', { username, password });
      
      if (data && data.success && data.token) {
        updateUser(data.data, data.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // No need to call the server for JWT logout - just remove from client
    updateUser(null);
    setLocation('/admin/login');
  };

  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);
    
    // First check if we have a token in localStorage
    const token = getTokenFromStorage();
    const storedUser = getUserFromStorage();
    
    if (token && storedUser) {
      // Token will be automatically included in the request by queryClient.ts
      try {
        const data: AuthResponse = await apiRequest('GET', '/api/auth/me');
        
        if (data && data.success) {
          // Update with the latest user data from server
          updateUser(data.data, token); // Keep using the same token
          setIsLoading(false);
          return true;
        }
        
        // If server says not authenticated, clear localStorage
        updateUser(null);
        setIsLoading(false);
        return false;
      } catch (error) {
        // If server error or 401/403, clear localStorage
        console.error('Verify auth error:', error);
        updateUser(null);
        setIsLoading(false);
        return false;
      }
    } else {
      // No stored token, user is not authenticated
      updateUser(null);
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!getTokenFromStorage(),
        isLoading,
        login,
        logout,
        checkAuth,
        getAuthToken,
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