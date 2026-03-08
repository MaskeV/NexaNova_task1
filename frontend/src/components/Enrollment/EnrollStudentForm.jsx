// frontend/src/components/Enrollment/EnrollStudentForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllStudents } from '../../services/enrollmentService';
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
      const response = await getAllStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
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

  // Transform students for dropdown
  const studentOptions = students.map(student => ({
    id: student._id,
    name: student.username,
    extra: student.email
  }));

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
          {loadingStudents ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <span>Loading students...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="no-items-warning">
              <p>⚠️ No students registered yet.</p>
              <small>Students need to register first before they can be enrolled.</small>
            </div>
          ) : (
            <MultiSelectDropdown
              label="Select Students *"
              options={studentOptions}
              selectedValues={formData.studentIds}
              onChange={handleStudentsChange}
              placeholder="Search and select students..."
              error={errors.studentIds}
              searchable={true}
            />
          )}
        </div>

        <div className="info-box">
          <p>
            ℹ️ <strong>Note:</strong> You can select multiple students to enroll them in the same course.
          </p>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || formData.studentIds.length === 0 || !formData.courseId || students.length === 0}
          >
            {loading ? 'Enrolling...' : `✓ Enroll ${formData.studentIds.length} Student(s)`}
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