// src/components/Subjects/SubjectCard.jsx
import React, { useState } from 'react';
import { FaBook, FaClock, FaChartLine, FaUsers, FaChevronDown, FaChevronUp, FaEdit, FaTrash } from 'react-icons/fa';
import { getSubjectById } from '../../services/subjectService';

const SubjectCard = ({ subject, onDelete, onEdit, canEdit = false, canDelete = false }) => {
  const [showTrainers, setShowTrainers] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const shouldShowReadMore = subject.description && subject.description.length > 100;

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return '#4caf50';
      case 'Intermediate': return '#ff9800';
      case 'Advanced': return '#f44336';
      default: return '#757575';
    }
  };

  const fetchTrainers = async () => {
    if (showTrainers) {
      setShowTrainers(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getSubjectById(subject.subjectId);

      // ✅ FIX: getSubjectWithTrainers returns { data: { subject, modules, trainers, stats } }
      // not { data: { trainers } } directly
      const fetchedTrainers = response.data?.trainers || response.data?.data?.trainers || [];
      setTrainers(fetchedTrainers);
      setShowTrainers(true);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normalize trainer count — subject.trainers may be array of strings (empIds) or objects
  const trainerCount = subject.trainers?.length || 0;
  const moduleCount = subject.modules?.length || 0;

  return (
    <div className="subject-card card">
      <div className="subject-card-header">
        <div className="subject-icon">
          <FaBook size={30} />
        </div>
        <div className="subject-info">
          <h3>{subject.name}</h3>
          <span className="subject-id">{subject.subjectId}</span>
        </div>
      </div>

      <div className="subject-card-body">
        {subject.description && (
          <div className="subject-description-container">
            <p className="subject-description">
              {isDescriptionExpanded
                ? subject.description
                : truncateText(subject.description, 100)
              }
            </p>
            {shouldShowReadMore && (
              <button
                className="read-more-btn"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? (
                  <><FaChevronUp size={12} /> Show less</>
                ) : (
                  <><FaChevronDown size={12} /> Read more</>
                )}
              </button>
            )}
          </div>
        )}

        <div className="subject-details">
          <div className="subject-detail">
            <FaClock className="icon" />
            {/* ✅ FIX: show totalDuration if available, fallback to duration */}
            <span>{subject.totalDuration || subject.duration || 0} hours</span>
          </div>

          <div className="subject-detail">
            <FaChartLine className="icon" />
            <span
              className="subject-level"
              style={{ color: getLevelColor(subject.level) }}
            >
              {subject.level || 'Beginner'}
            </span>
          </div>

          <div className="subject-detail">
            <FaUsers className="icon" />
            <span>{trainerCount} trainer(s)</span>
          </div>

          {/* ✅ NEW: show module count */}
          <div className="subject-detail">
            <FaBook className="icon" />
            <span>{moduleCount} module(s)</span>
          </div>
        </div>

        {trainerCount > 0 && (
          <div className="trainers-section">
            <button
              className="btn-show-trainers"
              onClick={fetchTrainers}
              disabled={loading}
            >
              {loading ? 'Loading...' : showTrainers ? 'Hide Trainers' : 'Show Trainers'}
              {!loading && (showTrainers ? <FaChevronUp /> : <FaChevronDown />)}
            </button>

            {showTrainers && trainers.length > 0 && (
              <div className="trainers-list">
                {trainers.map((trainer) => (
                  <div key={trainer.empId} className="trainer-item">
                    <strong>{trainer.name}</strong>
                    <span className="trainer-empid">{trainer.empId}</span>
                    <span className="trainer-exp">{trainer.experience} yrs</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {(canEdit || canDelete) && (
        <div className="subject-card-footer">
          {canEdit && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onEdit(subject)}
            >
              <FaEdit /> Edit
            </button>
          )}
          {canDelete && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(subject.subjectId)}
            >
              <FaTrash /> Delete
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .subject-description-container {
          margin-bottom: 1rem;
        }
        .subject-description {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0 0 0.5rem 0;
          word-break: break-word;
        }
        .read-more-btn {
          background: none;
          border: none;
          color: #667eea;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0;
          transition: all 0.2s ease;
        }
        .read-more-btn:hover {
          color: #764ba2;
        }
      `}</style>
    </div>
  );
};

export default SubjectCard;