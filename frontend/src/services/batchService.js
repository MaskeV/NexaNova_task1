// frontend/src/services/batchService.js
import api from './api';

const BATCH_BASE = '/batches';

// Get all batches
export const getAllBatches = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.technology) params.append('technology', filters.technology);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    
    const url = params.toString() ? `${BATCH_BASE}?${params}` : BATCH_BASE;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get batch by ID
export const getBatchById = async (batchId) => {
  try {
    const response = await api.get(`${BATCH_BASE}/${batchId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create batch (admin only)
export const createBatch = async (batchData) => {
  try {
    const response = await api.post(BATCH_BASE, batchData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update batch (admin only)
export const updateBatch = async (batchId, batchData) => {
  try {
    const response = await api.put(`${BATCH_BASE}/${batchId}`, batchData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete batch (admin only)
export const deleteBatch = async (batchId) => {
  try {
    const response = await api.delete(`${BATCH_BASE}/${batchId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add participants to batch
export const addParticipantsToBatch = async (batchId, participantIds) => {
  try {
    const response = await api.post(`${BATCH_BASE}/${batchId}/participants`, {
      participantIds
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove participant from batch
export const removeParticipantFromBatch = async (batchId, participantId) => {
  try {
    const response = await api.delete(`${BATCH_BASE}/${batchId}/participants/${participantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};