// frontend/src/components/Trainers/TrainerList.jsx
import React, { useState, useEffect } from 'react';
import { getAllTrainers, deleteTrainer } from '../../services/trainerService';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../utils/constants';
import { toast } from 'react-toastify';
import Loading from '../Common/Loading';
import TrainerCard from './TrainerCard';
import AddTrainer from './AddTrainer';
import '../../styles/pages/Trainers.css';

const TrainerList = () => {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const isAdmin = user?.role === USER_ROLES.ADMIN;

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
    if (!isAdmin) {
      toast.error('Only admins can delete trainers');
      return;
    }

    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await deleteTrainer(empId);
        toast.success('Trainer deleted successfully!');
        fetchTrainers();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete trainer';
        toast.error(errorMessage);
        console.error(error);
      }
    }
  };

  const handleTrainerAdded = () => {
    setShowAddForm(false);
    fetchTrainers();
    toast.success('Trainer added successfully!');
  };

  const canEditTrainer = (trainer) => {
    if (isAdmin) return true;
    // User can edit their own record (matched by email)
    return user?.email === trainer.email;
  };

  if (loading) return <Loading message="Loading trainers..." />;

  return (
    <div className="trainer-list-container">
      <div className="page-header">
        <div>
          <h1>Trainers ({trainers.length})</h1>
          {!isAdmin && (
            <p className="user-notice">
              ℹ️ You can only view trainers. Contact admin to add new trainers.
            </p>
          )}
        </div>
        {isAdmin && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Trainer'}
          </button>
        )}
      </div>

      {showAddForm && isAdmin && (
        <AddTrainer 
          onSuccess={handleTrainerAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {trainers.length === 0 ? (
        <div className="empty-state">
          <h3>No trainers found</h3>
          {isAdmin && <p>Click "Add Trainer" to create your first trainer</p>}
        </div>
      ) : (
        <div className="grid">
          {trainers.map((trainer) => (
            <TrainerCard 
              key={trainer.empId}
              trainer={trainer}
              onDelete={handleDelete}
              canEdit={canEditTrainer(trainer)}
              canDelete={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainerList;