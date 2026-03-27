// frontend/src/components/Courses/EditCourseModal.jsx — REPLACE ENTIRE FILE
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaTimes, FaTrash, FaArrowUp, FaArrowDown, FaLayerGroup,
  FaClock, FaPlus, FaEdit, FaCheck, FaUser, FaUsers,
  FaBook, FaChevronRight, FaChevronDown, FaSave, FaAngleLeft
} from 'react-icons/fa';

const BASE = 'http://localhost:5000';
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
};

// ─── Tiny helpers ────────────────────────────────────────────
const Badge = ({ children, color = '#667eea', bg = '#eef2ff' }) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
    {children}
  </span>
);

const Chip = ({ label, onRemove }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
    color: '#5b21b6', background: '#ede9fe', padding: '3px 10px', borderRadius: 20 }}>
    {label}
    {onRemove && (
      <button type="button" onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', padding: 0, lineHeight: 1, fontWeight: 700 }}>
        ×
      </button>
    )}
  </span>
);

const IconBtn = ({ onClick, title, danger, disabled, children }) => (
  <button type="button" onClick={onClick} title={title} disabled={disabled}
    style={{ background: 'white', border: `1.5px solid ${danger ? '#fca5a5' : '#e0e0e0'}`,
      borderRadius: 6, padding: '5px 8px', cursor: disabled ? 'not-allowed' : 'pointer',
      color: danger ? '#dc2626' : '#555', opacity: disabled ? 0.4 : 1,
      display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
      transition: 'all 0.15s' }}>
    {children}
  </button>
);

