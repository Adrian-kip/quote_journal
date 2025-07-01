import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const response = await api.get('/validate', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    validateToken();
  }, [token]);

  const loginUser = useCallback((newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);
  
  const triggerRefresh = useCallback(() => {
    console.log("--- REFRESH SIGNAL TRIGGERED ---"); 
    setRefreshSignal(count => count + 1);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    token,
    loading,
    loginUser,
    logoutUser,
    api,
    theme,
    toggleTheme,
    triggerRefresh
  }), [user, token, loading, loginUser, logoutUser, theme, toggleTheme, triggerRefresh]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};