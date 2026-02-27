// frontend/src/components/Schedule/ScheduleGrid.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { allocateSlot, deallocateSlot } from '../../services/scheduleService';
import { WEEKDAYS, TIME_SLOTS } from '../../utils/constants';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const ScheduleGrid = ({ schedule, trainers, subjects, onSlotUpdated }) => {
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [saving, setSaving] = useState(false);

  const getSlot = (day, timeSlot) => {
    return schedule.timeSlots.find(
      slot => slot.day === day && slot.timeSlot === timeSlot
    );
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot._id);
    setSelectedTrainer(slot.trainer || '');
    setSelectedModule(slot.module || '');
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setSelectedTrainer('');
    setSelectedModule('');
  };

  const handleSaveSlot = async (slotId) => {
    if (!selectedTrainer || !selectedModule) {
      toast.error('Please select both trainer and module');
      return;
    }

    try {
      setSaving(true);
      await allocateSlot(slotId, schedule.weekId, selectedTrainer, selectedModule);
      toast.success('Slot allocated successfully!');
      setEditingSlot(null);
      setSelectedTrainer('');
      setSelectedModule('');
      onSlotUpdated();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to allocate slot';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeallocateSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to deallocate this slot?')) {
      return;
    }

    try {
      setSaving(true);
      await deallocateSlot(slotId, schedule.weekId);
      toast.success('Slot deallocated successfully!');
      onSlotUpdated();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to deallocate slot';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Filter trainers by selected module
  const getAvailableTrainers = () => {
    if (!selectedModule) return trainers;
    return trainers.filter(trainer => 
      trainer.subjects && trainer.subjects.includes(selectedModule)
    );
  };

  const getModuleName = (moduleId) => {
    const subject = subjects.find(s => s.subjectId === moduleId);
    return subject ? subject.name : moduleId;
  };

  const getTrainerName = (empId) => {
    const trainer = trainers.find(t => t.empId === empId);
    return trainer ? trainer.name : empId;
  };

  return (
    <div className="schedule-grid-container">
      <div className="schedule-header">
        <h2>📅 {schedule.weekId}</h2>
        <p>
          {new Date(schedule.weekStartDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} - {new Date(schedule.weekEndDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
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
                      <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="form-control-small"
                        disabled={saving}
                      >
                        <option value="">Select Module</option>
                        {subjects.map(subject => (
                          <option key={subject.subjectId} value={subject.subjectId}>
                            {subject.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedTrainer}
                        onChange={(e) => setSelectedTrainer(e.target.value)}
                        className="form-control-small"
                        disabled={saving || !selectedModule}
                      >
                        <option value="">Select Trainer</option>
                        {getAvailableTrainers().map(trainer => (
                          <option key={trainer.empId} value={trainer.empId}>
                            {trainer.name} ({trainer.empId})
                          </option>
                        ))}
                      </select>

                      <div className="slot-editor-actions">
                        <button
                          className="btn-icon btn-success"
                          onClick={() => handleSaveSlot(slot._id)}
                          disabled={saving || !selectedTrainer || !selectedModule}
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
                      <div className="slot-module">{getModuleName(slot.module)}</div>
                      <div className="slot-trainer">{getTrainerName(slot.trainer)}</div>
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
          <span>Allocated Slot</span>
        </div>
        <div className="legend-item">
          <span className="legend-box empty"></span>
          <span>Available Slot</span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;