// ─── STEP 1: Course basic info ───────────────────────────────
const CourseInfoStep = ({ formData, onChange, subjects, onAddSubject, onRemoveSubject, onMoveSubject }) => {
  const available = subjects.filter(s => !formData.subjects.find(fs => fs.subjectId === s.subjectId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Course Name *">
          <input style={inp} name="name" value={formData.name} onChange={onChange} placeholder="e.g. Frontend Bootcamp" required />
        </Field>
        <Field label="Course ID *">
          <input style={{ ...inp, background: formData._isEdit ? '#f5f5f5' : 'white' }}
            name="courseId" value={formData.courseId} onChange={onChange}
            placeholder="e.g. CRS01" disabled={formData._isEdit} required />
        </Field>
      </div>

      <Field label="Description">
        <textarea style={{ ...inp, minHeight: 72, resize: 'vertical' }}
          name="description" value={formData.description} onChange={onChange}
          placeholder="What will students learn?" />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Duration (weeks) *">
          <input style={inp} type="number" name="duration" value={formData.duration} onChange={onChange} min="1" required />
        </Field>
        <Field label="Level *">
          <select style={inp} name="level" value={formData.level} onChange={onChange}>
            {['Beginner','Intermediate','Advanced','Mixed'].map(l => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Category *">
          <select style={inp} name="category" value={formData.category} onChange={onChange}>
            {['Frontend','Backend','DevOps','Mobile','Data Science','Cloud','Security','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      {/* Subjects list */}
      <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, color: '#333' }}>📚 Subjects in course ({formData.subjects.length})</h3>
          {available.length > 0 && (
            <select style={{ ...inp, width: 'auto', minWidth: 220, color: '#667eea', borderColor: '#667eea', fontWeight: 600 }}
              onChange={e => { if (e.target.value) { onAddSubject(e.target.value); e.target.value = ''; } }} defaultValue="">
              <option value="" disabled>＋ Add subject…</option>
              {available.map(s => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.name} — {s.modules?.length || 0} modules
                </option>
              ))}
            </select>
          )}
        </div>

        {formData.subjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', background: '#fafafa', borderRadius: 8, color: '#999' }}>
            No subjects added yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {formData.subjects.map((sub, i) => (
              <div key={sub.subjectId} style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: '#f0f4ff', borderRadius: 8, border: '1.5px solid #e0e7ff' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 14 }}>{sub.name || sub.subjectId}</strong>
                    <Badge>{sub.subjectId}</Badge>
                    <Badge color="#2e7d32" bg="#e8f5e9">{sub.modules?.length || 0} modules</Badge>
                    <Badge color="#e65100" bg="#fff3e0">{sub.trainers?.length || 0} trainers</Badge>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <IconBtn onClick={() => onMoveSubject(i, 'up')} disabled={i === 0} title="Move up"><FaArrowUp size={10} /></IconBtn>
                  <IconBtn onClick={() => onMoveSubject(i, 'down')} disabled={i === formData.subjects.length - 1} title="Move down"><FaArrowDown size={10} /></IconBtn>
                  <IconBtn danger onClick={() => onRemoveSubject(sub.subjectId)} title="Remove"><FaTrash size={10} /></IconBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── STEP 2: Edit a specific subject ─────────────────────────
const SubjectEditor = ({ subject, allModules, allTrainers, onUpdate, onBack }) => {
  const [data, setData] = useState({ ...subject });
  const [saving, setSaving] = useState(false);
  const [expandedMod, setExpandedMod] = useState(null);

  // New module form
  const [newModule, setNewModule] = useState({ name: '', moduleId: '', description: '', duration: '', content: '' });
  const [showNewMod, setShowNewMod] = useState(false);

  // Inline edit module
  const [editingMod, setEditingMod] = useState(null); // moduleId
  const [editModData, setEditModData] = useState({});

  const moduleIds = data.modules.map(m => m.moduleId);
  const trainerIds = data.trainers.map(t => t.empId);

  const availableModules = allModules.filter(m => !moduleIds.includes(m.moduleId));
  const availableTrainers = allTrainers.filter(t => !trainerIds.includes(t.empId));

  // ── Module actions ──────────────────────────────────────────
  const addExistingModule = async (moduleId) => {
    try {
      const mod = allModules.find(m => m.moduleId === moduleId);
      if (!mod) return;
      const updated = { ...data, modules: [...data.modules, mod] };
      await saveSubject(updated);
    } catch (e) { toast.error('Failed to add module'); }
  };

  const removeModule = async (moduleId) => {
    if (!window.confirm('Remove this module from subject?')) return;
    const updated = { ...data, modules: data.modules.filter(m => m.moduleId !== moduleId) };
    await saveSubject(updated);
  };

  const createAndAddModule = async () => {
    if (!newModule.moduleId || !newModule.name) { toast.error('Module ID and Name required'); return; }
    setSaving(true);
    try {
      // Create module in DB
      const res = await axios.post(`${BASE}/modules`, {
        moduleId: newModule.moduleId,
        name: newModule.name,
        description: newModule.description,
        duration: parseInt(newModule.duration) || 0,
        content: newModule.content,
        order: data.modules.length + 1,
        isActive: true,
        learningObjectives: [],
        prerequisites: [],
        resources: [],
      }, getHeaders());
      const createdMod = res.data?.data || res.data;
      const updated = { ...data, modules: [...data.modules, createdMod] };
      await saveSubject(updated);
      setNewModule({ name: '', moduleId: '', description: '', duration: '', content: '' });
      setShowNewMod(false);
      toast.success('Module created and added!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create module');
    } finally { setSaving(false); }
  };

  const saveModuleEdit = async () => {
    setSaving(true);
    try {
      await axios.put(`${BASE}/modules/${editingMod}`, editModData, getHeaders());
      const updated = {
        ...data,
        modules: data.modules.map(m => m.moduleId === editingMod ? { ...m, ...editModData } : m)
      };
      setData(updated);
      onUpdate(updated);
      setEditingMod(null);
      toast.success('Module updated!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update module');
    } finally { setSaving(false); }
  };

  // ── Trainer actions ─────────────────────────────────────────
  const addTrainer = async (empId) => {
    const trainer = allTrainers.find(t => t.empId === empId);
    if (!trainer) return;
    const updated = { ...data, trainers: [...data.trainers, trainer] };
    await saveSubject(updated);
  };

  const removeTrainer = async (empId) => {
    const updated = { ...data, trainers: data.trainers.filter(t => t.empId !== empId) };
    await saveSubject(updated);
  };

  // ── Save subject to backend ─────────────────────────────────
  const saveSubject = async (updated) => {
    setSaving(true);
    try {
      const payload = {
        name: updated.name,
        description: updated.description,
        level: updated.level,
        modules: updated.modules.map((m, i) => ({ moduleId: m.moduleId, order: m.order ?? i + 1 })),
        trainers: updated.trainers.map(t => t.empId),
      };
      await axios.put(`${BASE}/subject/${updated.subjectId}`, payload, getHeaders());
      setData(updated);
      onUpdate(updated);
      toast.success('Subject saved!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save subject');
    } finally { setSaving(false); }
  };

  const saveBasicInfo = () => saveSubject(data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Back button */}
      <button type="button" onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', color: '#667eea', fontWeight: 700, fontSize: 13, marginBottom: 14, padding: 0 }}>
        <FaAngleLeft /> Back to Course
      </button>

      {/* Subject basic info */}
      <div style={{ background: 'linear-gradient(135deg,#f0f4ff,#fff)', borderRadius: 10,
        border: '2px solid #e0e7ff', padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: '#333', fontSize: 15 }}>✏️ Subject Info</h3>
          <button type="button" onClick={saveBasicInfo} disabled={saving}
            style={{ ...saveBtnSm, opacity: saving ? 0.6 : 1 }}>
            <FaSave size={12} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Name">
            <input style={inp} value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} />
          </Field>
          <Field label="Level">
            <select style={inp} value={data.level} onChange={e => setData(d => ({ ...d, level: e.target.value }))}>
              {['Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }}
            value={data.description} onChange={e => setData(d => ({ ...d, description: e.target.value }))} />
        </Field>
      </div>

      {/* ── Modules panel ── */}
      <SectionPanel
        title={`📦 Modules (${data.modules.length})`}
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            {availableModules.length > 0 && (
              <select style={{ ...inp, width: 'auto', minWidth: 180, fontSize: 12, color: '#667eea', borderColor: '#667eea' }}
                onChange={e => { if (e.target.value) { addExistingModule(e.target.value); e.target.value = ''; } }} defaultValue="">
                <option value="" disabled>＋ Existing module…</option>
                {availableModules.map(m => <option key={m.moduleId} value={m.moduleId}>{m.name} ({m.moduleId})</option>)}
              </select>
            )}
            <button type="button" onClick={() => setShowNewMod(v => !v)}
              style={{ ...saveBtnSm, background: showNewMod ? '#e0e7ff' : 'linear-gradient(135deg,#667eea,#764ba2)', color: showNewMod ? '#667eea' : 'white' }}>
              <FaPlus size={10} /> New Module
            </button>
          </div>
        }
      >
        {/* Create new module form */}
        {showNewMod && (
          <div style={{ background: '#fafafa', border: '2px dashed #c7d2fe', borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13, color: '#667eea' }}>➕ Create New Module</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="Module ID *">
                <input style={{ ...inp, fontSize: 13 }} value={newModule.moduleId}
                  onChange={e => setNewModule(m => ({ ...m, moduleId: e.target.value }))} placeholder="e.g. MD010" />
              </Field>
              <Field label="Name *">
                <input style={{ ...inp, fontSize: 13 }} value={newModule.name}
                  onChange={e => setNewModule(m => ({ ...m, name: e.target.value }))} placeholder="Module name" />
              </Field>
              <Field label="Duration (h)">
                <input style={{ ...inp, fontSize: 13 }} type="number" value={newModule.duration}
                  onChange={e => setNewModule(m => ({ ...m, duration: e.target.value }))} placeholder="3" />
              </Field>
              <Field label="Description">
                <input style={{ ...inp, fontSize: 13 }} value={newModule.description}
                  onChange={e => setNewModule(m => ({ ...m, description: e.target.value }))} placeholder="Short description" />
              </Field>
            </div>
            <Field label="Content">
              <textarea style={{ ...inp, fontSize: 13, minHeight: 54, resize: 'vertical' }}
                value={newModule.content} onChange={e => setNewModule(m => ({ ...m, content: e.target.value }))}
                placeholder="Module content details…" />
            </Field>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" onClick={() => setShowNewMod(false)} style={cancelBtnSm}>Cancel</button>
              <button type="button" onClick={createAndAddModule} disabled={saving} style={{ ...saveBtnSm, opacity: saving ? 0.6 : 1 }}>
                <FaCheck size={10} /> {saving ? 'Creating…' : 'Create & Add'}
              </button>
            </div>
          </div>
        )}

        {data.modules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#999', fontSize: 13 }}>No modules yet</div>
        ) : (
          [...data.modules]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((mod, mi) => (
              <div key={mod.moduleId} style={{ border: '1.5px solid #e0e7ff', borderRadius: 8,
                marginBottom: 8, overflow: 'hidden', background: 'white' }}>
                {/* Module header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  cursor: 'pointer', background: expandedMod === mod.moduleId ? '#f0f4ff' : 'white' }}
                  onClick={() => setExpandedMod(expandedMod === mod.moduleId ? null : mod.moduleId)}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#e0e7ff',
                    color: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{mi + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 13 }}>{mod.name}</strong>
                      <Badge>{mod.moduleId}</Badge>
                      {mod.duration > 0 && <Badge color="#e65100" bg="#fff3e0"><FaClock size={9} /> {mod.duration}h</Badge>}
                    </div>
                    {mod.description && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{mod.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <IconBtn onClick={() => { setEditingMod(mod.moduleId); setEditModData({ name: mod.name, description: mod.description, duration: mod.duration, content: mod.content }); setExpandedMod(mod.moduleId); }} title="Edit">
                      <FaEdit size={10} />
                    </IconBtn>
                    <IconBtn danger onClick={() => removeModule(mod.moduleId)} title="Remove"><FaTrash size={10} /></IconBtn>
                  </div>
                  {expandedMod === mod.moduleId ? <FaChevronDown size={10} color="#999" /> : <FaChevronRight size={10} color="#999" />}
                </div>

                {/* Inline edit form */}
                {expandedMod === mod.moduleId && editingMod === mod.moduleId && (
                  <div style={{ padding: '12px 14px', borderTop: '1.5px solid #e0e7ff', background: '#fafafe' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <Field label="Name">
                        <input style={{ ...inp, fontSize: 13 }} value={editModData.name}
                          onChange={e => setEditModData(d => ({ ...d, name: e.target.value }))} />
                      </Field>
                      <Field label="Duration (h)">
                        <input style={{ ...inp, fontSize: 13 }} type="number" value={editModData.duration}
                          onChange={e => setEditModData(d => ({ ...d, duration: e.target.value }))} />
                      </Field>
                    </div>
                    <Field label="Description">
                      <input style={{ ...inp, fontSize: 13 }} value={editModData.description}
                        onChange={e => setEditModData(d => ({ ...d, description: e.target.value }))} />
                    </Field>
                    <Field label="Content">
                      <textarea style={{ ...inp, fontSize: 13, minHeight: 54, resize: 'vertical' }}
                        value={editModData.content}
                        onChange={e => setEditModData(d => ({ ...d, content: e.target.value }))} />
                    </Field>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                      <button type="button" onClick={() => setEditingMod(null)} style={cancelBtnSm}>Cancel</button>
                      <button type="button" onClick={saveModuleEdit} disabled={saving} style={{ ...saveBtnSm, opacity: saving ? 0.6 : 1 }}>
                        <FaSave size={10} /> {saving ? 'Saving…' : 'Save Module'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded view (read-only) */}
                {expandedMod === mod.moduleId && editingMod !== mod.moduleId && mod.content && (
                  <div style={{ padding: '10px 14px', borderTop: '1.5px solid #e0e7ff', background: '#fafafe' }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#666', lineHeight: 1.6 }}>{mod.content}</p>
                  </div>
                )}
              </div>
            ))
        )}
      </SectionPanel>

      {/* ── Trainers panel ── */}
      <SectionPanel
        title={`👩‍🏫 Trainers (${data.trainers.length})`}
        extra={
          availableTrainers.length > 0 && (
            <select style={{ ...inp, width: 'auto', minWidth: 200, fontSize: 12, color: '#667eea', borderColor: '#667eea' }}
              onChange={e => { if (e.target.value) { addTrainer(e.target.value); e.target.value = ''; } }} defaultValue="">
              <option value="" disabled>＋ Add trainer…</option>
              {availableTrainers.map(t => <option key={t.empId} value={t.empId}>{t.name} ({t.empId})</option>)}
            </select>
          )
        }
      >
        {data.trainers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#999', fontSize: 13 }}>No trainers assigned</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.trainers.map(t => (
              <div key={t.empId} style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: 'white', border: '1.5px solid #e0e7ff', borderRadius: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  <FaUser size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{t.email} · {t.experience} yrs exp</div>
                </div>
                <Badge>{t.empId}</Badge>
                <IconBtn danger onClick={() => removeTrainer(t.empId)} title="Remove trainer"><FaTrash size={10} /></IconBtn>
              </div>
            ))}
          </div>
        )}
      </SectionPanel>
    </div>
  );
};

// ─── Small section panel wrapper ─────────────────────────────
const SectionPanel = ({ title, extra, children }) => (
  <div style={{ border: '2px solid #e0e7ff', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 16px', background: 'linear-gradient(135deg,#f0f4ff,#fff)',
      borderBottom: '1.5px solid #e0e7ff', flexWrap: 'wrap', gap: 8 }}>
      <h4 style={{ margin: 0, fontSize: 14, color: '#333' }}>{title}</h4>
      {extra}
    </div>
    <div style={{ padding: 14 }}>{children}</div>
  </div>
);

// ─── Field wrapper ────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 4 }}>
    {label && <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 700, color: '#555' }}>{label}</label>}
    {children}
  </div>
);

// ─── Shared tiny styles ───────────────────────────────────────
const inp = {
  width: '100%', padding: '8px 10px', border: '1.5px solid #e0e0e0',
  borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box',
  fontFamily: 'inherit', outline: 'none',
};
const saveBtnSm = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
  fontWeight: 700, fontSize: 12,
  background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white',
};
const cancelBtnSm = {
  padding: '6px 14px', borderRadius: 6, border: '1.5px solid #e0e0e0',
  background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12, color: '#666',
};

// ─── MAIN MODAL ───────────────────────────────────────────────
const EditCourseModal = ({ course, subjects = [], onClose, onSave }) => {
  const [step, setStep] = useState('course');   // 'course' | 'subject'
  const [editingSubjectIdx, setEditingSubjectIdx] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '', courseId: '', description: '',
    duration: '', level: 'Beginner', category: 'Other',
    subjects: [], _isEdit: false
  });

  // Load all modules + trainers for dropdowns
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [mRes, tRes] = await Promise.all([
          axios.get(`${BASE}/modules`, getHeaders()),
          axios.get(`${BASE}/trainer`, getHeaders()),
        ]);
        setAllModules(mRes.data?.data || mRes.data || []);
        setAllTrainers(tRes.data?.data || tRes.data || []);
      } catch (e) {
        console.error('Failed to load modules/trainers', e);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  // Populate form from course prop
  useEffect(() => {
    if (course) {
      setFormData({
        _isEdit: true,
        name: course.name || '',
        courseId: course.courseId || '',
        description: course.description || '',
        duration: course.duration || '',
        level: course.level || 'Beginner',
        category: course.category || 'Other',
        subjects: (course.subjects || []).map((s, i) => ({
          ...s,
          sequenceOrder: s.sequenceOrder ?? i + 1,
          name: s.name || s.subjectId,
          modules: Array.isArray(s.modules) ? s.modules : [],
          trainers: Array.isArray(s.trainers) ? s.trainers : [],
        }))
      });
    }
  }, [course]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const addSubject = subjectId => {
    const sub = subjects.find(s => s.subjectId === subjectId);
    if (!sub) return;
    if (formData.subjects.find(s => s.subjectId === subjectId)) { toast.warning('Already added'); return; }
    setFormData(p => ({
      ...p,
      subjects: [...p.subjects, { ...sub, sequenceOrder: p.subjects.length + 1 }]
    }));
  };

  const removeSubject = subjectId => {
    setFormData(p => ({
      ...p,
      subjects: p.subjects.filter(s => s.subjectId !== subjectId).map((s, i) => ({ ...s, sequenceOrder: i + 1 }))
    }));
  };

  const moveSubject = (index, dir) => {
    const arr = [...formData.subjects];
    const to = dir === 'up' ? index - 1 : index + 1;
    if (to < 0 || to >= arr.length) return;
    [arr[index], arr[to]] = [arr[to], arr[index]];
    setFormData(p => ({ ...p, subjects: arr.map((s, i) => ({ ...s, sequenceOrder: i + 1 })) }));
  };

  const handleSubjectUpdate = useCallback((updatedSubject) => {
    setFormData(p => ({
      ...p,
      subjects: p.subjects.map(s => s.subjectId === updatedSubject.subjectId ? { ...s, ...updatedSubject } : s)
    }));
  }, []);

  const openSubjectEditor = idx => {
    setEditingSubjectIdx(idx);
    setStep('subject');
  };

  const handleSaveCourse = async () => {
    if (!formData.name || !formData.courseId) { toast.error('Name and ID required'); return; }
    if (!formData.duration || formData.duration < 1) { toast.error('Invalid duration'); return; }
    if (formData.subjects.length === 0) { toast.error('Add at least one subject'); return; }
    setSaving(true);
    try {
      await onSave(formData);
    } finally { setSaving(false); }
  };

  const currentSubject = editingSubjectIdx !== null ? formData.subjects[editingSubjectIdx] : null;

  const title = step === 'course'
    ? (course ? '✏️ Edit Course' : '➕ Create Course')
    : `📦 Edit Subject — ${currentSubject?.name || ''}`;

  return (
    <div style={S.overlay}>
      <div style={S.modal}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, color: '#333' }}>{title}</h2>
            {step === 'course' && (
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {formData.subjects.map((s, i) => (
                  <button key={s.subjectId} type="button" onClick={() => openSubjectEditor(i)}
                    style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20,
                      background: '#f0f4ff', border: '1.5px solid #c7d2fe', color: '#667eea',
                      fontWeight: 700, cursor: 'pointer' }}>
                    {s.name || s.subjectId}
                  </button>
                ))}
                {formData.subjects.length > 0 && (
                  <span style={{ fontSize: 11, color: '#aaa', alignSelf: 'center' }}>← click to edit</span>
                )}
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} style={S.closeBtn}><FaTimes /></button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading…</div>
          ) : step === 'course' ? (
            <CourseInfoStep
              formData={formData}
              onChange={handleChange}
              subjects={subjects}
              onAddSubject={addSubject}
              onRemoveSubject={removeSubject}
              onMoveSubject={moveSubject}
            />
          ) : (
            <SubjectEditor
              subject={currentSubject}
              allModules={allModules}
              allTrainers={allTrainers}
              onUpdate={handleSubjectUpdate}
              onBack={() => setStep('course')}
            />
          )}
        </div>

        {/* Footer */}
        {step === 'course' && (
          <div style={S.footer}>
            <button type="button" onClick={onClose} style={S.cancelBtn}>Cancel</button>
            <button type="button" onClick={handleSaveCourse} disabled={saving}
              style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : course ? '💾 Update Course' : '➕ Create Course'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: 16,
  },
  modal: {
    background: 'white', borderRadius: 14, width: '100%', maxWidth: 860,
    maxHeight: '92vh', display: 'flex', flexDirection: 'column',
    boxShadow: '0 24px 64px rgba(0,0,0,0.25)', overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '16px 20px', borderBottom: '2px solid #f0f0f0',
    background: 'linear-gradient(135deg,#f8f9ff,#fff)',
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#888',
    padding: 6, borderRadius: 6, fontSize: 16, display: 'flex', alignItems: 'center',
  },
  body: { padding: '20px', overflowY: 'auto', flex: 1 },
  footer: {
    padding: '14px 20px', borderTop: '2px solid #f0f0f0',
    display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafafa',
  },
  cancelBtn: {
    padding: '8px 20px', borderRadius: 6, border: '1.5px solid #e0e0e0',
    background: 'white', cursor: 'pointer', fontWeight: 600, color: '#666',
  },
  saveBtn: {
    padding: '8px 22px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontWeight: 700, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white',
    fontSize: 14,
  },
};

export default EditCourseModal;