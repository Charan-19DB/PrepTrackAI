import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('preptrack_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user session', err);
        localStorage.removeItem('preptrack_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('preptrack_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('preptrack_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data);
    return res.data;
  };

  const loginWithGoogle = async (googleData) => {
    const res = await api.post('/auth/google', googleData);
    localStorage.setItem('preptrack_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data);
    return res.data;
  };

  const sendEmailVerification = async (customEmail) => {
    const res = await api.post('/auth/send-verification', { email: customEmail });
    if (res.data?.email) {
      setUser(prev => ({ ...prev, email: res.data.email }));
    }
    return res.data;
  };

  const verifyEmailCode = async (code) => {
    const res = await api.post('/auth/verify-code', { code });
    if (res.data?.user) {
      setUser(prev => ({ ...prev, ...res.data.user, isEmailVerified: true }));
    } else {
      setUser(prev => ({ ...prev, isEmailVerified: true }));
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('preptrack_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    setUser(prev => ({ ...prev, ...res.data }));
    return res.data;
  };

  const updateSettings = async (settingsData) => {
    const res = await api.put('/auth/settings', settingsData);
    setUser(prev => ({ ...prev, settings: res.data }));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      loginWithGoogle,
      sendEmailVerification,
      verifyEmailCode,
      logout,
      updateProfile,
      updateSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
