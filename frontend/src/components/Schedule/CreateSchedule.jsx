// frontend/src/components/Schedule/CreateSchedule.jsx - FIXED: timezone-safe date
import React, { useState } from 'react';
import { FaCalendarPlus } from 'react-icons/fa';

const CreateSchedule = ({ onSubmit, onCancel }) => {
  const [weekStartDate, setWeekStartDate] = useState('');
  const [displayDate, setDisplayDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weekStartDate) return;

    setLoading(true);
    try {
      await onSubmit(weekStartDate);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Use string manipulation instead of new Date() to avoid UTC timezone shift.
  // new Date('2026-03-09') parses as UTC midnight, but toLocaleDateString() converts
  // to local time which can show the previous day in IST (UTC+5:30) and other timezones.
  const getMondayString = (dateStr) => {
    // Parse date parts directly from the string — no timezone conversion
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // local time, no UTC shift
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // days to subtract to get Monday
    date.setDate(date.getDate() + diff);

    // Format back to YYYY-MM-DD string without timezone conversion
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (dateStr) => {
    // Parse directly from string for display — avoids UTC shift
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value; // "YYYY-MM-DD" string from input
    if (selectedDate) {
      const monday = getMondayString(selectedDate);
      setWeekStartDate(monday);
      setDisplayDate(formatDisplayDate(monday));
    } else {
      setWeekStartDate('');
      setDisplayDate('');
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
          <label>Select any date in the week</label>
          <input
            type="date"
            className="form-control"
            onChange={handleDateChange}
            disabled={loading}
            required
          />
          {weekStartDate && (
            <small className="form-hint">
              ✅ Week starts on Monday: <strong>{displayDate}</strong>
            </small>
          )}
        </div>

        <div className="info-box">
          <p>
            ℹ️ A new blank weekly schedule will be created with all time slots available for allocation.
            You can then assign trainers and subjects to each slot.
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