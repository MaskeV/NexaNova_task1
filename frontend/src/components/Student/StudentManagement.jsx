// frontend/src/components/Student/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllStudents, bulkUploadStudents, updateStudentStatus, deleteStudent } from '../../services/studentService';
import Loading from '../Common/Loading';
import SearchBox from '../Common/SearchBox';
import BulkUploadModal from './Bulkuploadstudents ';
import { FaUpload, FaUsers, FaUserCheck, FaUserSlash, FaTrash, FaDownload } from 'react-icons/fa';
import '../../styles/pages/StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getAllStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (results) => {
    toast.success(`${results.successful.length} students uploaded successfully!`);
    if (results.failed.length > 0) {
      toast.warning(`${results.failed.length} students failed to upload`);
    }
    setShowUploadModal(false);
    fetchStudents();
  };

  const handleToggleStatus = async (studentId, currentStatus) => {
    try {
      await updateStudentStatus(studentId, !currentStatus);
      toast.success(`Student ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to update student status');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This will also remove all their enrollments.')) {
      return;
    }

    try {
      await deleteStudent(studentId);
      toast.success('Student deleted successfully!');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'username,email,password\nstudent1,student1@example.com,password123\nstudent2,student2@example.com,password456';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && student.isActive) ||
      (filterStatus === 'inactive' && !student.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: students.length,
    active: students.filter(s => s.isActive).length,
    inactive: students.filter(s => !s.isActive).length
  };

  if (loading) return <Loading message="Loading students..." />;

  return (
    <div className="student-management">
      <div className="page-header">
        <div>
          <h1>👥 Student Management</h1>
          <p>Manage student accounts and bulk upload</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={downloadTemplate}>
            <FaDownload /> Download Template
          </button>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            <FaUpload /> Bulk Upload Students
          </button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaUsers size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FaUserCheck size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">
            <FaUserSlash size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactive}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
      </div>

      <div className="filters-section card">
        <SearchBox
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username or email..."
        />
        <div className="status-filters">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({students.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Active ({stats.active})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterStatus('inactive')}
          >
            Inactive ({stats.inactive})
          </button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="empty-state card">
          <FaUsers size={60} color="#ccc" />
          <h3>No students found</h3>
          <p>{searchTerm ? 'Try adjusting your search' : 'Upload students to get started'}</p>
        </div>
      ) : (
        <div className="students-table card">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Enrollments</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student._id}>
                  <td>
                    <div className="student-name">
                      <span className="avatar">{student.username?.charAt(0).toUpperCase()}</span>
                      <strong>{student.username}</strong>
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>
                    <span className={`status-badge ${student.isActive ? 'active' : 'inactive'}`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{student.enrollmentCount || 0}</td>
                  <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className={`btn-icon ${student.isActive ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(student._id, student.isActive)}
                        title={student.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {student.isActive ? <FaUserSlash size={14} /> : <FaUserCheck size={14} />}
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDeleteStudent(student._id)}
                        title="Delete student"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showUploadModal && (
        <BulkUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default StudentManagement;