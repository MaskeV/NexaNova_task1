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
import { FaUserPlus, FaUsers, FaUpload, FaCheckSquare } from 'react-icons/fa';
import '../../styles/pages/Enrollment.css';

import BulkUploadStudents from './BulkUploadStudents';
import BulkEnrollSelected from './BulkEnrollSelected';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showBulkEnroll, setShowBulkEnroll] = useState(false);

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

      setEnrollments(enrollmentsRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  // EnrollStudentForm now passes { studentEmails, courseId }
  const handleEnrollStudent = async (enrollmentData) => {
    try {
      const { studentEmails, courseId } = enrollmentData;

      if (studentEmails.length > 1) {
        // Bulk enrollment
        const res = await bulkEnrollStudents({ studentEmails, courseId });
        const { successful, failed } = res.data;
        if (successful.length > 0) {
          toast.success(`${successful.length} student(s) enrolled successfully!`);
        }
        if (failed.length > 0) {
          failed.forEach(f => toast.warning(`${f.email}: ${f.reason}`));
        }
      } else {
        // Single enrollment
        await enrollStudent({ studentEmail: studentEmails[0], courseId });
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
    if (!window.confirm('Remove this enrollment?')) return;
    try {
      await deleteEnrollment(enrollmentId);
      toast.success('Enrollment removed successfully!');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove enrollment');
    }
  };

  const handleStatusUpdate = async (enrollmentId, newStatus) => {
    try {
      await updateEnrollmentStatus(enrollmentId, newStatus);
      toast.success('Status updated!');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Filter enrollments by selected course
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
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowBulkUpload(!showBulkUpload);
              setShowBulkEnroll(false);
              setShowEnrollForm(false);
            }}
          >
            <FaUpload /> {showBulkUpload ? 'Cancel Upload' : 'Bulk Upload Students'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowBulkEnroll(!showBulkEnroll);
              setShowBulkUpload(false);
              setShowEnrollForm(false);
            }}
          >
            <FaCheckSquare /> {showBulkEnroll ? 'Cancel' : 'Bulk Enroll Students'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowEnrollForm(!showEnrollForm);
              setShowBulkUpload(false);
              setShowBulkEnroll(false);
            }}
          >
            <FaUserPlus /> {showEnrollForm ? 'Cancel' : 'Enroll Student'}
          </button>
        </div>
      </div>

      {showBulkUpload && (
        <BulkUploadStudents
          onSuccess={() => {
            setShowBulkUpload(false);
            fetchData();
          }}
          onCancel={() => setShowBulkUpload(false)}
        />
      )}

      {showBulkEnroll && (
        <BulkEnrollSelected
          courses={courses}
          onSuccess={() => {
            setShowBulkEnroll(false);
            fetchData();
          }}
          onCancel={() => setShowBulkEnroll(false)}
        />
      )}

      {showEnrollForm && (
        <EnrollStudentForm
          courses={courses}
          onSubmit={handleEnrollStudent}
          onCancel={() => setShowEnrollForm(false)}
        />
      )}

      {/* Filter by Course (using actual courses, not subjects) */}
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
          <p>
            {filterCourse === 'all'
              ? 'Click "Enroll Student" to get started'
              : 'No students enrolled in this course'}
          </p>
        </div>
      ) : (
        // EnrollmentList still takes subjects for display names — we pass courses
        // The courseId stored on enrollment now matches course.courseId
        <EnrollmentList
          enrollments={filteredEnrollments}
          courses={courses}
          onDelete={handleDeleteEnrollment}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      <style jsx>{`
        .header-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default EnrollmentManagement;