// frontend/src/components/Schedule/CreateSchedule.jsx
import React, { useState } from 'react';
import { FaCalendarPlus } from 'react-icons/fa';

const CreateSchedule = ({ onSubmit, onCancel }) => {
  const [weekStartDate, setWeekStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!weekStartDate) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(weekStartDate);
    } finally {
      setLoading(false);
    }
  };

  // Get Monday of selected week
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      const monday = getMonday(selectedDate);
      setWeekStartDate(monday.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="create-schedule-form card">
      <div className="form-header">
        <FaCalendarPlus size={24} color="#667eea" />
        <h3>Create New Weekly Schedule</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Week Start Date (Monday)</label>
          <input
            type="date"
            className="form-control"
            onChange={handleDateChange}
            disabled={loading}
            required
          />
          {weekStartDate && (
            <small className="form-hint">
              Schedule will start from Monday: {new Date(weekStartDate).toLocaleDateString()}
            </small>
          )}
        </div>

        <div className="info-box">
          <p>
            ℹ️ A new blank weekly schedule will be created with all time slots available for allocation.
            You can then assign trainers and modules to each slot.
          </p>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !weekStartDate}
          >
            {loading ? 'Creating...' : '✓ Create Schedule'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSchedule;