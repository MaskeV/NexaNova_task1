// frontend/src/components/Courses/EditCourseModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllSubjects } from '../../services/subjectService';

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
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    fetchSubjects();
    if (course) {
      setFormData({
        name: course.name || '',
        courseId: course.courseId || '',
        description: course.description || '',
        duration: course.duration || '',
        level: course.level || 'Beginner',
        subjects: course.subjects?.map((sub, idx) => ({
          subjectId: sub.subjectId,
          sequenceOrder: sub.sequenceOrder || idx + 1,
          modules: sub.modules || []
        })) || []
      });
    }
  }, [course]);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await getAllSubjects();
      setAllSubjects(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
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
          sequenceOrder: prev.subjects.length + 1,
          modules: subject.modules || []
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

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-course-modal">
        <div className="modal-header">
          <h2>{course ? 'Edit Course' : 'Create Course'}</h2>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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

            <div className="subjects-section">
              <div className="section-header">
                <h3>Course Subjects ({formData.subjects.length})</h3>
                {!loadingSubjects && allSubjects.length > 0 && (
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

              {loadingSubjects ? (
                <div className="loading-state">Loading subjects...</div>
              ) : formData.subjects.length === 0 ? (
                <div className="empty-state">
                  <p>No subjects added yet. Use the dropdown above to add subjects.</p>
                </div>
              ) : (
                <div className="subjects-list">
                  {formData.subjects.map((subject, index) => {
                    const details = getSubjectDetails(subject.subjectId);
                    return (
                      <div key={subject.subjectId} className="subject-item">
                        <div className="subject-order">{index + 1}</div>
                        <div className="subject-info">
                          <strong>{details?.name || subject.subjectId}</strong>
                          <span className="subject-id">{subject.subjectId}</span>
                          {details?.description && (
                            <p className="subject-desc">{details.description}</p>
                          )}
                          <div className="subject-meta">
                            <span>{details?.modules?.length || 0} modules</span>
                            <span>{details?.duration || 0}h</span>
                            <span className="level-badge">{details?.level}</span>
                          </div>
                        </div>
                        <div className="subject-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => moveSubject(index, 'up')}
                            disabled={index === 0}
                          >
                            <FaArrowUp />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => moveSubject(index, 'down')}
                            disabled={index === formData.subjects.length - 1}
                          >
                            <FaArrowDown />
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-danger"
                            onClick={() => removeSubject(subject.subjectId)}
                          >
                            <FaTrash />
                          </button>
                        </div>
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
              disabled={loading || formData.subjects.length === 0}
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
        }

        .edit-course-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 2px solid #f0f0f0;
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

        .subjects-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 2px solid #f0f0f0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
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
        }

        .add-subject-select:hover {
          background: #667eea;
          color: white;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #666;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .subjects-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .subject-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
          align-items: flex-start;
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

        .subject-info strong {
          display: block;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .subject-id {
          font-family: monospace;
          font-size: 0.8rem;
          color: #667eea;
          background: white;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .subject-desc {
          color: #666;
          font-size: 0.85rem;
          margin: 0.5rem 0;
        }

        .subject-meta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          font-size: 0.85rem;
          color: #666;
        }

        .subject-meta span {
          background: white;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
        }

        .level-badge {
          font-weight: 600;
          color: #667eea;
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

        .modal-footer {
          padding: 1.5rem;
          border-top: 2px solid #f0f0f0;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
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
            gap: 1rem;
            align-items: stretch;
          }

          .add-subject-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EditCourseModal;