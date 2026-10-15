import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Satkar Singh',
    email: 'satkar0696.becse25@chitkara.edu.in',
    studentId: '2110990696',
    role: 'student'
  });

  const [isAdmin, setIsAdmin] = useState(false);

  const toggleAdminRole = () => {
    setIsAdmin((prev) => !prev);
  };

  const login = (userData) => {
    setUser(userData);
    if (userData?.role === 'admin' || userData?.isAdmin) {
      setIsAdmin(true);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, setIsAdmin, toggleAdminRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export default AuthContext;
