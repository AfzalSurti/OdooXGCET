import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { authAPI } from '@/lib/api';
import { mockCurrentUser } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  resendOtp: () => Promise<boolean>;
  pendingEmail: string | null;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convert backend role (uppercase) to frontend role (lowercase)
 */
function normalizeRole(role: string): UserRole {
  const upperRole = role.toUpperCase();
  if (upperRole === 'ADMIN') return 'admin';
  if (upperRole === 'HR') return 'hr';
  return 'employee';
}

/**
 * Convert user data from backend format to frontend format
 */
function transformUser(backendUser: any): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: `${backendUser.firstName} ${backendUser.lastName}`,
    role: normalizeRole(backendUser.role),
    employeeId: backendUser.employeeId,
    department: backendUser.department || '',
    avatar: undefined
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token and fetch user on mount
  useEffect(() => {
    const token = localStorage.getItem('zarvo_token');
    if (token) {
      // Fetch current user data
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('zarvo_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(transformUser(data.data));
        } else {
          // Invalid response format, clear token
          localStorage.removeItem('zarvo_token');
          setUser(null);
        }
      } else {
        // Token invalid or expired (401/403)
        const errorData = await response.json().catch(() => ({}));
        console.warn('Failed to fetch current user:', errorData.message || 'Unauthorized');
        localStorage.removeItem('zarvo_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('zarvo_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await authAPI.login(email, password);
      
      if (data.success && data.data?.token && data.data?.user) {
        // Token is already stored by authAPI.login
        setUser(transformUser(data.data.user));
        return true;
      } else {
        // Handle error message
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Clear any invalid token
      localStorage.removeItem('zarvo_token');
      setUser(null);
      throw error; // Re-throw to let the caller handle it
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Mock signup: assume backend created user and sent OTP
    await new Promise(resolve => setTimeout(resolve, 800));
    if (name && email && password) {
      setPendingEmail(email);
      return true;
    }
    return false;
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Mock: accept any non-empty OTP
    if (pendingEmail && otp.trim().length >= 4) {
      setUser({ ...mockCurrentUser, email: pendingEmail });
      setPendingEmail(null);
      return true;
    }
    return false;
  };

  const resendOtp = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return !!pendingEmail;
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setPendingEmail(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  // Don't render children until we've checked for existing auth
  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup,
      verifyOtp,
      resendOtp,
      pendingEmail,
      logout,
      switchRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
