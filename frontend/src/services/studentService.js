// frontend/src/services/studentService.js
import api from './api';

const STUDENT_BASE = '/students';

// Get all students
export const getAllStudents = async () => {
  try {
    const response = await api.get(STUDENT_BASE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get student by ID
export const getStudentById = async (studentId) => {
  try {
    const response = await api.get(`${STUDENT_BASE}/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Bulk upload students
export const bulkUploadStudents = async (formData) => {
  try {
    const response = await api.post(`${STUDENT_BASE}/bulk-upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update student status
export const updateStudentStatus = async (studentId, isActive) => {
  try {
    const response = await api.put(`${STUDENT_BASE}/${studentId}/status`, { isActive });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete student
export const deleteStudent = async (studentId) => {
  try {
    const response = await api.delete(`${STUDENT_BASE}/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get student statistics
export const getStudentStats = async () => {
  try {
    const response = await api.get(`${STUDENT_BASE}/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};