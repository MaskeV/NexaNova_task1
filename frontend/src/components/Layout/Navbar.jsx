// src/components/Layout/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/components/Navbar.css'; 

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <h2>NexaNova</h2>
        </Link>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className={`navbar-link ${isActive('/')}`}>
              Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/trainers" className={`navbar-link ${isActive('/trainers')}`}>
              Trainers
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/subjects" className={`navbar-link ${isActive('/subjects')}`}>
              Subjects
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;