import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session on load
    const token = localStorage.getItem('savoria_token');
    const savedUser = localStorage.getItem('savoria_user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const setSession = (token, userData) => {
    localStorage.setItem('savoria_token', token);
    localStorage.setItem('savoria_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      setSession(res.data.token, res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await registerUser({ name, email, password });
      setSession(res.data.token, res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('savoria_token');
      localStorage.removeItem('savoria_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
