import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, UserProfile, USER_PROFILES } from '../types/auth';

interface AuthContextType {
  role: UserRole;
  profile: UserProfile;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('admin'); // Default to admin for full showcase, easy toggle

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const toggleRole = () => {
    setRoleState((prev) => (prev === 'admin' ? 'user' : 'admin'));
  };

  const profile = USER_PROFILES[role];
  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  return (
    <AuthContext.Provider
      value={{
        role,
        profile,
        setRole,
        toggleRole,
        isAdmin,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
