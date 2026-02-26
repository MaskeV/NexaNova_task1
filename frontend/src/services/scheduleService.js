// frontend/src/services/scheduleService.js
import api from './api';

const SCHEDULE_BASE = '/schedule';

// Create a new weekly schedule
export const createSchedule = async (weekStartDate) => {
  try {
    const response = await api.post(SCHEDULE_BASE, { weekStartDate });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all schedules
export const getAllSchedules = async () => {
  try {
    const response = await api.get(SCHEDULE_BASE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get schedule by week ID
export const getScheduleByWeek = async (weekId) => {
  try {
    const response = await api.get(`${SCHEDULE_BASE}/${weekId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Allocate a time slot
export const allocateSlot = async (slotId, weekId, trainerId, moduleId) => {
  try {
    const response = await api.put(`${SCHEDULE_BASE}/slot/${slotId}`, {
      weekId,
      trainerId,
      moduleId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Deallocate a time slot
export const deallocateSlot = async (slotId, weekId) => {
  try {
    const response = await api.put(`${SCHEDULE_BASE}/slot/${slotId}/deallocate`, {
      weekId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a schedule
export const deleteSchedule = async (weekId) => {
  try {
    const response = await api.delete(`${SCHEDULE_BASE}/${weekId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};