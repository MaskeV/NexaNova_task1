// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get(API_ENDPOINTS.ME);
        setUser(response.data.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const register = async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        setUser(response.data.data);
        toast.success('Registration successful! Welcome to NexaNova!');
        
        // Navigate after a short delay to show the toast
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        setUser(response.data.data);
        toast.success('Login successful! Welcome back!');
        
        // Navigate after a short delay to show the toast
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully!');
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};