// frontend/src/utils/constants.js - REPLACE ENTIRE FILE

// ✅ FIX: No trailing slash
export const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  ME: '/auth/me',
  TRAINERS: '/trainer',
  TRAINER_BY_ID: (id) => `/trainer/${id}`,
  TRAINER_UPDATE: (id) => `/trainer/${id}`,
  TRAINERS_BY_SUBJECT: (subject) => `/trainer/${subject}/topic`,
  SUBJECTS: '/subject',
  SUBJECT_BY_ID: (id) => `/subject/${id}`,
  MODULES: '/modules',
  MODULE_BY_ID: (id) => `/modules/${id}`,
  COURSES: '/courses',
  COURSE_BY_ID: (id) => `/courses/${id}`,
  COURSE_HIERARCHY: '/courses/hierarchy',
  PROFILE: '/profile',
  PROFILE_ME: '/profile/me',
};

export const SCHEDULE_ENDPOINTS = {
  BASE: '/schedule',
  BY_WEEK: (weekId) => `/schedule/${weekId}`,
  ALLOCATE_SLOT: (slotId) => `/schedule/slot/${slotId}`,
  DEALLOCATE_SLOT: (slotId) => `/schedule/slot/${slotId}/deallocate`,
};

export const ENROLLMENT_ENDPOINTS = {
  BASE: '/enrollments',
  BULK: '/enrollments/bulk',
  BY_STUDENT: (studentEmail) => `/enrollments/student/${studentEmail}/courses`,
  BY_COURSE: (courseId) => `/enrollments/course/${courseId}`,
  UPDATE: (enrollmentId) => `/enrollments/${enrollmentId}`,
  DELETE: (enrollmentId) => `/enrollments/${enrollmentId}`,
};

export const TIMETABLE_ENDPOINTS = {
  MY_TIMETABLE: '/timetable/my-timetable',
  STUDENT_TIMETABLE: (studentId) => `/timetable/student/${studentId}`,
  STATS: (weekId) => `/timetable/stats/${weekId}`,
};

export const TOAST_MESSAGES = {
  TRAINER_ADDED: 'Trainer added successfully!',
  TRAINER_UPDATED: 'Trainer updated successfully!',
  TRAINER_DELETED: 'Trainer deleted successfully!',
  SUBJECT_ADDED: 'Subject added successfully!',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_SUCCESS: 'Authentication successful!',
  AUTH_ERROR: 'Authentication failed',
  REGISTRATION_SUCCESS: 'Registration successful!',
  LOGIN_SUCCESS: 'Login successful!',
  UNAUTHORIZED: 'You do not have permission to perform this action',
  PROFILE_CREATED: 'Profile created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PROFILE_DELETED: 'Profile deleted successfully!',
  PROFILE_NOT_FOUND: 'No profile found. Please create one.',
  SCHEDULE_CREATED: 'Schedule created successfully!',
  SCHEDULE_DELETED: 'Schedule deleted successfully!',
  SLOT_ALLOCATED: 'Slot allocated successfully!',
  SLOT_DEALLOCATED: 'Slot deallocated successfully!',
  STUDENT_ENROLLED: 'Student enrolled successfully!',
  ENROLLMENT_DELETED: 'Enrollment removed successfully!',
  ENROLLMENT_UPDATED: 'Enrollment status updated!',
};

export const VALIDATION = {
  EMAIL_REGEX: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
  PASSWORD_MIN_LENGTH: 6,
};

export const SUBJECT_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const USER_ROLES = { ADMIN: 'admin', TRAINER: 'trainer', STUDENT: 'student' };
export const ENROLLMENT_STATUS = { ACTIVE: 'active', COMPLETED: 'completed', DROPPED: 'dropped', SUSPENDED: 'suspended' };
export const TIME_SLOTS = ['8AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM'];
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const ROLE_NAMES = { admin: 'Administrator', trainer: 'Trainer', student: 'Student' };