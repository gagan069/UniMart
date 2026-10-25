import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi.js';
import { SEEDED_USERS } from '../lib/mockUsers.js';
import { isAdmin as checkIsAdmin } from '../lib/permissions.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // First check localStorage session, then URL query param for quick debug, or null
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('unimart_active_session_user_v1');
      if (raw) return JSON.parse(raw);

      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const asParam = params.get('as');
        if (asParam === 'guest') return null;
        if (asParam === 'admin') return SEEDED_USERS[0];
        if (asParam === 'satkar') return SEEDED_USERS[1];
        if (asParam === 'priya') return SEEDED_USERS[2];
        if (asParam) {
          const match = SEEDED_USERS.find((u) => u.id === asParam || u.email === asParam);
          if (match) return match;
        }
      }
    } catch (_e) {}
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

  const login = async (credentialsOrUser) => {
    setLoading(true);
    try {
      // If full user object passed directly (e.g. from Google SSO or seed user)
      if (credentialsOrUser && credentialsOrUser.email && !credentialsOrUser.password) {
        authApi.setCurrentUser(credentialsOrUser);
        setUser(credentialsOrUser);
        return credentialsOrUser;
      }
      // If credentials object passed { email, password }
      const res = await authApi.login(credentialsOrUser);
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

  const switchAccount = (accountKey) => {
    if (accountKey === 'guest' || accountKey === null) {
      logout();
      return;
    }
    const found = SEEDED_USERS.find(
      (u) => u.id === accountKey || u.email === accountKey
    );
    if (found) {
      const { password: _p, ...safeFound } = found;
      authApi.setCurrentUser(safeFound);
      setUser(safeFound);
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
        switchAccount,
        seededUsers: SEEDED_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
