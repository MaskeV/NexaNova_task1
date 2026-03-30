// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/DashBoard/DashBoard';
import TrainerList from './components/Trainers/TrainerList';
import SubjectList from './components/Subjects/SubjectList';
import MyProfile from './components/Profile/MyProfile';
import CourseList from './components/Courses/CourseList';
import StudentManagement from './components/Student/StudentManagement';


// Schedule Components (Admin only)
import ScheduleManagement from './components/Schedule/ScheduleManagement';

// Enrollment Components (Admin only)
import EnrollmentManagement from './components/Enrollment/EnrollmentManagement';

// Student Components (Students only)
import MyCourses from './components/Student/MyCourses';
import MyTimetable from './components/Student/MyTimetable';

import './App.css';

// UPDATED: Role-based route wrapper component
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <div className="app">
      <Navbar />
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      ) : (
        <main className="main-content">
          <Routes>
            {/* Public Routes - Redirect to login */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes - Accessible to all authenticated users */}
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            {/* UPDATED: Profile - Only for trainers */}
            <Route path="/profile" element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['trainer']}>
                  <MyProfile />
                </RoleBasedRoute>
              </PrivateRoute>
            } />
            
            {/* Admin Only Routes */}
            <Route path="/trainers" element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <TrainerList />
                </RoleBasedRoute>
              </PrivateRoute>
            } />
            
            <Route path="/subject" element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <SubjectList />
                </RoleBasedRoute>
              </PrivateRoute>
            } />
            
            <Route path="/courses" element={
  <PrivateRoute>
    <CourseList />
  </PrivateRoute>
} />
            <Route path="/schedules" element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <ScheduleManagement />
                </RoleBasedRoute>
              </PrivateRoute>
            } />
            
            <Route path="/enrollments" element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <EnrollmentManagement />
                </RoleBasedRoute>
              </PrivateRoute>
            } />
            
            {/* UPDATED: Student Only Routes */}
            <Route path="/my-courses" element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['student']}>
                  <MyCourses />
                </RoleBasedRoute>
              </PrivateRoute>
            } />
            
            <Route path="/my-timetable" element={
              <PrivateRoute>
                <RoleBasedRoute allowedRoles={['student']}>
                  <MyTimetable />
                </RoleBasedRoute>
              </PrivateRoute>
            } />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;