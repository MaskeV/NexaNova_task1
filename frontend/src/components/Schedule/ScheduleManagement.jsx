import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getAllSchedules,
  createSchedule,
  deleteSchedule,
  getScheduleByWeek
} from '../../services/scheduleService';
import { getAllTrainers } from '../../services/trainerService';
import { getAllSubjects } from '../../services/subjectService';
import Loading from '../Common/Loading';
import ScheduleGrid from './ScheduleGrid';
import CreateSchedule from './CreateSchedule';
import { FaPlus, FaCalendar, FaTrash } from 'react-icons/fa';
import '../../styles/pages/Schedule.css';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch all three independently so one failure doesn't block others
      const [schedulesRes, trainersRes, subjectsRes] = await Promise.all([
        getAllSchedules(),
        getAllTrainers(),
        getAllSubjects()
      ]);

      const schedulesData = schedulesRes.data || [];
      const trainersData = trainersRes.data || [];
      // getAllSubjects returns { success, count, data: [...] }
      const subjectsData = subjectsRes.data || [];

      console.log('✅ Schedules:', schedulesData.length);
      console.log('✅ Trainers:', trainersData.length);
      console.log('✅ Subjects:', subjectsData.length, subjectsData.map(s => s.subjectId + ':' + s.name));

      setSchedules(schedulesData);
      setTrainers(trainersData);
      setSubjects(subjectsData);

      if (schedulesData.length > 0) {
        await loadScheduleDetails(schedulesData[0].weekId);
      }
    } catch (error) {
      console.error('❌ fetchInitialData error:', error);
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleDetails = async (weekId) => {
    try {
      const response = await getScheduleByWeek(weekId);
      setSelectedSchedule(response.data);
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error('Failed to load schedule details');
    }
  };

  const handleCreateSchedule = async (weekStartDate) => {
    try {
      await createSchedule(weekStartDate);
      toast.success('Schedule created successfully!');
      setShowCreateForm(false);
      await fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (weekId) => {
    if (!window.confirm(`Delete schedule ${weekId}?`)) return;
    try {
      await deleteSchedule(weekId);
      toast.success('Schedule deleted successfully!');
      setSelectedSchedule(null);
      await fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete schedule');
    }
  };

  const handleSlotUpdated = async () => {
    if (selectedSchedule) {
      await loadScheduleDetails(selectedSchedule.weekId);
    }
  };

  if (loading) return <Loading message="Loading schedules..." />;

  return (
    <div className="schedule-management">
      <div className="page-header">
        <div>
          <h1>📅 Schedule Management</h1>
          <p>Assign subjects and trainers to weekly time slots</p>
          <small style={{ color: '#888' }}>
            {subjects.length} subjects | {trainers.length} trainers available
          </small>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <FaPlus /> {showCreateForm ? 'Cancel' : 'Create New Schedule'}
        </button>
      </div>

      {showCreateForm && (
        <CreateSchedule
          onSubmit={handleCreateSchedule}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {subjects.length === 0 && !loading && (
        <div style={{
          background: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          color: '#856404'
        }}>
          ⚠️ No subjects found. Please add subjects first before assigning schedule slots.
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="empty-state card">
          <FaCalendar size={60} color="#ccc" />
          <h3>No schedules created yet</h3>
          <p>Click "Create New Schedule" to get started</p>
        </div>
      ) : (
        <div className="schedule-content">
          <div className="schedules-sidebar">
            <h3>📋 Available Schedules</h3>
            <div className="schedule-list">
              {schedules.map((schedule) => (
                <div
                  key={schedule.weekId}
                  className={`schedule-item ${selectedSchedule?.weekId === schedule.weekId ? 'active' : ''}`}
                  onClick={() => loadScheduleDetails(schedule.weekId)}
                >
                  <div className="schedule-item-header">
                    <strong>{schedule.weekId}</strong>
                    <button
                      className="btn-icon-small btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSchedule(schedule.weekId);
                      }}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                  <small>
                    {new Date(schedule.weekStartDate).toLocaleDateString()} -{' '}
                    {new Date(schedule.weekEndDate).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          </div>

          <div className="schedule-main">
            {selectedSchedule ? (
              <ScheduleGrid
                schedule={selectedSchedule}
                trainers={trainers}
                subjects={subjects}
                onSlotUpdated={handleSlotUpdated}
              />
            ) : (
              <div className="empty-state">
                <p>Select a schedule from the list to view and edit</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;