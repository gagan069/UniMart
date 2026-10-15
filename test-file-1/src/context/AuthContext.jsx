import React, { createContext, useContext, useState } from 'react';
import { SEEDED_USERS } from '../lib/mockUsers.js';
import { isAdmin as checkIsAdmin } from '../lib/permissions.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Default to Student A (Satkar Singh)
  const [user, setUser] = useState(SEEDED_USERS[1]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const switchAccount = (accountKey) => {
    if (accountKey === 'guest' || accountKey === null) {
      setUser(null);
      return;
    }
    const found = SEEDED_USERS.find(
      (u) => u.id === accountKey || u.email === accountKey
    );
    if (found) {
      setUser(found);
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
