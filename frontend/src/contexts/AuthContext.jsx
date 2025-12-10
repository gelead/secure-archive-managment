import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({ ...parsedUser, accessToken: storedToken });
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    if (authData && authData.user && authData.accessToken) {
      const userData = { ...authData.user, accessToken: authData.accessToken, refreshToken: authData.refreshToken };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('accessToken', authData.accessToken);
      if (authData.refreshToken) {
        localStorage.setItem('refreshToken', authData.refreshToken);
      }
    } else {
      setUser(authData);
      localStorage.setItem('user', JSON.stringify(authData));
    }
  };

  const logout = async () => {
    if (user && user.accessToken) {
      try {
        await api.auth.logout(user.accessToken);
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;

