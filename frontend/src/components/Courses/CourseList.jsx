// frontend/src/components/Courses/CourseList.jsx - REPLACE ENTIRE FILE
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';
import SearchBox from '../Common/SearchBox';
import CourseCard from './CourseCard';
import EditCourseModal from './EditCourseModal';
import { FaPlus } from 'react-icons/fa';

// ✅ Direct URLs - no import from constants to rule out any caching issue
const BASE = 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
    setLoading(true);
    try {
      // ---- 1. Fetch subjects ----
      let rawSubjects = [];
      try {
        console.log('📘 Fetching subjects from:', `${BASE}/subject`);
        const subRes = await axios.get(`${BASE}/subject`, { headers: getAuthHeaders() });
        console.log('📘 Subjects raw response:', subRes.data);
        rawSubjects = subRes.data?.data || [];
        console.log('📘 Subjects count:', rawSubjects.length);
        if (rawSubjects[0]) {
          console.log('📘 First subject:', {
            subjectId: rawSubjects[0].subjectId,
            name: rawSubjects[0].name,
            modules: rawSubjects[0].modules?.length,
          });
        }
      } catch (err) {
        console.error('❌ Subjects fetch error:', err.message, err.response?.data);
      }

      // ---- 2. Build subjects map ----
      const subjectsMap = {};
      rawSubjects.forEach(s => {
        subjectsMap[s.subjectId] = s;
      });
      console.log('🗺️ Subjects map keys:', Object.keys(subjectsMap));

      // ---- 3. Fetch courses ----
      let rawCourses = [];
      try {
        console.log('📚 Fetching courses from:', `${BASE}/courses`);
        const courseRes = await axios.get(`${BASE}/courses`, { headers: getAuthHeaders() });
        rawCourses = courseRes.data?.data || [];
        console.log('📚 Courses count:', rawCourses.length);
        if (rawCourses[0]) {
          console.log('📚 First course subjects array:', rawCourses[0].subjects);
        }
      } catch (err) {
        console.error('❌ Courses fetch error:', err.message, err.response?.data);
        toast.error('Failed to load courses');
      }

      // ---- 4. Enrich courses with full subject+module data ----
      const enriched = rawCourses.map(course => {
        const enrichedSubjects = (course.subjects || []).map((ref, idx) => {
          const full = subjectsMap[ref.subjectId];
          console.log(`  🔍 Course ${course.courseId} → subject ${ref.subjectId}:`, full ? `✅ "${full.name}"` : '❌ NOT IN MAP');

          if (!full) {
            return {
              subjectId: ref.subjectId,
              sequenceOrder: ref.order ?? idx + 1,
              name: ref.subjectId,
              description: '',
              level: '',
              modules: [],
              trainers: [],
              totalDuration: 0,
            };
          }

          return {
            subjectId: full.subjectId,
            sequenceOrder: ref.order ?? idx + 1,
            name: full.name,
            description: full.description || '',
            level: full.level || 'Beginner',
            modules: full.modules || [],
            trainers: full.trainers || [],
            totalDuration: full.totalDuration || full.duration || 0,
          };
        });

        enrichedSubjects.sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0));

        return { ...course, subjects: enrichedSubjects };
      });

      console.log('✅ Final enriched courses:', enriched.length);
      setCourses(enriched);
      setSubjects(rawSubjects);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => { setEditingCourse(course); setShowModal(true); };
  const handleCreate = () => { setEditingCourse(null); setShowModal(true); };

  const handleSave = async (courseData) => {
    try {
      const payload = {
        name: courseData.name,
        description: courseData.description,
        duration: parseInt(courseData.duration),
        level: courseData.level,
        category: courseData.category || 'Other',
        subjects: courseData.subjects.map(s => ({
          subjectId: s.subjectId,
          order: s.sequenceOrder ?? 0,
        })),
      };

      if (editingCourse) {
        await axios.put(`${BASE}/courses/${editingCourse.courseId}`, payload, { headers: getAuthHeaders() });
        toast.success('Course updated successfully!');
      } else {
        await axios.post(`${BASE}/courses`, { ...payload, courseId: courseData.courseId }, { headers: getAuthHeaders() });
        toast.success('Course created successfully!');
      }
      setShowModal(false);
      setEditingCourse(null);
      fetchData();
    } catch (error) {
      console.error('Save course error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`${BASE}/courses/${courseId}`, { headers: getAuthHeaders() });
      toast.success('Course deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(course => {
    const s = searchTerm.toLowerCase();
    return (
      course.name?.toLowerCase().includes(s) ||
      course.courseId?.toLowerCase().includes(s) ||
      course.description?.toLowerCase().includes(s)
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
            placeholder="Search courses..."
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
          subjects={subjects}
          onClose={() => { setShowModal(false); setEditingCourse(null); }}
          onSave={handleSave}
        />
      )}

      <style jsx>{`
        .courses-list-page { padding: 2rem 0; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-header h1 { margin: 0 0 0.5rem 0; }
        .page-header p { margin: 0; color: #666; }
        .btn { padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.5rem; }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
        .search-section { margin-bottom: 2rem; }
        .search-results { margin-top: 0.75rem; color: #666; font-size: 0.95rem; font-weight: 500; }
        .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 2rem; }
        .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; }
        .empty-state h3 { color: #666; margin-bottom: 0.5rem; }
        .empty-state p { color: #999; margin-bottom: 1.5rem; }
        @media (max-width: 768px) { .page-header { flex-direction: column; align-items: stretch; } .courses-grid { grid-template-columns: 1fr; gap: 1.5rem; } }
      `}</style>
    </div>
  );
};

export default CourseList;