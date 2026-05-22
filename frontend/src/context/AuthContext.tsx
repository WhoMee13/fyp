import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface VendorProfile {
  id: string;
  citizenshipId: string;
  frontImagePath: string;
  backImagePath: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

type AuthProviderType = 'LOCAL' | 'GOOGLE' | 'BOTH';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  authProvider?: AuthProviderType;
  hasPassword?: boolean;
  createdAt: string;
  vendorProfile?: VendorProfile | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  vendorStatus: VendorProfile['status'] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user);
      toast.success('Login successful');
      return response.data.user;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await api.post('/auth/google', { credential });
      setUser(response.data.user);
      toast.success('Signed in with Google');
      return response.data.user;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Google sign-in failed');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, phone });
      setUser(response.data.user);
      toast.success('Registration successful');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isVendor: !!user?.vendorProfile && user.vendorProfile.status === 'APPROVED',
        vendorStatus: user?.vendorProfile?.status ?? null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

