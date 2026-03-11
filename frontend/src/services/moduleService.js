// frontend/src/services/moduleService.js
import api from './api';

const MODULE_BASE = '/modules';

// Get all modules
export const getAllModules = async () => {
  try {
    const response = await api.get(MODULE_BASE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get module by ID
export const getModuleById = async (moduleId) => {
  try {
    const response = await api.get(`${MODULE_BASE}/${moduleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create module (admin only)
export const createModule = async (moduleData) => {
  try {
    const response = await api.post(MODULE_BASE, moduleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update module (admin only)
export const updateModule = async (moduleId, moduleData) => {
  try {
    const response = await api.put(`${MODULE_BASE}/${moduleId}`, moduleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete module (admin only)
export const deleteModule = async (moduleId) => {
  try {
    const response = await api.delete(`${MODULE_BASE}/${moduleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};