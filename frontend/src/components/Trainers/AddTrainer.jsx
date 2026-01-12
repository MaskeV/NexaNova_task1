// src/components/Trainers/AddTrainer.jsx
import React, { useState } from 'react';
import { addTrainer } from '../../services/trainerService';
import { toast } from 'react-toastify';

const AddTrainer = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    empId: '',
    name: '',
    email: '',
    phone: '',
    subjects: '',
    experience: ''
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
    
    // Validation
    if (!formData.empId || !formData.name || !formData.email) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Convert subjects string to array
      const subjectsArray = formData.subjects
        ? formData.subjects.split(',').map(s => s.trim().toUpperCase())
        : [];

      const trainerData = {
        ...formData,
        subjects: subjectsArray,
        experience: parseInt(formData.experience) || 0
      };

      await addTrainer(trainerData);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add trainer');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-trainer-form card">
      <h2>Add New Trainer</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Employee ID *</label>
            <input
              type="text"
              name="empId"
              className="form-control"
              placeholder="EMP001"
              value={formData.empId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Subjects (comma-separated)</label>
            <input
              type="text"
              name="subjects"
              className="form-control"
              placeholder="REACT, NODE, MONGODB"
              value={formData.subjects}
              onChange={handleChange}
            />
            <small>Enter subject codes separated by commas</small>
          </div>

          <div className="form-group">
            <label>Experience (years)</label>
            <input
              type="number"
              name="experience"
              className="form-control"
              placeholder="5"
              min="0"
              value={formData.experience}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Trainer'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTrainer;