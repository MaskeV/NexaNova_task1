import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Get my trainer profile - FIXED: uses /me endpoint
export const getMyProfile = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.PROFILE_ME); // Changed from PROFILE to PROFILE_ME
    return response.data;
  } catch (error) {
    // Handle 404 specially - means no profile exists
    if (error.response?.status === 404) {
      const customError = new Error('Profile not found');
      customError.response = error.response;
      customError.code = 'PROFILE_NOT_FOUND';
      throw customError;
    }
    throw error;
  }
};

// Create my trainer profile
export const createMyProfile = async (profileData) => {
  try {
    // Remove empId from data - backend will generate it
    const { empId, ...dataToSend } = profileData;
    
    // Get user email from localStorage for better UX
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email && !dataToSend.email) {
      dataToSend.email = user.email;
    }
    
    const response = await api.post(API_ENDPOINTS.PROFILE, dataToSend);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update my trainer profile
export const updateMyProfile = async (profileData) => {
  try {
    // DO NOT send empId or email in update - backend uses auth email
    const { empId, email, ...dataToSend } = profileData;
    
    const response = await api.put(API_ENDPOINTS.PROFILE, dataToSend);
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