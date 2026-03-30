// src/components/Layout/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaCalendarAlt, FaUserGraduate, FaBook, FaClock, FaUserTie } from 'react-icons/fa';
import '../../styles/components/Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  // Hide navbar on auth pages
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname === '/forgot-password';
  
  if (isAuthPage) {
    return null;
  }

  // Check if current path is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>NexaNova</h2>
        </Link>

        {isAuthenticated && (
          <div className="navbar-menu">
            {/* Dashboard - Available to all */}
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>

            {/* Admin Only Menu */}
            {user?.role === 'admin' && (
              <>
                <Link 
                  to="/trainers" 
                  className={`nav-link ${isActive('/trainers') ? 'active' : ''}`}
                >
                  Trainers
                </Link>
               <Link 
  to="/courses" 
  className={`nav-link ${isActive('/courses') ? 'active' : ''}`}
>
  Courses
</Link>
                <Link 
                  to="/schedules" 
                  className={`nav-link ${isActive('/schedules') ? 'active' : ''}`}
                >
                  <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                  Schedules
                </Link>
                <Link 
                  to="/enrollments" 
                  className={`nav-link ${isActive('/enrollments') ? 'active' : ''}`}
                >
                  <FaUserGraduate style={{ marginRight: '0.5rem' }} />
                  Enrollments
                </Link>
                
              </>
              
            )}

            {/* UPDATED: Trainer Only Menu */}
            {user?.role === 'trainer' && (
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                <FaUserTie style={{ marginRight: '0.5rem' }} />
                My Profile
              </Link>
            )}

            {/* UPDATED: Student Only Menu */}
            {user?.role === 'student' && (
              <>
                <Link 
                  to="/my-courses" 
                  className={`nav-link ${isActive('/my-courses') ? 'active' : ''}`}
                >
                  <FaBook style={{ marginRight: '0.5rem' }} />
                  My Courses
                </Link>
                <Link 
                  to="/my-timetable" 
                  className={`nav-link ${isActive('/my-timetable') ? 'active' : ''}`}
                >
                  <FaClock style={{ marginRight: '0.5rem' }} />
                  My Timetable
                </Link>
              </>
            )}
          </div>
        )}

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <FaUser />
                <span>{user?.username}</span>
                {/* UPDATED: Role badges */}
                {user?.role === 'admin' && (
                  <span className="admin-badge">Admin</span>
                )}
                {user?.role === 'trainer' && (
                  <span className="trainer-badge">Trainer</span>
                )}
                {user?.role === 'student' && (
                  <span className="student-badge">Student</span>
                )}
              </div>
              <button onClick={logout} className="btn btn-logout">
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;