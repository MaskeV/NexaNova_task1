// frontend/src/components/Enrollment/EnrollmentList.jsx
import React from 'react';
import { FaTrash, FaUser, FaBook, FaCheckCircle } from 'react-icons/fa';
import { ENROLLMENT_STATUS } from '../../utils/constants';

const EnrollmentList = ({ enrollments, courses, onDelete, onStatusUpdate }) => {
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.courseId === courseId);
    return course ? course.name : courseId;
  };

  const getCourseDetails = (courseId) => {
    return courses.find(c => c.courseId === courseId);
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
                    <small>{enrollment.studentEmail || enrollment.student?.email}</small>
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
                      <>
                        <small className="course-level-badge" style={{
                          background: courseDetails.level === 'Beginner' ? '#e8f5e9' : 
                                     courseDetails.level === 'Intermediate' ? '#fff3e0' : '#fce4ec',
                          color: courseDetails.level === 'Beginner' ? '#2e7d32' : 
                                 courseDetails.level === 'Intermediate' ? '#e65100' : '#c2185b'
                        }}>
                          {courseDetails.level}
                        </small>
                        <small className="course-duration-badge">
                          {courseDetails.duration} weeks
                        </small>
                      </>
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
        .course-level-badge,
        .course-duration-badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 0.5rem;
          margin-top: 0.25rem;
        }

        .course-duration-badge {
          background: #e3f2fd;
          color: #1976d2;
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

        .enrollment-list {
          margin-top: 2rem;
        }

        .list-header {
          margin-bottom: 1.5rem;
        }

        .list-header h3 {
          color: #333;
          font-size: 1.5rem;
        }

        .enrollments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .enrollment-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .enrollment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .enrollment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .student-info svg {
          color: #667eea;
          flex-shrink: 0;
        }

        .student-info strong {
          display: block;
          color: #333;
          font-size: 1rem;
        }

        .student-info small {
          display: block;
          color: #666;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .enrollment-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .course-info {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .course-info svg {
          color: #764ba2;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .course-info strong {
          display: block;
          color: #333;
          font-size: 0.95rem;
        }

        .course-info small {
          display: block;
          color: #666;
          font-size: 0.8rem;
          font-family: monospace;
          margin-top: 0.25rem;
        }

        .enrollment-meta {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .meta-item span:first-child {
          font-weight: 600;
          color: #333;
        }

        .status-select {
          padding: 0.25rem 0.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: capitalize;
        }

        .status-select:hover {
          border-color: #667eea;
        }

        .status-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-icon.btn-danger {
          background: transparent;
          color: #e74c3c;
          border: 2px solid #e74c3c;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .btn-icon.btn-danger:hover {
          background: #e74c3c;
          color: white;
        }

        @media (max-width: 768px) {
          .enrollments-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EnrollmentList;