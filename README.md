
## Training Management System

## Project Overview
Full-stack application for managing trainers and training subjects.

## Features
- Authentication and Authorization
- Auto-generated IDs (SB001, TR001)
- Trainer-Subject assignment system
- Form validation
- Responsive design

## Tech Stack
**Frontend:** React, Axios, CSS3
**Backend:** Node.js, Express, MongoDB
**Databaase:** MongoDB

## Setup
1. Backend: `cd backend && npm install && npm run dev`
2. Frontend: `cd frontend && npm install && npm start`

## API Documentation
See backend/README.md for API endpoints

## Database Schema
Subjects: subjectId, name, duration, level, trainers[]
Trainers: empId, name, email, experience, subjects[]