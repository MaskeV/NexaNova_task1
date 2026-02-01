// frontend/src/services/subjectService.js
import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Get all subjects
export const getAllSubjects = async () => {
  try {
    console.log('📘 Fetching all subjects...');
    const response = await api.get(API_ENDPOINTS.SUBJECTS);
    console.log('✅ Subjects fetched:', response.data.count);
    return response.data;
  } catch (error) {
    console.error('❌ Get all subjects error:', error);
    throw error;
  }
};

// Get subject by ID with trainers
export const getSubjectById = async (subjectId) => {
  try {
    console.log('📘 Fetching subject:', subjectId);
    const response = await api.get(API_ENDPOINTS.SUBJECT_BY_ID(subjectId));
    console.log('✅ Subject fetched:', subjectId);
    return response.data;
  } catch (error) {
    console.error('❌ Get subject by ID error:', error);
    throw error;
  }
};

// Add new subject
export const addSubject = async (subjectData) => {
  try {
    console.log('📘 Adding subject:', subjectData);
    const response = await api.post(API_ENDPOINTS.SUBJECTS, subjectData);
    console.log('✅ Subject added:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Add subject error:', error);
    throw error;
  }
};

// Update subject
export const updateSubject = async (subjectId, subjectData) => {
  try {
    console.log('📘 Updating subject:', subjectId, subjectData);
    const endpoint = API_ENDPOINTS.SUBJECT_BY_ID(subjectId);
    console.log('📍 PUT endpoint:', endpoint);
    
    const response = await api.put(endpoint, subjectData);
    console.log('✅ Subject updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Update subject error:', error);
    console.error('Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    throw error;
  }
};

// Delete subject
export const deleteSubject = async (subjectId) => {
  try {
    console.log('📘 Deleting subject:', subjectId);
    const endpoint = API_ENDPOINTS.SUBJECT_BY_ID(subjectId);
    console.log('📍 DELETE endpoint:', endpoint);
    
    const response = await api.delete(endpoint);
    console.log('✅ Subject deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Delete subject error:', error);
    console.error('Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    throw error;
  }
};