# Training Management System - Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Backend Configuration](#backend-configuration)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Features](#features)
- [Learn More](#learn-more)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Backend API running on http://localhost:5000

---

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Ensure backend is configured and running (see Backend Configuration below)

4. Start the development server
```bash
npm start
```

---

## Backend Configuration

This frontend application connects to the backend API. The backend must be running before starting the frontend.

### Backend Setup

1. Navigate to the backend directory
```bash
cd backend
```

2. Create a `.env` file in the backend root directory with the following configuration:

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
```

### How to Get Backend Environment Variables

#### PORT
The port number where the backend server will run.
- Default: 5000
- You can change this to any available port

#### NODE_ENV
The environment mode.
- Use `development` for local development
- Use `production` for production deployment

#### MONGODB_URI
The connection string for MongoDB database.

**Local MongoDB:**
- Install MongoDB on your machine
- Use: `mongodb://localhost:27017/training_db`

**MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Click "Connect" and select "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `myFirstDatabase` with `training_db`
8. Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/training_db`

#### JWT_SECRET
A secret key used to sign and verify JWT tokens.

**How to generate:**
- Use a random string generator
- Or run in terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Or use any long random string (minimum 32 characters recommended)
- Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

#### JWT_EXPIRE
How long the JWT token remains valid.
- Format: `30d` (30 days), `7d` (7 days), `24h` (24 hours)
- Recommended: `30d` for development, `7d` for production

#### JWT_COOKIE_EXPIRE
How long the JWT cookie remains valid (in days).
- Must be a number
- Example: `30` means 30 days

#### Email Configuration (SMTP)

These are required for password reset functionality.

**Using Gmail:**

1. SMTP_HOST: `smtp.gmail.com`
2. SMTP_PORT: `587`
3. SMTP_USER: Your Gmail address (e.g., `yourname@gmail.com`)
4. SMTP_PASS: Gmail App Password (NOT your regular Gmail password)

**How to get Gmail App Password:**
1. Go to your Google Account settings
2. Select Security
3. Under "Signing in to Google," select "2-Step Verification"
4. At the bottom, select "App passwords"
5. Select "Mail" and your device
6. Click "Generate"
7. Copy the 16-character password
8. Use this as SMTP_PASS

**Using Other Email Services:**
- **Outlook:** SMTP_HOST=`smtp-mail.outlook.com`, PORT=`587`
- **Yahoo:** SMTP_HOST=`smtp.mail.yahoo.com`, PORT=`587`
- **SendGrid:** Get API credentials from https://sendgrid.com
- **Mailgun:** Get API credentials from https://www.mailgun.com

#### FROM_EMAIL and FROM_NAME
- FROM_EMAIL: The email address that appears as sender
- FROM_NAME: The name that appears as sender
- These can be any values you want to display

### Starting the Backend

After configuring the `.env` file:

```bash
cd backend
npm install
npm run dev
```

The backend should now be running on http://localhost:5000

---

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

---

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── Subjects/
│   │   │   ├── SubjectList.jsx
│   │   │   ├── AddSubject.jsx
│   │   │   ├── EditSubject.jsx
│   │   │   └── SubjectDetails.jsx
│   │   ├── Trainers/
│   │   │   ├── TrainerList.jsx
│   │   │   ├── AddTrainer.jsx
│   │   │   ├── EditTrainer.jsx
│   │   │   └── TrainerDetails.jsx
│   │   └── Common/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       └── Footer.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── subjectService.js
│   │   └── trainerService.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── styles/
│   │   └── main.css
│   ├── App.js
│   ├── App.css
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

---

## Features

### Authentication
- User login with JWT tokens
- Protected routes for authenticated users
- Automatic token refresh
- Logout functionality

### Subject Management
- View all subjects
- Add new subjects with auto-generated IDs (SB01, SB02, etc.)
- Edit existing subjects
- Delete subjects
- Assign trainers to subjects
- Filter and search subjects

### Trainer Management
- View all trainers
- Add new trainers with auto-generated IDs (TR01, TR02, etc.)
- Edit trainer information
- Delete trainers
- View trainer specializations
- Manage trainer-subject assignments

### UI Features
- Responsive design
- Toast notifications for user feedback
- Loading states
- Error handling
- Form validation
- Custom dropdown for multi-select trainer assignment

---

## Dependencies

### Main Dependencies
- React 18.x
- React Router DOM (for routing)
- Axios (for API calls)
- React Toastify (for notifications)

### Development Dependencies
- ESLint (code linting)
- Prettier (code formatting)

---

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api` by default.

### Base Configuration

All API calls are centralized in the `services` folder and use axios for HTTP requests.

```javascript
// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});
```

### Authentication Token

The JWT token is stored in localStorage and automatically included in API requests:

```javascript
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Troubleshooting

### Common Issues

#### 1. API Connection Error

**Problem**: Cannot connect to backend API

**Solution**: 
- Verify backend server is running: `cd backend && npm run dev`
- Check backend is running on http://localhost:5000
- Ensure MongoDB is running
- Check backend `.env` file is properly configured

#### 2. CORS Error

**Problem**: Cross-Origin Request Blocked

**Solution**:
- Ensure backend has CORS enabled
- Check backend CORS configuration allows http://localhost:3000
- Verify backend has proper CORS middleware setup

#### 3. Token Expiration

**Problem**: Getting 401 Unauthorized errors

**Solution**:
- Login again to get a new token
- Check `JWT_EXPIRE` setting in backend `.env`
- Clear browser localStorage and login again

#### 4. MongoDB Connection Error

**Problem**: Backend cannot connect to database

**Solution**:
- Ensure MongoDB is installed and running locally
- Or verify MongoDB Atlas connection string is correct
- Check `MONGODB_URI` in backend `.env` file
- Test connection: `mongosh mongodb://localhost:27017`

#### 5. Email Not Sending

**Problem**: Password reset emails not working

**Solution**:
- Verify SMTP credentials in backend `.env`
- For Gmail, ensure you are using App Password, not regular password
- Check 2-Step Verification is enabled for Gmail
- Try a different email service if issues persist

#### 6. Build Fails

**Problem**: `npm run build` fails

**Solution**:
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for ESLint errors: `npm run lint`
- Ensure all imports are correct
- Check console for specific error messages

---

## Deployment

### Building for Production

1. Ensure backend is deployed and accessible

2. Update API base URL in `src/services/api.js` to your production backend URL

3. Create production build
```bash
npm run build
```

4. The `build` folder contains optimized production files ready for deployment

### Deployment Platforms

The app can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Backend Deployment

For production, deploy the backend to:
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

Ensure you update the backend `.env` with production values:
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Use strong `JWT_SECRET`
- Configure production email service

---

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## Support

For issues or questions, please contact the development team or create an issue in the project repository.

