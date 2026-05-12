// src/components/Trainers/AddTrainer.jsx - FIXED VERSION WITH DEBUG
import React, { useState, useEffect, useRef } from 'react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    generateEmpId();
    fetchAvailableSubjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAvailableSubjects = async () => {
    try {
      setLoadingSubjects(true);
      console.log('🔍 Fetching subjects...');
      
      const response = await getAllSubjects();
      console.log('📦 Raw API response:', response);
      console.log('📊 Response.data:', response.data);
      
      // ✅ Handle different response formats
      let subjects = [];
      
      if (Array.isArray(response.data)) {
        subjects = response.data;
      } else if (response.data && Array.isArray(response.data.subjects)) {
        subjects = response.data.subjects;
      } else if (response && Array.isArray(response)) {
        subjects = response;
      }
      
      console.log('✅ Processed subjects:', subjects);
      console.log('📏 Number of subjects:', subjects.length);
      
      // Filter out any invalid entries
      const validSubjects = subjects.filter(s => s && s.subjectId && s.name);
      console.log('✅ Valid subjects after filtering:', validSubjects);
      
      setAvailableSubjects(validSubjects);
      
      if (validSubjects.length === 0) {
        console.warn('⚠️ No valid subjects found');
        toast.warning('No subjects available. Please add subjects first.');
      } else {
        console.log(`✅ Loaded ${validSubjects.length} subjects successfully`);
      }
    } catch (error) {
      console.error('❌ Failed to fetch subjects:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      toast.error('Failed to load subjects. Please try again.');
      setAvailableSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const generateEmpId = async () => {
    try {
      const response = await getAllTrainers();
      const trainers = response.data || [];
      
      let maxNum = 0;
      trainers.forEach(trainer => {
        if (trainer.empId) {
          const match = trainer.empId.match(/EMP(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            if (num > maxNum) maxNum = num;
          }
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

  const handleSubjectToggle = (subjectId) => {
    const currentSubjects = [...formData.subjects];
    const index = currentSubjects.indexOf(subjectId);
    
    if (index === -1) {
      currentSubjects.push(subjectId);
    } else {
      currentSubjects.splice(index, 1);
    }
    
    setFormData({
      ...formData,
      subjects: currentSubjects
    });
    
    if (errors.subjects) {
      setErrors({
        ...errors,
        subjects: ''
      });
    }
  };

  const handleSelectAll = () => {
    const allSubjectIds = availableSubjects.map(subject => subject.subjectId);
    setFormData({
      ...formData,
      subjects: allSubjectIds
    });
  };

  const handleClearAll = () => {
    setFormData({
      ...formData,
      subjects: []
    });
  };

  const toggleDropdown = () => {
    if (availableSubjects.length > 0) {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const removeSubject = (subjectId) => {
    const updatedSubjects = formData.subjects.filter(id => id !== subjectId);
    setFormData({
      ...formData,
      subjects: updatedSubjects
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Client-side validation
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.subjects.length === 0) {
      newErrors.subjects = 'At least one subject must be selected';
    }
    if (!formData.experience || parseInt(formData.experience) < 1) {
      newErrors.experience = 'Experience must be at least 1 year';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill all required fields correctly');
      return;
    }

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
          <div className="form-group" ref={dropdownRef}>
            <label>Subjects * (Required - At least one)</label>
            {loadingSubjects ? (
              <div className="loading-state">
                <div className="spinner-small"></div>
                <span>Loading subjects...</span>
              </div>
            ) : availableSubjects.length === 0 ? (
              <div className="no-items-warning">
                <p>⚠️ No subjects available. Please add subjects first.</p>
                <small>Go to Subjects page to add subjects before assigning trainers.</small>
                <button 
                  type="button" 
                  className="btn-retry"
                  onClick={fetchAvailableSubjects}
                  style={{ marginTop: '0.75rem' }}
                >
                  🔄 Retry Loading Subjects
                </button>
              </div>
            ) : (
              <>
                <div 
                  className={`custom-dropdown ${dropdownOpen ? 'open' : ''} ${errors.subjects ? 'error' : ''}`}
                  onClick={toggleDropdown}
                >
                  <div className="dropdown-selected">
                    {formData.subjects.length === 0 
                      ? <span className="placeholder">Click to select subjects ({availableSubjects.length} available)</span>
                      : <span className="selected-count">{formData.subjects.length} subject(s) selected</span>
                    }
                    <span className={`dropdown-arrow ${dropdownOpen ? 'up' : 'down'}`}>
                      {dropdownOpen ? '▲' : '▼'}
                    </span>
                  </div>
                  
                  {dropdownOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <div className="dropdown-title">Select Subjects ({availableSubjects.length} available)</div>
                        <div className="dropdown-actions">
                          <button 
                            type="button" 
                            className="action-btn select-all"
                            onClick={handleSelectAll}
                          >
                            Select All
                          </button>
                          <button 
                            type="button" 
                            className="action-btn clear-all"
                            onClick={handleClearAll}
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      
                      <div className="dropdown-options">
                        {availableSubjects.map((subject) => (
                          <div 
                            key={subject.subjectId} 
                            className={`dropdown-option ${formData.subjects.includes(subject.subjectId) ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubjectToggle(subject.subjectId);
                            }}
                          >
                            <div className="option-checkbox">
                              <input
                                type="checkbox"
                                checked={formData.subjects.includes(subject.subjectId)}
                                onChange={() => {}}
                                className="checkbox"
                              />
                            </div>
                            <div className="option-content">
                              <div className="option-id">{subject.subjectId}</div>
                              <div className="option-name">{subject.name}</div>
                              <div className="option-extra">
                                {subject.level && `${subject.level}`}
                                {subject.duration && ` • ${subject.duration}h`}
                                {subject.totalDuration && ` • ${subject.totalDuration}h`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {errors.subjects && <span className="error-text">{errors.subjects}</span>}
              </>
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

        {formData.subjects.length > 0 && (
          <div className="selected-subjects-preview">
            <div className="preview-header">
              <strong>Selected Subjects ({formData.subjects.length})</strong>
              <button 
                type="button" 
                className="clear-preview-btn"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
            <div className="selected-tags">
              {formData.subjects.map((subjectId) => {
                const subject = availableSubjects.find(s => s.subjectId === subjectId);
                return (
                  <span key={subjectId} className="selected-tag">
                    {subject?.name || subjectId}
                    <button 
                      type="button" 
                      className="remove-tag-btn"
                      onClick={() => removeSubject(subjectId)}
                      title="Remove"
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
          display: block;
        }

        .btn-retry {
          padding: 0.5rem 1rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .btn-retry:hover {
          background: #5568d3;
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