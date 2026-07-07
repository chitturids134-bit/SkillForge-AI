import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Backend runs on Port 5001
const API_URL = 'http://localhost:5003/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default authorization header
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Check if token exists and fetch user
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthHeader(token);
        try {
          const res = await axios.get(`${API_URL}/me`);
          setUser(res.data.user);
        } catch (err) {
          console.error('Session restoration failed:', err);
          localStorage.removeItem('token');
          setAuthHeader(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register User
  const register = async (name, email, password, role) => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        role,
      });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setAuthHeader(token);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Login User
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setAuthHeader(token);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setAuthHeader(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
