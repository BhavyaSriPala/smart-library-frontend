import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on first render
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('smart_library_token');
      const storedUser = localStorage.getItem('smart_library_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse stored authentication:', error);
      localStorage.removeItem('smart_library_token');
      localStorage.removeItem('smart_library_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler: sets state & persists to localStorage
  const login = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('smart_library_token', jwtToken);
    localStorage.setItem('smart_library_user', JSON.stringify(userData));
  };

  // Logout handler: clears state & localStorage
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smart_library_token');
    localStorage.removeItem('smart_library_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
