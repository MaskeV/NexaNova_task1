// src/components/Trainers/AddTrainer.jsx
import React, { useState, useEffect } from 'react';
import { addTrainer, getAllTrainers } from '../../services/trainerService';
import { getAllSubjects } from '../../services/subjectService';
import { toast } from 'react-toastify';
import MultiSelectDropdown from '../Common/MultiSelectDropdown';

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

  const handleSubjectsChange = (selectedSubjects) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    try {
      setLoading(true);

      const trainerData = {
        empId: formData.empId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        subjects: formData.subjects,
        experience: parseInt(formData.experience) || 0
      };

      console.log('📤 Submitting trainer data:', trainerData);

      await addTrainer(trainerData);
      toast.success('Trainer added successfully!');
      onSuccess();
    } catch (error) {
      console.error('❌ Add trainer error:', error);
      
      // Extract error message and field-specific errors from backend response
      const backendErrors = error.response?.data?.errors || {};
      const errorMessage = error.response?.data?.message || 'Failed to add trainer';
      
      console.log('🔴 Backend errors:', backendErrors);
      
      // Set field-specific errors
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
        
        // Show toast with first error
        const firstError = Object.values(backendErrors)[0];
        toast.error(firstError);
      } else {
        // Generic error
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Transform subjects for dropdown
  const subjectOptions = availableSubjects.map(subject => ({
    id: subject.subjectId,
    name: subject.name,
    extra: `${subject.level} • ${subject.duration}h`
  }));

  return (
    <div className="add-trainer-form card">
      <div className="form-header">
        <h2>👨‍🏫 Add New Trainer</h2>
        <p className="form-subtitle">Fill in the details below to create a new trainer profile</p>
      </div>

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
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            {errors.empId && <span className="error-text">{errors.empId}</span>}
            <small className="input-hint">✓ Auto-generated in sequence</small>
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="e.g., Ram Kale"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
            <small className="input-hint">3-100 characters, letters only</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="e.g., ram@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
            <small className="input-hint">Valid email with proper domain</small>
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              className={`form-control ${errors.phone ? 'error' : ''}`}
              placeholder="e.g., 9876543210"
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
              required
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
            <small className="input-hint">10 digits, starting with 6-9</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            {loadingSubjects ? (
              <div className="loading-state">
                <div className="spinner-small"></div>
                <span>Loading subjects...</span>
              </div>
            ) : availableSubjects.length === 0 ? (
              <div className="no-items-warning">
                <p>⚠️ No subjects available. Please add subjects first.</p>
                <small>Go to Subjects page to add subjects before assigning trainers.</small>
              </div>
            ) : (
              <MultiSelectDropdown
                label="Subjects * (Required - At least one)"
                options={subjectOptions}
                selectedValues={formData.subjects}
                onChange={handleSubjectsChange}
                placeholder="Search and select subjects..."
                error={errors.subjects}
                searchable={true}
              />
            )}
          </div>

          <div className="form-group">
            <label>Experience (years) *</label>
            <input
              type="number"
              name="experience"
              className={`form-control ${errors.experience ? 'error' : ''}`}
              placeholder="e.g., 5"
              min="1"
              max="50"
              value={formData.experience}
              onChange={handleChange}
              required
            />
            {errors.experience && <span className="error-text">{errors.experience}</span>}
            <small className="required-notice">⚠️ Minimum 1 year required (1-50 years)</small>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Adding Trainer...
              </>
            ) : (
              '✓ Add Trainer'
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

        .required-notice {
          color: #e74c3c;
          font-weight: 600;
          display: block;
          margin-top: 0.25rem;
          font-size: 0.85rem;
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

        .no-items-warning {
          padding: 1rem;
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          color: #856404;
        }

        .no-items-warning p {
          margin: 0 0 0.5rem 0;
          font-weight: 600;
        }

        .no-items-warning small {
          color: #856404;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
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

export default AddTrainer;