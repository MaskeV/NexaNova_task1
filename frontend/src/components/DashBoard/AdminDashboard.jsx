// frontend/src/components/DashBoard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTrainers } from '../../services/trainerService';
import { getAllSubjects } from '../../services/subjectService';
import { FaUsers, FaBook, FaChartLine, FaArrowRight } from 'react-icons/fa';
import Loading from '../Common/Loading';
import '../../styles/pages/Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTrainers: 0,
    totalSubjects: 0,
    recentTrainers: [],
    recentSubjects: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [trainersResponse, subjectsResponse] = await Promise.all([
        getAllTrainers(),
        getAllSubjects()
      ]);

      setStats({
        totalTrainers: trainersResponse.count,
        totalSubjects: subjectsResponse.count,
        recentTrainers: trainersResponse.data.slice(0, 5),
        recentSubjects: subjectsResponse.data.slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage trainers, subjects, and schedules</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#667eea' }}>
            <FaUsers size={30} color="white" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalTrainers}</h3>
            <p>Total Trainers</p>
          </div>
          <Link to="/trainers" className="stat-link">
            View All <FaArrowRight />
          </Link>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#764ba2' }}>
            <FaBook size={30} color="white" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalSubjects}</h3>
            <p>Total Subjects</p>
          </div>
          <Link to="/subjects" className="stat-link">
            View All <FaArrowRight />
          </Link>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#f093fb' }}>
            <FaChartLine size={30} color="white" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalTrainers + stats.totalSubjects}</h3>
            <p>Total Records</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Trainers</h2>
            <Link to="/trainers" className="view-all-link">View All</Link>
          </div>
          <div className="recent-list">
            {stats.recentTrainers.length > 0 ? (
              stats.recentTrainers.map((trainer) => (
                <div key={trainer.empId} className="recent-item card">
                  <div className="recent-item-content">
                    <h4>{trainer.name}</h4>
                    <p>{trainer.empId} • {trainer.email}</p>
                    <div className="item-tags">
                      {trainer.subjects?.slice(0, 3).map((subject, idx) => (
                        <span key={idx} className="tag">{subject}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No trainers added yet</p>
            )}
          </div>
        </div>

        <div className="recent-section">
          <div className="section-header">
            <h2>Recent Subjects</h2>
            <Link to="/subjects" className="view-all-link">View All</Link>
          </div>
          <div className="recent-list">
            {stats.recentSubjects.length > 0 ? (
              stats.recentSubjects.map((subject) => (
                <div key={subject.subjectId} className="recent-item card">
                  <div className="recent-item-content">
                    <h4>{subject.name}</h4>
                    <p>{subject.subjectId}</p>
                    <div className="item-meta">
                      <span className="meta-item">{subject.level}</span>
                      <span className="meta-item">{subject.duration}h</span>
                      <span className="meta-item">{subject.trainers?.length || 0} trainer(s)</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No subjects added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;