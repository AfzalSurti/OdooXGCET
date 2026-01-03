import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '@/lib/types';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in production this would call an API
    await new Promise(resolve => setTimeout(resolve, 800));
    if (email && password) {
      setUser(mockCurrentUser);
      return true;
    }
    return false;
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
    setUser(null);
    setPendingEmail(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

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
