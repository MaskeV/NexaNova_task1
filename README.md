# Training Management System

A comprehensive full-stack web application for managing training programs, subjects, and trainers. Built with React, Vue.js, and Express.js.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Detailed Documentation](#detailed-documentation)
- [Deployment](#deployment)
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
- Auto-generated trainer IDs (EMP101, EMP102, etc.)
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
- Vue.js (for specific components)
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
- Nodemon (auto-restart)
- Git (version control)

---

## Project Structure

```
training-management-system/
├── frontend/                    # React/Vue frontend application
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

2. Start the backend development server
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
   https://nexanova-task1-backend.onrender.com
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
- Employee ID (auto-generated: EMP101, EMP102...)
- Name, email, experience
- Associated subjects

For detailed schema information, see [Backend README](./backend/README.md).

---

## Deployment

### Live Application

- **Frontend (Vercel)**: https://nexa-nova-task1.vercel.app/
- **Backend (Render)**:  https://nexanova-task1-backend.onrender.com


### Frontend Deployment on Vercel

1. Push your code to GitHub repository

2. Go to [Vercel](https://vercel.com) and sign in

3. Click "New Project" and import your repository

4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: build
   - **Install Command**: `npm install`

5. Add environment variables in Vercel dashboard:
   ```
   REACT_APP_API_URL=https://your-api.onrender.com/api
   ```

6. Click "Deploy"

7. Vercel will automatically deploy your frontend and provide a URL

### Backend Deployment on Render

1. Push your code to GitHub repository

2. Go to [Render](https://render.com) and sign in

3. Click "New +" and select "Web Service"

4. Connect your GitHub repository

5. Configure the service:
   - **Name**: training-management-backend
   - **Environment**: Node
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev`

6. Add environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/training_db
   JWT_SECRET=your_strong_secret_key
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_EMAIL=noreply@training.com
   FROM_NAME=Training System
   ```

7. Click "Create Web Service"

8. Render will build and deploy your backend

### Important Deployment Notes

**For MongoDB:**
- Use MongoDB Atlas for production database
- Whitelist Render's IP addresses in MongoDB Atlas
- Use connection string with credentials

**For CORS:**
- Update backend CORS settings to allow Vercel domain
```javascript
const corsOptions = {
  origin: ['https://your-app.vercel.app'],
  credentials: true
};
```

**Environment Variables:**
- Never commit `.env` files
- Set all environment variables in hosting platforms
- Use strong secrets in production

**SSL/HTTPS:**
- Both Vercel and Render provide automatic HTTPS
- Update API calls in frontend to use HTTPS

---

## Screenshots

### Login Page
User authentication with email and password.

### Dashboard
Overview of subjects and trainers.

### Subject Management
Add, edit, and delete subjects with trainer assignments.
- React Development (SB01)
- Node.js Backend Development (SB02)
- Python Programming (SB03)

### Trainer Management
Manage trainer profiles and specializations.
- Amit Sharma (EMP101) - 6 years experience
- Priya Verma (EMP102) - 4 years experience
- Neha Iyer (EMP104) - 7 years experience

---

## Development

### Running Development Servers

Backend development server with auto-reload:
```bash
cd backend
npm run dev
```

Frontend development server:
```bash
cd frontend
npm start
```

### Building for Production

Frontend production build:
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` folder.

---

## Environment Variables

### Backend Environment Variables

Required environment variables for the backend:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/training_db
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

### Frontend Environment Variables

```env
REACT_APP_API_URL=https://your-api.onrender.com/api
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
- Check backend CORS settings allow frontend URL
- Verify frontend is making requests to correct backend URL
- Ensure credentials are included in requests

**Database connection failed**
- Ensure MongoDB is installed and running
- Check `MONGODB_URI` in `.env` file
- Verify database credentials if using MongoDB Atlas
- Whitelist IP addresses in MongoDB Atlas

**Authentication errors**
- Clear browser localStorage
- Login again to get fresh token
- Check `JWT_SECRET` is configured

**Deployment issues on Render**
- Check build logs for errors
- Ensure all environment variables are set
- Verify start command is correct: `npm run dev`

**Deployment issues on Vercel**
- Check build logs for errors
- Ensure `REACT_APP_API_URL` points to Render backend
- Verify build command: `npm run build`

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
- Vue.js community
- Express.js community
- MongoDB documentation
- Vercel for frontend hosting
- Render for backend hosting
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
- Deployed on Vercel (frontend) and Render (backend)

---

Made with care for efficient training management.