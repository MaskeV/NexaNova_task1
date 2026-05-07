// frontend/src/pages/ScheduleManagement.jsx - SIMPLIFIED VERSION (No Modules)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaTrash, FaEdit, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';
import '../../styles/pages/ScheduleManagement.css';

const BASE_URL = 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['8AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM'];

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  
  // Data for dropdowns
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [trainers, setTrainers] = useState([]);
  
  // Allocation modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSchedules();
    fetchCourses();
    fetchTrainers();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSubjectsForCourse(selectedCourse);
    } else {
      setSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedCourse]);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/schedule`, getHeaders());
      setSchedules(response.data.data || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/courses`, getHeaders());
      setCourses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchSubjectsForCourse = async (courseId) => {
    try {
      const response = await axios.get(`${BASE_URL}/courses/${courseId}`, getHeaders());
      const courseData = response.data.data;
      
      // Get subjects from the course's populatedSubjects
      const courseSubjects = courseData.populatedSubjects || [];
      setSubjects(courseSubjects);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setSubjects([]);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/trainer`, getHeaders());
      setTrainers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching trainers:', err);
    }
  };

  const fetchScheduleDetails = async (weekId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/schedule/${weekId}`, getHeaders());
      setScheduleData(response.data.data);
      setSelectedSchedule(weekId);
      setError('');
    } catch (err) {
      setError('Failed to load schedule details');
      console.error('Error fetching schedule details:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewSchedule = async () => {
    const weekStart = prompt('Enter week start date (YYYY-MM-DD):');
    if (!weekStart) return;

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/schedule`,
        { weekStartDate: weekStart },
        getHeaders()
      );
      setSuccess('Schedule created successfully!');
      fetchSchedules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create schedule');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (weekId) => {
    if (!window.confirm(`Delete schedule ${weekId}?`)) return;

    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/schedule/${weekId}`, getHeaders());
      setSuccess('Schedule deleted successfully!');
      fetchSchedules();
      if (selectedSchedule === weekId) {
        setSelectedSchedule(null);
        setScheduleData(null);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete schedule');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openAllocationModal = (slot) => {
    setSelectedSlot(slot);
    setSelectedCourse('');
    setSelectedSubject('');
    setSelectedTrainer('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setSelectedCourse('');
    setSelectedSubject('');
    setSelectedTrainer('');
  };

  const allocateSlot = async () => {
    if (!selectedCourse || !selectedSubject || !selectedTrainer) {
      setError('Please select course, subject, and trainer');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${BASE_URL}/schedule/slot/${selectedSlot._id}`,
        {
          weekId: selectedSchedule,
          trainerId: selectedTrainer,
          subjectId: selectedSubject // Backend expects "moduleId" but it's actually subjectId
        },
        getHeaders()
      );
      
      setSuccess('Slot allocated successfully!');
      fetchScheduleDetails(selectedSchedule);
      closeModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate slot');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deallocateSlot = async (slotId) => {
    if (!window.confirm('Deallocate this slot?')) return;

    setLoading(true);
    try {
      await axios.put(
        `${BASE_URL}/schedule/slot/${slotId}/deallocate`,
        { weekId: selectedSchedule },
        getHeaders()
      );
      
      setSuccess('Slot deallocated successfully!');
      fetchScheduleDetails(selectedSchedule);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deallocate slot');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getSlotForDayTime = (day, timeSlot) => {
    if (!scheduleData?.timeSlots) return null;
    return scheduleData.timeSlots.find(
      slot => slot.day === day && slot.timeSlot === timeSlot
    );
  };

  const getSubjectName = (subjectId) => {
    const allSubjects = subjects.length > 0 ? subjects : [];
    const subject = allSubjects.find(s => s.subjectId === subjectId);
    return subject?.name || subjectId;
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.empId === trainerId);
    return trainer?.name || trainerId;
  };

  const getCourseName = (subjectId) => {
    // Find which course contains this subject
    for (const course of courses) {
      if (course.subjects?.some(s => s.subjectId === subjectId)) {
        return course.name;
      }
    }
    return '';
  };

  // Filter trainers who can teach the selected subject
  const getAvailableTrainers = () => {
    if (!selectedSubject) return trainers;
    return trainers.filter(t => t.subjects?.includes(selectedSubject));
  };

  return (
    <div className="schedule-management">
      <div className="page-header">
        <div>
          <h1>
            <FaCalendarAlt /> Schedule Management
          </h1>
          <p>Create and manage weekly schedules</p>
        </div>
        <button className="btn btn-primary" onClick={createNewSchedule} disabled={loading}>
          <FaPlus /> Create New Schedule
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="schedule-container">
        {/* Sidebar - Available Schedules */}
        <div className="schedules-sidebar">
          <h3>
            <FaCalendarAlt /> Available Schedules
          </h3>
          <div className="schedules-list">
            {schedules.length === 0 ? (
              <p className="empty-message">No schedules created yet</p>
            ) : (
              schedules.map(schedule => (
                <div
                  key={schedule.weekId}
                  className={`schedule-item ${selectedSchedule === schedule.weekId ? 'active' : ''}`}
                  onClick={() => fetchScheduleDetails(schedule.weekId)}
                >
                  <div className="schedule-info">
                    <h4>{schedule.weekId}</h4>
                    <p>
                      {new Date(schedule.weekStartDate).toLocaleDateString()} –{' '}
                      {new Date(schedule.weekEndDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="btn-icon btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSchedule(schedule.weekId);
                    }}
                    disabled={loading}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Area - Schedule Grid */}
        <div className="schedule-main">
          {!selectedSchedule ? (
            <div className="empty-state">
              <FaCalendarAlt size={64} color="#cbd5e1" />
              <h3>No Schedule Selected</h3>
              <p>Select a schedule from the sidebar or create a new one</p>
            </div>
          ) : loading ? (
            <div className="loading-state">Loading schedule...</div>
          ) : (
            <>
              <div className="schedule-header-info">
                <div className="allocation-steps">
                  <span className="step-badge">📌 Allocate slots by selecting:</span>
                  <span className="step">Course</span>
                  <span className="arrow">→</span>
                  <span className="step">Subject</span>
                  <span className="arrow">→</span>
                  <span className="step">Trainer</span>
                </div>
                <div className="schedule-title">
                  <FaCalendarAlt /> {scheduleData?.weekId}
                  <span className="date-range">
                    {new Date(scheduleData?.weekStartDate).toLocaleDateString()} –{' '}
                    {new Date(scheduleData?.weekEndDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="schedule-grid">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th className="time-column">Time</th>
                      {DAYS.map(day => (
                        <th key={day}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map(timeSlot => (
                      <tr key={timeSlot}>
                        <td className="time-cell">{timeSlot}</td>
                        {DAYS.map(day => {
                          const slot = getSlotForDayTime(day, timeSlot);
                          const isAllocated = slot?.isAllocated;

                          return (
                            <td key={`${day}-${timeSlot}`} className="slot-cell">
                              {isAllocated ? (
                                <div className="allocated-slot">
                                  <div className="slot-content">
                                    <div className="course-name">
                                      {getCourseName(slot.module)}
                                    </div>
                                    <div className="subject-name">
                                      {slot.moduleDetails?.name || getSubjectName(slot.module)}
                                    </div>
                                    <div className="trainer-info">
                                      👤 {getTrainerName(slot.trainer)}
                                    </div>
                                  </div>
                                  <div className="slot-actions">
                                    <button
                                      className="btn-icon btn-edit"
                                      onClick={() => openAllocationModal(slot)}
                                      title="Edit allocation"
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      className="btn-icon btn-delete"
                                      onClick={() => deallocateSlot(slot._id)}
                                      title="Remove allocation"
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  className="assign-btn"
                                  onClick={() => openAllocationModal(slot)}
                                  disabled={loading}
                                >
                                  + Assign
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Allocation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Allocate Slot - {selectedSlot?.day} {selectedSlot?.timeSlot}
              </h3>
              <button className="btn-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>1. Select Course *</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(course => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.name} ({course.courseId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>2. Select Subject *</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="form-control"
                  disabled={!selectedCourse}
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map(subject => (
                    <option key={subject.subjectId} value={subject.subjectId}>
                      {subject.name} ({subject.subjectId})
                    </option>
                  ))}
                </select>
                {!selectedCourse && (
                  <small className="form-hint">Select a course first</small>
                )}
              </div>

              <div className="form-group">
                <label>3. Select Trainer *</label>
                <select
                  value={selectedTrainer}
                  onChange={(e) => setSelectedTrainer(e.target.value)}
                  className="form-control"
                  disabled={!selectedSubject}
                >
                  <option value="">-- Select Trainer --</option>
                  {getAvailableTrainers().map(trainer => (
                    <option key={trainer.empId} value={trainer.empId}>
                      {trainer.name} ({trainer.empId}) - {trainer.experience}y exp
                    </option>
                  ))}
                </select>
                {!selectedSubject && (
                  <small className="form-hint">Select a subject first</small>
                )}
                {selectedSubject && getAvailableTrainers().length === 0 && (
                  <small className="form-hint text-warning">
                    No trainers available for this subject
                  </small>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={loading}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={allocateSlot}
                disabled={loading || !selectedCourse || !selectedSubject || !selectedTrainer}
              >
                <FaCheck /> Allocate Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;