// frontend/src/services/enrollmentService.js
import api from './api';

const ENROLLMENT_BASE = '/enrollments';

// Get all students (for admin)
export const getAllStudents = async () => {
  try {
    const response = await api.get('/auth/users');
    return response.data;
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

// Bulk enroll students by emails
export const bulkEnrollStudents = async (enrollmentData) => {
  try {
    const response = await api.post(`${ENROLLMENT_BASE}/bulk`, enrollmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ⭐ NEW: Bulk enroll students by IDs (for UI selection - FR-Admin-07)
export const bulkEnrollStudentsByIds = async (enrollmentData) => {
  try {
    const response = await api.post(`${ENROLLMENT_BASE}/bulk-by-ids`, enrollmentData);
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

// Bulk upload students from file
export const bulkUploadStudents = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`${ENROLLMENT_BASE}/bulk-upload-students`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Bulk enroll selected students in a course
export const bulkEnrollSelectedStudents = async (studentIds, courseId) => {
  try {
    const response = await api.post(`${ENROLLMENT_BASE}/bulk-enroll-selected`, {
      studentIds,
      courseId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

