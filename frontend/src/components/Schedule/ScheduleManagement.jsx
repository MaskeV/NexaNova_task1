// frontend/src/components/Schedule/ScheduleManagement.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getAllSchedules,
  createSchedule,
  deleteSchedule,
  getScheduleByWeek
} from '../../services/scheduleService';
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

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await getAllSchedules();
      const list = res.data || [];
      setSchedules(list);

      // Auto-select the most recent schedule
      if (list.length > 0) {
        await loadScheduleDetails(list[0].weekId);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleDetails = async (weekId) => {
    try {
      const res = await getScheduleByWeek(weekId);
      setSelectedSchedule(res.data);
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
      await fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (weekId) => {
    if (!window.confirm(`Delete schedule ${weekId}? This cannot be undone.`)) return;
    try {
      await deleteSchedule(weekId);
      toast.success('Schedule deleted');
      if (selectedSchedule?.weekId === weekId) setSelectedSchedule(null);
      await fetchSchedules();
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
          <p>Create and manage weekly training schedules</p>
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

      {schedules.length === 0 ? (
        <div className="empty-state card">
          <FaCalendar size={60} color="#ccc" />
          <h3>No schedules created yet</h3>
          <p>Click "Create New Schedule" to get started</p>
        </div>
      ) : (
        <div className="schedule-content">
          {/* Sidebar: schedule list */}
          <div className="schedules-sidebar">
            <h3>📋 Available Schedules</h3>
            <div className="schedule-list">
              {schedules.map(schedule => (
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
                      title="Delete schedule"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                  <small>
                    {new Date(schedule.weekStartDate).toLocaleDateString()} –{' '}
                    {new Date(schedule.weekEndDate).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          </div>

          {/* Main: grid */}
          <div className="schedule-main">
            {selectedSchedule ? (
              <>
                <div className="hierarchy-notice">
                  <span>📌 Allocate slots by selecting:</span>
                  <span className="step">Course</span>
                  <span className="arrow">→</span>
                  <span className="step">Subject</span>
                  <span className="arrow">→</span>
                  <span className="step">Module</span>
                  <span className="arrow">→</span>
                  <span className="step">Trainer</span>
                </div>
                <ScheduleGrid
                  schedule={selectedSchedule}
                  onSlotUpdated={handleSlotUpdated}
                />
              </>
            ) : (
              <div className="empty-state">
                <p>Select a schedule from the list to view and edit</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .hierarchy-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%);
          border: 1px solid #c5cae9;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.88rem;
          color: #555;
        }

        .hierarchy-notice > span:first-child {
          font-weight: 600;
          color: #333;
          margin-right: 0.25rem;
        }

        .step {
          padding: 0.2rem 0.6rem;
          background: #667eea;
          color: white;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .arrow {
          color: #667eea;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default ScheduleManagement;