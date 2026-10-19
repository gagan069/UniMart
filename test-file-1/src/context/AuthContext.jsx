import React, { createContext, useContext, useState } from 'react';
import { SEEDED_USERS, getAllUsers, findUserById } from '../lib/mockUsers.js';
import { isAdmin as checkIsAdmin } from '../lib/permissions.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 1. Default user is guest (null) for first-time visitors
  // 2. Only honour ?as= query param during DEV mode
  // 3. Otherwise restore from localStorage via unimart_active_user_id
  const [user, setUser] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        // Optional quick-switch query param in DEV mode only
        if (import.meta.env.DEV && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const asParam = params.get('as');
          if (asParam === 'guest') return null;
          if (asParam === 'admin') return SEEDED_USERS[0];
          if (asParam === 'satkar') return SEEDED_USERS[1];
          if (asParam === 'priya') return SEEDED_USERS[2];
          if (asParam) {
            const foundUser = findUserById(asParam);
            if (foundUser) return foundUser;
          }
        }

        const savedId = localStorage.getItem('unimart_active_user_id');
        if (savedId === 'guest') return null;
        if (savedId) {
          const found = findUserById(savedId);
          if (found) return found;
        }
      }
    } catch (e) {
      console.error('Error hydrating user from localStorage', e);
    }
    // Default to guest
    return null;
  });

  const login = (userData) => {
    setUser(userData);
    try {
      if (userData?.id) {
        localStorage.setItem('unimart_active_user_id', userData.id);
      }
    } catch (e) {
      console.error('Error saving active user to localStorage', e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.setItem('unimart_active_user_id', 'guest');
    } catch (e) {
      console.error('Error saving guest state to localStorage', e);
    }
  };

  const switchAccount = (accountKey) => {
    if (!accountKey || accountKey === 'guest') {
      logout();
      return;
    }
    const found = findUserById(accountKey);
    if (found) {
      login(found);
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
        seededUsers: getAllUsers(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
