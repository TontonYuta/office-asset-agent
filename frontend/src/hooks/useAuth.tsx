import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserProfile, USER_PROFILES } from '../types/auth';
import { loginApi, getMeApi, logoutApi, getStoredToken } from '../services/api';

interface AuthContextType {
  role: UserRole;
  profile: UserProfile;
  token: string | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [role, setRoleState] = useState<UserRole>('admin');
  const [profile, setProfile] = useState<UserProfile>(USER_PROFILES.admin);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync profile on mount if token exists
  useEffect(() => {
    let isMounted = true;
    async function loadCurrentSession() {
      if (!token) return;
      try {
        const user = await getMeApi();
        if (isMounted && user) {
          setProfile(user);
          setRoleState(user.role);
        }
      } catch (err) {
        console.warn('Failed to restore session:', err);
      }
    }
    loadCurrentSession();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const res = await loginApi({ username, password });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setRoleState(res.user.role);
      setProfile(res.user);
      setIsLoginModalOpen(false);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Đăng nhập không thành công.' };
  };

  const logout = async () => {
    await logoutApi();
    setToken(null);
    setRoleState('user');
    setProfile(USER_PROFILES.user);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setProfile(USER_PROFILES[newRole]);
  };

  const toggleRole = () => {
    // Instead of raw toggle, open authentication modal to verify credentials
    openLoginModal();
  };

  const isAdmin = role === 'admin';
  const isUser = role === 'user';
  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        role,
        profile,
        token,
        isAuthenticated,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
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
