// frontend/src/components/Student/MyCourses.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getStudentCourses } from '../../services/enrollmentService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';
import { FaBook, FaClock, FaChartLine, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import '../../styles/pages/Courses.css';

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

// frontend/src/components/Student/MyCourses.jsx - UPDATE useEffect
useEffect(() => {
  if (user?.email) {  // Changed from user?._id to user?.email
    fetchCourses();
  }
}, [user]);

const fetchCourses = async () => {
  try {
    setLoading(true);
    const response = await getStudentCourses(user.email);  // Changed from user._id to user.email
    setCourses(response.data);
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to load courses';
    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return { bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', color: '#2e7d32' };
      case 'intermediate':
        return { bg: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', color: '#e65100' };
      case 'advanced':
        return { bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)', color: '#c2185b' };
      default:
        return { bg: '#f5f5f5', color: '#666' };
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: '#4caf50', text: 'Active' },
      completed: { bg: '#2196f3', text: 'Completed' },
      dropped: { bg: '#f44336', text: 'Dropped' },
      suspended: { bg: '#ff9800', text: 'Suspended' }
    };
    
    const style = styles[status] || styles.active;
    
    return (
      <div className="enrollment-status" style={{ background: style.bg }}>
        <FaCheckCircle />
        <span>{style.text}</span>
      </div>
    );
  };

  if (loading) return <Loading message="Loading your courses..." />;

  return (
    <div className="my-courses">
      <div className="page-header">
        <div>
          <h1>📚 My Enrolled Courses</h1>
          <p>Courses you are currently enrolled in</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state card">
          <FaBook size={60} color="#ccc" />
          <h3>No Enrollments Yet</h3>
          <p>You are not enrolled in any courses. Contact your administrator to enroll in courses.</p>
          <div className="info-box" style={{ marginTop: '2rem', textAlign: 'left' }}>
            <p><strong>To get enrolled:</strong></p>
            <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Go to your Profile and copy your Student ID (MongoDB ObjectId)</li>
              <li>Share your Student ID with your administrator</li>
              <li>Admin will enroll you in the courses</li>
              <li>Your courses will appear here once enrolled</li>
            </ol>
          </div>
        </div>
      ) : (
        <>
          <div className="courses-summary card">
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-icon">📚</span>
                <div>
                  <div className="stat-value">{courses.length}</div>
                  <div className="stat-label">Total Courses</div>
                </div>
              </div>
              <div className="summary-stat">
                <span className="stat-icon">✅</span>
                <div>
                  <div className="stat-value">
                    {courses.filter(c => c.status === 'active').length}
                  </div>
                  <div className="stat-label">Active Enrollments</div>
                </div>
              </div>
              <div className="summary-stat">
                <span className="stat-icon">⏱️</span>
                <div>
                  <div className="stat-value">
                    {courses.reduce((sum, c) => sum + (c.courseDetails?.duration || 0), 0)}h
                  </div>
                  <div className="stat-label">Total Hours</div>
                </div>
              </div>
            </div>
          </div>

          <div className="courses-grid">
            {courses.map(enrollment => {
              const levelColors = getLevelColor(enrollment.courseDetails?.level);
              
              return (
                <div key={enrollment._id} className="course-card card">
                  <div className="course-header">
                    <FaBook size={30} color="#667eea" />
                    {getStatusBadge(enrollment.status)}
                  </div>

                  <div className="course-content">
                    <h3>{enrollment.courseDetails?.name || enrollment.course}</h3>
                    <p className="course-id">{enrollment.course}</p>
                    
                    {enrollment.courseDetails && (
                      <>
                        {enrollment.courseDetails.description && (
                          <p className="course-description">
                            {enrollment.courseDetails.description}
                          </p>
                        )}

                        <div className="course-details">
                          <div className="detail">
                            <FaClock />
                            <span>{enrollment.courseDetails.duration} hours</span>
                          </div>
                          <div className="detail">
                            <FaChartLine />
                            <span 
                              className="level"
                              style={{
                                background: levelColors.bg,
                                color: levelColors.color
                              }}
                            >
                              {enrollment.courseDetails.level}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="enrollment-info">
                      <div className="enrollment-date">
                        <FaCalendarAlt />
                        <small>
                          Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style jsx>{`
        .courses-summary {
          margin-bottom: 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e8f0fe 100%);
          border: 2px solid #667eea;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
        }

        .summary-stat {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #667eea;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #666;
          margin-top: 0.25rem;
        }

        .enrollment-info {
          padding-top: 0.75rem;
          margin-top: 0.75rem;
          border-top: 1px solid #f0f0f0;
        }

        .enrollment-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
        }

        .enrollment-date svg {
          color: #667eea;
        }

        .info-box {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 1rem;
          border-radius: 4px;
        }

        .info-box p {
          margin: 0.5rem 0;
          color: #0d47a1;
        }

        .info-box ol {
          color: #1565c0;
        }

        @media (max-width: 768px) {
          .summary-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MyCourses;