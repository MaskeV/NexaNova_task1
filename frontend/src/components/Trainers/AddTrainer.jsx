// src/components/Trainers/AddTrainer.jsx
import React, { useState, useEffect } from 'react';
import { addTrainer, getAllTrainers } from '../../services/trainerService';
import { getAllSubjects } from '../../services/subjectService';
import { toast } from 'react-toastify';

const AddTrainer = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    empId: '',
    name: '',
    email: '',
    phone: '',
    subjects: [],
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Auto-generate Employee ID and fetch subjects on component mount
  useEffect(() => {
    generateEmpId();
    fetchAvailableSubjects();
  }, []);

  const fetchAvailableSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await getAllSubjects();
      setAvailableSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const generateEmpId = async () => {
    try {
      const response = await getAllTrainers();
      const trainers = response.data;
      
      let maxNum = 0;
      trainers.forEach(trainer => {
        const match = trainer.empId.match(/EMP(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxNum) maxNum = num;
        }
      });

      const nextNum = maxNum + 1;
      const newEmpId = `EMP${String(nextNum).padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, empId: newEmpId }));
    } catch (error) {
      console.error('Failed to generate ID:', error);
      setFormData(prev => ({ ...prev, empId: 'EMP001' }));
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

  const handleSubjectChange = (e) => {
    const options = e.target.options;
    const selectedSubjects = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedSubjects.push(options[i].value);
      }
    }
    setFormData({
      ...formData,
      subjects: selectedSubjects
    });
    
    if (errors.subjects) {
      setErrors({
        ...errors,
        subjects: ''
      });
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    // Validate Employee ID
    if (!formData.empId || formData.empId.trim() === '') {
      newErrors.empId = 'Employee ID is required';
    } else if (!/^EMP\d{3}$/.test(formData.empId)) {
      newErrors.empId = 'Employee ID must be in format EMP001';
    } else {
      try {
        const response = await getAllTrainers();
        const exists = response.data.some(t => t.empId === formData.empId);
        if (exists) {
          newErrors.empId = 'This Employee ID already exists. Please use a unique ID.';
        }
      } catch (error) {
        console.error('Error checking duplicate ID:', error);
      }
    }

    // Validate Name
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Validate Email
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        const domain = formData.email.split('@')[1];
        if (!domain || domain.length < 4) {
          newErrors.email = 'Invalid email domain';
        }
        const domainParts = domain.split('.');
        if (domainParts.length < 2) {
          newErrors.email = 'Email domain must have at least one dot (e.g., example.com)';
        }
      }
      
      try {
        const response = await getAllTrainers();
        const exists = response.data.some(t => t.email.toLowerCase() === formData.email.toLowerCase());
        if (exists) {
          newErrors.email = 'This email is already registered. Please use a different email.';
        }
      } catch (error) {
        console.error('Error checking duplicate email:', error);
      }
    }

    // Validate Phone
    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must start with 6, 7, 8, or 9';
    }

    // Validate Experience
    if (formData.experience && formData.experience !== '') {
      const exp = parseInt(formData.experience);
      if (isNaN(exp) || exp < 0) {
        newErrors.experience = 'Experience must be a positive number';
      } else if (exp > 50) {
        newErrors.experience = 'Experience cannot exceed 50 years';
      }
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

      const trainerData = {
        empId: formData.empId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        subjects: formData.subjects, // Already array of subject IDs
        experience: parseInt(formData.experience) || 0
      };

      await addTrainer(trainerData);
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add trainer';
      toast.error(errorMessage);
      
      if (errorMessage.includes('Employee ID')) {
        setErrors(prev => ({ ...prev, empId: errorMessage }));
      } else if (errorMessage.includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      }
      
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-trainer-form card">
      <h2>Add New Trainer</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Employee ID *</label>
            <input
              type="text"
              name="empId"
              className={`form-control ${errors.empId ? 'error' : ''}`}
              placeholder="EMP001"
              value={formData.empId}
              onChange={handleChange}
              required
              readOnly
            />
            {errors.empId && <span className="error-text">{errors.empId}</span>}
            <small>Auto-generated in sequence (Read-only)</small>
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
            <small>Minimum 3 characters, letters only</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
            <small>Valid email with proper domain (e.g., user@company.com)</small>
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              className={`form-control ${errors.phone ? 'error' : ''}`}
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
              required
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
            <small>Exactly 10 digits, starting with 6-9</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Subjects (select from existing subjects)</label>
            {loadingSubjects ? (
              <div className="loading-subjects">Loading subjects...</div>
            ) : availableSubjects.length === 0 ? (
              <div className="no-subjects-warning">
                <p>⚠️ No subjects available. Please add subjects first.</p>
                <small>Go to Subjects page to add subjects before assigning trainers.</small>
              </div>
            ) : (
              <>
                <select
                  multiple
                  name="subjects"
                  className={`form-control multi-select ${errors.subjects ? 'error' : ''}`}
                  value={formData.subjects}
                  onChange={handleSubjectChange}
                  size="5"
                >
                  {availableSubjects.map((subject) => (
                    <option key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectId} - {subject.name}
                    </option>
                  ))}
                </select>
                {errors.subjects && <span className="error-text">{errors.subjects}</span>}
                <small>Hold Ctrl/Cmd to select multiple subjects</small>
              </>
            )}
          </div>

          <div className="form-group">
            <label>Experience (years)</label>
            <input
              type="number"
              name="experience"
              className={`form-control ${errors.experience ? 'error' : ''}`}
              placeholder="5"
              min="0"
              max="50"
              value={formData.experience}
              onChange={handleChange}
            />
            {errors.experience && <span className="error-text">{errors.experience}</span>}
            <small>0 to 50 years</small>
          </div>
        </div>

        <div className="selected-subjects-preview">
          <strong>Selected Subjects: </strong>
          {formData.subjects.length > 0 ? (
            <div className="selected-tags">
              {formData.subjects.map((subjectId) => {
                const subject = availableSubjects.find(s => s.subjectId === subjectId);
                return (
                  <span key={subjectId} className="selected-tag">
                    {subject?.name || subjectId}
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