// frontend/src/services/enrollmentService.js - REPLACE ENTIRE FILE
import api from './api';

const ENROLLMENT_BASE = '/enrollments';

// Get all students (for admin) - Now returns actual user data
export const getAllStudents = async () => {
  try {
    // Fetch users with student role
    const response = await api.get('/auth/users?role=student');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Enroll a single student by email
export const enrollStudent = async (enrollmentData) => {
  try {
    const response = await api.post(ENROLLMENT_BASE, {
      studentEmail: enrollmentData.studentEmail,
      courseId: enrollmentData.courseId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Bulk enroll students by emails
export const bulkEnrollStudents = async (enrollmentData) => {
  try {
    const response = await api.post(`${ENROLLMENT_BASE}/bulk`, {
      studentEmails: enrollmentData.studentEmails,
      courseId: enrollmentData.courseId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get student's courses by email
export const getStudentCourses = async (studentEmail) => {
  try {
    const response = await api.get(`${ENROLLMENT_BASE}/student/${studentEmail}/courses`);
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