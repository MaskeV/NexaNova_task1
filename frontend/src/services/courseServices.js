// frontend/src/services/courseService.js
import api from './api';

const COURSE_BASE = '/courses';

// Get all courses (basic)
export const getAllCourses = async () => {
  try {
    const response = await api.get(COURSE_BASE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get courses with full hierarchy
export const getCoursesWithHierarchy = async () => {
  try {
    const response = await api.get(`${COURSE_BASE}/hierarchy`);
    return response.data;
  } catch (error) {
    console.error('Hierarchy endpoint error:', error);
    // Fallback to basic courses if hierarchy doesn't exist
    return await getAllCourses();
  }
};

// Get course by ID
export const getCourseById = async (courseId) => {
  try {
    const response = await api.get(`${COURSE_BASE}/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create course (admin only)
export const createCourse = async (courseData) => {
  try {
    const response = await api.post(COURSE_BASE, courseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update course (admin only)
export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`${COURSE_BASE}/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete course (admin only)
export const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`${COURSE_BASE}/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add module to course
export const addModuleToCourse = async (courseId, moduleData) => {
  try {
    const response = await api.post(`${COURSE_BASE}/${courseId}/modules`, moduleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove module from course
export const removeModuleFromCourse = async (courseId, subjectId) => {
  try {
    const response = await api.delete(`${COURSE_BASE}/${courseId}/modules/${subjectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};