// frontend/src/components/Courses/CourseList.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllCourses, deleteCourse, createCourse, updateCourse } from '../../services/courseServices';
import { getAllSubjects } from '../../services/subjectService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';
import SearchBox from '../Common/SearchBox';
import CourseCard from './CourseCard';
import EditCourseModal from './EditCourseModal';
import { FaPlus } from 'react-icons/fa';

const CourseList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both courses and subjects
      const [coursesResponse, subjectsResponse] = await Promise.all([
        getAllCourses(),
        getAllSubjects()
      ]);

      console.log('Courses:', coursesResponse.data);
      console.log('Subjects:', subjectsResponse.data);

      const subjectsMap = {};
      (subjectsResponse.data || []).forEach(subject => {
        subjectsMap[subject.subjectId] = subject;
      });

      // Populate courses with full subject data
      const populatedCourses = (coursesResponse.data || []).map(course => {
        const populatedSubjects = (course.subjects || []).map(subjectRef => {
          const fullSubject = subjectsMap[subjectRef.subjectId];
          return {
            subjectId: subjectRef.subjectId,
            sequenceOrder: subjectRef.order,
            name: fullSubject?.name || subjectRef.subjectId,
            description: fullSubject?.description || '',
            level: fullSubject?.level || 'Beginner',
            duration: fullSubject?.duration || 0,
            modules: fullSubject?.modules || []
          };
        }).sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));

        return {
          ...course,
          subjects: populatedSubjects
        };
      });

      setCourses(populatedCourses);
      setSubjects(subjectsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleSave = async (courseData) => {
    try {
      const payload = {
        ...courseData,
        subjects: courseData.subjects.map(s => ({
          subjectId: s.subjectId,
          order: s.sequenceOrder
        }))
      };

      if (editingCourse) {
        await updateCourse(editingCourse.courseId, payload);
        toast.success('Course updated successfully!');
      } else {
        await createCourse(payload);
        toast.success('Course created successfully!');
      }
      setShowModal(false);
      setEditingCourse(null);
      fetchData();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await deleteCourse(courseId);
      toast.success('Course deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(course => {
    const search = searchTerm.toLowerCase();
    return (
      course.name?.toLowerCase().includes(search) ||
      course.courseId?.toLowerCase().includes(search) ||
      course.description?.toLowerCase().includes(search)
    );
  });

  if (loading) return <Loading message="Loading courses..." />;

  return (
    <div className="courses-list-page">
      <div className="page-header">
        <div>
          <h1>📚 Courses ({courses.length})</h1>
          <p>Browse all available courses with their subjects and modules</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleCreate}>
            <FaPlus /> Create Course
          </button>
        )}
      </div>

      {courses.length > 0 && (
        <div className="search-section">
          <SearchBox
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses by name, ID, or description..."
          />
          {searchTerm && (
            <p className="search-results">
              Found {filteredCourses.length} of {courses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {filteredCourses.length === 0 ? (
        <div className="empty-state card">
          <h3>No courses found</h3>
          <p>{searchTerm ? 'Try a different search term' : 'No courses available yet'}</p>
          {isAdmin && !searchTerm && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <FaPlus /> Create First Course
            </button>
          )}
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.courseId}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={isAdmin}
              canDelete={isAdmin}
            />
          ))}
        </div>
      )}

      {showModal && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => {
            setShowModal(false);
            setEditingCourse(null);
          }}
          onSave={handleSave}
        />
      )}

      <style jsx>{`
        .courses-list-page {
          padding: 2rem 0;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-header h1 {
          margin: 0 0 0.5rem 0;
        }

        .page-header p {
          margin: 0;
          color: #666;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .search-section {
          margin-bottom: 2rem;
        }

        .search-results {
          margin-top: 0.75rem;
          color: #666;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 2rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
        }

        .empty-state h3 {
          color: #666;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #999;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .courses-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseList;