// frontend/src/components/Enrollment/BulkEnrollSelected.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllStudents } from '../../services/studentService';
import { bulkEnrollStudents } from '../../services/enrollmentService';
import { FaCheckSquare, FaSquare, FaSearch, FaTimes, FaUsers } from 'react-icons/fa';

const BulkEnrollSelected = ({ courses, onSuccess, onCancel }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getAllStudents();
      setStudents(response.data || []);
      setFilteredStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      // Deselect all
      setSelectedStudents(new Set());
    } else {
      // Select all filtered students
      const newSelected = new Set(selectedStudents);
      filteredStudents.forEach(student => {
        newSelected.add(student._id || student.id);
      });
      setSelectedStudents(newSelected);
    }
  };

  const handleSelectStudent = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleEnroll = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    // Get selected student emails
    const selectedEmails = students
      .filter(student => selectedStudents.has(student._id || student.id))
      .map(student => student.email);

    setEnrolling(true);
    try {
      const response = await bulkEnrollStudents({
        studentEmails: selectedEmails,
        courseId: selectedCourse
      });

      const { successful, failed } = response.data;
      
      if (successful.length > 0) {
        toast.success(`Successfully enrolled ${successful.length} student(s)`);
      }
      if (failed.length > 0) {
        failed.forEach(f => toast.warning(`${f.email}: ${f.reason}`));
      }

      if (successful.length > 0 && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll students');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="bulk-enroll-modal card">
      <div className="modal-header">
        <h3>
          <FaUsers /> Bulk Enroll Students
        </h3>
        <button className="close-btn" onClick={onCancel}>
          <FaTimes />
        </button>
      </div>

      <div className="modal-body">
        {/* Course Selection */}
        <div className="form-group">
          <label>Select Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="form-control"
          >
            <option value="">Choose a course...</option>
            {courses.map(course => (
              <option key={course.courseId || course._id} value={course.courseId || course._id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>

        {/* Search and Select All */}
        <div className="controls">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            className="btn-select-all"
            onClick={handleSelectAll}
          >
            {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? 
              <FaCheckSquare /> : <FaSquare />}
            {selectedStudents.size === filteredStudents.length ? ' Deselect All' : ' Select All'}
          </button>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="loading">Loading students...</div>
        ) : (
          <>
            <div className="students-list">
              <div className="students-header">
                <span>Selected: {selectedStudents.size} / {filteredStudents.length} students</span>
              </div>
              
              {filteredStudents.length === 0 ? (
                <div className="no-students">No students found</div>
              ) : (
                <div className="students-grid">
                  {filteredStudents.map(student => (
                    <div 
                      key={student._id || student.id}
                      className={`student-item ${selectedStudents.has(student._id || student.id) ? 'selected' : ''}`}
                      onClick={() => handleSelectStudent(student._id || student.id)}
                    >
                      <div className="student-checkbox">
                        {selectedStudents.has(student._id || student.id) ? 
                          <FaCheckSquare color="#007bff" /> : <FaSquare />}
                      </div>
                      <div className="student-info">
                        <div className="student-name">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="student-email">{student.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={handleEnroll}
                disabled={!selectedCourse || selectedStudents.size === 0 || enrolling}
              >
                {enrolling ? 'Enrolling...' : `Enroll ${selectedStudents.size} Student(s)`}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={enrolling}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .bulk-enroll-modal {
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #666;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        .form-control {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1rem 0;
          gap: 1rem;
        }
        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 0.5rem;
          background: white;
        }
        .search-box svg {
          margin-right: 0.5rem;
          color: #666;
        }
        .search-input {
          flex: 1;
          border: none;
          outline: none;
        }
        .btn-select-all {
          padding: 0.5rem 1rem;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .students-list {
          margin: 1rem 0;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          max-height: 400px;
          overflow-y: auto;
        }
        .students-header {
          padding: 0.75rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
          font-weight: 500;
        }
        .students-grid {
          max-height: 350px;
          overflow-y: auto;
        }
        .student-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        }
        .student-item:hover {
          background: #f8f9fa;
        }
        .student-item.selected {
          background: #e3f2fd;
        }
        .student-checkbox {
          margin-right: 1rem;
          font-size: 1.25rem;
        }
        .student-info {
          flex: 1;
        }
        .student-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .student-email {
          font-size: 0.85rem;
          color: #666;
        }
        .no-students {
          padding: 2rem;
          text-align: center;
          color: #666;
        }
        .loading {
          padding: 2rem;
          text-align: center;
          color: #666;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default BulkEnrollSelected;