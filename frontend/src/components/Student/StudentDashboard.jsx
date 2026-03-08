// frontend/src/components/Student/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentCourses } from '../../services/enrollmentService';
import { getMyTimetable } from '../../services/timetableService';
import { useAuth } from '../../context/AuthContext';
import { FaBook, FaClock, FaGraduationCap } from 'react-icons/fa';
import Loading from '../Common/Loading';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    upcomingClasses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [coursesRes, timetableRes] = await Promise.all([
        getStudentCourses(user._id).catch(() => ({ data: [] })),
        getMyTimetable().catch(() => ({ data: null }))
      ]);

      const courses = coursesRes.data || [];
      const timetable = timetableRes.data;

      setStats({
        totalCourses: courses.length,
        activeCourses: courses.filter(c => c.status === 'active').length,
        upcomingClasses: timetable?.totalClasses || 0
      });
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading your dashboard..." />;

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}! 🎓</h1>
        <p>Here's your learning overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#4caf50' }}>
            <FaBook size={30} color="white" />
          </div>
          <div className="stat-content">
            <h3>{stats.activeCourses}</h3>
            <p>Active Courses</p>
          </div>
          <Link to="/my-courses" className="stat-link">
            View Courses →
          </Link>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#2196f3' }}>
            <FaClock size={30} color="white" />
          </div>
          <div className="stat-content">
            <h3>{stats.upcomingClasses}</h3>
            <p>Classes This Week</p>
          </div>
          <Link to="/my-timetable" className="stat-link">
            View Timetable →
          </Link>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: '#ff9800' }}>
            <FaGraduationCap size={30} color="white" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalCourses}</h3>
            <p>Total Enrollments</p>
          </div>
        </div>
      </div>

      <div className="quick-links card">
        <h2>Quick Links</h2>
        <div className="links-grid">
          <Link to="/my-courses" className="quick-link">
            <FaBook />
            <span>My Courses</span>
          </Link>
          <Link to="/my-timetable" className="quick-link">
            <FaClock />
            <span>My Timetable</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;