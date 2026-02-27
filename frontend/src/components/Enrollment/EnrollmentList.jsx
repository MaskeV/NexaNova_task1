// frontend/src/components/Enrollment/EnrollmentList.jsx
import React from 'react';
import { FaTrash, FaUser, FaBook, FaCheckCircle } from 'react-icons/fa';
import { ENROLLMENT_STATUS } from '../../utils/constants';

const EnrollmentList = ({ enrollments, subjects, onDelete, onStatusUpdate }) => {
  const getCourseName = (courseId) => {
    const subject = subjects.find(s => s.subjectId === courseId);
    return subject ? subject.name : courseId;
  };

  const getCourseDetails = (courseId) => {
    return subjects.find(s => s.subjectId === courseId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'completed': return '#2196f3';
      case 'dropped': return '#f44336';
      case 'suspended': return '#ff9800';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '✓';
      case 'completed': return '✓✓';
      case 'dropped': return '✗';
      case 'suspended': return '⏸';
      default: return '○';
    }
  };

  return (
    <div className="enrollment-list">
      <div className="list-header">
        <h3>📋 Enrollments ({enrollments.length})</h3>
      </div>

      <div className="enrollments-grid">
        {enrollments.map(enrollment => {
          const courseDetails = getCourseDetails(enrollment.course);
          
          return (
            <div key={enrollment._id} className="enrollment-card card">
              <div className="enrollment-header">
                <div className="student-info">
                  <FaUser />
                  <div>
                    <strong>{enrollment.student?.username || 'Unknown'}</strong>
                    <small>{enrollment.studentEmail}</small>
                  </div>
                </div>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => onDelete(enrollment._id)}
                  title="Remove enrollment"
                >
                  <FaTrash size={14} />
                </button>
              </div>

              <div className="enrollment-body">
                <div className="course-info">
                  <FaBook />
                  <div>
                    <strong>{getCourseName(enrollment.course)}</strong>
                    <small>{enrollment.course}</small>
                    {courseDetails && (
                      <small className="course-level-badge" style={{
                        background: courseDetails.level === 'Beginner' ? '#e8f5e9' : 
                                   courseDetails.level === 'Intermediate' ? '#fff3e0' : '#fce4ec',
                        color: courseDetails.level === 'Beginner' ? '#2e7d32' : 
                               courseDetails.level === 'Intermediate' ? '#e65100' : '#c2185b'
                      }}>
                        {courseDetails.level}
                      </small>
                    )}
                  </div>
                </div>

                <div className="enrollment-meta">
                  <div className="meta-item">
                    <span>Status:</span>
                    <div className="status-wrapper">
                      <span className="status-icon" style={{ color: getStatusColor(enrollment.status) }}>
                        {getStatusIcon(enrollment.status)}
                      </span>
                      <select
                        value={enrollment.status}
                        onChange={(e) => onStatusUpdate(enrollment._id, e.target.value)}
                        className="status-select"
                        style={{ color: getStatusColor(enrollment.status) }}
                      >
                        {Object.values(ENROLLMENT_STATUS).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="meta-item">
                    <span>Enrolled:</span>
                    <span>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                  </div>

                  {courseDetails && (
                    <div className="meta-item">
                      <span>Duration:</span>
                      <span>{courseDetails.duration} hours</span>
                    </div>
                  )}
                </div>

                {enrollment.status === 'active' && (
                  <div className="enrollment-badge">
                    <FaCheckCircle />
                    <span>Currently Enrolled</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .course-level-badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 0.5rem;
          margin-top: 0.25rem;
        }

        .status-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-icon {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .enrollment-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border-radius: 8px;
          color: #2e7d32;
          font-weight: 600;
          font-size: 0.85rem;
          margin-top: 1rem;
          border: 2px solid #4caf50;
        }
      `}</style>
    </div>
  );
};

export default EnrollmentList;