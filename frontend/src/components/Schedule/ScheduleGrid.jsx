// frontend/src/components/Schedule/ScheduleGrid.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { allocateSlot, deallocateSlot } from '../../services/scheduleService';
import { WEEKDAYS, TIME_SLOTS } from '../../utils/constants';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const ScheduleGrid = ({
  schedule,
  trainers = [],
  courses = [],
  subjects = [],
  onSlotUpdated
}) => {
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [saving, setSaving] = useState(false);

  if (!schedule) return null;

  const getSlot = (day, timeSlot) =>
    schedule.timeSlots?.find(s => s.day === day && s.timeSlot === timeSlot);

  // ── Open editor ───────────────────────────────────────────────────────────
  const handleEditSlot = (slot) => {
    setEditingSlot(slot._id);
    if (slot.isAllocated && slot.subject) {
      // Try to find which course owns this subject
      const parentCourse = courses.find(c => {
        const ids = c.subjects || c.subjectIds || [];
        return ids.includes(slot.subject);
      });
      setSelectedCourse(
        parentCourse?.courseId || parentCourse?._id?.toString() || ''
      );
      setSelectedSubject(slot.subject || '');
      setSelectedTrainer(slot.trainer || '');
    } else {
      setSelectedCourse('');
      setSelectedSubject('');
      setSelectedTrainer('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setSelectedCourse('');
    setSelectedSubject('');
    setSelectedTrainer('');
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSaveSlot = async (slot) => {
    if (!selectedSubject || !selectedTrainer) {
      toast.error('Please select both a subject and a trainer');
      return;
    }
    try {
      setSaving(true);
      if (slot.isAllocated) {
        await deallocateSlot(slot._id, schedule.weekId);
      }
      await allocateSlot(slot._id, schedule.weekId, selectedTrainer, selectedSubject);
      toast.success('Slot allocated successfully!');
      handleCancelEdit();
      onSlotUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to allocate slot');
    } finally {
      setSaving(false);
    }
  };

  // ── Clear ─────────────────────────────────────────────────────────────────
  const handleDeallocateSlot = async (slotId) => {
    if (!window.confirm('Remove this allocation?')) return;
    try {
      setSaving(true);
      await deallocateSlot(slotId, schedule.weekId);
      toast.success('Slot cleared');
      onSlotUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deallocate slot');
    } finally {
      setSaving(false);
    }
  };

  // ── Filtered lists ────────────────────────────────────────────────────────

  // Subjects filtered by selected course.
  // Course model may store subject refs as: subjects[], subjectIds[], or modules[]
  const getSubjectsForCourse = () => {
    if (!selectedCourse) return subjects; // no filter → show all

    const course = courses.find(c =>
      (c.courseId || c._id?.toString()) === selectedCourse
    );
    if (!course) return subjects;

    // Try every possible field name the Course model might use
    const ids = [
      ...(course.subjects || []),
      ...(course.subjectIds || []),
      ...(course.modules || [])
    ];
    if (ids.length === 0) return subjects;

    return subjects.filter(s =>
      ids.includes(s.subjectId) || ids.includes(s._id?.toString())
    );
  };

  // Trainers who teach the selected subject
  // Trainer model stores subject refs as: subjects[], subjectIds[]
  const getTrainersForSubject = () => {
    if (!selectedSubject) return [];
    return trainers.filter(t =>
      (t.subjects || []).includes(selectedSubject) ||
      (t.subjectIds || []).includes(selectedSubject)
    );
  };

  // ── Display helpers ───────────────────────────────────────────────────────
  const getSubjectName = (subjectId) => {
    if (!subjectId) return '—';
    return subjects.find(s => s.subjectId === subjectId)?.name || subjectId;
  };

  const getTrainerName = (empId) => {
    if (!empId) return '—';
    return trainers.find(t => t.empId === empId)?.name || empId;
  };

  const getCourseId = (course) => course.courseId || course._id?.toString() || '';
  const getCourseName = (course) => course.name || course.title || course.courseName || '';

  const filteredSubjects = getSubjectsForCourse();
  const availableTrainers = getTrainersForSubject();

  return (
    <div className="schedule-grid-container">
      <div className="schedule-header">
        <h2>📅 {schedule.weekId}</h2>
        <p>
          {new Date(schedule.weekStartDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
          {' — '}
          {new Date(schedule.weekEndDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="schedule-grid">
        {/* Header */}
        <div className="schedule-grid-header">
          <div className="time-column">Time</div>
          {WEEKDAYS.map(day => (
            <div key={day} className="day-column">{day}</div>
          ))}
        </div>

        {/* Rows */}
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

                      {/* Step 1 — Course (optional filter) */}
                      <select
                        value={selectedCourse}
                        onChange={(e) => {
                          setSelectedCourse(e.target.value);
                          setSelectedSubject('');
                          setSelectedTrainer('');
                        }}
                        className="form-control-small"
                        disabled={saving}
                      >
                        <option value="">All Courses</option>
                        {courses.map(c => (
                          <option key={getCourseId(c)} value={getCourseId(c)}>
                            {getCourseName(c)}
                          </option>
                        ))}
                      </select>

                      {/* Step 2 — Subject */}
                      <select
                        value={selectedSubject}
                        onChange={(e) => {
                          setSelectedSubject(e.target.value);
                          setSelectedTrainer('');
                        }}
                        className="form-control-small"
                        disabled={saving}
                      >
                        <option value="">-- Subject --</option>
                        {filteredSubjects.map(s => (
                          <option key={s.subjectId} value={s.subjectId}>
                            {s.name}
                          </option>
                        ))}
                      </select>

                      {/* Step 3 — Trainer (filtered by subject) */}
                      <select
                        value={selectedTrainer}
                        onChange={(e) => setSelectedTrainer(e.target.value)}
                        className="form-control-small"
                        disabled={saving || !selectedSubject}
                      >
                        <option value="">
                          {selectedSubject ? '-- Trainer --' : 'Select subject first'}
                        </option>
                        {availableTrainers.map(t => (
                          <option key={t.empId} value={t.empId}>
                            {t.name} ({t.empId})
                          </option>
                        ))}
                      </select>

                      {/* Warning: no trainers for this subject */}
                      {selectedSubject && availableTrainers.length === 0 && (
                        <small style={{ color: '#e53e3e', fontSize: '0.72rem' }}>
                          ⚠ No trainers teach this subject
                        </small>
                      )}

                      <div className="slot-editor-actions">
                        <button
                          className="btn-icon btn-success"
                          onClick={() => handleSaveSlot(slot)}
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
                      <div className="slot-subject">{getSubjectName(slot.subject)}</div>
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
                        onClick={() => slot && handleEditSlot(slot)}
                        disabled={saving || !slot}
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