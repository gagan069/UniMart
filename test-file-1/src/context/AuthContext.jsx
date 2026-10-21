import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi.js';
import { isAdmin as checkIsAdmin } from '../lib/permissions.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // First-time visitors are guests (null) unless a valid session exists in localStorage
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('unimart_active_session_user_v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    authApi.getCurrentUser().then((res) => {
      if (mounted && res?.data !== undefined) {
        setUser(res.data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      setUser(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      setUser(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role: user?.role || 'guest',
        isAdmin: checkIsAdmin(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export default AuthContext;
