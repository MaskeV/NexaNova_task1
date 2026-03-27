// frontend/src/services/moduleService.js
import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Get all modules
export const getAllModules = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.MODULES);
    return response.data;
  } catch (error) {
    console.error('❌ Get all modules error:', error);
    throw error;
  }
};

// Get module by ID
export const getModuleById = async (moduleId) => {
  try {
    const response = await api.get(API_ENDPOINTS.MODULE_BY_ID(moduleId));
    return response.data;
  } catch (error) {
    console.error('❌ Get module by ID error:', error);
    throw error;
  }
};

// Create module (admin only)
export const createModule = async (moduleData) => {
  try {
    const response = await api.post(API_ENDPOINTS.MODULES, moduleData);
    return response.data;
  } catch (error) {
    console.error('❌ Create module error:', error);
    throw error;
  }
};

// Update module (admin only)
export const updateModule = async (moduleId, moduleData) => {
  try {
    const response = await api.put(API_ENDPOINTS.MODULE_BY_ID(moduleId), moduleData);
    return response.data;
  } catch (error) {
    console.error('❌ Update module error:', error);
    throw error;
  }
};

// Delete module (admin only)
export const deleteModule = async (moduleId) => {
  try {
    const response = await api.delete(API_ENDPOINTS.MODULE_BY_ID(moduleId));
    return response.data;
  } catch (error) {
    console.error('❌ Delete module error:', error);
    throw error;
  }
};