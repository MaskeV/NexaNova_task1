// src/components/Trainers/TrainerList.jsx
import React, { useState, useEffect } from 'react';
import { getAllTrainers, deleteTrainer } from '../../services/trainerService';
import { toast } from 'react-toastify';
import Loading from '../Common/Loading';
import TrainerCard from './TrainerCard';
import AddTrainer from './AddTrainer';
import '../../styles/pages/Trainers.css';

const TrainerList = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await getAllTrainers();
      setTrainers(response.data);
    } catch (error) {
      toast.error('Failed to fetch trainers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (empId) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await deleteTrainer(empId);
        toast.success('Trainer deleted successfully!');
        fetchTrainers(); // Refresh list
      } catch (error) {
        toast.error('Failed to delete trainer');
        console.error(error);
      }
    }
  };

  const handleTrainerAdded = () => {
    setShowAddForm(false);
    fetchTrainers();
    toast.success('Trainer added successfully!');
  };

  if (loading) return <Loading message="Loading trainers..." />;

  return (
    <div className="trainer-list-container">
      <div className="page-header">
        <h1>Trainers ({trainers.length})</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Trainer'}
        </button>
      </div>

      {showAddForm && (
        <AddTrainer 
          onSuccess={handleTrainerAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {trainers.length === 0 ? (
        <div className="empty-state">
          <h3>No trainers found</h3>
          <p>Click "Add Trainer" to create your first trainer</p>
        </div>
      ) : (
        <div className="grid">
          {trainers.map((trainer) => (
            <TrainerCard 
              key={trainer.empId}
              trainer={trainer}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainerList;