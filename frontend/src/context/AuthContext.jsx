import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = '/api/auth';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthHeader(token);
        try {
          const res = await axios.get(`${API_URL}/me`);
          setUser(res.data.user);
        } catch (err) {
          console.error('Session restoration failed:', err.message);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('token');
            setAuthHeader(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

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
      return { success: true, user: userData };
    } catch (err) {
      let msg = 'Registration failed.';
      if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        msg = 'Unable to connect to server. Please make sure the backend is running.';
      } else if (err.response.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setAuthHeader(token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      let msg = 'Invalid email or password.';
      if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        msg = 'Unable to connect to server. Please make sure the backend is running.';
      } else if (err.response.status === 401) {
        msg = err.response.data?.message || 'Invalid email or password.';
      } else if (err.response.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthHeader(null);
    setUser(null);
    navigate('/login');
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
