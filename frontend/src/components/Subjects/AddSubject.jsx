// src/components/Subjects/AddSubject.jsx
import React, { useState } from 'react';
import { addSubject } from '../../services/subjectService';
import { SUBJECT_LEVELS } from '../../utils/constants';
import { toast } from 'react-toastify';

const AddSubject = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    subjectId: '',
    name: '',
    description: '',
    duration: '',
    level: 'Beginner',
    trainers: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subjectId || !formData.name) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Convert trainers string to array
      const trainersArray = formData.trainers
        ? formData.trainers.split(',').map(t => t.trim().toUpperCase())
        : [];

      const subjectData = {
        ...formData,
        subjectId: formData.subjectId.toUpperCase(),
        trainers: trainersArray,
        duration: parseInt(formData.duration) || 0
      };

      await addSubject(subjectData);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add subject');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-subject-form card">
      <h2>Add New Subject</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Subject ID *</label>
            <input
              type="text"
              name="subjectId"
              className="form-control"
              placeholder="REACT"
              value={formData.subjectId}
              onChange={handleChange}
              required
            />
            <small>Will be converted to uppercase</small>
          </div>

          <div className="form-group">
            <label>Subject Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="React Development"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            className="form-control"
            placeholder="Learn React from scratch..."
            rows="3"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (hours)</label>
            <input
              type="number"
              name="duration"
              className="form-control"
              placeholder="60"
              min="0"
              value={formData.duration}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Level</label>
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
          </div>
        </div>

        <div className="form-group">
          <label>Trainers (comma-separated Employee IDs)</label>
          <input
            type="text"
            name="trainers"
            className="form-control"
            placeholder="EMP001, EMP002"
            value={formData.trainers}
            onChange={handleChange}
          />
          <small>Enter trainer Employee IDs separated by commas</small>
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