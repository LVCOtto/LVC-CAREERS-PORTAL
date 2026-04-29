import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from './api';

export type UserRole = 'colleague' | 'manager' | 'admin' | 'architect';

export interface User {
  id: string;
  username: string | null;
  name: string;
  email: string | null;
  role: UserRole;
  jobRole: string;
  department: string;
  managerId?: string | null;
  startDate: string;
  requiresInduction: boolean;
  activated: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    api.auth.me()
      .then((user) => {
        if (mounted) setCurrentUser(user as User);
      })
      .catch(() => {
        if (mounted) setCurrentUser(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    const user = await api.auth.login(username, password);
    setCurrentUser(user as User);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Even if logout fails, clear local auth state.
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        isAuthenticated: currentUser !== null,
      }}
    >
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
