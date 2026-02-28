// frontend/src/utils/constants.js

// API Base URL
export const API_BASE_URL = 'https://nexanova-task1-backend.onrender.com/';
//export const API_BASE_URL = 'http://localhost:5000/';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  ME: '/auth/me',
  
  // Trainer endpoints
  TRAINERS: '/trainer',
  TRAINER_BY_ID: (id) => `/trainer/${id}`,
  TRAINER_UPDATE: (id) => `/trainer/${id}`,
  TRAINERS_BY_SUBJECT: (subject) => `/trainer/${subject}/topic`,
  
  // Subject endpoints
  SUBJECTS: '/subject',
  SUBJECT_BY_ID: (id) => `/subject/${id}`,

  // Profile endpoints
  PROFILE: '/profile',
  PROFILE_ME: '/profile/me',
};

// Schedule Endpoints
export const SCHEDULE_ENDPOINTS = {
  BASE: '/schedule',
  BY_WEEK: (weekId) => `/schedule/${weekId}`,
  ALLOCATE_SLOT: (slotId) => `/schedule/slot/${slotId}`,
  DEALLOCATE_SLOT: (slotId) => `/schedule/slot/${slotId}/deallocate`,
};

// Enrollment Endpoints
export const ENROLLMENT_ENDPOINTS = {
  BASE: '/enrollments',
  BULK: '/enrollments/bulk',
  BY_STUDENT: (studentId) => `/enrollments/student/${studentId}/courses`,
  BY_COURSE: (courseId) => `/enrollments/course/${courseId}`,
  UPDATE: (enrollmentId) => `/enrollments/${enrollmentId}`,
  DELETE: (enrollmentId) => `/enrollments/${enrollmentId}`,
};

// Timetable Endpoints
export const TIMETABLE_ENDPOINTS = {
  MY_TIMETABLE: '/timetable/my-timetable',
  STUDENT_TIMETABLE: (studentId) => `/timetable/student/${studentId}`,
  STATS: (weekId) => `/timetable/stats/${weekId}`,
};

// Toast Messages
export const TOAST_MESSAGES = {
  TRAINER_ADDED: 'Trainer added successfully!',
  TRAINER_UPDATED: 'Trainer updated successfully!',
  TRAINER_DELETED: 'Trainer deleted successfully!',
  TRAINER_ERROR: 'Error with trainer operation',
  SUBJECT_ADDED: 'Subject added successfully!',
  SUBJECT_ERROR: 'Error with subject operation',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_SUCCESS: 'Authentication successful!',
  AUTH_ERROR: 'Authentication failed',
  REGISTRATION_SUCCESS: 'Registration successful!',
  LOGIN_SUCCESS: 'Login successful!',
  UNAUTHORIZED: 'You do not have permission to perform this action',
  
  // Profile messages
  PROFILE_CREATED: 'Profile created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PROFILE_DELETED: 'Profile deleted successfully!',
  PROFILE_NOT_FOUND: 'No profile found. Please create one.',
  
  // Schedule messages
  SCHEDULE_CREATED: 'Schedule created successfully!',
  SCHEDULE_UPDATED: 'Schedule updated successfully!',
  SCHEDULE_DELETED: 'Schedule deleted successfully!',
  SLOT_ALLOCATED: 'Slot allocated successfully!',
  SLOT_DEALLOCATED: 'Slot deallocated successfully!',
  
  // Enrollment messages
  STUDENT_ENROLLED: 'Student enrolled successfully!',
  ENROLLMENT_DELETED: 'Enrollment removed successfully!',
  ENROLLMENT_UPDATED: 'Enrollment status updated!',
};

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
  PASSWORD_MIN_LENGTH: 6,
};

// Subject Levels
export const SUBJECT_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// UPDATED: User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TRAINER: 'trainer',  // NEW
  STUDENT: 'student'   // NEW (renamed from USER)
};

// Enrollment Status
export const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  SUSPENDED: 'suspended'
};

// Time Slots
export const TIME_SLOTS = ['8AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM'];

// Weekdays
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// UPDATED: Role Display Names
export const ROLE_NAMES = {
  admin: 'Administrator',
  trainer: 'Trainer',   // NEW
  student: 'Student'    // NEW
};