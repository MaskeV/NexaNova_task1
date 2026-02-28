// frontend/src/services/enrollmentService.js
import api from './api';

const ENROLLMENT_BASE = '/enrollments';

// Get all students (for admin)
export const getAllStudents = async () => {
  try {
    // This would need a backend endpoint - for now return empty
    return { data: [] };
  } catch (error) {
    throw error;
  }
};

// Enroll a single student
export const enrollStudent = async (enrollmentData) => {
  try {
    const response = await api.post(ENROLLMENT_BASE, enrollmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Bulk enroll students
export const bulkEnrollStudents = async (enrollmentData) => {
  try {
    const response = await api.post(`${ENROLLMENT_BASE}/bulk`, enrollmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get student's courses
export const getStudentCourses = async (studentId) => {
  try {
    const response = await api.get(`${ENROLLMENT_BASE}/student/${studentId}/courses`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get course enrollments
export const getCourseEnrollments = async (courseId) => {
  try {
    const response = await api.get(`${ENROLLMENT_BASE}/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all enrollments
export const getAllEnrollments = async () => {
  try {
    const response = await api.get(ENROLLMENT_BASE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update enrollment status
export const updateEnrollmentStatus = async (enrollmentId, status) => {
  try {
    const response = await api.put(`${ENROLLMENT_BASE}/${enrollmentId}`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete enrollment
export const deleteEnrollment = async (enrollmentId) => {
  try {
    const response = await api.delete(`${ENROLLMENT_BASE}/${enrollmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};