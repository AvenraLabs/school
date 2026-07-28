import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { teachersAPI, substitutionAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import {
  ChevronLeft,
  UserX,
  Calendar,
  Check,
  Save,
  Search,
  AlertCircle,
  Clock,
  BookOpen,
  Award,
  UserCheck,
} from 'lucide-react';
import { formatDate } from '../../utils/date';

const st = {
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  pageTitleRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  pageTitle: { fontSize: '26px', fontWeight: 850, letterSpacing: '-0.03em', color: '#0f172a', margin: 0 },
  pageSubtitle: { fontSize: '13px', color: '#64748b', marginTop: '4px' },

  btnBack: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '38px', height: '38px', borderRadius: '10px',
    background: '#fff', color: '#475569', border: '1px solid #e2e8f0',
    cursor: 'pointer', flexShrink: 0,
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    height: '42px', padding: '0 22px', borderRadius: '12px',
    fontSize: '14px', fontWeight: 600,
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none',
    cursor: 'pointer', boxShadow: '0 10px 24px rgba(79, 70, 229, 0.22)',
  },

  card: {
    background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '20px', marginBottom: '20px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
  badgeStep: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '24px', height: '24px', borderRadius: '50%',
    background: '#eef2ff', color: '#4f46e5', fontSize: '12px', fontWeight: 700,
  },

  teacherGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', maxHeight: '280px', overflowY: 'auto', padding: '2px' },
  teacherCard: (selected) => ({
    padding: '12px 14px', borderRadius: '12px',
    border: selected ? '2px solid #6366f1' : '1px solid #e2e8f0',
    background: selected ? '#f5f3ff' : '#fff',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
    transition: 'all 0.15s ease',
  }),

  searchInput: {
    width: '100%', height: '40px', padding: '0 14px 0 38px', fontSize: '13px',
    border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff',
    outline: 'none', color: '#0f172a', marginBottom: '14px',
  },

  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0', marginTop: '10px' },
  th: {
    textAlign: 'left', padding: '10px 14px', fontSize: '11px', fontWeight: 700,
    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
  },
  td: { padding: '12px 14px', fontSize: '13px', borderBottom: '1px solid #f1f5f9', color: '#1e293b' },

  btnAssign: (selected) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    height: '32px', padding: '0 12px', borderRadius: '8px',
    fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
    background: selected ? '#10b981' : '#eef2ff',
    color: selected ? '#fff' : '#4f46e5',
  }),

  emptyNotice: {
    padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px',
    background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0',
  },
};

