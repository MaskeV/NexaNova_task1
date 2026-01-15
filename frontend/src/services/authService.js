// src/services/authService.js
import api from './api';

// Login user
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Register user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Update password
export const updatePassword = async (passwords) => {
  const response = await api.put('/auth/password', passwords);
  return response.data;
};

// Logout user
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};