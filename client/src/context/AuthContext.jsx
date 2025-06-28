// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the context
const AuthContext = createContext(null);

// Create an Axios instance for API calls
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
});

export const AuthProvider = ({ children }) => {
  // --- EXISTING AUTH STATE ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // --- NEW THEME STATE ---
  // 1. Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // --- NEW THEME EFFECT ---
  // 2. This effect runs whenever the `theme` state changes
  useEffect(() => {
    // Set the data-theme attribute on the root <html> element
    document.documentElement.setAttribute('data-theme', theme);
    // Save the user's choice in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // --- EXISTING AUTH EFFECT ---
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/validate');
          setUser(response.data);
        } catch (error) {
          console.error("Token validation failed", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    validateToken();
  }, [token]);

  const loginUser = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };
  
  // --- NEW THEME TOGGLE FUNCTION ---
  // 3. Function to toggle the theme state
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // 4. Expose theme state and toggle function in the context value
  const authContextValue = {
    user,
    token,
    loading,
    loginUser,
    logoutUser,
    api,
    theme, // <-- Add this
    toggleTheme, // <-- Add this
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};