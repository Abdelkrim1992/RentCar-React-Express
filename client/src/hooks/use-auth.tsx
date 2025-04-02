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
  const [isLoading, setIsLoading] = useState(false);
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
      // Don't set isLoading to true to avoid loading screens
      const data: AuthResponse = await apiRequest('POST', '/api/auth/login', { username, password });
      
      if (data && data.success && data.token) {
        // Immediately update storage to ensure fast access
        saveTokenToStorage(data.token);
        saveUserToStorage(data.data);
        
        // Then update state
        setUser(data.data);
        
        // If user is admin, immediately redirect to admin dashboard
        if (data.data.isAdmin) {
          setLocation('/admin');
        }
        
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
    // First check if we have a token and user in localStorage
    const token = getTokenFromStorage();
    const storedUser = getUserFromStorage();
    
    // If we have both token and user in localStorage, trust that first
    if (token && storedUser) {
      // Only set the user from the stored value if we don't already have it
      if (!user) {
        setUser(storedUser);
      }
      
      try {
        // Quietly verify with server in the background
        const data: AuthResponse = await apiRequest('GET', '/api/auth/me');
        
        if (data && data.success) {
          // Update user data if needed (keep same token)
          updateUser(data.data, token);
          
          // Auto redirect to admin if on login page
          if (data.data.isAdmin && window.location.pathname === '/admin/login') {
            setLocation('/admin');
          }
          
          return true;
        }
        
        // Only clear on explicit server rejection
        // This way temporary network issues won't log users out
        return true;
      } catch (error) {
        // Don't clear token on network errors - only on explicit 401/403
        if (error instanceof Error && 
            (error.message.includes('401') || error.message.includes('403'))) {
          updateUser(null);
          return false;
        }
        // On other errors, keep the user logged in
        return true;
      }
    } else {
      // No stored credentials, user is not authenticated
      updateUser(null);
      return false;
    }
  };

  // On initial load, check auth once if we have a stored token
  useEffect(() => {
    if (getTokenFromStorage()) {
      checkAuth();
    }
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
  const { isAuthenticated, checkAuth } = useAuth();
  const [, setLocation] = useLocation();

  // First, do an immediate check for token and user in localStorage 
  // to avoid any loading screens
  const token = getTokenFromStorage();
  const storedUser = getUserFromStorage();
  
  // Only perform background check if needed
  useEffect(() => {
    // Only run a background auth check when necessary
    // This avoids any network calls that could delay rendering
    const verifyAuth = async () => {
      // Skip verification if we already have token and user data in localStorage
      if (token && storedUser) {
        return; // Already authenticated based on localStorage
      }
      
      // Only check with server if localStorage doesn't have valid data
      const isAuthed = await checkAuth();
      if (!isAuthed) {
        setLocation('/admin/login');
      }
    };
    
    verifyAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // If both token and stored user exist, render immediately without waiting
  // for the network check to complete - this gives immediate access
  // If user is not authenticated by localStorage, the useEffect will redirect
  const immediatelyAuthenticated = !!token && !!storedUser;
  
  return (immediatelyAuthenticated || isAuthenticated) ? <>{children}</> : null;
};