import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from './api';

export type UserRole = 'colleague' | 'manager' | 'admin' | 'architect';

export interface User {
  id: string;
  username: string | null;
  name: string;
  email: string | null;
  role: UserRole;
  jobRoleId?: number | null;
  jobRole: string;
  departmentId?: number | null;
  department: string;
  managerId?: string | null;
  startDate: string;
  requiresInduction: boolean;
  activated: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  requestCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.auth.me()
      .then((user) => {
        if (mounted) {
          setCurrentUser(user as User);
          setIsAuthLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setCurrentUser(null);
          setIsAuthLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const requestCode = async (email: string) => {
    await api.auth.requestCode(email);
  };

  const verifyCode = async (email: string, code: string) => {
    const user = await api.auth.verifyCode(email, code);
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
        requestCode,
        verifyCode,
        logout,
        isAuthenticated: currentUser !== null,
        isAuthLoading,
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
