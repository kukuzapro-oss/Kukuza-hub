import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Wallet } from '../types/index.ts';
import { api, setStoredToken, getStoredToken } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<string | undefined>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationCode: () => Promise<string>;
  claimAdmin: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await api.get<{ user: User; wallet: Wallet }>('/api/auth/me');
      setUser(data.user);
      setWallet(data.wallet);
    } catch {
      setUser(null);
      setWallet(null);
      setStoredToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User; wallet: Wallet }>('/api/auth/login', {
      email,
      password,
    });
    setStoredToken(res.token);
    setUser(res.user);
    setWallet(res.wallet);
  };

  const register = async (fullName: string, email: string, phone: string, password: string) => {
    const res = await api.post<{ token: string; user: User; wallet: Wallet; verification_code?: string }>('/api/auth/register', {
      full_name: fullName,
      email,
      phone,
      password,
    });
    setStoredToken(res.token);
    setUser(res.user);
    setWallet(res.wallet);
    return res.user.verification_code;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Continue client cleanup
    }
    setStoredToken(null);
    setUser(null);
    setWallet(null);
  };

  const verifyEmail = async (code: string) => {
    await api.post('/api/auth/verify-email', { code });
    if (user) {
      setUser({ ...user, is_verified: 1 });
    }
  };

  const resendVerificationCode = async () => {
    const res = await api.post<{ message: string; verification_code: string }>('/api/auth/resend-code');
    return res.verification_code;
  };

  const claimAdmin = async () => {
    const res = await api.post<{ user: User }>('/api/auth/claim-admin');
    setUser(res.user);
  };

  const isAdmin = user?.role === 'admin' || user?.email.toLowerCase() === 'juniorjustus8272@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        loading,
        login,
        register,
        logout,
        refreshUser,
        verifyEmail,
        resendVerificationCode,
        claimAdmin,
        isAdmin,
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
