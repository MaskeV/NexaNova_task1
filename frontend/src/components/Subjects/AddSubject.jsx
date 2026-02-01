// src/components/Subjects/AddSubject-Improved.jsx
import React, { useState, useEffect } from 'react';
import { addSubject, getAllSubjects } from '../../services/subjectService';
import { getAllTrainers } from '../../services/trainerService';
import { SUBJECT_LEVELS } from '../../utils/constants';
import { toast } from 'react-toastify';
import MultiSelectDropdown from '../Common/MultiSelectDropdown';

const AddSubject = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    subjectId: '',
    name: '',
    description: '',
    duration: '',
    level: 'Beginner',
    trainers: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableTrainers, setAvailableTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [generatingId, setGeneratingId] = useState(false);

  useEffect(() => {
    fetchAvailableTrainers();
    generateSubjectId();
  }, []);

  const generateSubjectId = async () => {
    try {
      setGeneratingId(true);
      const response = await getAllSubjects();
      const existingIds = response.data.map(s => s.subjectId);
      
      const numbers = existingIds
        .filter(id => id.startsWith('SB'))
        .map(id => {
          const match = id.match(/SB(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => !isNaN(num));
      
      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
      const nextNumber = maxNumber + 1;
      
      const newId = `SB${nextNumber.toString().padStart(2, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        subjectId: newId
      }));
    } catch (error) {
      console.error('Failed to generate subject ID:', error);
      toast.error('Failed to generate Subject ID');
    } finally {
      setGeneratingId(false);
    }
  };

  const fetchAvailableTrainers = async () => {
    try {
      setLoadingTrainers(true);
      const response = await getAllTrainers();
      setAvailableTrainers(response.data);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
      toast.error('Failed to load trainers');
    } finally {
      setLoadingTrainers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleTrainersChange = (selectedTrainers) => {
    setFormData({
      ...formData,
      trainers: selectedTrainers
    });
    
    if (errors.trainers) {
      setErrors({
        ...errors,
        trainers: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrors({});

    try {
      setLoading(true);

      const subjectData = {
        subjectId: formData.subjectId.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        duration: parseInt(formData.duration) || 0,
        level: formData.level,
        trainers: formData.trainers
      };

      console.log('📤 Submitting subject data:', subjectData);

      await addSubject(subjectData);
      toast.success('Subject added successfully!');
      onSuccess();
    } catch (error) {
      console.error('❌ Add subject error:', error);
      
      const backendErrors = error.response?.data?.errors || {};
      const errorMessage = error.response?.data?.message || 'Failed to add subject';
      
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
        const firstError = Object.values(backendErrors)[0];
        toast.error(firstError);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Transform trainers for dropdown
  const trainerOptions = availableTrainers.map(trainer => ({
    id: trainer.empId,
    name: trainer.name,
    extra: `${trainer.experience} years experience`
  }));

  return (
    <div className="add-subject-form card">
      <div className="form-header">
        <h2>📚 Add New Subject</h2>
        <p className="form-subtitle">Fill in the details below to create a new subject</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Subject ID *</label>
            <input
              type="text"
              name="subjectId"
              className={`form-control ${errors.subjectId ? 'error' : ''}`}
              value={formData.subjectId}
              readOnly
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            {errors.subjectId && <span className="error-text">{errors.subjectId}</span>}
            <small className="input-hint">
              {generatingId ? '🔄 Generating ID...' : '✓ Auto-generated'}
            </small>
          </div>

          <div className="form-group">
            <label>Subject Name *</label>
            <input
              type="text"
              name="name"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="e.g., React Development"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
            <small className="input-hint">3-100 characters</small>
          </div>
        </div>

        <div className="form-group">
          <label>Description * (Required)</label>
          <textarea
            name="description"
            className={`form-control ${errors.description ? 'error' : ''}`}
            placeholder="Provide a detailed description of the subject..."
            rows="4"
            value={formData.description}
            onChange={handleChange}
            maxLength="500"
            required
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
          <small className="char-counter">
            {formData.description.length}/500 characters 
            {formData.description.length < 10 && <span className="warning"> (minimum 10 required)</span>}
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (hours) *</label>
            <input
              type="number"
              name="duration"
              className={`form-control ${errors.duration ? 'error' : ''}`}
              placeholder="e.g., 40"
              min="1"
              max="1000"
              value={formData.duration}
              onChange={handleChange}
              required
            />
            {errors.duration && <span className="error-text">{errors.duration}</span>}
            <small className="input-hint">1-1000 hours</small>
          </div>

          <div className="form-group">
            <label>Difficulty Level *</label>
            <select
              name="level"
              className={`form-control ${errors.level ? 'error' : ''}`}
              value={formData.level}
              onChange={handleChange}
            >
              {SUBJECT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.level && <span className="error-text">{errors.level}</span>}
          </div>
        </div>

        <div className="form-group">
          {loadingTrainers ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <span>Loading trainers...</span>
            </div>
          ) : (
            <MultiSelectDropdown
              label="Assign Trainers (Optional)"
              options={trainerOptions}
              selectedValues={formData.trainers}
              onChange={handleTrainersChange}
              placeholder="Search and select trainers..."
              error={errors.trainers}
              searchable={true}
            />
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading || generatingId}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Adding Subject...
              </>
            ) : (
              '✓ Add Subject'
            )}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            ✕ Cancel
          </button>
        </div>
      </form>

      <style jsx>{`
        .form-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .form-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .form-subtitle {
          margin: 0;
          color: #666;
          font-size: 0.95rem;
        }

        .input-hint {
          display: block;
          margin-top: 0.25rem;
          color: #666;
          font-size: 0.85rem;
        }

        .char-counter {
          display: block;
          margin-top: 0.25rem;
          color: #666;
          font-size: 0.85rem;
          text-align: right;
        }

        .char-counter .warning {
          color: #e74c3c;
          font-weight: 600;
        }

        .loading-state {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          color: #666;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-text {
          color: #e74c3c;
          font-size: 0.875rem;
          font-weight: 600;
          display: block;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #fff5f5;
          border-left: 3px solid #e74c3c;
          border-radius: 4px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #f0f0f0;
        }

        .form-actions .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default AddSubject;