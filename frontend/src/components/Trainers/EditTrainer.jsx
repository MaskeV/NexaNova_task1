// frontend/src/components/Trainers/EditTrainer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { updateTrainer } from '../../services/trainerService';
import { getAllSubjects } from '../../services/subjectService';
import { toast } from 'react-toastify';

const EditTrainer = ({ trainer, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: trainer.name || '',
    email: trainer.email || '',
    phone: trainer.phone || '',
    subjects: trainer.subjects || [],
    experience: trainer.experience || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchAvailableSubjects();
    
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
      const response = await getAllSubjects();
      setAvailableSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

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
    
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    try {
      setLoading(true);

      const trainerData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        subjects: formData.subjects,
        experience: parseInt(formData.experience) || 0
      };

      await updateTrainer(trainer.empId, trainerData);
      toast.success('Trainer updated successfully!');
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update trainer';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-trainer-form card">
      <h2>Edit Trainer - {trainer.empId}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="Ram Kale"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="ram@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
        </div>

        <div className="form-row">
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
          </div>
        </div>

        <div className="form-group" ref={dropdownRef}>
          <label>Subjects</label>
          {loadingSubjects ? (
            <div className="loading-subjects">Loading subjects...</div>
          ) : (
            <>
              <div 
                className={`custom-dropdown ${dropdownOpen ? 'open' : ''}`}
                onClick={toggleDropdown}
              >
                <div className="dropdown-selected">
                  {formData.subjects.length === 0 
                    ? <span className="placeholder">Click to select subjects</span>
                    : <span className="selected-count">{formData.subjects.length} subject(s) selected</span>
                  }
                  <span className={`dropdown-arrow ${dropdownOpen ? 'up' : 'down'}`}>
                    {dropdownOpen ? '▲' : '▼'}
                  </span>
                </div>
                
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-title">Select Subjects</div>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
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
            {loading ? 'Updating...' : 'Update Trainer'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTrainer;