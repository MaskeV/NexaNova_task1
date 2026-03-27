// frontend/src/pages/SubjectManagement.jsx  (or components/Subjects/SubjectManagement.jsx)
// REPLACE / CREATE THIS FILE
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaChevronDown,
  FaChevronUp, FaLayerGroup, FaUsers, FaClock, FaCheck
} from 'react-icons/fa';

const BASE = 'http://localhost:5000';
const hdrs = () => {
  const t = localStorage.getItem('token');
  return { headers: t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } };
};

// ── tiny shared components ────────────────────────────────────
const Pill = ({ children, color = '#667eea', bg = '#eef2ff' }) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg,
    padding: '2px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
    {children}
  </span>
);

const Inp = ({ label, error, ...props }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>{label}</label>}
    <input style={{
      width: '100%', boxSizing: 'border-box', padding: '8px 10px',
      border: `1.5px solid ${error ? '#f87171' : '#e2e8f0'}`, borderRadius: 7,
      fontSize: 13, fontFamily: 'inherit', outline: 'none',
      background: props.disabled ? '#f8fafc' : 'white'
    }} {...props} />
    {error && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2, display: 'block' }}>{error}</span>}
  </div>
);

const Sel = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>{label}</label>}
    <select style={{
      width: '100%', boxSizing: 'border-box', padding: '8px 10px',
      border: '1.5px solid #e2e8f0', borderRadius: 7,
      fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white'
    }} {...props}>{children}</select>
  </div>
);

const Btn = ({ children, variant = 'primary', sm, ...props }) => {
  const styles = {
    primary: { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none' },
    secondary: { background: 'white', color: '#475569', border: '1.5px solid #e2e8f0' },
    danger: { background: 'white', color: '#ef4444', border: '1.5px solid #fca5a5' },
    success: { background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none' },
  };
  return (
    <button type="button" style={{
      ...styles[variant],
      padding: sm ? '5px 12px' : '8px 16px',
      borderRadius: 7, fontWeight: 700, fontSize: sm ? 12 : 13,
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? 0.5 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'inherit', transition: 'all 0.15s',
    }} {...props}>{children}</button>
  );
};

// ── Create/Edit Module mini-form ──────────────────────────────
const ModuleForm = ({ onSave, onCancel, initial = {} }) => {
  const [d, setD] = useState({
    moduleId: '', name: '', description: '', duration: '', content: '',
    learningObjectives: '', ...initial
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!d.moduleId || !d.name) { toast.error('Module ID and Name are required'); return; }
    setSaving(true);
    try {
      const payload = {
        moduleId: d.moduleId.trim().toUpperCase(),
        name: d.name.trim(),
        description: d.description.trim(),
        duration: parseInt(d.duration) || 0,
        content: d.content.trim(),
        order: 1,
        isActive: true,
        learningObjectives: d.learningObjectives
          ? d.learningObjectives.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        prerequisites: [],
        resources: [],
      };
      let result;
      if (initial._id) {
        const res = await axios.put(`${BASE}/modules/${initial.moduleId}`, payload, hdrs());
        result = res.data?.data || res.data;
      } else {
        const res = await axios.post(`${BASE}/modules`, payload, hdrs());
        result = res.data?.data || res.data;
      }
      toast.success(initial._id ? 'Module updated!' : 'Module created!');
      onSave(result || payload);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save module');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ background: '#f8faff', border: '2px dashed #c7d2fe', borderRadius: 10, padding: 16, marginBottom: 10 }}>
      <p style={{ margin: '0 0 12px', fontWeight: 800, fontSize: 13, color: '#667eea' }}>
        {initial._id ? '✏️ Edit Module' : '➕ New Module'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <Inp label="Module ID *" value={d.moduleId} placeholder="e.g. MD014"
          disabled={!!initial._id}
          onChange={e => setD(p => ({ ...p, moduleId: e.target.value }))} />
        <Inp label="Name *" value={d.name} placeholder="Module name"
          onChange={e => setD(p => ({ ...p, name: e.target.value }))} />
        <Inp label="Duration (hours)" type="number" value={d.duration} placeholder="4"
          onChange={e => setD(p => ({ ...p, duration: e.target.value }))} />
        <Inp label="Description" value={d.description} placeholder="Short description"
          onChange={e => setD(p => ({ ...p, description: e.target.value }))} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Content</label>
        <textarea value={d.content} onChange={e => setD(p => ({ ...p, content: e.target.value }))}
          placeholder="Module content details..."
          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px',
            border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 13,
            fontFamily: 'inherit', minHeight: 60, resize: 'vertical', outline: 'none' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
          Learning Objectives <span style={{ fontWeight: 400, color: '#94a3b8' }}>(one per line)</span>
        </label>
        <textarea value={d.learningObjectives} onChange={e => setD(p => ({ ...p, learningObjectives: e.target.value }))}
          placeholder={"Understand X\nBe able to Y\nMaster Z"}
          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px',
            border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 13,
            fontFamily: 'inherit', minHeight: 60, resize: 'vertical', outline: 'none' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="secondary" sm onClick={onCancel}>Cancel</Btn>
        <Btn sm onClick={save} disabled={saving}>
          <FaCheck size={10} /> {saving ? 'Saving…' : 'Save Module'}
        </Btn>
      </div>
    </div>
  );
};

// ── Subject form (create or edit) ─────────────────────────────
const SubjectForm = ({ initial, allModules, allTrainers, onSaved, onCancel }) => {
  const isEdit = !!initial;
  const [d, setD] = useState({
    subjectId: '', name: '', description: '', level: 'Beginner',
    modules: [], trainers: [],
    ...(initial ? {
      subjectId: initial.subjectId,
      name: initial.name,
      description: initial.description,
      level: initial.level || 'Beginner',
      modules: initial.modules || [],
      trainers: (initial.trainers || []).map(t => t.empId || t),
    } : {})
  });
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingMod, setEditingMod] = useState(null);
  const [localModules, setLocalModules] = useState(allModules); // grows when new module created
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const moduleIds = d.modules.map(m => m.moduleId);
  const trainerIds = d.trainers;
  const available = localModules.filter(m => !moduleIds.includes(m.moduleId));
  const availableTrainers = allTrainers.filter(t => !trainerIds.includes(t.empId));

  const validate = () => {
    const e = {};
    if (!d.subjectId.trim()) e.subjectId = 'Required';
    else if (!/^SB\d{2,}$/i.test(d.subjectId.trim())) e.subjectId = 'Format: SB01, SB02…';
    if (!d.name.trim() || d.name.trim().length < 3) e.name = 'Min 3 characters';
    if (!d.description.trim() || d.description.trim().length < 10) e.description = 'Min 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addModule = (moduleId) => {
    const mod = localModules.find(m => m.moduleId === moduleId);
    if (!mod) return;
    setD(p => ({ ...p, modules: [...p.modules, { ...mod, order: p.modules.length + 1 }] }));
  };

  const removeModule = (moduleId) => {
    setD(p => ({ ...p, modules: p.modules.filter(m => m.moduleId !== moduleId).map((m, i) => ({ ...m, order: i + 1 })) }));
  };

  const moveModule = (idx, dir) => {
    const arr = [...d.modules];
    const to = dir === 'up' ? idx - 1 : idx + 1;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    setD(p => ({ ...p, modules: arr.map((m, i) => ({ ...m, order: i + 1 })) }));
  };

  const onModuleCreated = (mod) => {
    setLocalModules(prev => [...prev, mod]);
    setD(p => ({ ...p, modules: [...p.modules, { ...mod, order: p.modules.length + 1 }] }));
    setShowModuleForm(false);
    setEditingMod(null);
  };

  const onModuleEdited = (mod) => {
    setLocalModules(prev => prev.map(m => m.moduleId === mod.moduleId ? { ...m, ...mod } : m));
    setD(p => ({ ...p, modules: p.modules.map(m => m.moduleId === mod.moduleId ? { ...m, ...mod } : m) }));
    setEditingMod(null);
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        subjectId: d.subjectId.trim().toUpperCase(),
        name: d.name.trim(),
        description: d.description.trim(),
        level: d.level,
        modules: d.modules.map((m, i) => ({ moduleId: m.moduleId, order: m.order ?? i + 1 })),
        trainers: d.trainers,
        isActive: true,
      };
      let result;
      if (isEdit) {
        const res = await axios.put(`${BASE}/subject/${initial.subjectId}`, payload, hdrs());
        result = res.data?.data || res.data;
        toast.success('Subject updated!');
      } else {
        const res = await axios.post(`${BASE}/subject`, payload, hdrs());
        result = res.data?.data || res.data;
        toast.success('Subject created!');
      }
      onSaved(result || payload);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save subject');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 4px 24px rgba(102,126,234,0.13)',
      border: '2px solid #e0e7ff', padding: 24, marginBottom: 20 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>
          {isEdit ? `✏️ Edit — ${initial.name}` : '➕ Create New Subject'}
        </h2>
        {onCancel && <Btn variant="secondary" sm onClick={onCancel}><FaTimes size={10} /> Cancel</Btn>}
      </div>

      {/* Basic fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Inp label="Subject ID *" value={d.subjectId} placeholder="e.g. SB16"
          disabled={isEdit}
          error={errors.subjectId}
          onChange={e => setD(p => ({ ...p, subjectId: e.target.value }))} />
        <Inp label="Name *" value={d.name} placeholder="Subject name"
          error={errors.name}
          onChange={e => setD(p => ({ ...p, name: e.target.value }))} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
          Description * <span style={{ fontWeight: 400, color: '#94a3b8' }}>(min 10 chars)</span>
        </label>
        <textarea value={d.description} onChange={e => setD(p => ({ ...p, description: e.target.value }))}
          placeholder="Describe what this subject covers..."
          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px',
            border: `1.5px solid ${errors.description ? '#f87171' : '#e2e8f0'}`,
            borderRadius: 7, fontSize: 13, fontFamily: 'inherit',
            minHeight: 72, resize: 'vertical', outline: 'none' }} />
        {errors.description && <span style={{ fontSize: 11, color: '#ef4444' }}>{errors.description}</span>}
      </div>

      <Sel label="Level" value={d.level} onChange={e => setD(p => ({ ...p, level: e.target.value }))}>
        {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
      </Sel>

      {/* ── Modules ── */}
      <div style={{ borderTop: '2px solid #f0f4ff', paddingTop: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1e293b' }}>
            <FaLayerGroup size={13} style={{ marginRight: 6, color: '#667eea' }} />
            Modules ({d.modules.length})
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {available.length > 0 && (
              <select onChange={e => { if (e.target.value) { addModule(e.target.value); e.target.value = ''; } }}
                defaultValue=""
                style={{ padding: '5px 10px', border: '1.5px solid #667eea', borderRadius: 7,
                  fontSize: 12, fontWeight: 600, color: '#667eea', background: 'white',
                  cursor: 'pointer', fontFamily: 'inherit' }}>
                <option value="" disabled>＋ Add existing…</option>
                {available.map(m => <option key={m.moduleId} value={m.moduleId}>{m.name} ({m.moduleId})</option>)}
              </select>
            )}
            <Btn sm onClick={() => { setShowModuleForm(true); setEditingMod(null); }}>
              <FaPlus size={9} /> New Module
            </Btn>
          </div>
        </div>

        {/* New module form */}
        {showModuleForm && !editingMod && (
          <ModuleForm onSave={onModuleCreated} onCancel={() => setShowModuleForm(false)} />
        )}

        {/* Module list */}
        {d.modules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', background: '#f8faff',
            borderRadius: 8, color: '#94a3b8', fontSize: 13 }}>
            No modules added yet — add existing or create new
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.modules.map((mod, i) => (
              <div key={mod.moduleId}>
                {editingMod === mod.moduleId ? (
                  <ModuleForm
                    initial={{ ...mod, learningObjectives: mod.learningObjectives?.join('\n') || '' }}
                    onSave={onModuleEdited}
                    onCancel={() => setEditingMod(null)}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', background: '#f0f4ff',
                    border: '1.5px solid #e0e7ff', borderRadius: 8 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 11 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 13, color: '#1e293b' }}>{mod.name}</strong>
                        <Pill>{mod.moduleId}</Pill>
                        {mod.duration > 0 && <Pill color="#d97706" bg="#fffbeb"><FaClock size={9} /> {mod.duration}h</Pill>}
                      </div>
                      {mod.description && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>{mod.description}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Btn variant="secondary" sm onClick={() => moveModule(i, 'up')} disabled={i === 0}><FaChevronUp size={9} /></Btn>
                      <Btn variant="secondary" sm onClick={() => moveModule(i, 'down')} disabled={i === d.modules.length - 1}><FaChevronDown size={9} /></Btn>
                      <Btn variant="secondary" sm onClick={() => setEditingMod(mod.moduleId)}><FaEdit size={9} /></Btn>
                      <Btn variant="danger" sm onClick={() => removeModule(mod.moduleId)}><FaTrash size={9} /></Btn>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Trainers ── */}
      <div style={{ borderTop: '2px solid #f0f4ff', paddingTop: 16, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1e293b' }}>
            <FaUsers size={13} style={{ marginRight: 6, color: '#667eea' }} />
            Trainers ({d.trainers.length})
          </h3>
          {availableTrainers.length > 0 && (
            <select onChange={e => { if (e.target.value) { setD(p => ({ ...p, trainers: [...p.trainers, e.target.value] })); e.target.value = ''; } }}
              defaultValue=""
              style={{ padding: '5px 10px', border: '1.5px solid #667eea', borderRadius: 7,
                fontSize: 12, fontWeight: 600, color: '#667eea', background: 'white',
                cursor: 'pointer', fontFamily: 'inherit' }}>
              <option value="" disabled>＋ Assign trainer…</option>
              {availableTrainers.map(t => <option key={t.empId} value={t.empId}>{t.name} ({t.empId})</option>)}
            </select>
          )}
        </div>

        {d.trainers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 12, background: '#f8faff', borderRadius: 8, color: '#94a3b8', fontSize: 13 }}>
            No trainers assigned
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {d.trainers.map(empId => {
              const t = allTrainers.find(x => x.empId === empId);
              return (
                <div key={empId} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', background: '#f0f4ff', border: '1.5px solid #e0e7ff', borderRadius: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>{t?.name || empId}</span>
                  <Pill>{empId}</Pill>
                  <button type="button" onClick={() => setD(p => ({ ...p, trainers: p.trainers.filter(x => x !== empId) }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                      padding: 0, lineHeight: 1, fontWeight: 800, fontSize: 14 }}>×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '2px solid #f0f4ff' }}>
        {onCancel && <Btn variant="secondary" onClick={onCancel} style={{ marginRight: 8 }}>Cancel</Btn>}
        <Btn onClick={save} disabled={saving}>
          <FaSave size={12} /> {saving ? 'Saving…' : isEdit ? 'Update Subject' : 'Create Subject'}
        </Btn>
      </div>
    </div>
  );
};

// ── Subject card (read-only with expand) ──────────────────────
const SubjectCard = ({ subject, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const lvlColor = { Beginner: ['#059669','#ecfdf5'], Intermediate: ['#d97706','#fffbeb'], Advanced: ['#dc2626','#fef2f2'] };
  const [c, bg] = lvlColor[subject.level] || ['#667eea','#eef2ff'];

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1.5px solid #e0e7ff',
      boxShadow: '0 2px 8px rgba(102,126,234,0.08)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            fontWeight: 800, fontSize: 14 }}>
            {subject.name?.charAt(0) || 'S'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
              <strong style={{ fontSize: 15, color: '#1e293b' }}>{subject.name}</strong>
              <Pill>{subject.subjectId}</Pill>
              <Pill color={c} bg={bg}>{subject.level}</Pill>
              <Pill color="#7c3aed" bg="#f5f3ff"><FaLayerGroup size={9} /> {subject.modules?.length || 0} modules</Pill>
              <Pill color="#0284c7" bg="#f0f9ff"><FaUsers size={9} /> {subject.trainers?.length || 0} trainers</Pill>
              {subject.totalDuration > 0 && <Pill color="#d97706" bg="#fffbeb"><FaClock size={9} /> {subject.totalDuration}h</Pill>}
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{subject.description}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <Btn variant="secondary" sm onClick={() => setOpen(o => !o)}>
              {open ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
            </Btn>
            <Btn variant="secondary" sm onClick={() => onEdit(subject)}><FaEdit size={10} /></Btn>
            <Btn variant="danger" sm onClick={() => onDelete(subject.subjectId)}><FaTrash size={10} /></Btn>
          </div>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1.5px solid #e0e7ff', background: '#f8faff', padding: '12px 16px' }}>
          {subject.modules?.length > 0 && (
            <>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#667eea' }}>MODULES</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {[...subject.modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((m, i) => (
                  <div key={m.moduleId || i} style={{ display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', background: 'white', borderRadius: 7, border: '1px solid #e0e7ff' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#e0e7ff',
                      color: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 10, flexShrink: 0 }}>{m.order ?? i + 1}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#334155' }}>{m.name}</span>
                    <Pill>{m.moduleId}</Pill>
                    {m.duration > 0 && <Pill color="#d97706" bg="#fffbeb">{m.duration}h</Pill>}
                  </div>
                ))}
              </div>
            </>
          )}
          {subject.trainers?.length > 0 && (
            <>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#667eea' }}>TRAINERS</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {subject.trainers.map((t, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, color: '#334155',
                    background: '#f0f4ff', padding: '4px 12px', borderRadius: 20, border: '1px solid #e0e7ff' }}>
                    {t.name || t.empId || t}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── PAGE ───────────────────────────────────────────────────────
const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, mRes, tRes] = await Promise.all([
        axios.get(`${BASE}/subject`, hdrs()),
        axios.get(`${BASE}/modules`, hdrs()),
        axios.get(`${BASE}/trainer`, hdrs()),
      ]);
      setSubjects(sRes.data?.data || []);
      setAllModules(mRes.data?.data || mRes.data || []);
      setAllTrainers(tRes.data?.data || []);
    } catch (e) {
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  const handleSaved = () => {
    setShowCreate(false);
    setEditingSubject(null);
    loadAll();
  };

  const handleDelete = async (subjectId) => {
    if (!window.confirm('Delete this subject? This cannot be undone.')) return;
    try {
      await axios.delete(`${BASE}/subject/${subjectId}`, hdrs());
      toast.success('Subject deleted');
      loadAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = subjects.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.subjectId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8', fontSize: 14 }}>
      Loading subjects…
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto', fontFamily: "'Poppins','Segoe UI',sans-serif" }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', letterSpacing: -0.5 }}>
            📚 Subjects
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''} · {allModules.length} modules total
          </p>
        </div>
        {!showCreate && !editingSubject && (
          <Btn onClick={() => setShowCreate(true)}>
            <FaPlus size={11} /> Create Subject
          </Btn>
        )}
      </div>

      {/* Create form */}
      {showCreate && !editingSubject && (
        <SubjectForm
          allModules={allModules}
          allTrainers={allTrainers}
          onSaved={handleSaved}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Edit form */}
      {editingSubject && (
        <SubjectForm
          initial={editingSubject}
          allModules={allModules}
          allTrainers={allTrainers}
          onSaved={handleSaved}
          onCancel={() => setEditingSubject(null)}
        />
      )}

      {/* Search */}
      {!showCreate && !editingSubject && subjects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subjects by name or ID…"
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px',
              border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13,
              fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
      )}

      {/* Subject cards */}
      {!showCreate && !editingSubject && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white',
              borderRadius: 12, color: '#94a3b8', border: '1.5px dashed #e2e8f0' }}>
              <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>No subjects yet</p>
              <p style={{ fontSize: 13, margin: 0 }}>Click "Create Subject" to get started</p>
            </div>
          ) : (
            filtered.map(s => (
              <SubjectCard
                key={s.subjectId}
                subject={s}
                onEdit={setEditingSubject}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;