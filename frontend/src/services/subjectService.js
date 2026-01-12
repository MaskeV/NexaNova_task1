// src/services/subjectService.js
import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Get all subjects
export const getAllSubjects = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.SUBJECTS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get subject by ID with trainers
export const getSubjectById = async (subjectId) => {
  try {
    const response = await api.get(API_ENDPOINTS.SUBJECT_BY_ID(subjectId));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add new subject
export const addSubject = async (subjectData) => {
  try {
    const response = await api.post(API_ENDPOINTS.SUBJECTS, subjectData);
    return response.data;
  } catch (error) {
    throw error;
  }
};