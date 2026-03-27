import api from './api';

const SCHEDULE_BASE = '/schedule';

export const createSchedule = async (weekStartDate) => {
  const response = await api.post(SCHEDULE_BASE, { weekStartDate });
  return response.data;
};

export const getAllSchedules = async () => {
  const response = await api.get(SCHEDULE_BASE);
  return response.data;
};

export const getScheduleByWeek = async (weekId) => {
  const response = await api.get(`${SCHEDULE_BASE}/${weekId}`);
  return response.data;
};

export const allocateSlot = async (slotId, weekId, trainerId, subjectId) => {
  const response = await api.put(`${SCHEDULE_BASE}/slot/${slotId}`, {
    weekId,
    trainerId,
    subjectId
  });
  return response.data;
};

export const deallocateSlot = async (slotId, weekId) => {
  const response = await api.put(`${SCHEDULE_BASE}/slot/${slotId}/deallocate`, { weekId });
  return response.data;
};

export const deleteSchedule = async (weekId) => {
  const response = await api.delete(`${SCHEDULE_BASE}/${weekId}`);
  return response.data;
};