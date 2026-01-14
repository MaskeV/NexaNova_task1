// src/components/Subjects/AddSubject.jsx
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchAvailableTrainers();
  }, []);

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
    
    let processedValue = value;
    if (name === 'subjectId') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleTrainerChange = (e) => {
    const options = e.target.options;
    const selectedTrainers = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTrainers.push(options[i].value);
      }
    }
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

  const validateForm = async () => {
    const newErrors = {};

    // Validate Subject ID
    if (!formData.subjectId || formData.subjectId.trim() === '') {
      newErrors.subjectId = 'Subject ID is required';
    } else if (!/^[A-Z0-9]+$/.test(formData.subjectId)) {
      newErrors.subjectId = 'Subject ID must contain only uppercase letters and numbers';
    } else if (formData.subjectId.length < 2) {
      newErrors.subjectId = 'Subject ID must be at least 2 characters';
    } else if (formData.subjectId.length > 15) {
      newErrors.subjectId = 'Subject ID must be at most 15 characters';
    } else {
      // Check for duplicate Subject ID
      try {
        const response = await getAllSubjects();
        const exists = response.data.some(s => s.subjectId === formData.subjectId);
        if (exists) {
          newErrors.subjectId = 'This Subject ID already exists. Please use a unique ID.';
        }
      } catch (error) {
        console.error('Error checking duplicate subject ID:', error);
      }
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
            <label>Subject ID *</label>
            <input
              type="text"
              name="subjectId"
              className={`form-control ${errors.subjectId ? 'error' : ''}`}
              placeholder="REACT"
              value={formData.subjectId}
              onChange={handleChange}
              maxLength="15"
              required
            />
            {errors.subjectId && <span className="error-text">{errors.subjectId}</span>}
            <small>2-15 characters, uppercase letters and numbers only (auto-converted)</small>
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
            <>
              <select
                multiple
                name="trainers"
                className={`form-control multi-select ${errors.trainers ? 'error' : ''}`}
                value={formData.trainers}
                onChange={handleTrainerChange}
                size="5"
              >
                {availableTrainers.map((trainer) => (
                  <option key={trainer.empId} value={trainer.empId}>
                    {trainer.empId} - {trainer.name} ({trainer.experience} yrs)
                  </option>
                ))}
              </select>
              {errors.trainers && <span className="error-text">{errors.trainers}</span>}
              <small>Hold Ctrl/Cmd to select multiple trainers</small>
            </>
          )}
        </div>

        <div className="selected-trainers-preview">
          <strong>Selected Trainers: </strong>
          {formData.trainers.length > 0 ? (
            <div className="selected-tags">
              {formData.trainers.map((empId) => {
                const trainer = availableTrainers.find(t => t.empId === empId);
                return (
                  <span key={empId} className="selected-tag">
                    {trainer?.name || empId}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="no-selection">None selected</span>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Subject'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubject;