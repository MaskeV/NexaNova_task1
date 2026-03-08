// frontend/src/components/Trainer/TrainerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaBook, FaChalkboardTeacher } from 'react-icons/fa';
import Loading from '../Common/Loading';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getMyProfile();
      setProfile(response.data);
      setHasProfile(true);
    } catch (error) {
      if (error.code === 'PROFILE_NOT_FOUND') {
        setHasProfile(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading your dashboard..." />;

  return (
    <div className="trainer-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}! 👨‍🏫</h1>
        <p>Manage your trainer profile and subjects</p>
      </div>

      {!hasProfile ? (
        <div className="alert-card card" style={{
          background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
          border: '2px solid #ff9800',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#e65100', marginBottom: '1rem' }}>
            ⚠️ Profile Not Created
          </h2>
          <p style={{ color: '#f57c00', marginBottom: '1.5rem' }}>
            You need to create your trainer profile to get started.
          </p>
          <Link to="/profile" className="btn btn-primary">
            Create Profile Now
          </Link>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#667eea' }}>
              <FaUser size={30} color="white" />
            </div>
            <div className="stat-content">
              <h3>{profile?.empId || 'N/A'}</h3>
              <p>Employee ID</p>
            </div>
            <Link to="/profile" className="stat-link">
              View Profile →
            </Link>
          </div>

          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#4caf50' }}>
              <FaBook size={30} color="white" />
            </div>
            <div className="stat-content">
              <h3>{profile?.subjects?.length || 0}</h3>
              <p>Subjects Teaching</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#ff9800' }}>
              <FaChalkboardTeacher size={30} color="white" />
            </div>
            <div className="stat-content">
              <h3>{profile?.experience || 0}</h3>
              <p>Years Experience</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;