// frontend/src/components/Subjects/EditSubject.jsx
import React, { useState, useEffect, useRef } from 'react';
import { updateSubject } from '../../services/subjectService';
import { getAllTrainers } from '../../services/trainerService';
import { getAllModules } from '../../services/moduleService';
import { SUBJECT_LEVELS } from '../../utils/constants';
import { toast } from 'react-toastify';
import MultiSelectDropdown from '../Common/MultiSelectDropdown';

const EditSubject = ({ subject, onSuccess, onCancel }) => {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: subject.name || '',
    description: subject.description || '',
    level: subject.level || 'Beginner',
    trainers: subject.trainers || [],
    modules: subject.modules || []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableTrainers, setAvailableTrainers] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [loadingModules, setLoadingModules] = useState(true);

  useEffect(() => {
    const scrollToTop = () => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const timer = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchAvailableData();
  }, []);

  const fetchAvailableData = async () => {
    try {
      setLoadingTrainers(true);
      setLoadingModules(true);
      
      const [trainersResponse, modulesResponse] = await Promise.all([
        getAllTrainers(),
        getAllModules()
      ]);
      
      setAvailableTrainers(trainersResponse.data || []);
      setAvailableModules(modulesResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load trainers and modules');
    } finally {
      setLoadingTrainers(false);
      setLoadingModules(false);
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

  const handleModulesChange = (selectedModules) => {
    setFormData({
      ...formData,
      modules: selectedModules.map((moduleId, index) => ({
        moduleId,
        order: index + 1
      }))
    });
    
    if (errors.modules) {
      setErrors({
        ...errors,
        modules: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrors({});

    try {
      setLoading(true);

      const subjectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        level: formData.level,
        trainers: formData.trainers,
        modules: formData.modules
      };

      console.log('📤 Updating subject:', subject.subjectId, subjectData);

      await updateSubject(subject.subjectId, subjectData);
      toast.success('Subject updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('❌ Update subject error:', error);
      
      const backendErrors = error.response?.data?.errors || {};
      const errorMessage = error.response?.data?.message || 'Failed to update subject';
      
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

  // Transform modules for dropdown
  const moduleOptions = availableModules.map(module => ({
    id: module.moduleId,
    name: module.name,
    extra: `${module.duration} hours`
  }));

  // Get selected module IDs for MultiSelect
  const selectedModuleIds = formData.modules.map(m => m.moduleId);

  return (
    <div ref={formRef} className="edit-subject-form card">
      <div className="form-header">
        <h2>✏️ Edit Subject - {subject.subjectId}</h2>
        <p className="form-subtitle">Update the subject details, assign trainers, and manage modules</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Subject ID</label>
            <input
              type="text"
              className="form-control"
              value={subject.subjectId}
              readOnly
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small className="input-hint">Cannot be changed</small>
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
            <small className="input-hint">3-100 characters</small>
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            className={`form-control ${errors.description ? 'error' : ''}`}
            placeholder="Learn React from scratch..."
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

        <div className="form-group">
          <label>Level *</label>
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

        <div className="form-group">
          <label className="section-label">👨‍🏫 Assign Trainers</label>
          {loadingTrainers ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <span>Loading trainers...</span>
            </div>
          ) : (
            <MultiSelectDropdown
              label="Select Trainers (Optional)"
              options={trainerOptions}
              selectedValues={formData.trainers}
              onChange={handleTrainersChange}
              placeholder="Search and select trainers..."
              error={errors.trainers}
              searchable={true}
            />
          )}
          <small className="input-hint">Trainers who will teach this subject</small>
        </div>

        <div className="form-group">
          <label className="section-label">📦 Assign Modules</label>
          {loadingModules ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <span>Loading modules...</span>
            </div>
          ) : (
            <MultiSelectDropdown
              label="Select Modules (Optional)"
              options={moduleOptions}
              selectedValues={selectedModuleIds}
              onChange={handleModulesChange}
              placeholder="Search and select modules..."
              error={errors.modules}
              searchable={true}
            />
          )}
          <small className="input-hint">Modules included in this subject (order will be preserved)</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Updating Subject...
              </>
            ) : (
              '✓ Update Subject'
            )}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            ✕ Cancel
          </button>
        </div>
      </form>

      <style jsx>{`
        .edit-subject-form {
          scroll-margin-top: 20px;
        }

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

        .section-label {
          font-size: 1rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.75rem;
          display: block;
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

export default EditSubject;