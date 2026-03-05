// frontend/src/components/Enrollment/EnrollStudentForm.jsx - REPLACE ENTIRE FILE
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaUserGraduate, FaPlus, FaTimes } from 'react-icons/fa';

const EnrollStudentForm = ({ subjects, onSubmit, onCancel }) => {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [formData, setFormData] = useState({
    studentEmails: [],
    courseId: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      // Fetch all users with student role
      const response = await api.get('/auth/users?role=student');
      setStudents(response.data.data || []);
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

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.studentEmails.includes(email)) {
      toast.warning('This email is already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      studentEmails: [...prev.studentEmails, email]
    }));
    setEmailInput('');
    
    if (errors.studentEmails) {
      setErrors(prev => ({ ...prev, studentEmails: '' }));
    }
  };

  const handleRemoveEmail = (email) => {
    setFormData(prev => ({
      ...prev,
      studentEmails: prev.studentEmails.filter(e => e !== email)
    }));
  };

  const handleSelectStudent = (e) => {
    const email = e.target.value;
    if (email && !formData.studentEmails.includes(email)) {
      setFormData(prev => ({
        ...prev,
        studentEmails: [...prev.studentEmails, email]
      }));
      e.target.value = '';
      
      if (errors.studentEmails) {
        setErrors(prev => ({ ...prev, studentEmails: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.studentEmails.length === 0) {
      newErrors.studentEmails = 'Please add at least one student email';
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
          <label>Student Email(s) *</label>
          
          {/* Quick select from existing students */}
          {!loadingStudents && students.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#666' }}>Quick Select:</label>
              <select
                onChange={handleSelectStudent}
                className="form-control"
                disabled={loading}
              >
                <option value="">Select from registered students...</option>
                {students
                  .filter(s => !formData.studentEmails.includes(s.email))
                  .map(student => (
                    <option key={student._id} value={student.email}>
                      {student.username} ({student.email})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Manual email input */}
          <div className="manual-student-input">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddEmail();
                }
              }}
              className="form-control"
              placeholder="Enter student email (e.g., student@example.com)"
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddEmail}
              disabled={loading || !emailInput.trim()}
            >
              <FaPlus /> Add
            </button>
          </div>
          {errors.studentEmails && <span className="error-text">{errors.studentEmails}</span>}
          <small className="form-hint">
            Add student emails one by one or select from registered students
          </small>
        </div>

        {formData.studentEmails.length > 0 && (
          <div className="selected-students">
            <strong>Selected Students ({formData.studentEmails.length}):</strong>
            <div className="student-chips">
              {formData.studentEmails.map(email => (
                <div key={email} className="student-chip">
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    disabled={loading}
                    title="Remove"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="info-box">
          <p>
            ℹ️ <strong>Note:</strong> Enter student email addresses to enroll them. 
            Students must be registered in the system with the 'student' role.
          </p>
          <p>
            You can add multiple students at once for bulk enrollment.
          </p>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || formData.studentEmails.length === 0 || !formData.courseId}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Enrolling...
              </>
            ) : (
              <>✓ Enroll {formData.studentEmails.length} Student{formData.studentEmails.length !== 1 ? 's' : ''}</>
            )}
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
        .form-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .form-header h3 {
          margin: 0;
          color: #333;
        }

        .form-hint {
          display: block;
          margin-top: 0.5rem;
          color: #666;
          font-size: 0.85rem;
        }

        .manual-student-input {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .manual-student-input .form-control {
          flex: 1;
        }

        .manual-student-input .btn {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .selected-students {
          margin-top: 1.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
          border-radius: 8px;
          border: 2px solid #667eea;
        }

        .selected-students strong {
          display: block;
          margin-bottom: 1rem;
          color: #333;
          font-size: 1rem;
        }

        .student-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .student-chip {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          transition: all 0.2s ease;
        }

        .student-chip:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .student-chip button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          transition: background-color 0.2s ease;
        }

        .student-chip button:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .info-box {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 1rem;
          border-radius: 4px;
          margin-top: 1.5rem;
        }

        .info-box p {
          margin: 0.5rem 0;
          color: #0d47a1;
          font-size: 0.9rem;
        }

        .info-box strong {
          color: #1565c0;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .manual-student-input {
            flex-direction: column;
          }

          .manual-student-input .btn {
            width: 100%;
          }

          .student-chips {
            flex-direction: column;
          }

          .student-chip {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default EnrollStudentForm;