export function SubstituteTeachers() {
  const navigate = useNavigate();
  const toast = useToast();
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  const [periods, setPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('');

  // Map of timetable_id -> candidate array
  const [candidatesMap, setCandidatesMap] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Map of timetable_id -> selected substitute_teacher_id
  const [selectedSubstitutes, setSelectedSubstitutes] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const res = await teachersAPI.list();
      const items = res.items || res.data || [];
      setTeachers(items);
    } catch {
      toast.error('Failed to load teachers');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return teachers;
    return teachers.filter((t) => {
      const name = (t.user?.name || t.User?.name || '').toLowerCase();
      const empId = (t.employee_id || '').toLowerCase();
      return name.includes(q) || empId.includes(q);
    });
  }, [teachers, searchQuery]);

  const handleSelectTeacher = async (teacherId) => {
    setSelectedTeacherId(teacherId);
    setSelectedSubstitutes({});
    setCandidatesMap({});
    setPeriods([]);

    try {
      setLoadingPeriods(true);
      const res = await substitutionAPI.getTeacherPeriods(teacherId, todayStr);
      const data = res.data || {};
      const periodItems = data.periods || [];
      setPeriods(periodItems);
      setDayOfWeek(data.day_of_week || '');

      // Initialize pre-existing substitutions
      const initialSubs = {};
      periodItems.forEach((p) => {
        if (p.current_substitute?.teacher_id) {
          initialSubs[p.timetable_id] = p.current_substitute.teacher_id;
        }
      });
      setSelectedSubstitutes(initialSubs);

      // Load available candidates for each period slot
      if (periodItems.length > 0) {
        loadCandidatesForPeriods(periodItems);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load teacher schedule');
    } finally {
      setLoadingPeriods(false);
    }
  };

  const loadCandidatesForPeriods = async (periodItems) => {
    setLoadingCandidates(true);
    const resultMap = {};
    await Promise.all(
      periodItems.map(async (p) => {
        try {
          const res = await substitutionAPI.getAvailableSubstitutes(p.timetable_id, todayStr);
          resultMap[p.timetable_id] = res.data?.candidates || [];
        } catch {
          resultMap[p.timetable_id] = [];
        }
      })
    );
    setCandidatesMap(resultMap);
    setLoadingCandidates(false);
  };

  const handleAssignSubstitute = (timetableId, substituteTeacherId) => {
    setSelectedSubstitutes((prev) => {
      if (prev[timetableId] === substituteTeacherId) {
        const next = { ...prev };
        delete next[timetableId];
        return next;
      }
      return { ...prev, [timetableId]: substituteTeacherId };
    });
  };

  const handleSaveSubstitutions = async () => {
    if (periods.length === 0) return;

    const payload = Object.entries(selectedSubstitutes).map(([timetable_id, substitute_teacher_id]) => ({
      timetable_id: Number(timetable_id),
      substitute_teacher_id: Number(substitute_teacher_id),
    }));

    if (payload.length === 0) {
      toast.error('Please select at least one substitute teacher.');
      return;
    }

    try {
      setSaving(true);
      await substitutionAPI.saveSubstitutions(todayStr, payload);
      toast.success('Substitutions saved successfully!');
      navigate('/admin/timetables');
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('Conflict: One of the selected teachers was just assigned elsewhere. Please refresh candidates.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to save substitutions.');
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedTeacherObj = teachers.find((t) => String(t.id) === String(selectedTeacherId));

  return (
    <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={st.pageHeader}>
        <div style={st.pageTitleRow}>
          <button style={st.btnBack} onClick={() => navigate('/admin/timetables')} title="Back to Timetables">
            <ChevronLeft style={{ width: '18px', height: '18px' }} />
          </button>
          <div>
            <h1 style={st.pageTitle}>Substitute Teachers</h1>
            <p style={st.pageSubtitle}>Assign temporary teacher substitutions for today ({formatDate(todayStr)})</p>
          </div>
        </div>

        {periods.length > 0 && (
          <button style={st.btnPrimary} onClick={handleSaveSubstitutions} disabled={saving}>
            <Save style={{ width: '16px', height: '16px' }} />
            {saving ? 'Saving…' : 'Save Substitutions'}
          </button>
        )}
      </div>

      {/* Step 1: Select Absent Teacher */}
      <div style={st.card}>
        <div style={st.sectionTitle}>
          <span style={st.badgeStep}>1</span>
          Select Absent Teacher Today
        </div>

        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#94a3b8' }} />
          <input
            type="text"
            style={st.searchInput}
            placeholder="Search absent teacher by name or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loadingTeachers ? (
          <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Loading teachers…</p>
        ) : filteredTeachers.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No active teachers found.</p>
        ) : (
          <div style={st.teacherGrid}>
            {filteredTeachers.map((t) => {
              const isSelected = String(t.id) === String(selectedTeacherId);
              const teacherName = t.user?.name || t.User?.name || `Teacher #${t.id}`;
              return (
                <div
                  key={t.id}
                  style={st.teacherCard(isSelected)}
                  onClick={() => handleSelectTeacher(t.id)}
                >
                  <div
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: isSelected ? '#6366f1' : '#e2e8f0',
                      color: isSelected ? '#fff' : '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    {teacherName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#4338ca' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {teacherName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      ID: {t.employee_id || '—'}
                    </div>
                  </div>
                  {isSelected && <Check style={{ width: '16px', height: '16px', color: '#6366f1' }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2 & 3: Affected Periods & Available Substitutes */}
      {selectedTeacherId && (
        <div style={st.card}>
          <div style={st.sectionTitle}>
            <span style={st.badgeStep}>2</span>
            Today's Timetable & Available Substitutes ({dayOfWeek.toUpperCase()})
          </div>

          {loadingPeriods || loadingCandidates ? (
            <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Loading schedule & finding free teachers…</p>
          ) : periods.length === 0 ? (
            <div style={st.emptyNotice}>
              <AlertCircle style={{ width: '28px', height: '28px', color: '#94a3b8', margin: '0 auto 8px' }} />
              <p style={{ fontWeight: 600, color: '#475569' }}>
                {selectedTeacherObj?.user?.name || 'Selected teacher'} has no scheduled periods for today ({dayOfWeek}).
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {periods.map((p, idx) => {
                const candidates = candidatesMap[p.timetable_id] || [];
                const assignedSubId = selectedSubstitutes[p.timetable_id];
                const assignedSubObj = candidates.find((c) => String(c.teacher_id) === String(assignedSubId));

                return (
                  <div
                    key={p.timetable_id}
                    style={{
                      borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fafafa',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Period Header */}
                    <div
                      style={{
                        padding: '12px 16px', background: '#eef2ff', borderBottom: '1px solid #c7d2fe',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            padding: '4px 10px', borderRadius: '8px', background: '#4f46e5',
                            color: '#fff', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace',
                          }}
                        >
                          Period {idx + 1} ({p.start_time} – {p.end_time})
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                          Class {p.class_name} – Section {p.section_name}
                        </span>
                        <span style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 600 }}>
                          ({p.subject_name})
                        </span>
                      </div>

                      {assignedSubId && (
                        <div
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '4px 10px', borderRadius: '20px', background: '#d1fae5',
                            border: '1px solid #a7f3d0', fontSize: '12px', fontWeight: 700, color: '#047857',
                          }}
                        >
                          <UserCheck style={{ width: '14px', height: '14px' }} />
                          Sub: {assignedSubObj ? assignedSubObj.name : `Teacher #${assignedSubId}`}
                        </div>
                      )}
                    </div>

                    {/* Candidates Table */}
                    <div style={{ padding: '12px 16px', background: '#fff' }}>
                      {candidates.length === 0 ? (
                        <div style={st.emptyNotice}>
                          No teachers available for this period.
                        </div>
                      ) : (
                        <table style={st.table}>
                          <thead>
                            <tr>
                              <th style={st.th}>Teacher</th>
                              <th style={st.th}>Subject</th>
                              <th style={st.th}>Class Average</th>
                              <th style={st.th}>Periods Today</th>
                              <th style={{ ...st.th, textAlign: 'right' }}>Assign</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidates.map((c) => {
                              const isAssigned = String(assignedSubId) === String(c.teacher_id);
                              return (
                                <tr key={c.teacher_id} style={{ background: isAssigned ? '#f0fdf4' : 'transparent' }}>
                                  <td style={{ ...st.td, fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div
                                        style={{
                                          width: '26px', height: '26px', borderRadius: '50%',
                                          background: '#e2e8f0', color: '#475569', fontSize: '11px',
                                          fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                      >
                                        {c.name.charAt(0).toUpperCase()}
                                      </div>
                                      <span>{c.name}</span>
                                    </div>
                                  </td>
                                  <td style={st.td}>{c.subject}</td>
                                  <td style={st.td}>
                                    <span
                                      style={{
                                        padding: '2px 8px', borderRadius: '6px',
                                        background: c.class_average >= 60 ? '#f0fdf4' : '#fff1f2',
                                        color: c.class_average >= 60 ? '#15803d' : '#be123c',
                                        fontWeight: 700, fontSize: '12px',
                                      }}
                                    >
                                      {c.class_average}%
                                    </span>
                                  </td>
                                  <td style={st.td}>
                                    <span style={{ fontWeight: 600, color: '#475569' }}>
                                      {c.periods_today} periods
                                    </span>
                                  </td>
                                  <td style={{ ...st.td, textAlign: 'right' }}>
                                    <button
                                      style={st.btnAssign(isAssigned)}
                                      onClick={() => handleAssignSubstitute(p.timetable_id, c.teacher_id)}
                                    >
                                      {isAssigned ? (
                                        <>
                                          <Check style={{ width: '14px', height: '14px' }} /> Assigned
                                        </>
                                      ) : (
                                        'Assign'
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
