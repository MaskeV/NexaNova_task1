// src/components/Subjects/SubjectList.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  const formRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Scroll to form when it opens
  useEffect(() => {
    if ((showAddForm || editingSubject) && formRef.current) {
      // Small delay to ensure form is rendered
      setTimeout(() => {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        // Extra scroll to account for fixed navbar
        window.scrollBy({ top: -20, behavior: 'smooth' });
      }, 100);
    }
  }, [showAddForm, editingSubject]);

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
    // Close add form if open
    setShowAddForm(false);
    // Set editing subject (this will trigger scroll in useEffect)
    setEditingSubject(subject);
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
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

  const handleAddNew = () => {
    // Close edit form if open
    setEditingSubject(null);
    // Toggle add form
    setShowAddForm(!showAddForm);
  };

  if (loading) return <Loading message="Loading subjects..." />;

  return (
    <div className="subject-list-container">
      <div className="page-header">
        <div>
          <h1>Subjects ({subjects.length})</h1>
          {!isAdmin && (
            <p className="user-notice">
              ℹ️ Only administrators can add, edit, or delete subjects. View available subjects below.
            </p>
          )}
        </div>
        {isAdmin && (
          <button 
            className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleAddNew}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Subject'}
          </button>
        )}
      </div>

      {/* Form section with ref for scrolling */}
      <div ref={formRef}>
        {showAddForm && isAdmin && !editingSubject && (
          <div className="form-container-wrapper">
            <AddSubject 
              onSuccess={handleSubjectAdded}
              onCancel={handleCancelAdd}
            />
          </div>
        )}

        {editingSubject && isAdmin && (
          <div className="form-container-wrapper">
            <EditSubject
              subject={editingSubject}
              onSuccess={handleSubjectUpdated}
              onCancel={handleCancelEdit}
            />
          </div>
        )}
      </div>

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

      <style jsx>{`
        .form-container-wrapper {
          margin-bottom: 2rem;
          animation: slideDown 0.3s ease-out;
          scroll-margin-top: 80px; /* Account for fixed navbar */
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-notice {
          color: #666;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default SubjectList;