import React, { useState, useEffect } from 'react';
import { timetableAPI, classesAPI, teacherAssignmentsAPI, teachersAPI, subjectsAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Calendar, Plus, Trash2, Save, ChevronLeft } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DAY_COLORS = {
  monday:    { bg: '#eef2ff', border: '#c7d2fe', accent: '#4f46e5', text: '#3730a3' },
  tuesday:   { bg: '#fdf4ff', border: '#e9d5ff', accent: '#9333ea', text: '#7e22ce' },
  wednesday: { bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a', text: '#15803d' },
  thursday:  { bg: '#fff7ed', border: '#fed7aa', accent: '#ea580c', text: '#c2410c' },
  friday:    { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', text: '#1d4ed8' },
  saturday:  { bg: '#fdf2f8', border: '#fbcfe8', accent: '#db2777', text: '#be185d' },
};

/* ── shared inline styles ── */
const st = {
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  pageTitle:  { fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 },
  pageSubtitle: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },

  selectRow: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  selectWrap: { display: 'flex', flexDirection: 'column', gap: '4px' },
  selectLabel: { fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  select: {
    height: '42px', padding: '0 36px 0 14px', fontSize: '14px', fontWeight: 500,
    color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '10px',
    background: '#fff', outline: 'none', cursor: 'pointer', minWidth: '180px',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '18px',
  },
  selectFocus: { borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' },

  emptyCard: {
    background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
    padding: '60px 24px', textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },

  /* Week grid */
  weekGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },

  dayCard: (day, hasEntries) => ({
    borderRadius: '16px', border: `1px solid ${DAY_COLORS[day].border}`,
    background: '#fff', cursor: 'pointer', overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.15s, transform 0.15s',
  }),
  dayCardHeader: (day) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', background: DAY_COLORS[day].bg,
    borderBottom: `1px solid ${DAY_COLORS[day].border}`,
  }),
  dayName: (day) => ({
    fontSize: '13px', fontWeight: 700, color: DAY_COLORS[day].text,
    textTransform: 'capitalize',
  }),
  periodCount: (day) => ({
    fontSize: '11px', fontWeight: 600, color: DAY_COLORS[day].accent,
    background: '#fff', border: `1px solid ${DAY_COLORS[day].border}`,
    padding: '2px 8px', borderRadius: '20px',
  }),
  dayBody: { padding: '12px 14px', minHeight: '80px' },
  emptyDay: { fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '16px 0' },

  periodPill: (isBreak, day) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '6px 10px', borderRadius: '8px', marginBottom: '6px',
    background: isBreak ? '#fffbeb' : DAY_COLORS[day].bg,
    border: `1px solid ${isBreak ? '#fde68a' : DAY_COLORS[day].border}`,
  }),
  periodTime: (isBreak, day) => ({
    fontSize: '11px', fontWeight: 700, fontFamily: 'monospace',
    color: isBreak ? '#92400e' : DAY_COLORS[day].accent,
    flexShrink: 0,
  }),
  periodSubject: (isBreak) => ({
    fontSize: '12px', fontWeight: 600, color: isBreak ? '#92400e' : '#1e293b',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  }),

  /* Day editor */
  editorCard: {
    background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
  },
  editorHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafafa',
  },
  editorTitle: { display: 'flex', alignItems: 'center', gap: '10px' },
  editorTitleText: { fontSize: '16px', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' },
  editorActions: { display: 'flex', gap: '8px' },

  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    height: '38px', padding: '0 16px', borderRadius: '10px',
    fontSize: '13px', fontWeight: 600,
    background: '#fff', color: '#475569', border: '1px solid #e2e8f0',
    cursor: 'pointer',
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    height: '38px', padding: '0 18px', borderRadius: '10px',
    fontSize: '13px', fontWeight: 600,
    background: '#4f46e5', color: '#fff', border: 'none',
    cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  },
  btnAddPeriod: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    height: '36px', padding: '0 14px', borderRadius: '9px',
    fontSize: '12px', fontWeight: 600,
    background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe',
    cursor: 'pointer', marginTop: '12px',
  },
  btnIconDanger: {
    width: '32px', height: '32px', borderRadius: '8px', border: 'none',
    background: 'transparent', cursor: 'pointer', color: '#f43f5e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  entryRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '12px', marginBottom: '8px',
    background: '#f8fafc', border: '1px solid #f1f5f9',
  },
  inputField: {
    height: '38px', padding: '0 12px', fontSize: '13px',
    border: '1px solid #e2e8f0', borderRadius: '9px',
    background: '#fff', color: '#0f172a', outline: 'none',
    fontFamily: 'inherit',
  },
  selectField: {
    height: '38px', padding: '0 32px 0 12px', fontSize: '13px',
    border: '1px solid #e2e8f0', borderRadius: '9px',
    background: '#fff', color: '#0f172a', outline: 'none',
    fontFamily: 'inherit', flex: 1, cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px',
  },
  timeSep: { fontSize: '14px', color: '#94a3b8', fontWeight: 700, flexShrink: 0 },
  breakLabel: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', fontWeight: 600, color: '#64748b',
    cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
  },
  sectionBody: { padding: '16px 20px' },
};

