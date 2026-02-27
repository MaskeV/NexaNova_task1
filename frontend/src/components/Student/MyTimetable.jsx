// frontend/src/components/Student/MyTimetable.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getMyTimetable } from '../../services/timetableService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';
import { FaCalendarAlt, FaClock, FaBook, FaUser, FaChartBar } from 'react-icons/fa';
import '../../styles/pages/Timetable.css';

const MyTimetable = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekId, setWeekId] = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, [weekId]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await getMyTimetable(weekId);
      setTimetable(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load timetable';
      toast.error(message);
      console.error('Timetable error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f44336';
      default: return '#666';
    }
  };

  if (loading) return <Loading message="Loading your timetable..." />;

  if (!timetable) {
    return (
      <div className="student-timetable">
        <div className="page-header">
          <h1>📅 My Class Timetable</h1>
        </div>
        <div className="empty-state card">
          <FaCalendarAlt size={60} color="#ccc" />
          <h3>No Timetable Available</h3>
          <p>No schedule has been created for the current week yet.</p>
          <div className="info-box" style={{ marginTop: '2rem', textAlign: 'left' }}>
            <p><strong>Possible reasons:</strong></p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Administrator hasn't created a schedule for this week</li>
              <li>You may not be enrolled in any courses</li>
              <li>No classes have been scheduled for your courses</li>
            </ul>
            <p style={{ marginTop: '1rem' }}>Please contact your administrator for more information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-timetable">
      <div className="page-header">
        <div>
          <h1>📅 My Class Timetable</h1>
          <p>Week: <strong>{timetable.weekId}</strong></p>
          <p className="date-range">
            {new Date(timetable.weekStartDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })} - {' '}
            {new Date(timetable.weekEndDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {timetable.enrolledCourses && timetable.enrolledCourses.length > 0 && (
        <div className="enrolled-courses card">
          <h3>📚 My Enrolled Courses ({timetable.enrolledCourses.length})</h3>
          <div className="course-chips">
            {timetable.enrolledCourses.map(course => (
              <div key={course.subjectId} className="course-chip">
                <FaBook />
                <span>{course.name}</span>
                <span 
                  className="course-level"
                  style={{ 
                    background: `${getLevelColor(course.level)}33`,
                    color: getLevelColor(course.level)
                  }}
                >
                  {course.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {timetable.totalClasses === 0 ? (
        <div className="empty-state card">
          <FaCalendarAlt size={60} color="#ccc" />
          <h3>No Classes Scheduled</h3>
          <p>You don't have any classes scheduled for this week.</p>
          {timetable.enrolledCourses && timetable.enrolledCourses.length > 0 && (
            <p style={{ marginTop: '1rem', color: '#666' }}>
              You are enrolled in courses, but classes haven't been scheduled yet. 
              Please check back later or contact your administrator.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="timetable-grid">
            {timetable.timetable.map(daySchedule => (
              <div key={daySchedule.day} className="day-schedule card">
                <h3 className="day-header">{daySchedule.day}</h3>
                
                {daySchedule.slots.length === 0 ? (
                  <div className="no-classes">
                    <p>No classes scheduled</p>
                  </div>
                ) : (
                  <div className="time-slots">
                    {daySchedule.slots.map(slot => (
                      <div key={slot._id} className="time-slot">
                        <div className="slot-time">
                          <FaClock />
                          <span>{slot.timeSlot}</span>
                        </div>
                        
                        <div className="slot-module">
                          <FaBook />
                          <div>
                            <strong>{slot.module.name}</strong>
                            {slot.module.level && (
                              <small style={{ 
                                background: `${getLevelColor(slot.module.level)}22`,
                                color: getLevelColor(slot.module.level),
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                display: 'inline-block',
                                marginTop: '0.25rem'
                              }}>
                                {slot.module.level}
                              </small>
                            )}
                          </div>
                        </div>
                        
                        {slot.trainer && (
                          <div className="slot-trainer">
                            <FaUser />
                            <div>
                              <strong>{slot.trainer.name}</strong>
                              <small>{slot.trainer.empId}</small>
                              {slot.trainer.experience && (
                                <small style={{ marginLeft: '0.5rem' }}>
                                  • {slot.trainer.experience} years exp.
                                </small>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="timetable-summary card">
            <h3><FaChartBar /> Weekly Summary</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-label">Total Classes:</span>
                <span className="stat-value">{timetable.totalClasses}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Enrolled Courses:</span>
                <span className="stat-value">{timetable.enrolledCourses?.length || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Days with Classes:</span>
                <span className="stat-value">
                  {timetable.timetable.filter(day => day.slots.length > 0).length}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .info-box {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 1rem;
          border-radius: 4px;
          margin-top: 1rem;
        }

        .info-box p {
          margin: 0.5rem 0;
          color: #0d47a1;
        }

        .info-box ul {
          color: #1565c0;
        }
      `}</style>
    </div>
  );
};

export default MyTimetable;