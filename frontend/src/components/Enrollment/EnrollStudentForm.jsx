// frontend/src/components/Enrollment/EnrollStudentForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllStudents } from '../../services/enrollmentService';
import { getAllCourses } from '../../services/courseServices';
import MultiSelectDropdown from '../Common/MultiSelectDropdown';
import { FaUserGraduate } from 'react-icons/fa';

const EnrollStudentForm = ({ onSubmit, onCancel }) => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [formData, setFormData] = useState({
    studentIds: [],
    courseId: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await getAllStudents();
      console.log('📥 Fetched students:', response.data);
      setStudents(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      toast.error('Failed to load students');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await getAllCourses();
      console.log('📥 Fetched courses:', response.data);
      setCourses(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      toast.error('Failed to load courses');
      setCourses([]);
    } finally {
      setLoadingCourses(false);
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
      // Convert student IDs to emails for enrollment
      const selectedStudents = students.filter(s => formData.studentIds.includes(s._id));
      const studentEmails = selectedStudents.map(s => s.email);
      
      console.log('📤 Enrolling students:', {
        studentEmails,
        courseId: formData.courseId,
        studentCount: studentEmails.length
      });

      await onSubmit({
        studentEmails,
        courseId: formData.courseId
      });

      // Reset form on success
      setFormData({
        studentIds: [],
        courseId: ''
      });
    } catch (error) {
      console.error('❌ Enrollment submission error:', error);
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
          {loadingCourses ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <span>Loading courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="no-items-warning">
              <p>⚠️ No courses available.</p>
              <small>Please create courses first before enrolling students.</small>
            </div>
          ) : (
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className={`form-control ${errors.courseId ? 'error' : ''}`}
              disabled={loading}
              required
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course.courseId} value={course.courseId}>
                  {course.name} ({course.courseId}) - {course.level} - {course.duration} weeks
                </option>
              ))}
            </select>
          )}
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
            disabled={loading || formData.studentIds.length === 0 || !formData.courseId || students.length === 0 || courses.length === 0}
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

      <style jsx>{`
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
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        .info-box {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
        }

        .info-box p {
          margin: 0;
          color: #0d47a1;
        }

        .error-text {
          color: #e74c3c;
          font-size: 0.875rem;
          font-weight: 600;
          display: block;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default EnrollStudentForm;