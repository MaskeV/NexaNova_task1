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

// Mock Evaluation Components
import BatchManagement from './components/MockEvaluation/BatchManagement';
import TechnologyManagement from './components/MockEvaluation/TechnologyManagement';
import EvaluationManagement from './components/MockEvaluation/EvaluationManagement';
import EvaluatorDashboard from './components/MockEvaluation/EvaluatorDashboard';
import ReportsDashboard from './components/MockEvaluation/ReportsDashboard';

import './App.css';

/**
 * Role-based route wrapper.
 * Redirects to "/" if the authenticated user's role is not in allowedRoles.
 */
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
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
            {/* ── Public / Auth Routes ───────────────────────────── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ── Dashboard (all authenticated users) ───────────── */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* ── Trainer-only ───────────────────────────────────── */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['trainer']}>
                    <MyProfile />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            {/* ── Admin-only ─────────────────────────────────────── */}
            <Route
              path="/trainers"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <TrainerList />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/subject"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <SubjectList />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/courses"
              element={
                <PrivateRoute>
                  <CourseList />
                </PrivateRoute>
              }
            />

            <Route
              path="/schedules"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <ScheduleManagement />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/enrollments"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <EnrollmentManagement />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            {/* ── Student-only ───────────────────────────────────── */}
            <Route
              path="/my-courses"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['student']}>
                    <MyCourses />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/my-timetable"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['student']}>
                    <MyTimetable />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            {/* ── Mock Evaluation — Admin only ───────────────────── */}
            {/*
              FR-1.1 / FR-1.2 / FR-1.3 : Batch & technology configuration
              FR-2.1 / FR-2.2           : Managed via existing user mgmt
              FR-3.1 / FR-3.2           : Participant & evaluator assignment
              FR-4.1 / FR-4.2 / FR-4.3 : Reports
            */}
            <Route
              path="/mock-eval/batches"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <BatchManagement />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/mock-eval/technologies"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <TechnologyManagement />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/mock-eval/evaluations"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <EvaluationManagement />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/mock-eval/reports"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <ReportsDashboard />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            {/* ── Mock Evaluation — Evaluator only ──────────────── */}
            {/* FR-3.3 / FR-3.4 / FR-3.5 : View, fill & submit evaluations */}
            <Route
              path="/my-evaluations"
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={['evaluator']}>
                    <EvaluatorDashboard />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            {/* ── Catch-all ──────────────────────────────────────── */}
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