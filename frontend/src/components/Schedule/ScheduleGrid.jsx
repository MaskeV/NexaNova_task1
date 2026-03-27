import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { allocateSlot, deallocateSlot } from '../../services/scheduleService';
import { WEEKDAYS, TIME_SLOTS } from '../../utils/constants';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const ScheduleGrid = ({ schedule, trainers, subjects, onSlotUpdated }) => {
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [saving, setSaving] = useState(false);

  const getSlot = (day, timeSlot) => {
    return schedule.timeSlots.find(
      slot => slot.day === day && slot.timeSlot === timeSlot
    );
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot._id);
    setSelectedSubject(slot.subjectId || '');
    setSelectedTrainer(slot.trainerId || '');
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setSelectedSubject('');
    setSelectedTrainer('');
  };

  // Get trainers who are assigned to the selected subject
  const getTrainersForSubject = (subjectId) => {
    if (!subjectId) return [];
    return trainers.filter(
      trainer => trainer.subjects && trainer.subjects.includes(subjectId)
    );
  };

  const handleSaveSlot = async (slotId) => {
    if (!selectedSubject || !selectedTrainer) {
      toast.error('Please select both a subject and a trainer');
      return;
    }

    try {
      setSaving(true);
      await allocateSlot(slotId, schedule.weekId, selectedTrainer, selectedSubject);
      toast.success('Slot allocated successfully!');
      setEditingSlot(null);
      setSelectedSubject('');
      setSelectedTrainer('');
      onSlotUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to allocate slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDeallocateSlot = async (slotId) => {
    if (!window.confirm('Remove this allocation?')) return;
    try {
      setSaving(true);
      await deallocateSlot(slotId, schedule.weekId);
      toast.success('Slot cleared successfully!');
      onSlotUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clear slot');
    } finally {
      setSaving(false);
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.subjectId === subjectId);
    return subject ? subject.name : subjectId;
  };

  const getTrainerName = (empId) => {
    const trainer = trainers.find(t => t.empId === empId);
    return trainer ? trainer.name : empId;
  };

  const availableTrainers = getTrainersForSubject(selectedSubject);

  return (
    <div className="schedule-grid-container">
      <div className="schedule-header">
        <h2>📅 {schedule.weekId}</h2>
        <p>
          {new Date(schedule.weekStartDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })} -{' '}
          {new Date(schedule.weekEndDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="schedule-grid">
        <div className="schedule-grid-header">
          <div className="time-column">Time</div>
          {WEEKDAYS.map(day => (
            <div key={day} className="day-column">{day}</div>
          ))}
        </div>

        {TIME_SLOTS.map(timeSlot => (
          <div key={timeSlot} className="schedule-grid-row">
            <div className="time-cell">{timeSlot}</div>
            {WEEKDAYS.map(day => {
              const slot = getSlot(day, timeSlot);
              const isEditing = editingSlot === slot?._id;

              return (
                <div key={`${day}-${timeSlot}`} className="schedule-cell">
                  {isEditing ? (
                    <div className="slot-editor">
                      {/* Subject Dropdown */}
                      <select
                        value={selectedSubject}
                        onChange={(e) => {
                          setSelectedSubject(e.target.value);
                          setSelectedTrainer(''); // reset trainer on subject change
                        }}
                        className="form-control-small"
                        disabled={saving}
                      >
                        <option value="">-- Select Subject --</option>
                        {subjects.map(subject => (
                          <option key={subject.subjectId} value={subject.subjectId}>
                            {subject.name}
                          </option>
                        ))}
                      </select>

                      {/* Trainer Dropdown - only enabled after subject selected */}
                      <select
                        value={selectedTrainer}
                        onChange={(e) => setSelectedTrainer(e.target.value)}
                        className="form-control-small"
                        disabled={saving || !selectedSubject}
                      >
                        <option value="">
                          {!selectedSubject
                            ? '-- Select subject first --'
                            : availableTrainers.length === 0
                              ? '-- No trainers for this subject --'
                              : '-- Select Trainer --'}
                        </option>
                        {availableTrainers.map(trainer => (
                          <option key={trainer.empId} value={trainer.empId}>
                            {trainer.name} ({trainer.empId})
                          </option>
                        ))}
                      </select>

                      {/* Warning if no trainers for selected subject */}
                      {selectedSubject && availableTrainers.length === 0 && (
                        <small style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          ⚠️ No trainers assigned to this subject yet
                        </small>
                      )}

                      <div className="slot-editor-actions">
                        <button
                          className="btn-icon btn-success"
                          onClick={() => handleSaveSlot(slot._id)}
                          disabled={saving || !selectedSubject || !selectedTrainer}
                          title="Save"
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="btn-icon btn-secondary"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          title="Cancel"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : slot?.isAllocated ? (
                    <div className="slot-content allocated">
                      <div className="slot-module">
                        {slot.subjectDetails?.name || getSubjectName(slot.subjectId)}
                      </div>
                      <div className="slot-trainer">
                        {slot.trainerDetails?.name || getTrainerName(slot.trainerId)}
                      </div>
                      <div className="slot-actions">
                        <button
                          className="btn-icon btn-primary"
                          onClick={() => handleEditSlot(slot)}
                          disabled={saving}
                          title="Edit"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDeallocateSlot(slot._id)}
                          disabled={saving}
                          title="Remove"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="slot-content empty">
                      <button
                        className="btn-add-slot"
                        onClick={() => handleEditSlot(slot)}
                        disabled={saving}
                      >
                        + Assign
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="schedule-legend">
        <div className="legend-item">
          <span className="legend-box allocated"></span>
          <span>Allocated</span>
        </div>
        <div className="legend-item">
          <span className="legend-box empty"></span>
          <span>Available</span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;