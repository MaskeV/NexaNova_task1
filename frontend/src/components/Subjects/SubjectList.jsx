// src/components/Subjects/SubjectList.jsx
import React, { useState, useEffect } from 'react';
import { getAllSubjects } from '../../services/subjectService';
import { toast } from 'react-toastify';
import Loading from '../Common/Loading';
import SubjectCard from './SubjectCard';
import AddSubject from './AddSubject';
import '../../styles/pages/Subject.css';

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Subject'}
        </button>
      </div>

      {showAddForm && (
        <AddSubject 
          onSuccess={handleSubjectAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {subjects.length === 0 ? (
        <div className="empty-state">
          <h3>No subjects found</h3>
          <p>Click "Add Subject" to create your first subject</p>
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