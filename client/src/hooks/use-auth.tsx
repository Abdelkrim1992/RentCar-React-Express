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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }
      
      const data: AuthResponse = await response.json();
      
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

  const logout = () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    })
      .then(() => {
        setUser(null);
        setLocation('/admin/login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
        // Still redirect to login even if there was an error
        setUser(null);
        setLocation('/admin/login');
      });
  };

  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Make the auth check request with error handling
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      // If unauthorized, just return false - no need to log error
      if (response.status === 401) {
        setUser(null);
        setIsLoading(false);
        return false;
      }
      
      // For other errors, throw so they're caught by our catch block
      if (!response.ok) {
        throw new Error(`Auth check failed: ${response.statusText}`);
      }
      
      // Parse the JSON response
      const data: AuthResponse = await response.json();
      
      if (data && data.success) {
        setUser(data.data);
        setIsLoading(false);
        return true;
      }
      
      setUser(null);
      setIsLoading(false);
      return false;
    } catch (error) {
      // Only log real errors, not 401s
      console.error('Check auth error:', error);
      setUser(null);
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

  useEffect(() => {
    // Check authentication status when component mounts
    const verifyAuth = async () => {
      const isAuthed = await checkAuth();
      if (!isAuthed) {
        setLocation('/admin/login');
      }
    };
    
    verifyAuth();
  }, [checkAuth, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-[#6843EC] border-b-[#D2FF3A] border-l-[#6843EC] border-r-[#D2FF3A] rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};