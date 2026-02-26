// frontend/src/services/timetableService.js
import api from './api';

const TIMETABLE_BASE = '/timetable';

// Get current user's timetable
export const getMyTimetable = async (weekId = null) => {
  try {
    const url = weekId ? `${TIMETABLE_BASE}/my-timetable?weekId=${weekId}` : `${TIMETABLE_BASE}/my-timetable`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get specific student's timetable
export const getStudentTimetable = async (studentId, weekId = null) => {
  try {
    const url = weekId 
      ? `${TIMETABLE_BASE}/student/${studentId}?weekId=${weekId}` 
      : `${TIMETABLE_BASE}/student/${studentId}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get timetable statistics
export const getTimetableStats = async (weekId) => {
  try {
    const response = await api.get(`${TIMETABLE_BASE}/stats/${weekId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};