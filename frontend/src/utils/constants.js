// src/utils/constants.js

// API Base URL
export const API_BASE_URL = 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Trainer endpoints
  TRAINERS: '/trainer',
  TRAINER_BY_ID: (id) => `/trainer/${id}`,
  TRAINERS_BY_SUBJECT: (subject) => `/trainer/${subject}/topic`,
  
  // Subject endpoints
  SUBJECTS: '/subject',
  SUBJECT_BY_ID: (id) => `/subject/${id}`,
};

// Toast Messages
export const TOAST_MESSAGES = {
  TRAINER_ADDED: 'Trainer added successfully!',
  TRAINER_DELETED: 'Trainer deleted successfully!',
  TRAINER_ERROR: 'Error with trainer operation',
  SUBJECT_ADDED: 'Subject added successfully!',
  SUBJECT_ERROR: 'Error with subject operation',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
};

// Subject Levels
export const SUBJECT_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];