// src/components/Subjects/SubjectCard.jsx
import React, { useState } from 'react';
import { FaBook, FaClock, FaChartLine, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { getSubjectById } from '../../services/subjectService';

const SubjectCard = ({ subject }) => {
  const [showTrainers, setShowTrainers] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);

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
      setTrainers(response.data.trainers);
      setShowTrainers(true);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <p className="subject-description">{subject.description}</p>
        )}

        <div className="subject-details">
          <div className="subject-detail">
            <FaClock className="icon" />
            <span>{subject.duration || 0} hours</span>
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
            <span>{subject.trainers?.length || 0} trainer(s)</span>
          </div>
        </div>

        {subject.trainers && subject.trainers.length > 0 && (
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
    </div>
  );
};

export default SubjectCard;