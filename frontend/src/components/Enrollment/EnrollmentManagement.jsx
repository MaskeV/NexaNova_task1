// frontend/src/components/Enrollment/EnrollmentManagement.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  getAllEnrollments, 
  enrollStudent, 
  bulkEnrollStudents,
  deleteEnrollment,
  updateEnrollmentStatus,
  getCourseEnrollments
} from '../../services/enrollmentService';
import { getAllSubjects } from '../../services/subjectService';
import { getAllStudents } from '../../services/enrollmentService';
import Loading from '../Common/Loading';
import EnrollStudentForm from './EnrollStudentForm';
import EnrollmentList from './EnrollmentList';
import { FaUserPlus, FaUsers } from 'react-icons/fa';
import '../../styles/pages/Enrollment.css';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, subjectsRes] = await Promise.all([
        getAllEnrollments(),
        getAllSubjects()
      ]);
      
      setEnrollments(enrollmentsRes.data || []);
      setSubjects(subjectsRes.data || []);
      
      // Extract unique students from enrollments
      const uniqueStudents = [];
      const studentIds = new Set();
      
      enrollmentsRes.data.forEach(enrollment => {
        if (enrollment.student && !studentIds.has(enrollment.student._id)) {
          studentIds.add(enrollment.student._id);
          uniqueStudents.push({
            _id: enrollment.student._id,
            username: enrollment.student.username,
            email: enrollment.student.email
          });
        }
      });
      
      setStudents(uniqueStudents);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  // frontend/src/components/Enrollment/EnrollmentManagement.jsx - UPDATE handleEnrollStudent method
const handleEnrollStudent = async (enrollmentData) => {
  try {
    if (enrollmentData.studentEmails && enrollmentData.studentEmails.length > 1) {
      // Bulk enrollment
      await bulkEnrollStudents({
        studentEmails: enrollmentData.studentEmails,
        courseId: enrollmentData.courseId
      });
      toast.success(`${enrollmentData.studentEmails.length} students enrolled successfully!`);
    } else {
      // Single enrollment
      await enrollStudent({
        studentEmail: enrollmentData.studentEmails[0],
        courseId: enrollmentData.courseId
      });
      toast.success('Student enrolled successfully!');
    }
    
    setShowEnrollForm(false);
    await fetchData();
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to enroll student';
    toast.error(message);
  }
};
  const handleDeleteEnrollment = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to remove this enrollment?')) {
      return;
    }

    try {
      await deleteEnrollment(enrollmentId);
      toast.success('Enrollment removed successfully!');
      await fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove enrollment';
      toast.error(message);
    }
  };

  const handleStatusUpdate = async (enrollmentId, newStatus) => {
    try {
      await updateEnrollmentStatus(enrollmentId, newStatus);
      toast.success('Enrollment status updated!');
      await fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
    }
  };

  const filteredEnrollments = filterCourse === 'all' 
    ? enrollments 
    : enrollments.filter(e => e.course === filterCourse);

  if (loading) return <Loading message="Loading enrollments..." />;

  return (
    <div className="enrollment-management">
      <div className="page-header">
        <div>
          <h1>👥 Student Enrollment Management</h1>
          <p>Enroll students in courses and manage their enrollments</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowEnrollForm(!showEnrollForm)}
        >
          <FaUserPlus /> {showEnrollForm ? 'Cancel' : 'Enroll Student'}
        </button>
      </div>

      {showEnrollForm && (
        <EnrollStudentForm
          students={students}
          subjects={subjects}
          onSubmit={handleEnrollStudent}
          onCancel={() => setShowEnrollForm(false)}
        />
      )}

      <div className="enrollment-filters card">
        <label>Filter by Course:</label>
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="form-control"
        >
          <option value="all">All Courses ({enrollments.length})</option>
          {subjects.map(subject => {
            const count = enrollments.filter(e => e.course === subject.subjectId).length;
            return (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.name} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="empty-state card">
          <FaUsers size={60} color="#ccc" />
          <h3>No enrollments found</h3>
          <p>{filterCourse === 'all' ? 'Click "Enroll Student" to get started' : 'No students enrolled in this course'}</p>
        </div>
      ) : (
        <EnrollmentList
          enrollments={filteredEnrollments}
          subjects={subjects}
          onDelete={handleDeleteEnrollment}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default EnrollmentManagement;