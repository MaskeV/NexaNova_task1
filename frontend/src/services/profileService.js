// frontend/src/services/profileService.js
import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Get my trainer profile
export const getMyProfile = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create my trainer profile
export const createMyProfile = async (profileData) => {
  try {
    const response = await api.post(API_ENDPOINTS.PROFILE, profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update my trainer profile
export const updateMyProfile = async (profileData) => {
  try {
    const response = await api.put(API_ENDPOINTS.PROFILE, profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete my trainer profile
export const deleteMyProfile = async () => {
  try {
    const response = await api.delete(API_ENDPOINTS.PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};