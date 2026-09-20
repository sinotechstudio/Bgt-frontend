import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, setAuthToken, registerUnauthorizedHandler } from '../lib/api';
import { useToast } from './ToastContext';
import { useRouter } from './RouterContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrCreds: string | { email: string; password: string }, maybePassword?: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; gamerTag?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateUser: (updated: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { error, success, info } = useToast();
  const { navigate } = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.auth.me();
      if (res.user) {
        setUser(res.user);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Register 401 handler
    registerUnauthorizedHandler(() => {
      setUser(null);
      info('Your session has expired. Please sign in again.', 'Session Expired');
      navigate('/login');
    });

    const initAuth = async () => {
      setIsLoading(true);
      try {
        const res = await api.auth.me();
        if (res.user) {
          setUser(res.user);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [info, navigate]);

  const login = async (emailOrCreds: string | { email: string; password: string }, maybePassword?: string) => {
    setIsLoading(true);
    try {
      const credentials = typeof emailOrCreds === 'string'
        ? { email: emailOrCreds, password: maybePassword || '' }
        : emailOrCreds;
      const res = await api.auth.login(credentials);
      setAuthToken(res.token);
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`, 'Login Successful');
      navigate('/');
    } catch (err: any) {
      error(err.message || 'Failed to sign in', 'Authentication Error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; gamerTag?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      setAuthToken(res.token);
      setUser(res.user);
      success(res.message, 'Registration Complete');
      if (res.requireVerification) {
        navigate('/verify-email');
        return true;
      } else {
        navigate('/');
        return false;
      }
    } catch (err: any) {
      error(err.message || 'Failed to create account', 'Registration Error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      setAuthToken(null);
      setUser(null);
      success('You have been logged out safely.', 'Signed Out');
      navigate('/login');
    }
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUser,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
