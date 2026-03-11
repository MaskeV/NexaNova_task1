// frontend/src/components/Enrollment/EnrollmentManagement.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  getAllEnrollments, 
  enrollStudent, 
  bulkEnrollStudents,
  deleteEnrollment,
  updateEnrollmentStatus
} from '../../services/enrollmentService';
import { getAllCourses } from '../../services/courseServices';
import Loading from '../Common/Loading';
import EnrollStudentForm from './EnrollStudentForm';
import EnrollmentList from './EnrollmentList';
import { FaUserPlus, FaUsers } from 'react-icons/fa';
import '../../styles/pages/Enrollment.css';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, coursesRes] = await Promise.all([
        getAllEnrollments(),
        getAllCourses()
      ]);
      
      console.log('📥 Enrollments:', enrollmentsRes.data);
      console.log('📥 Courses:', coursesRes.data);
      
      setEnrollments(enrollmentsRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async (enrollmentData) => {
    try {
      console.log('📤 Enrollment data being sent:', enrollmentData);
      
      if (enrollmentData.studentEmails && enrollmentData.studentEmails.length > 1) {
        // Bulk enrollment
        const payload = {
          studentEmails: enrollmentData.studentEmails,
          courseId: enrollmentData.courseId
        };
        console.log('📤 Bulk enrollment payload:', payload);
        
        const response = await bulkEnrollStudents(payload);
        console.log('✅ Bulk enrollment response:', response);
        toast.success(`${enrollmentData.studentEmails.length} students enrolled successfully!`);
      } else if (enrollmentData.studentEmails && enrollmentData.studentEmails.length === 1) {
        // Single enrollment
        const payload = {
          studentEmail: enrollmentData.studentEmails[0],
          courseId: enrollmentData.courseId
        };
        console.log('📤 Single enrollment payload:', payload);
        
        const response = await enrollStudent(payload);
        console.log('✅ Single enrollment response:', response);
        toast.success('Student enrolled successfully!');
      } else {
        toast.error('No students selected');
        return;
      }
      
      setShowEnrollForm(false);
      await fetchData();
    } catch (error) {
      console.error('❌ Enrollment error:', error);
      console.error('Error response:', error.response?.data);
      
      const message = error.response?.data?.message || error.message || 'Failed to enroll student';
      toast.error(message);
      
      // Show detailed error in console for debugging
      if (error.response?.data) {
        console.error('Full error details:', JSON.stringify(error.response.data, null, 2));
      }
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
          {courses.map(course => {
            const count = enrollments.filter(e => e.course === course.courseId).length;
            return (
              <option key={course.courseId} value={course.courseId}>
                {course.name} ({count})
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
          courses={courses}
          onDelete={handleDeleteEnrollment}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default EnrollmentManagement;