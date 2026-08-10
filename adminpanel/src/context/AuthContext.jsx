import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in & listen for silent token refreshes
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    const handleRefreshed = (e) => {
      if (e.detail?.token) {
        setToken(e.detail.token);
      }
    };

    window.addEventListener('auth:token-refreshed', handleRefreshed);
    return () => {
      window.removeEventListener('auth:token-refreshed', handleRefreshed);
    };
  }, []);

  const login = (userData, authToken, refreshToken = null) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setError(null);
  };

  const logout = async () => {
    // Tell the backend first (fire-and-forget — don't block on network failures)
    try {
      await axiosInstance.post('/auth/logout');
    } catch {
      // Ignore — we always clear local state regardless
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setError(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    token,
    loading,
    error,
    setError,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
