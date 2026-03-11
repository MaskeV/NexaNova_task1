// frontend/src/components/Courses/EditCourseModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaEdit, FaSave, FaUsers, FaLayerGroup } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllSubjects, updateSubject } from '../../services/subjectService';
import { getAllTrainers } from '../../services/trainerService';
import { getAllModules } from '../../services/moduleService';

const EditCourseModal = ({ course, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    description: '',
    duration: '',
    level: 'Beginner',
    subjects: []
  });
  const [allSubjects, setAllSubjects] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [subjectFormData, setSubjectFormData] = useState(null);

  useEffect(() => {
    fetchData();
    if (course) {
      setFormData({
        name: course.name || '',
        courseId: course.courseId || '',
        description: course.description || '',
        duration: course.duration || '',
        level: course.level || 'Beginner',
        subjects: course.subjects?.map((sub, idx) => ({
          subjectId: sub.subjectId,
          sequenceOrder: sub.order || idx + 1
        })) || []
      });
    }
  }, [course]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [subjectsRes, trainersRes, modulesRes] = await Promise.all([
        getAllSubjects(),
        getAllTrainers(),
        getAllModules()
      ]);
      
      setAllSubjects(subjectsRes.data || []);
      setAllTrainers(trainersRes.data || []);
      setAllModules(modulesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSubject = (subjectId) => {
    const subject = allSubjects.find(s => s.subjectId === subjectId);
    if (!subject) return;

    const alreadyAdded = formData.subjects.find(s => s.subjectId === subjectId);
    if (alreadyAdded) {
      toast.warning('Subject already added to course');
      return;
    }

    setFormData(prev => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        {
          subjectId: subject.subjectId,
          sequenceOrder: prev.subjects.length + 1
        }
      ]
    }));
  };

  const removeSubject = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects
        .filter(s => s.subjectId !== subjectId)
        .map((s, idx) => ({
          ...s,
          sequenceOrder: idx + 1
        }))
    }));
  };

  const moveSubject = (index, direction) => {
    const newSubjects = [...formData.subjects];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newSubjects.length) return;

    [newSubjects[index], newSubjects[newIndex]] = [newSubjects[newIndex], newSubjects[index]];
    
    setFormData(prev => ({
      ...prev,
      subjects: newSubjects.map((s, idx) => ({
        ...s,
        sequenceOrder: idx + 1
      }))
    }));
  };

  const handleEditSubject = (subjectId) => {
    const subject = allSubjects.find(s => s.subjectId === subjectId);
    if (!subject) return;

    setEditingSubjectId(subjectId);
    setSubjectFormData({
      subjectId: subject.subjectId,
      name: subject.name,
      description: subject.description,
      level: subject.level,
      trainers: subject.trainers?.map(t => t.empId || t) || [],
      modules: subject.modules?.map(m => m.moduleId || m) || []
    });
  };

  const handleCancelEditSubject = () => {
    setEditingSubjectId(null);
    setSubjectFormData(null);
  };

  const handleSaveSubject = async () => {
    try {
      const payload = {
        name: subjectFormData.name,
        description: subjectFormData.description,
        level: subjectFormData.level,
        trainers: subjectFormData.trainers,
        modules: subjectFormData.modules.map((moduleId, index) => ({
          moduleId,
          order: index + 1
        }))
      };

      await updateSubject(subjectFormData.subjectId, payload);
      toast.success('Subject updated successfully!');
      
      // Refresh subjects data
      await fetchData();
      
      setEditingSubjectId(null);
      setSubjectFormData(null);
    } catch (error) {
      console.error('Error updating subject:', error);
      toast.error(error.response?.data?.message || 'Failed to update subject');
    }
  };

  const handleSubjectFormChange = (field, value) => {
    setSubjectFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleTrainer = (empId) => {
    setSubjectFormData(prev => {
      const trainers = prev.trainers || [];
      if (trainers.includes(empId)) {
        return { ...prev, trainers: trainers.filter(t => t !== empId) };
      } else {
        return { ...prev, trainers: [...trainers, empId] };
      }
    });
  };

  const toggleModule = (moduleId) => {
    setSubjectFormData(prev => {
      const modules = prev.modules || [];
      if (modules.includes(moduleId)) {
        return { ...prev, modules: modules.filter(m => m !== moduleId) };
      } else {
        return { ...prev, modules: [...modules, moduleId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.courseId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.subjects.length === 0) {
      toast.error('Please add at least one subject to the course');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectDetails = (subjectId) => {
    return allSubjects.find(s => s.subjectId === subjectId);
  };

  if (loadingData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content edit-course-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-course-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{course ? 'Edit Course' : 'Create Course'}</h2>
          <button className="btn-close" onClick={onClose} type="button">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Course Basic Info */}
            <div className="form-section">
              <h3 className="section-title">📚 Course Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Frontend Development Bootcamp"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Course ID *</label>
                  <input
                    type="text"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    placeholder="e.g., CRS01"
                    disabled={!!course}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Course description..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (weeks) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 12"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subjects Section */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">📖 Course Subjects ({formData.subjects.length})</h3>
                {allSubjects.length > 0 && (
                  <select
                    className="add-subject-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        addSubject(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">+ Add Subject</option>
                    {allSubjects
                      .filter(sub => !formData.subjects.find(s => s.subjectId === sub.subjectId))
                      .map(sub => (
                        <option key={sub.subjectId} value={sub.subjectId}>
                          {sub.name} ({sub.subjectId})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {formData.subjects.length === 0 ? (
                <div className="empty-state">
                  <p>No subjects added yet. Use the dropdown above to add subjects.</p>
                </div>
              ) : (
                <div className="subjects-list">
                  {formData.subjects.map((subject, index) => {
                    const details = getSubjectDetails(subject.subjectId);
                    const isEditing = editingSubjectId === subject.subjectId;
                    
                    return (
                      <div key={subject.subjectId} className={`subject-item ${isEditing ? 'editing' : ''}`}>
                        {isEditing && subjectFormData ? (
                          // Edit Mode
                          <div className="subject-edit-form">
                            <div className="subject-edit-header">
                              <h4>✏️ Editing: {subjectFormData.name}</h4>
                              <div className="edit-actions">
                                <button
                                  type="button"
                                  className="btn-save"
                                  onClick={handleSaveSubject}
                                >
                                  <FaSave /> Save Changes
                                </button>
                                <button
                                  type="button"
                                  className="btn-cancel"
                                  onClick={handleCancelEditSubject}
                                >
                                  <FaTimes /> Cancel
                                </button>
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Subject Name</label>
                              <input
                                type="text"
                                value={subjectFormData.name}
                                onChange={(e) => handleSubjectFormChange('name', e.target.value)}
                                placeholder="Subject name"
                              />
                            </div>

                            <div className="form-group">
                              <label>Description</label>
                              <textarea
                                value={subjectFormData.description}
                                onChange={(e) => handleSubjectFormChange('description', e.target.value)}
                                placeholder="Subject description"
                                rows={3}
                              />
                            </div>

                            <div className="form-group">
                              <label>Level</label>
                              <select
                                value={subjectFormData.level}
                                onChange={(e) => handleSubjectFormChange('level', e.target.value)}
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                              </select>
                            </div>

                            {/* Trainers Selection */}
                            <div className="form-group">
                              <label>
                                <FaUsers /> Assign Trainers ({subjectFormData.trainers.length} selected)
                              </label>
                              <div className="checkbox-list">
                                {allTrainers.length === 0 ? (
                                  <p className="empty-message">No trainers available</p>
                                ) : (
                                  allTrainers.map(trainer => (
                                    <label key={trainer.empId} className="checkbox-item">
                                      <input
                                        type="checkbox"
                                        checked={subjectFormData.trainers.includes(trainer.empId)}
                                        onChange={() => toggleTrainer(trainer.empId)}
                                      />
                                      <span className="checkbox-label">
                                        {trainer.name} ({trainer.empId}) - {trainer.experience} yrs
                                      </span>
                                    </label>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Modules Selection */}
                            <div className="form-group">
                              <label>
                                <FaLayerGroup /> Assign Modules ({subjectFormData.modules.length} selected)
                              </label>
                              <div className="checkbox-list">
                                {allModules.length === 0 ? (
                                  <p className="empty-message">No modules available</p>
                                ) : (
                                  allModules.map(module => (
                                    <label key={module.moduleId} className="checkbox-item">
                                      <input
                                        type="checkbox"
                                        checked={subjectFormData.modules.includes(module.moduleId)}
                                        onChange={() => toggleModule(module.moduleId)}
                                      />
                                      <span className="checkbox-label">
                                        {module.name} ({module.moduleId}) - {module.duration}h
                                      </span>
                                    </label>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="subject-order">{index + 1}</div>
                            <div className="subject-info">
                              <div className="subject-header-row">
                                <div>
                                  <strong>{details?.name || subject.subjectId}</strong>
                                  <span className="subject-id">{subject.subjectId}</span>
                                </div>
                                <button
                                  type="button"
                                  className="btn-edit-subject"
                                  onClick={() => handleEditSubject(subject.subjectId)}
                                  title="Edit subject details, trainers, and modules"
                                >
                                  <FaEdit /> Edit Subject
                                </button>
                              </div>
                              
                              {details?.description && (
                                <p className="subject-desc">{details.description}</p>
                              )}
                              
                              <div className="subject-meta">
                                <span className="meta-badge">
                                  <FaLayerGroup /> {details?.modules?.length || 0} modules
                                </span>
                                <span className="meta-badge">
                                  {details?.totalDuration || details?.duration || 0}h
                                </span>
                                <span className="meta-badge level">
                                  {details?.level}
                                </span>
                                <span className="meta-badge trainers">
                                  <FaUsers /> {details?.trainers?.length || 0} trainers
                                </span>
                              </div>

                              {details?.trainers && details.trainers.length > 0 && (
                                <div className="trainers-list">
                                  <strong>Trainers:</strong>{' '}
                                  {details.trainers.map((t, idx) => (
                                    <span key={idx}>
                                      {t.name || t.empId}
                                      {idx < details.trainers.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="subject-actions">
                              <button
                                type="button"
                                className="btn-icon"
                                onClick={() => moveSubject(index, 'up')}
                                disabled={index === 0}
                                title="Move up"
                              >
                                <FaArrowUp />
                              </button>
                              <button
                                type="button"
                                className="btn-icon"
                                onClick={() => moveSubject(index, 'down')}
                                disabled={index === formData.subjects.length - 1}
                                title="Move down"
                              >
                                <FaArrowDown />
                              </button>
                              <button
                                type="button"
                                className="btn-icon btn-danger"
                                onClick={() => removeSubject(subject.subjectId)}
                                title="Remove from course"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || formData.subjects.length === 0 || editingSubjectId !== null}
            >
              {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          overflow-y: auto;
        }

        .edit-course-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          margin: auto;
        }

        .loading-container {
          padding: 4rem 2rem;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 2px solid #f0f0f0;
          flex-shrink: 0;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #f0f0f0;
          color: #333;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
          max-height: calc(90vh - 180px);
        }

        .modal-body::-webkit-scrollbar {
          width: 10px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 5px;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 5px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .form-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .section-title {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .add-subject-select {
          padding: 0.5rem 1rem;
          border: 2px solid #667eea;
          border-radius: 6px;
          background: white;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 200px;
        }

        .add-subject-select:hover {
          background: #667eea;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #666;
          background: white;
          border-radius: 8px;
        }

        .subjects-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .subject-item {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: white;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
          align-items: flex-start;
          transition: all 0.3s;
        }

        .subject-item.editing {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .subject-order {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .subject-info {
          flex: 1;
          min-width: 0;
        }

        .subject-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .subject-info strong {
          display: block;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .subject-id {
          font-family: monospace;
          font-size: 0.8rem;
          color: #667eea;
          background: #f0f4ff;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          display: inline-block;
          margin-left: 0.5rem;
        }

        .subject-desc {
          color: #666;
          font-size: 0.85rem;
          margin: 0.5rem 0;
        }

        .subject-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.75rem;
        }

        .meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.6rem;
          background: #f0f0f0;
          border-radius: 4px;
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }

        .meta-badge.level {
          background: #e8f5e9;
          color: #2e7d32;
          font-weight: 600;
        }

        .meta-badge.trainers {
          background: #d1fae5;
          color: #10b981;
          font-weight: 600;
        }

        .trainers-list {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #f0f4ff;
          border-radius: 6px;
          font-size: 0.85rem;
          color: #666;
        }

        .trainers-list strong {
          color: #333;
          margin-right: 0.5rem;
        }

        .btn-edit-subject {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit-subject:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .subject-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .btn-icon {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          padding: 0.5rem;
          cursor: pointer;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-icon:hover:not(:disabled) {
          background: #f0f0f0;
          border-color: #667eea;
          color: #667eea;
        }

        .btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon.btn-danger:hover {
          background: #fee;
          border-color: #e74c3c;
          color: #e74c3c;
        }

        .subject-edit-form {
          width: 100%;
        }

        .subject-edit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e0e0e0;
        }

        .subject-edit-header h4 {
          margin: 0;
          color: #667eea;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-save,
        .btn-cancel {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-save {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-cancel {
          background: #e0e0e0;
          color: #666;
        }

        .btn-cancel:hover {
          background: #d0d0d0;
        }

        .checkbox-list {
          max-height: 200px;
          overflow-y: auto;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          padding: 0.75rem;
          background: white;
        }

        .checkbox-list::-webkit-scrollbar {
          width: 8px;
        }

        .checkbox-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .checkbox-list::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .checkbox-item:hover {
          background: #f8f9fa;
        }

        .checkbox-item input[type="checkbox"] {
          margin-right: 0.75rem;
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .checkbox-label {
          flex: 1;
          color: #333;
          font-size: 0.9rem;
        }

        .empty-message {
          color: #999;
          text-align: center;
          padding: 1rem;
          margin: 0;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 2px solid #f0f0f0;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          flex-shrink: 0;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: #e0e0e0;
          color: #666;
        }

        .btn-secondary:hover {
          background: #d0d0d0;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
          }

          .add-subject-select {
            width: 100%;
          }

          .subject-item {
            flex-direction: column;
          }

          .subject-header-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default EditCourseModal;