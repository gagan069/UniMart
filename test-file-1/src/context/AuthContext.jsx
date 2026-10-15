import React, { createContext, useContext, useState } from 'react';
import { SEEDED_USERS } from '../lib/mockUsers.js';
import { isAdmin as checkIsAdmin } from '../lib/permissions.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Support optional ?as=admin / ?as=priya / ?as=guest for testing, then check localStorage, then default to Student A
  const [user, setUser] = useState(() => {
    try {
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

      const savedId = localStorage.getItem('unimart_active_user_id');
      if (savedId === 'guest') return null;
      if (savedId) {
        const found = SEEDED_USERS.find((u) => u.id === savedId || u.email === savedId);
        if (found) return found;
      }
    } catch (e) {}
    return SEEDED_USERS[1];
  });

  const login = (userData) => {
    setUser(userData);
    try {
      if (userData?.id) localStorage.setItem('unimart_active_user_id', userData.id);
    } catch (e) {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.setItem('unimart_active_user_id', 'guest');
    } catch (e) {}
  };

  const switchAccount = (accountKey) => {
    if (accountKey === 'guest' || accountKey === null) {
      setUser(null);
      try {
        localStorage.setItem('unimart_active_user_id', 'guest');
      } catch (e) {}
      return;
    }
    const found = SEEDED_USERS.find(
      (u) => u.id === accountKey || u.email === accountKey
    );
    if (found) {
      setUser(found);
      try {
        localStorage.setItem('unimart_active_user_id', found.id);
      } catch (e) {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'guest',
        isAdmin: checkIsAdmin(user),
        login,
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
  const context = useContext(AuthContext);
  return context;
}

export default AuthContext;
