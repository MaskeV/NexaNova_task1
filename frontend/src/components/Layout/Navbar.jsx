// src/components/Layout/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaCalendarAlt, FaUserGraduate, FaBook, FaClock } from 'react-icons/fa';
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
                  to="/subjects" 
                  className={`nav-link ${isActive('/subjects') ? 'active' : ''}`}
                >
                  Subjects
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

            {/* Student Only Menu */}
            {user?.role === 'user' && (
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

            {/* Profile - Available to all */}
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              My Profile
            </Link>
          </div>
        )}

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <FaUser />
                <span>{user?.username}</span>
                {user?.role === 'admin' && (
                  <span className="admin-badge">Admin</span>
                )}
                {user?.role === 'user' && (
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