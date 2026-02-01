// src/components/Subjects/SubjectList.jsx
import React, { useState, useEffect } from 'react';
import { getAllSubjects, deleteSubject } from '../../services/subjectService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Loading from '../Common/Loading';
import SubjectCard from './SubjectCard';
import AddSubject from './AddSubject';
import EditSubject from './EditSubject';
import '../../styles/pages/Subject.css';

const SubjectList = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await getAllSubjects();
      setSubjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch subjects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectAdded = () => {
    setShowAddForm(false);
    fetchSubjects();
    toast.success('Subject added successfully!');
  };

  const handleSubjectUpdated = () => {
    setEditingSubject(null);
    fetchSubjects();
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
  };

  const handleDelete = async (subjectId) => {
    if (!isAdmin) {
      toast.error('Only admins can delete subjects');
      return;
    }

    if (window.confirm('Are you sure you want to delete this subject? This will remove it from all trainers.')) {
      try {
        await deleteSubject(subjectId);
        toast.success('Subject deleted successfully!');
        fetchSubjects();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete subject';
        toast.error(errorMessage);
        console.error(error);
      }
    }
  };

  if (loading) return <Loading message="Loading subjects..." />;

  return (
    <div className="subject-list-container">
      <div className="page-header">
        <h1>Subjects ({subjects.length})</h1>
        {isAdmin && !editingSubject && (
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingSubject(null);
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add Subject'}
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="info-banner">
          <p>ℹ️ Only administrators can add, edit, or delete subjects. View available subjects below.</p>
        </div>
      )}

      {showAddForm && isAdmin && !editingSubject && (
        <AddSubject 
          onSuccess={handleSubjectAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingSubject && isAdmin && (
        <EditSubject
          subject={editingSubject}
          onSuccess={handleSubjectUpdated}
          onCancel={handleCancelEdit}
        />
      )}

      {subjects.length === 0 ? (
        <div className="empty-state">
          <h3>No subjects found</h3>
          <p>{isAdmin ? 'Click "Add Subject" to create your first subject' : 'No subjects available yet'}</p>
        </div>
      ) : (
        <div className="grid">
          {subjects.map((subject) => (
            <SubjectCard 
              key={subject.subjectId}
              subject={subject}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={isAdmin}
              canDelete={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectList;