# Backend API Documentation

## 📍 Base URL
```
http://localhost:5000/
```

## 🔐 Authentication
Most endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | Register new user |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/subjects` | Get all subjects |
| POST | `/subjects` | Create new subject |
| GET | `/subjects/:id` | Get single subject |
| PUT | `/subjects/:id` | Update subject |
| DELETE | `/subjects/:id` | Delete subject |

### Trainers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trainers` | Get all trainers |
| POST | `/trainers` | Create new trainer |
| GET | `/trainers/:id` | Get single trainer |
| PUT | `/trainers/:id` | Update trainer |
| DELETE | `/trainers/:id` | Delete trainer |

---

## 📝 Detailed API Reference

### 🔐 Authentication

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### 2. Register (Admin Only)
```http
POST /api/auth/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New User",
  "email": "user@example.com",
  "password": "password123",
  "role": "trainer"
}
```

---

### 📚 Subjects

#### 1. Get All Subjects
```http
GET /api/subjects
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "subjectId": "SB001",
      "name": "React Fundamentals",
      "description": "Learn React from scratch",
      "duration": 60,
      "level": "Beginner",
      "trainers": ["TR001", "TR002"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 2. Create Subject
```http
POST /api/subjects
Authorization: Bearer <token>
Content-Type: application/json

{
  "subjectId": "SB001",
  "name": "React Fundamentals",
  "description": "Learn React from scratch",
  "duration": 60,
  "level": "Beginner",
  "trainers": ["TR001"]
}
```

> **Note:** `subjectId` is auto-generated (SB001, SB002, etc.) if not provided.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Subject created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "subjectId": "SB001",
    "name": "React Fundamentals",
    "description": "Learn React from scratch",
    "duration": 60,
    "level": "Beginner",
    "trainers": ["TR001"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 3. Get Single Subject
```http
GET /api/subjects/SB001
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "subjectId": "SB001",
    "name": "React Fundamentals",
    "description": "Learn React from scratch",
    "duration": 60,
    "level": "Beginner",
    "trainers": [
      {
        "empId": "TR001",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 4. Update Subject
```http
PUT /api/subjects/SB001
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "React Advanced",
  "duration": 80,
  "level": "Intermediate"
}
```

#### 5. Delete Subject
```http
DELETE /api/subjects/SB001
Authorization: Bearer <token>
```

---

### 👨‍🏫 Trainers

#### 1. Get All Trainers
```http
GET /api/trainers
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "empId": "TR001",
      "name": "John Doe",
      "email": "john@example.com",
      "experience": 5,
      "specialization": ["React", "JavaScript"],
      "subjects": ["SB001", "SB002"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 2. Create Trainer
```http
POST /api/trainers
Authorization: Bearer <token>
Content-Type: application/json

{
  "empId": "TR001",
  "name": "John Doe",
  "email": "john@example.com",
  "experience": 5,
  "specialization": ["React", "JavaScript"]
}
```

> **Note:** `empId` is auto-generated (TR001, TR002, etc.) if not provided.

#### 3. Get Single Trainer
```http
GET /api/trainers/TR001
Authorization: Bearer <token>
```

#### 4. Update Trainer
```http
PUT /api/trainers/TR001
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "experience": 6,
  "specialization": ["React", "Node.js"]
}
```

#### 5. Delete Trainer
```http
DELETE /api/trainers/TR001
Authorization: Bearer <token>
```

---

## 🔧 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info (in development)",
  "statusCode": 400
}
```

### Common HTTP Status Codes:

- **200 OK** - Request successful
- **201 Created** - Resource created
- **400 Bad Request** - Invalid input
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate resource (e.g., duplicate subjectId)
- **500 Internal Server Error** - Server error

---

## 🗄️ Database Schema

### Subjects Collection
```javascript
{
  _id: ObjectId,
  subjectId: String,      // Unique, auto-generated: SB001
  name: String,           // Required
  description: String,    // Optional
  duration: Number,       // Hours, default: 0
  level: String,          // Beginner/Intermediate/Advanced
  trainers: [String],     // Array of trainer empIds
  createdAt: Date,
  updatedAt: Date
}
```

### Trainers Collection
```javascript
{
  _id: ObjectId,
  empId: String,          // Unique, auto-generated: TR001
  name: String,           // Required
  email: String,          // Required, unique
  experience: Number,     // Years
  specialization: [String], // Array of skills
  subjects: [String],     // Array of subjectIds
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,          // Unique
  password: String,       // Hashed
  role: String,           // admin/trainer/user
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚙️ Environment Variables

Create a `.env` file in the backend root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/training_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@training.com
FROM_NAME=Training System

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Production
```bash
npm start
```

---

## 📁 Project Structure

```
backend/
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── subjectController.js
│   └── trainerController.js
├── models/              # Mongoose models
│   ├── User.js
│   ├── Subject.js
│   └── Trainer.js
├── routes/              # API routes
│   ├── auth.js
│   ├── subjects.js
│   └── trainers.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   └── error.js
├── utils/               # Utility functions
│   ├── sendEmail.js
│   └── generateId.js
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json
├── server.js           # Entry point
└── README.md           # This file
```

---

## 📞 Support

For issues or questions, please contact the development team or create an issue in the project repository.

