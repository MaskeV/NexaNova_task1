// src/components/Layout/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaUser, FaSignOutAlt, FaCalendarAlt, FaUserGraduate,
  FaBook, FaClock, FaUserTie, FaChevronDown,
  FaLayerGroup, FaMicrochip, FaClipboardList, FaChartBar, FaClipboardCheck
} from 'react-icons/fa';
import '../../styles/components/Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mockMenuOpen, setMockMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password';

  if (isAuthPage) return null;

  const isActive = (path) => location.pathname === path;

  const isMockEvalActive = location.pathname.startsWith('/mock-eval');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMockMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mockEvalLinks = [
    { to: '/mock-eval/batches',      icon: <FaLayerGroup />,      label: 'Batches' },
    { to: '/mock-eval/technologies', icon: <FaMicrochip />,        label: 'Technologies' },
    { to: '/mock-eval/evaluations',  icon: <FaClipboardList />,    label: 'Evaluations' },
    { to: '/mock-eval/reports',      icon: <FaChartBar />,         label: 'Reports' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>NexaNova</h2>
        </Link>

        {isAuthenticated && (
          <div className="navbar-menu">
            {/* Dashboard — all roles */}
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Dashboard
            </Link>

            {/* ── Admin links ── */}
            {user?.role === 'admin' && (
              <>
                <Link to="/trainers" className={`nav-link ${isActive('/trainers') ? 'active' : ''}`}>
                  Trainers
                </Link>

                <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>
                  Courses
                </Link>

                <Link to="/schedules" className={`nav-link ${isActive('/schedules') ? 'active' : ''}`}>
                  <FaCalendarAlt style={{ marginRight: '0.4rem' }} />
                  Schedules
                </Link>

                <Link to="/enrollments" className={`nav-link ${isActive('/enrollments') ? 'active' : ''}`}>
                  <FaUserGraduate style={{ marginRight: '0.4rem' }} />
                  Enrollments
                </Link>

                {/* ── Mock Evaluation dropdown ── */}
                <div
                  className={`nav-dropdown ${isMockEvalActive ? 'active' : ''}`}
                  ref={dropdownRef}
                >
                  <button
                    className={`nav-link nav-dropdown-trigger ${isMockEvalActive ? 'active' : ''}`}
                    onClick={() => setMockMenuOpen((o) => !o)}
                    aria-expanded={mockMenuOpen}
                  >
                    <FaClipboardCheck style={{ marginRight: '0.4rem' }} />
                    Mock Eval
                    <FaChevronDown
                      style={{
                        marginLeft: '0.4rem',
                        fontSize: '0.7rem',
                        transition: 'transform 0.2s',
                        transform: mockMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>

                  {mockMenuOpen && (
                    <div className="nav-dropdown-menu">
                      {mockEvalLinks.map(({ to, icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          className={`nav-dropdown-item ${isActive(to) ? 'active' : ''}`}
                          onClick={() => setMockMenuOpen(false)}
                        >
                          <span className="dropdown-item-icon">{icon}</span>
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Trainer links ── */}
            {user?.role === 'trainer' && (
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                <FaUserTie style={{ marginRight: '0.4rem' }} />
                My Profile
              </Link>
            )}

            {/* ── Student links ── */}
            {user?.role === 'student' && (
              <>
                <Link to="/my-courses" className={`nav-link ${isActive('/my-courses') ? 'active' : ''}`}>
                  <FaBook style={{ marginRight: '0.4rem' }} />
                  My Courses
                </Link>
                <Link to="/my-timetable" className={`nav-link ${isActive('/my-timetable') ? 'active' : ''}`}>
                  <FaClock style={{ marginRight: '0.4rem' }} />
                  My Timetable
                </Link>
              </>
            )}

            {/* ── Evaluator links ── */}
            {user?.role === 'evaluator' && (
              <Link
                to="/my-evaluations"
                className={`nav-link ${isActive('/my-evaluations') ? 'active' : ''}`}
              >
                <FaClipboardCheck style={{ marginRight: '0.4rem' }} />
                My Evaluations
              </Link>
            )}
          </div>
        )}

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <FaUser />
                <span>{user?.username}</span>
                {user?.role === 'admin'     && <span className="admin-badge">Admin</span>}
                {user?.role === 'trainer'   && <span className="trainer-badge">Trainer</span>}
                {user?.role === 'student'   && <span className="student-badge">Student</span>}
                {user?.role === 'evaluator' && <span className="evaluator-badge">Evaluator</span>}
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