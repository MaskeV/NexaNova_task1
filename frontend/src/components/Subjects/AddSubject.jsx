// src/components/Subjects/AddSubject.jsx
import React, { useState, useEffect, useRef } from 'react';
import { addSubject, getAllSubjects } from '../../services/subjectService';
import { getAllTrainers } from '../../services/trainerService';
import { SUBJECT_LEVELS } from '../../utils/constants';
import { toast } from 'react-toastify';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchAvailableTrainers();
    generateSubjectId();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const generateSubjectId = async () => {
    try {
      setGeneratingId(true);
      const response = await getAllSubjects();
      const existingIds = response.data.map(s => s.subjectId);
      
      // Extract numbers from existing IDs like SB01, SB02, etc.
      const numbers = existingIds
        .filter(id => id.startsWith('SB'))
        .map(id => {
          const match = id.match(/SB(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => !isNaN(num));
      
      // Find the highest number and add 1
      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
      const nextNumber = maxNumber + 1;
      
      // Generate ID in format SB01, SB02, etc. (2 digits)
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

  const toggleTrainer = (empId) => {
    const isSelected = formData.trainers.includes(empId);
    const newTrainers = isSelected
      ? formData.trainers.filter(id => id !== empId)
      : [...formData.trainers, empId];
    
    setFormData({
      ...formData,
      trainers: newTrainers
    });
    
    if (errors.trainers) {
      setErrors({
        ...errors,
        trainers: ''
      });
    }
  };

  const removeTrainer = (empId) => {
    setFormData({
      ...formData,
      trainers: formData.trainers.filter(id => id !== empId)
    });
  };

  const validateForm = async () => {
    const newErrors = {};

    // Subject ID is auto-generated, so we just check if it exists
    if (!formData.subjectId || formData.subjectId.trim() === '') {
      newErrors.subjectId = 'Subject ID generation failed. Please refresh.';
    }

    // Validate Name
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Subject name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Subject name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Subject name must be at most 100 characters';
    }

    // Validate Duration
    if (formData.duration && formData.duration !== '') {
      const dur = parseInt(formData.duration);
      if (isNaN(dur) || dur < 0) {
        newErrors.duration = 'Duration must be a positive number';
      } else if (dur > 1000) {
        newErrors.duration = 'Duration cannot exceed 1000 hours';
      }
    }

    // Validate Description
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be at most 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      toast.error('Please fix all errors before submitting');
      return;
    }

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

      await addSubject(subjectData);
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add subject';
      toast.error(errorMessage);
      
      if (errorMessage.includes('Subject ID')) {
        setErrors(prev => ({ ...prev, subjectId: errorMessage }));
      }
      
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-subject-form card">
      <h2>Add New Subject</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Subject ID</label>
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
            <small>
              {generatingId ? '🔄 Generating ID...' : '✓ Auto-generated'}
            </small>
          </div>

          <div className="form-group">
            <label>Subject Name *</label>
            <input
              type="text"
              name="name"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="React Development"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
            <small>3-100 characters</small>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            className={`form-control ${errors.description ? 'error' : ''}`}
            placeholder="Learn React from scratch..."
            rows="3"
            value={formData.description}
            onChange={handleChange}
            maxLength="500"
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
          <small>Maximum 500 characters ({formData.description.length}/500)</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (hours)</label>
            <input
              type="number"
              name="duration"
              className={`form-control ${errors.duration ? 'error' : ''}`}
              placeholder="60"
              min="0"
              max="1000"
              value={formData.duration}
              onChange={handleChange}
            />
            {errors.duration && <span className="error-text">{errors.duration}</span>}
            <small>0 to 1000 hours</small>
          </div>

          <div className="form-group">
            <label>Level *</label>
            <select
              name="level"
              className="form-control"
              value={formData.level}
              onChange={handleChange}
            >
              {SUBJECT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <small>Choose difficulty level</small>
          </div>
        </div>

        <div className="form-group">
          <label>Assign Trainers (optional)</label>
          {loadingTrainers ? (
            <div className="loading-trainers">Loading trainers...</div>
          ) : availableTrainers.length === 0 ? (
            <div className="no-trainers-info">
              <p>ℹ️ No trainers available yet.</p>
              <small>You can add trainers later.</small>
            </div>
          ) : (
            <div className="custom-dropdown" ref={dropdownRef}>
              <div 
                className={`dropdown-trigger ${isDropdownOpen ? 'open' : ''} ${errors.trainers ? 'error' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>
                  {formData.trainers.length > 0 
                    ? `${formData.trainers.length} trainer(s) selected` 
                    : 'Select trainers...'}
                </span>
                <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
              </div>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {availableTrainers.map((trainer) => {
                    const isSelected = formData.trainers.includes(trainer.empId);
                    return (
                      <div
                        key={trainer.empId}
                        className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleTrainer(trainer.empId)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="trainer-info">
                          <strong>{trainer.empId}</strong> - {trainer.name}
                          <small> ({trainer.experience} yrs exp)</small>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.trainers && <span className="error-text">{errors.trainers}</span>}
            </div>
          )}
        </div>

        {formData.trainers.length > 0 && (
          <div className="selected-trainers-preview">
            <strong>Selected Trainers:</strong>
            <div className="selected-tags">
              {formData.trainers.map((empId) => {
                const trainer = availableTrainers.find(t => t.empId === empId);
                return (
                  <span key={empId} className="selected-tag">
                    {trainer?.name || empId}
                    <button
                      type="button"
                      className="remove-tag"
                      onClick={() => removeTrainer(empId)}
                      aria-label="Remove trainer"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading || generatingId}>
            {loading ? 'Adding...' : 'Add Subject'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>

      <style jsx>{`
        .custom-dropdown {
          position: relative;
          width: 100%;
        }

        .dropdown-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dropdown-trigger:hover {
          border-color: #4CAF50;
        }

        .dropdown-trigger.open {
          border-color: #4CAF50;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }

        .dropdown-trigger.error {
          border-color: #dc3545;
        }

        .dropdown-arrow {
          color: #666;
          font-size: 12px;
          transition: transform 0.2s;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 250px;
          overflow-y: auto;
          background: white;
          border: 1px solid #4CAF50;
          border-top: none;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid #f0f0f0;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background-color: #f5f5f5;
        }

        .dropdown-item.selected {
          background-color: #e8f5e9;
        }

        .dropdown-item input[type="checkbox"] {
          cursor: pointer;
          width: 16px;
          height: 16px;
        }

        .trainer-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .trainer-info small {
          color: #666;
          font-size: 12px;
        }

        .selected-trainers-preview {
          margin-top: 15px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }

        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .selected-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background-color: #4CAF50;
          color: white;
          border-radius: 20px;
          font-size: 14px;
        }

        .remove-tag {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .remove-tag:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .loading-trainers,
        .no-trainers-info {
          padding: 15px;
          text-align: center;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default AddSubject;