import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from './api';

export type UserRole = 'colleague' | 'manager' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  jobRole: string;
  department: string;
  managerId?: string | null;
  startDate: string;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginAs: (role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loginAs = async (role: UserRole) => {
    const usernameMap: Record<UserRole, { username: string; password: string }> = {
      colleague: { username: 'colleague1', password: 'colleague' },
      manager: { username: 'manager1', password: 'manager' },
      admin: { username: 'admin', password: 'admin' },
    };
    const creds = usernameMap[role];
    const user = await api.auth.login(creds.username, creds.password);
    setCurrentUser(user as User);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginAs,
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
