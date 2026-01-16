// src/components/Subjects/SubjectList.jsx
import React, { useState, useEffect } from 'react';
import { getAllSubjects } from '../../services/subjectService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Loading from '../Common/Loading';
import SubjectCard from './SubjectCard';
import AddSubject from './AddSubject';
import '../../styles/pages/Subject.css';

const SubjectList = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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

  if (loading) return <Loading message="Loading subjects..." />;

  return (
    <div className="subject-list-container">
      <div className="page-header">
        <h1>Subjects ({subjects.length})</h1>
        {isAdmin && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Subject'}
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="info-banner">
          <p>ℹ️ Only administrators can add new subjects. View available subjects below.</p>
        </div>
      )}

      {showAddForm && isAdmin && (
        <AddSubject 
          onSuccess={handleSubjectAdded}
          onCancel={() => setShowAddForm(false)}
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectList;