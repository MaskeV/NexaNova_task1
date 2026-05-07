// frontend/src/components/DashBoard/AdminDashboard.jsx — FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaUsers, FaBook, FaGraduationCap, FaLayerGroup,
  FaArrowRight, FaChevronDown, FaChevronUp, FaChevronRight,
  FaClock, FaUserTie, FaUserGraduate
} from 'react-icons/fa';
import Loading from '../Common/Loading';
import '../../styles/pages/Dashboard.css';

const BASE = 'http://localhost:5000';
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
};

// ── Expandable Course card ─────────────────────────────────────
const CourseRow = ({ course }) => {
  const [open, setOpen] = useState(false);
  const [openSubject, setOpenSubject] = useState(null);
  const subjectCount = course.subjects?.length || 0;
  const moduleCount  = (course.subjects || []).reduce((s, sub) => s + (sub.modules?.length || 0), 0);

  return (
    <div className="recent-item card" style={{ padding: 0, overflow: 'hidden', cursor: 'default' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', cursor: 'pointer',
        background: open ? 'linear-gradient(135deg,#f0f4ff 0%,#fafaff 100%)' : 'white',
        transition: 'background 0.2s',
        userSelect: 'none'
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg,#667eea,#764ba2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FaGraduationCap color="white" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 5,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {course.name}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span style={pill('#667eea','#eef2ff')}>{course.courseId}</span>
            <span style={pill('#059669','#ecfdf5')}>{subjectCount} subject{subjectCount !== 1 ? 's' : ''}</span>
            <span style={pill('#7c3aed','#f5f3ff')}>{moduleCount} module{moduleCount !== 1 ? 's' : ''}</span>
            {course.level && <span style={pill('#d97706','#fffbeb')}>{course.level}</span>}
            {course.duration && <span style={pill('#0284c7','#f0f9ff')}>{course.duration}w</span>}
          </div>
        </div>
        <span style={{ color: '#94a3b8', flexShrink: 0 }}>
          {open ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </span>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #e0e7ff', background: '#f8faff' }}>
          {subjectCount === 0
            ? <p style={{ margin: 0, padding: '12px 20px', color: '#94a3b8', fontSize: 13 }}>No subjects</p>
            : (course.subjects || []).map((sub, si) => (
              <div key={sub.subjectId} style={{ borderBottom: '1px solid #e0e7ff' }}>
                <div onClick={() => setOpenSubject(openSubject === sub.subjectId ? null : sub.subjectId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                    cursor: sub.modules?.length > 0 ? 'pointer' : 'default',
                    background: openSubject === sub.subjectId ? '#eef2ff' : 'transparent',
                    transition: 'background 0.15s', userSelect: 'none'
                  }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: '#e0e7ff', color: '#667eea',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 11
                  }}>{si + 1}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{sub.name || sub.subjectId}</span>
                    <div style={{ display: 'flex', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={pill('#667eea','#eef2ff')}>{sub.subjectId}</span>
                      <span style={pill('#7c3aed','#f5f3ff')}>{sub.modules?.length || 0} modules</span>
                      {sub.level && <span style={pill('#059669','#ecfdf5')}>{sub.level}</span>}
                      {(sub.totalDuration || sub.duration) > 0 && (
                        <span style={pill('#0284c7','#f0f9ff')}>{sub.totalDuration || sub.duration}h</span>
                      )}
                    </div>
                  </div>
                  {sub.modules?.length > 0 && (
                    <span style={{ color: '#94a3b8' }}>
                      {openSubject === sub.subjectId ? <FaChevronDown size={11} /> : <FaChevronRight size={11} />}
                    </span>
                  )}
                </div>

                {openSubject === sub.subjectId && sub.modules?.length > 0 && (
                  <div style={{ background: '#f0f4ff', paddingLeft: 52, paddingRight: 16, paddingBottom: 8 }}>
                    {[...sub.modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((mod, mi) => (
                      <div key={mod.moduleId || mi} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0',
                        borderBottom: mi < sub.modules.length - 1 ? '1px solid #dde5ff' : 'none'
                      }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          background: '#c7d2fe', color: '#4338ca',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 10
                        }}>{mod.order ?? mi + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{mod.name}</span>
                          {mod.description && (
                            <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>— {mod.description}</span>
                          )}
                        </div>
                        {mod.duration > 0 && <span style={pill('#d97706','#fffbeb')}>{mod.duration}h</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

// ── Trainer row ────────────────────────────────────────────────
const TrainerRow = ({ trainer }) => (
  <div className="recent-item card">
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#667eea,#764ba2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <FaUserTie color="white" size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 2 }}>{trainer.name}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{trainer.empId} · {trainer.email}</div>
        {trainer.subjects?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {trainer.subjects.slice(0, 4).map((s, i) => (
              <span key={i} style={pill('#667eea','#eef2ff')}>{s}</span>
            ))}
            {trainer.subjects.length > 4 && (
              <span style={pill('#94a3b8','#f1f5f9')}>+{trainer.subjects.length - 4}</span>
            )}
          </div>
        )}
      </div>
      {trainer.experience && (
        <span style={{ ...pill('#059669','#ecfdf5'), flexShrink: 0 }}>{trainer.experience}y exp</span>
      )}
    </div>
  </div>
);

// ── Stat Card ──────────────────────────────────────────────────
const StatCard = ({ label, value, icon, gradient, to, loading }) => (
  <div className="stat-card card" style={{ position: 'relative', overflow: 'hidden' }}>
    {/* decorative circle */}
    <div style={{
      position: 'absolute', top: -20, right: -20,
      width: 100, height: 100, borderRadius: '50%',
      background: gradient, opacity: 0.08
    }} />
    <div className="stat-icon" style={{ background: gradient }}>
      {React.cloneElement(icon, { color: 'white', size: 26 })}
    </div>
    <div className="stat-content">
      <h3 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
        {loading ? '—' : value}
      </h3>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{label}</p>
    </div>
    {to && (
      <Link to={to} className="stat-link" style={{ fontWeight: 700 }}>
        View All <FaArrowRight size={11} />
      </Link>
    )}
  </div>
);

// ── pill helper ────────────────────────────────────────────────
const pill = (color, bg) => ({
  fontSize: 11, fontWeight: 700, color, background: bg,
  padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap',
  display: 'inline-block', letterSpacing: 0.2
});

// ── MAIN ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [data, setData] = useState({
    totalTrainers: 0, totalCourses: 0, totalStudents: 0,
    recentTrainers: [], recentCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let trainers = [], subjects = [], courses = [], students = [];

      await Promise.allSettled([
        axios.get(`${BASE}/trainer`, getHeaders()).then(r => { trainers = r.data?.data || []; }),
        axios.get(`${BASE}/subject`, getHeaders()).then(r => { subjects = r.data?.data || []; }),
        axios.get(`${BASE}/courses`, getHeaders()).then(r => { courses = r.data?.data || []; }),
        // FIXED: Fetch all students from /students endpoint
        axios.get(`${BASE}/students`, getHeaders()).then(r => { students = r.data?.data || []; }),
      ]);

      // Build subjects map for enriching courses
      const subjectsMap = {};
      subjects.forEach(s => { subjectsMap[s.subjectId] = s; });

      const enrichedCourses = courses.map(course => ({
        ...course,
        subjects: (course.subjects || [])
          .map(ref => {
            const full = subjectsMap[ref.subjectId];
            return full
              ? { ...full, sequenceOrder: ref.order ?? 0 }
              : { subjectId: ref.subjectId, name: ref.subjectId, modules: [], trainers: [] };
          })
          .sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0))
      }));

      setData({
        totalTrainers: trainers.length,
        totalCourses: courses.length,
        totalStudents: students.length, // FIXED: Count all students
        recentTrainers: trainers.slice(0, 5),
        recentCourses: enrichedCourses.slice(0, 5),
      });
    } catch (e) {
      console.error('Dashboard fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  const statCards = [
    {
      label: 'Total Trainers', value: data.totalTrainers,
      icon: <FaUsers />, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', to: '/trainers'
    },
    {
      label: 'Total Courses', value: data.totalCourses,
      icon: <FaUsers />, gradient: 'linear-gradient(135deg,#10b981,#059669)', to: '/courses'
    },
    {
      label: 'Total Students', value: data.totalStudents,
      icon: <FaUsers />, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', to: '/students'
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 style={{ fontFamily: "'Poppins', 'Segoe UI', sans-serif", fontWeight: 800, letterSpacing: -0.5 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#64748b', fontWeight: 500 }}>
          Manage trainers, courses and student enrollments
        </p>
      </div>

      {/* ── 3 Stat Cards ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {statCards.map(c => (
          <StatCard key={c.label} {...c} loading={loading} />
        ))}
      </div>

      {/* ── Two columns ── */}
      <div className="dashboard-content">
        {/* Left — Trainers */}
        <div className="recent-section">
          <div className="section-header">
            <h2 style={{ fontFamily: "'Poppins','Segoe UI',sans-serif", fontWeight: 700 }}>
              Recent Trainers
            </h2>
            <Link to="/trainers" className="view-all-link">View All</Link>
          </div>
          <div className="recent-list">
            {data.recentTrainers.length === 0
              ? <p className="empty-message">No trainers yet</p>
              : data.recentTrainers.map(t => <TrainerRow key={t.empId} trainer={t} />)
            }
          </div>
        </div>

        {/* Right — Courses (expandable) */}
        <div className="recent-section">
          <div className="section-header">
            <h2 style={{ fontFamily: "'Poppins','Segoe UI',sans-serif", fontWeight: 700 }}>
              Recent Courses
            </h2>
            <Link to="/courses" className="view-all-link">View All</Link>
          </div>
          <div className="recent-list">
            {data.recentCourses.length === 0
              ? <p className="empty-message">No courses yet</p>
              : data.recentCourses.map(c => <CourseRow key={c.courseId} course={c} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;