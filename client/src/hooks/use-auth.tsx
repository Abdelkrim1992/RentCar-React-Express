import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data: AuthResponse = await apiRequest('POST', '/api/auth/login', { username, password });
      
      if (data && data.success) {
        setUser(data.data);
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
      setUser(null);
      setLocation('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if there was an error
      setUser(null);
      setLocation('/admin/login');
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Use the apiRequest with a modified try/catch to handle 401s
      try {
        const data: AuthResponse = await apiRequest('GET', '/api/auth/me');
        
        if (data && data.success) {
          setUser(data.data);
          setIsLoading(false);
          return true;
        }
        
        // If we got a response but it's not successful
        setUser(null);
        setIsLoading(false);
        return false;
      } catch (apiError) {
        // Handle 401 separately (not authenticated)
        if (apiError instanceof Error && apiError.message.includes('401')) {
          setUser(null);
          setIsLoading(false);
          return false;
        }
        // Rethrow for other errors to be caught by the outer catch
        throw apiError;
      }
    } catch (error) {
      // Handle other errors
      console.error('Check auth error:', error);
      setUser(null);
      setIsLoading(false);
      return false;
    } finally {
      // Always ensure loading is set to false
      setIsLoading(false);
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