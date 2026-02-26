// frontend/src/components/Trainers/TrainerList.jsx
import React, { useState, useEffect } from 'react';
import { getAllTrainers, deleteTrainer } from '../../services/trainerService';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../utils/constants';
import { toast } from 'react-toastify';
import Loading from '../Common/Loading';
import SearchBox from '../Common/SearchBox';
import TrainerCard from './TrainerCard';
import AddTrainer from './AddTrainer';
import '../../styles/pages/Trainers.css';

const TrainerList = () => {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
  };

  const canEditTrainer = (trainer) => {
    if (isAdmin) return true;
    // User can edit their own record (matched by email)
    return user?.email === trainer.email;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter trainers based on search term
  const filteredTrainers = trainers.filter(trainer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      trainer.name?.toLowerCase().includes(searchLower) ||
      trainer.empId?.toLowerCase().includes(searchLower) ||
      trainer.email?.toLowerCase().includes(searchLower) ||
      trainer.phone?.includes(searchTerm) ||
      trainer.subjects?.some(subject => subject.toLowerCase().includes(searchLower))
    );
  });

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
            className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Trainer'}
          </button>
        )}
      </div>

      {/* Search Box */}
      {trainers.length > 0 && (
        <div className="search-section">
          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search trainers by name, ID, email, phone, or subjects..."
          />
          {searchTerm && (
            <p className="search-results-info">
              Found {filteredTrainers.length} of {trainers.length} trainer{filteredTrainers.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

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
      ) : filteredTrainers.length === 0 ? (
        <div className="empty-state">
          <h3>No trainers match your search</h3>
          <p>Try adjusting your search terms or <button onClick={() => setSearchTerm('')} className="clear-search-link">clear search</button></p>
        </div>
      ) : (
        <div className="grid">
          {filteredTrainers.map((trainer) => (
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

      <style jsx>{`
        .search-section {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-results-info {
          color: #666;
          font-size: 0.95rem;
          margin: 0;
          font-weight: 500;
        }

        .clear-search-link {
          background: none;
          border: none;
          color: #2a5298;
          text-decoration: underline;
          cursor: pointer;
          font-weight: 600;
          padding: 0;
          font-size: inherit;
        }

        .clear-search-link:hover {
          color: #1e3c72;
        }

        .user-notice {
          color: #666;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .search-section {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TrainerList;