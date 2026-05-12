// frontend/src/pages/TrainersPage.jsx
import React from 'react';
import TrainerList from '../components/Trainers/TrainerList';
import '../styles/pages/Trainers.css';

/**
 * TrainersPage Component
 * Main page for displaying and managing trainers
 */
const TrainersPage = () => {
  return (
    <div className="page-container">
      <TrainerList />
    </div>
  );
};

export default TrainersPage;