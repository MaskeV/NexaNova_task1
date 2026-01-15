// src/components/Layout/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import '../../styles/components/Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>NexaNova</h2>
        </Link>

        {isAuthenticated && (
          <div className="navbar-menu">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/trainers" className="nav-link">Trainers</Link>
            <Link to="/subjects" className="nav-link">Subjects</Link>
          </div>
        )}

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <FaUser />
                <span>{user?.username}</span>
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