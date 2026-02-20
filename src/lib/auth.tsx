'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import api from './api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithTokens: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore the session using a stored token
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api
        .get('/auth/me/')
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await api.post('/auth/token/', { username, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    const me = await api.get('/auth/me/');
    setUser(me.data);
  };

  // Used after Google sign-in — tokens come from the backend Google endpoint
  const loginWithTokens = async (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    const me = await api.get('/auth/me/');
    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await api.get('/auth/me/');
    setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, loginWithTokens, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