export function Timetables() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [timetable, setTimetable] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDay, setEditDay] = useState(null);
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadClasses();
    loadTeachers();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadTimetable();
      loadAssignments();
    }
  }, [selectedClass, selectedSection]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch { /* ignore */ }
  };

  const loadTeachers = async () => {
    try {
      const res = await teachersAPI.getOptions();
      setTeachers(res.items || []);
    } catch { /* ignore */ }
  };

  const loadSubjects = async () => {
    try {
      const res = await subjectsAPI.list();
      setSubjects(res.items || []);
    } catch { /* ignore */ }
  };

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const res = await timetableAPI.getSection(Number(selectedClass), Number(selectedSection));
      setTimetable(res.data || {});
    } catch {
      setTimetable({});
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await teacherAssignmentsAPI.getBySection(Number(selectedSection));
      setAssignments(res.data || []);
    } catch { /* ignore */ }
  };

  const selectedSections = classes.find((c) => String(c.id) === String(selectedClass))?.sections || [];

  const openDayEditor = (day) => {
    const dayEntries = timetable[day] || [];
    setEntries(dayEntries.length > 0
      ? dayEntries.map((e) => ({
          start_time: e.start_time || '',
          end_time: e.end_time || '',
          teacher_assignment_id: e.teacher_assignment_id || '',
          teacher_id: e.teacher_id || '',
          subject_id: e.subject_id || '',
          title: e.title || '',
          is_break: e.is_break || false,
        }))
      : [{ start_time: '09:00', end_time: '09:45', teacher_assignment_id: '', teacher_id: '', subject_id: '', title: '', is_break: false }]
    );
    setEditDay(day);
  };

  const addEntry = () => setEntries([...entries, { start_time: '', end_time: '', teacher_assignment_id: '', teacher_id: '', subject_id: '', title: '', is_break: false }]);
  const removeEntry = (idx) => setEntries(entries.filter((_, i) => i !== idx));
  const updateEntry = (idx, field, value) => {
    const updated = [...entries];
    updated[idx][field] = field === 'is_break' ? value
      : (field === 'teacher_assignment_id' || field === 'teacher_id' || field === 'subject_id') ? (value === '' ? undefined : Number(value))
      : value;
    setEntries(updated);
  };

  const handleSaveDay = async () => {
    setSaving(true);
    try {
      await timetableAPI.create(Number(selectedClass), Number(selectedSection), editDay, entries.map((e) => ({
        start_time: e.start_time,
        end_time: e.end_time,
        teacher_id: e.teacher_id ? Number(e.teacher_id) : undefined,
        subject_id: e.subject_id ? Number(e.subject_id) : undefined,
        title: e.title || undefined,
        is_break: e.is_break,
      })));
      toast.success(`${editDay.charAt(0).toUpperCase() + editDay.slice(1)} saved`);
      setEditDay(null);
      loadTimetable();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const selectedClassName = classes.find(c => String(c.id) === String(selectedClass))?.class_name || '';
  const selectedSectionName = selectedSections.find(s => String(s.id) === String(selectedSection))?.name || '';

  return (
    <div>
      {/* Header */}
      <div style={st.pageHeader}>
        <div>
          <h1 style={st.pageTitle}>Timetables</h1>
          <p style={st.pageSubtitle}>Create and manage section timetables</p>
        </div>
      </div>

      {/* Class + Section selectors */}
      <div style={st.selectRow}>
        <div style={st.selectWrap}>
          <span style={st.selectLabel}>Class</span>
          <select
            style={st.select}
            value={selectedClass}
            onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); setTimetable({}); setEditDay(null); }}
          >
            <option value="">Select class…</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
          </select>
        </div>
        <div style={st.selectWrap}>
          <span style={st.selectLabel}>Section</span>
          <select
            style={{ ...st.select, opacity: !selectedClass ? 0.5 : 1, cursor: !selectedClass ? 'not-allowed' : 'pointer' }}
            value={selectedSection}
            onChange={e => { setSelectedSection(e.target.value); setEditDay(null); }}
            disabled={!selectedClass}
          >
            <option value="">Select section…</option>
            {selectedSections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
          </select>
        </div>

        {/* Breadcrumb pill when both selected */}
        {selectedClass && selectedSection && (
          <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '6px', height: '42px', padding: '0 14px', background: '#eef2ff', borderRadius: '10px', border: '1px solid #c7d2fe' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5' }}>{selectedClassName}</span>
            <span style={{ fontSize: '13px', color: '#a5b4fc' }}>·</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6366f1' }}>Section {selectedSectionName}</span>
          </div>
        )}
      </div>

      {/* Body */}
      {!selectedClass || !selectedSection ? (
        <div style={st.emptyCard}>
          <Calendar style={{ width: '44px', height: '44px', color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Select a class and section</p>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>Choose above to view or edit the timetable</p>
        </div>
      ) : loading ? (
        <div style={{ ...st.emptyCard, padding: '40px' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading timetable…</p>
        </div>
      ) : editDay ? (
        /* ── Day Editor ── */
        <div style={st.editorCard}>
          <div style={st.editorHeader}>
            <div style={st.editorTitle}>
              <button
                style={{ ...st.btnSecondary, width: '34px', height: '34px', padding: 0, borderRadius: '8px' }}
                onClick={() => setEditDay(null)}
                title="Back to week view"
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </button>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: DAY_COLORS[editDay].accent, flexShrink: 0 }} />
              <span style={{ ...st.editorTitleText, color: DAY_COLORS[editDay].text }}>{editDay} Schedule</span>
            </div>
            <div style={st.editorActions}>
              <button style={st.btnSecondary} onClick={() => setEditDay(null)}>Cancel</button>
              <button style={st.btnPrimary} onClick={handleSaveDay} disabled={saving}>
                <Save style={{ width: '14px', height: '14px' }} />
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          <div style={st.sectionBody}>
            {entries.map((entry, idx) => (
              <div key={idx} style={st.entryRow}>
                {/* Time range */}
                <input
                  type="time"
                  style={{ ...st.inputField, width: '112px' }}
                  value={entry.start_time}
                  onChange={e => updateEntry(idx, 'start_time', e.target.value)}
                />
                <span style={st.timeSep}>–</span>
                <input
                  type="time"
                  style={{ ...st.inputField, width: '112px' }}
                  value={entry.end_time}
                  onChange={e => updateEntry(idx, 'end_time', e.target.value)}
                />

                {/* Subject / Break input */}
                {entry.is_break ? (
                  <input
                    style={{ ...st.inputField, flex: 1 }}
                    value={entry.title}
                    onChange={e => updateEntry(idx, 'title', e.target.value)}
                    placeholder="Break label (e.g. Lunch)"
                  />
                ) : (
                  <>
                    <select
                      style={{ ...st.selectField, marginRight: '8px' }}
                      value={entry.subject_id || ''}
                      onChange={e => updateEntry(idx, 'subject_id', e.target.value)}
                    >
                      <option value="">Select subject…</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>

                    <select
                      style={st.selectField}
                      value={entry.teacher_id || ''}
                      onChange={e => updateEntry(idx, 'teacher_id', e.target.value)}
                    >
                      <option value="">Select teacher…</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.user?.name || t.employee_id || `Teacher #${t.id}`}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {/* Break toggle */}
                <label style={st.breakLabel}>
                  <input
                    type="checkbox"
                    checked={entry.is_break}
                    onChange={e => updateEntry(idx, 'is_break', e.target.checked)}
                    style={{ accentColor: '#f59e0b', width: '14px', height: '14px' }}
                  />
                  Break
                </label>

                <button style={st.btnIconDanger} onClick={() => removeEntry(idx)} title="Remove">
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            ))}

            <button style={st.btnAddPeriod} onClick={addEntry}>
              <Plus style={{ width: '14px', height: '14px' }} /> Add Period
            </button>
          </div>
        </div>
      ) : (
        /* ── Week View ── */
        <div style={st.weekGrid}>
          {DAYS.map(day => {
            const dayEntries = timetable[day] || [];
            const col = DAY_COLORS[day];
            return (
              <div
                key={day}
                style={st.dayCard(day)}
                onClick={() => openDayEditor(day)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={st.dayCardHeader(day)}>
                  <span style={st.dayName(day)}>{day}</span>
                  <span style={st.periodCount(day)}>
                    {dayEntries.length} {dayEntries.length === 1 ? 'period' : 'periods'}
                  </span>
                </div>
                <div style={st.dayBody}>
                  {dayEntries.length === 0 ? (
                    <p style={st.emptyDay}>No entries — click to add</p>
                  ) : (
                    dayEntries.map((e, i) => (
                      <div key={i} style={st.periodPill(e.is_break, day)}>
                        <span style={st.periodTime(e.is_break, day)}>
                          {e.start_time}–{e.end_time}
                        </span>
                        <span style={st.periodSubject(e.is_break)}>
                          {e.is_break ? (e.title || 'Break') : (e.subject?.name || e.title || 'Period')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
