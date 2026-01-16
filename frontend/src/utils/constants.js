// frontend/src/utils/constants.js

// API Base URL
export const API_BASE_URL = 'http://localhost:5000';

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

    PROFILE: '/api/profile',
  PROFILE_ME: '/api/profile/me',
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
 
   // Add profile messages
  PROFILE_CREATED: 'Profile created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PROFILE_DELETED: 'Profile deleted successfully!',
  PROFILE_NOT_FOUND: 'No profile found. Please create one.',

};

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
  PASSWORD_MIN_LENGTH: 6,
};

// Subject Levels
export const SUBJECT_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};