// src/services/trainerService.js
import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Get all trainers
export const getAllTrainers = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.TRAINERS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get trainer by ID
export const getTrainerById = async (empId) => {
  try {
    const response = await api.get(API_ENDPOINTS.TRAINER_BY_ID(empId));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get trainers by subject
export const getTrainersBySubject = async (subject) => {
  try {
    const response = await api.get(API_ENDPOINTS.TRAINERS_BY_SUBJECT(subject));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add new trainer
export const addTrainer = async (trainerData) => {
  try {
    const response = await api.post(API_ENDPOINTS.TRAINERS, trainerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete trainer
export const deleteTrainer = async (empId) => {
  try {
    const response = await api.delete(API_ENDPOINTS.TRAINERS, {
      data: { empId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};