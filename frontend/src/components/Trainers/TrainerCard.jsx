// src/components/Trainers/TrainerCard.jsx
import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaBriefcase, FaTrash } from 'react-icons/fa';

const TrainerCard = ({ trainer, onDelete }) => {
  return (
    <div className="trainer-card card">
      <div className="trainer-card-header">
        <div className="trainer-avatar">
          <FaUser size={40} />
        </div>
        <div className="trainer-info">
          <h3>{trainer.name}</h3>
          <span className="trainer-id">{trainer.empId}</span>
        </div>
      </div>

      <div className="trainer-card-body">
        <div className="trainer-detail">
          <FaEnvelope className="icon" />
          <span>{trainer.email}</span>
        </div>

        {trainer.phone && (
          <div className="trainer-detail">
            <FaPhone className="icon" />
            <span>{trainer.phone}</span>
          </div>
        )}

        <div className="trainer-detail">
          <FaBriefcase className="icon" />
          <span>{trainer.experience} years experience</span>
        </div>

        <div className="trainer-subjects">
          <strong>Subjects:</strong>
          <div className="subject-tags">
            {trainer.subjects && trainer.subjects.length > 0 ? (
              trainer.subjects.map((subject, index) => (
                <span key={index} className="subject-tag">{subject}</span>
              ))
            ) : (
              <span className="no-subjects">No subjects assigned</span>
            )}
          </div>
        </div>
      </div>

      <div className="trainer-card-footer">
        <button 
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(trainer.empId)}
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
};

export default TrainerCard;