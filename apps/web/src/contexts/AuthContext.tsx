import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  roles: string[];
  accountStatus: string;
}

export interface Profile {
  displayName: string;
  publicProfile: {
    bio?: string;
    interests: string[];
    languages: string[];
    values: string[];
    conversationStarters: string[];
    profilePhotoUrl?: string;
  };
  privateProfile: {
    communicationPreference: string;
  };
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  genderIdentity?: string;
  matchingPreference?: string;
  agreedToRules: boolean;
  agreedToPrivacy: boolean;
  consentToMatching: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api<{ data: { user: User; profile: Profile | null } }>(
        '/api/v1/auth/me',
      );
      setUser(response.data.user);
      setProfile(response.data.profile);
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await api<{ data: { user: User } }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(response.data.user);
    await refreshUser();
  };

  const register = async (data: RegisterData) => {
    const response = await api<{ data: { user: User } }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setUser(response.data.user);
    await refreshUser();
  };

  const logout = async () => {
    await api('/api/v1/auth/logout', { method: 'POST' });
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
