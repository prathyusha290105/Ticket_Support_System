import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('supportdesk_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and verify with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('supportdesk_token');
      const storedUser = localStorage.getItem('supportdesk_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Verify token validity with backend
          const res = await api.get('/auth/me');
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('supportdesk_user', JSON.stringify(res.data.data.user));
          }
        } catch (error) {
          console.warn('[Auth] Session validation failed, logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem('supportdesk_token', newToken);
    localStorage.setItem('supportdesk_user', JSON.stringify(userData));

    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: createdUser } = res.data.data;

    setToken(newToken);
    setUser(createdUser);
    localStorage.setItem('supportdesk_token', newToken);
    localStorage.setItem('supportdesk_user', JSON.stringify(createdUser));

    return createdUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('supportdesk_token');
    localStorage.removeItem('supportdesk_user');
  };

  const isAgent = user?.role === 'AGENT';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAgent,
        isCustomer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
