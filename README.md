# Training Management System

A comprehensive full-stack web application for managing training programs, subjects, and trainers. Built with React and Node.js.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Detailed Documentation](#detailed-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The Training Management System is a modern web application designed to streamline the management of training programs. It allows administrators to manage subjects, assign trainers, and organize training schedules efficiently.

### Key Capabilities

- User authentication and authorization
- Subject management with auto-generated IDs
- Trainer management and assignment
- Real-time data synchronization
- Responsive design for all devices
- RESTful API architecture

---

## Features

### Authentication
- Secure login with JWT tokens
- Password reset via email
- Role-based access control
- Protected routes

### Subject Management
- Create, read, update, and delete subjects
- Auto-generated subject IDs (SB01, SB02, etc.)
- Assign multiple trainers to subjects
- Set difficulty levels (Beginner, Intermediate, Advanced)
- Track subject duration and descriptions

### Trainer Management
- Manage trainer profiles
- Auto-generated trainer IDs (TR01, TR02, etc.)
- Track experience and specializations
- View assigned subjects
- Update trainer information

### User Interface
- Clean and intuitive design
- Toast notifications for user feedback
- Loading states and error handling
- Form validation
- Custom multi-select dropdowns
- Responsive layout

---

## Tech Stack

### Frontend
- React 18.x
- React Router DOM (routing)
- Axios (HTTP client)
- React Toastify (notifications)
- CSS3 (styling)

### Backend
- Node.js
- Express.js (web framework)
- MongoDB (database)
- Mongoose (ODM)
- JWT (authentication)
- Bcrypt (password hashing)
- Nodemailer (email service)

### Development Tools
- ESLint (code linting)
- Prettier (code formatting)
- Nodemon (auto-restart)
- Git (version control)

---

## Project Structure

```
training-management-system/
├── frontend/                    # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Auth/          # Authentication components
│   │   │   ├── Subjects/      # Subject management
│   │   │   ├── Trainers/      # Trainer management
│   │   │   └── Common/        # Shared components
│   │   ├── services/          # API service files
│   │   ├── utils/             # Utility functions
│   │   ├── styles/            # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md              # Frontend documentation
│
├── backend/                     # Node.js backend API
│   ├── controllers/            # Route controllers
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Utility functions
│   ├── .env                   # Environment variables
│   ├── server.js              # Entry point
│   ├── package.json
│   └── README.md              # Backend API documentation
│
└── README.md                   # This file
```

---

## Quick Start

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd training-management-system
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Configuration

1. Create `.env` file in the backend directory
```bash
cd backend
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/training_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@training.com
FROM_NAME=Training System
```

For detailed configuration instructions, see [Backend README](./backend/README.md).

### Running the Application

1. Start MongoDB (if running locally)
```bash
mongod
```

2. Start the backend server
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

3. Start the frontend development server
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3000

4. Open your browser and navigate to http://localhost:3000

### Default Login Credentials

Create an admin user using the backend API or use the seed script if provided:
```
Email: admin@example.com
Password: admin123
```

---

## Detailed Documentation

For detailed setup and usage instructions, please refer to:

- [Frontend Documentation](./frontend/README.md) - React app setup, features, and troubleshooting
- [Backend Documentation](./backend/README.md) - API endpoints, database schema, and configuration

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Main Endpoints

#### Authentication
- POST `/auth/login` - User login
- POST `/auth/register` - Register new user
- POST `/auth/forgot-password` - Request password reset
- POST `/auth/reset-password` - Reset password

#### Subjects
- GET `/subjects` - Get all subjects
- POST `/subjects` - Create new subject
- GET `/subjects/:id` - Get single subject
- PUT `/subjects/:id` - Update subject
- DELETE `/subjects/:id` - Delete subject

#### Trainers
- GET `/trainers` - Get all trainers
- POST `/trainers` - Create new trainer
- GET `/trainers/:id` - Get single trainer
- PUT `/trainers/:id` - Update trainer
- DELETE `/trainers/:id` - Delete trainer

For complete API documentation, see [Backend README](./backend/README.md).

---

## Database Schema

### Collections

**Users**
- Authentication and user management
- Role-based access (admin, trainer, user)

**Subjects**
- Subject ID (auto-generated: SB01, SB02...)
- Name, description, duration, level
- Associated trainers

**Trainers**
- Employee ID (auto-generated: TR01, TR02...)
- Name, email, experience, specialization
- Associated subjects

For detailed schema information, see [Backend README](./backend/README.md).

---

## Screenshots

### Login Page
User authentication with email and password.

### Dashboard
Overview of subjects and trainers.

### Subject Management
Add, edit, and delete subjects with trainer assignments.

### Trainer Management
Manage trainer profiles and specializations.

---

## Development

### Running Tests

Frontend tests:
```bash
cd frontend
npm test
```

Backend tests:
```bash
cd backend
npm test
```

### Code Linting

```bash
npm run lint
```

### Building for Production

Frontend production build:
```bash
cd frontend
npm run build
```

Backend production mode:
```bash
cd backend
npm start
```

---

## Deployment

### Frontend Deployment

The frontend can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

Build the app:
```bash
cd frontend
npm run build
```

Deploy the `build` folder to your hosting service.

### Backend Deployment

The backend can be deployed to:
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

Ensure environment variables are set in production:
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Use strong `JWT_SECRET`
- Configure production email service

---

## Environment Variables

### Backend Environment Variables

Required environment variables for the backend:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/training_db
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@training.com
FROM_NAME=Training System
```

For detailed explanation of each variable, see [Backend README](./backend/README.md).

---

## Troubleshooting

### Common Issues

**Cannot connect to backend**
- Ensure backend is running on port 5000
- Check MongoDB is running
- Verify `.env` configuration

**CORS errors**
- Check backend CORS settings allow http://localhost:3000
- Verify frontend is making requests to correct backend URL

**Database connection failed**
- Ensure MongoDB is installed and running
- Check `MONGODB_URI` in `.env` file
- Verify database credentials if using MongoDB Atlas

**Authentication errors**
- Clear browser localStorage
- Login again to get fresh token
- Check `JWT_SECRET` is configured

For detailed troubleshooting, see:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

### Coding Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes before submitting

---

## Project Roadmap

### Planned Features

- Email notifications for assignments
- Calendar view for training schedules
- Reports and analytics
- Export data to PDF/Excel
- Mobile application
- Multi-language support
- Dark mode

---

## Support

For issues, questions, or suggestions:

- Create an issue in the repository
- Contact the development team
- Check existing documentation

---

## Authors

Your Name / Your Organization

---

## Acknowledgments

- React team for the amazing framework
- Express.js community
- MongoDB documentation
- All contributors

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Version History

### v1.0.0 (Current)
- Initial release
- User authentication
- Subject management
- Trainer management
- Auto-generated IDs
- Email notifications

---

Made with care for efficient training management.