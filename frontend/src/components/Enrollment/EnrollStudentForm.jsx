// frontend/src/components/Enrollment/EnrollStudentForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import MultiSelectDropdown from '../Common/MultiSelectDropdown';
import { FaUserGraduate } from 'react-icons/fa';

const EnrollStudentForm = ({ subjects, onSubmit, onCancel }) => {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [formData, setFormData] = useState({
    studentIds: [],
    courseId: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      // Get all users with 'user' role (students)
      const response = await api.get('/auth/users'); // You'll need to create this endpoint
      
      // For now, we'll create a mock request or use a different approach
      // Since we don't have a users endpoint, we'll need to add one or use existing enrollments
      
      // Mock for demonstration - in production, fetch from backend
      setStudents([]);
    } catch (error) {
      console.error('Error fetching students:', error);
      // For now, allow manual student ID entry
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStudentsChange = (selectedIds) => {
    setFormData(prev => ({
      ...prev,
      studentIds: selectedIds
    }));
    
    if (errors.studentIds) {
      setErrors(prev => ({
        ...prev,
        studentIds: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.studentIds.length === 0) {
      newErrors.studentIds = 'Please select at least one student';
    }
    
    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  // For manual student ID entry when we don't have students list
  const [manualStudentId, setManualStudentId] = useState('');

  const handleAddManualStudent = () => {
    if (manualStudentId.trim()) {
      setFormData(prev => ({
        ...prev,
        studentIds: [...prev.studentIds, manualStudentId.trim()]
      }));
      setManualStudentId('');
    }
  };

  const handleRemoveStudent = (id) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.filter(sid => sid !== id)
    }));
  };

  return (
    <div className="enroll-student-form card">
      <div className="form-header">
        <FaUserGraduate size={24} color="#667eea" />
        <h3>Enroll Student(s) in Course</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Course *</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className={`form-control ${errors.courseId ? 'error' : ''}`}
            disabled={loading}
            required
          >
            <option value="">Choose a course...</option>
            {subjects.map(subject => (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.name} ({subject.subjectId}) - {subject.level}
              </option>
            ))}
          </select>
          {errors.courseId && <span className="error-text">{errors.courseId}</span>}
        </div>

        <div className="form-group">
          <label>Student ID(s) *</label>
          <p className="form-hint">Enter MongoDB ObjectId of student(s) to enroll</p>
          
          <div className="manual-student-input">
            <input
              type="text"
              value={manualStudentId}
              onChange={(e) => setManualStudentId(e.target.value)}
              className="form-control"
              placeholder="Enter student MongoDB ID (e.g., 507f1f77bcf86cd799439011)"
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddManualStudent}
              disabled={loading || !manualStudentId.trim()}
            >
              Add
            </button>
          </div>
          {errors.studentIds && <span className="error-text">{errors.studentIds}</span>}
        </div>

        {formData.studentIds.length > 0 && (
          <div className="selected-students">
            <strong>Selected Students ({formData.studentIds.length}):</strong>
            <div className="student-chips">
              {formData.studentIds.map(id => (
                <div key={id} className="student-chip">
                  <span>{id}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(id)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="info-box">
          <p>
            ℹ️ <strong>Note:</strong> You need the MongoDB ObjectId of students to enroll them. 
            Students can find their ID in their profile or you can use the database.
          </p>
          <p>
            For bulk enrollment, add multiple student IDs one by one.
          </p>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || formData.studentIds.length === 0 || !formData.courseId}
          >
            {loading ? 'Enrolling...' : '✓ Enroll Student(s)'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollStudentForm;