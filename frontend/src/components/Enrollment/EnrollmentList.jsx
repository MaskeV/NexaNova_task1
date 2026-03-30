// frontend/src/components/Enrollment/EnrollmentList.jsx
import React from 'react';
import { FaTrash, FaUser, FaBook, FaCheckCircle } from 'react-icons/fa';
import { ENROLLMENT_STATUS } from '../../utils/constants';

// Accepts either `courses` (new) or `subjects` (old) prop for backward compat
const EnrollmentList = ({ enrollments, courses = [], subjects = [], onDelete, onStatusUpdate }) => {
  // Merge: prefer courses, fall back to subjects for older enrollments
  const allItems = [
    ...courses.map(c => ({ id: c.courseId, name: c.name, level: c.level, duration: c.duration, type: 'course' })),
    ...subjects.map(s => ({ id: s.subjectId, name: s.name, level: s.level, duration: s.duration || s.totalDuration, type: 'subject' }))
  ];

  const getItemDetails = (courseId) => allItems.find(i => i.id === courseId) || null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':    return '#4caf50';
      case 'completed': return '#2196f3';
      case 'dropped':   return '#f44336';
      case 'suspended': return '#ff9800';
      default:          return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':    return '✓';
      case 'completed': return '✓✓';
      case 'dropped':   return '✗';
      case 'suspended': return '⏸';
      default:          return '○';
    }
  };

  return (
    <div className="enrollment-list">
      <div className="list-header">
        <h3>📋 Enrollments ({enrollments.length})</h3>
      </div>

      <div className="enrollments-grid">
        {enrollments.map(enrollment => {
          // Support both old courseDetails (subject) and new courseDetails (course) from backend
          const itemDetails =
            getItemDetails(enrollment.course) ||
            (enrollment.courseDetails
              ? { ...enrollment.courseDetails, id: enrollment.course }
              : null);

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
                    <strong>{itemDetails?.name || enrollment.course}</strong>
                    <small>{enrollment.course}</small>
                    {itemDetails?.level && (
                      <small
                        className="course-level-badge"
                        style={{
                          background:
                            itemDetails.level === 'Beginner' ? '#e8f5e9' :
                            itemDetails.level === 'Intermediate' ? '#fff3e0' : '#fce4ec',
                          color:
                            itemDetails.level === 'Beginner' ? '#2e7d32' :
                            itemDetails.level === 'Intermediate' ? '#e65100' : '#c2185b'
                        }}
                      >
                        {itemDetails.level}
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

                  {itemDetails?.duration && (
                    <div className="meta-item">
                      <span>Duration:</span>
                      <span>
                        {itemDetails.duration}
                        {itemDetails.type === 'course' ? ' weeks' : ' hours'}
                      </span>
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