import { useState, useEffect, useCallback } from 'react';
import { teacherAssignmentsAPI, teachersAPI, classesAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { UserCog, ChevronDown, ChevronRight, UserPlus, X, Check } from 'lucide-react';

/* ── plain CSS styles ── */
const s = {
  pageHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
  },
  pageTitle: { fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 },
  pageSubtitle: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },

  classCard: {
    background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '12px', overflow: 'visible',
  },
  classHeader: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 18px', cursor: 'pointer', userSelect: 'none',
    background: '#fafafa',
    borderTopLeftRadius: '15px',
    borderTopRightRadius: '15px',
  },
  classIcon: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: '#eef2ff', color: '#4f46e5',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  className: { fontWeight: 700, fontSize: '14px', color: '#0f172a', flex: 1 },

  sectionsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px', padding: '16px',
  },
  sectionCard: {
    border: '1px solid #e2e8f0', borderRadius: '12px',
    padding: '14px', background: '#fff', position: 'relative',
  },
  sectionLabel: {
    fontSize: '11px', fontWeight: 600, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px',
  },
  sectionName: { fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' },

  assignedRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: '#e0e7ff', color: '#4f46e5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: 700, flexShrink: 0,
  },
  teacherName: { fontSize: '12px', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 },
  teacherSub: { fontSize: '11px', color: '#94a3b8' },

  unassignedBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', fontWeight: 600, color: '#94a3b8',
    background: '#f8fafc', border: '1px dashed #cbd5e1',
    borderRadius: '6px', padding: '3px 8px',
  },
  assignBtn: {
    marginTop: '10px', width: '100%', height: '30px',
    borderRadius: '8px', border: '1px solid #c7d2fe',
    background: '#eef2ff', color: '#4f46e5',
    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
  },
  changeBtn: {
    marginTop: '10px', width: '100%', height: '28px',
    borderRadius: '8px', border: '1px solid #e2e8f0',
    background: '#f8fafc', color: '#64748b',
    fontSize: '11px', fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
  },

  /* Picker dropdown */
  pickerOverlay: {
    position: 'fixed', inset: 0, zIndex: 40,
    background: 'transparent',
  },
  pickerPopup: {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 50,
    overflow: 'hidden', maxHeight: '220px', overflowY: 'auto',
  },
  pickerSearch: {
    width: '100%', height: '36px', padding: '0 12px', fontSize: '13px',
    border: 'none', borderBottom: '1px solid #f1f5f9',
    outline: 'none', fontFamily: 'inherit', background: '#fafafa',
    boxSizing: 'border-box',
  },
  pickerItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
    color: '#1e293b', transition: 'background 0.1s',
  },
  pickerItemHovered: { background: '#f1f5f9' },
  pickerEmpty: { padding: '16px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' },

  emptyState: {
    background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
    padding: '60px 24px', textAlign: 'center',
  },
};

export function TeacherAssignments() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  /* sectionAssignments: { [sectionId]: assignment | null } */
  const [sectionAssignments, setSectionAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  /* picker state */
  const [activePicker, setActivePicker] = useState(null); // { sectionId, classId, currentAssignmentId }
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerHover, setPickerHover] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { init(); }, []);

  const init = async () => {
    setLoading(true);
    try {
      const [clsRes, tRes, assignRes] = await Promise.all([
        classesAPI.list(),
        teachersAPI.getOptions(),
        teacherAssignmentsAPI.list(500, 0),
      ]);

      const classList = clsRes.items || [];
      const teacherList = tRes.items || [];
      const allAssignments = assignRes.items || [];

      setClasses(classList);
      setTeachers(teacherList);

      // Build a map of sectionId → class-teacher assignment
      const map = {};
      for (const cls of classList) {
        for (const sec of cls.sections || []) {
          map[sec.id] = null; // default: unassigned
        }
      }
      for (const a of allAssignments) {
        if (a.is_class_teacher && a.section_id) {
          map[a.section_id] = a;
        }
      }
      setSectionAssignments(map);

      // expand all by default
      const exp = {};
      for (const cls of classList) exp[cls.id] = true;
      setExpanded(exp);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const openPicker = (sectionId, classId) => {
    setPickerSearch('');
    setPickerHover(null);
    setActivePicker({ sectionId, classId });
  };

  const closePicker = () => setActivePicker(null);

  const handleAssign = useCallback(async (teacher) => {
    if (!activePicker || saving) return;
    const { sectionId, classId } = activePicker;
    const existing = sectionAssignments[sectionId];

    setSaving(true);
    closePicker();
    try {
      // Remove existing class-teacher assignment for this section if any
      if (existing) {
        await teacherAssignmentsAPI.delete(existing.id);
      }
      // Create new assignment as class teacher
      // subject_id is optional — we pass undefined; backend should allow it for class teacher
      const created = await teacherAssignmentsAPI.create(
        teacher.id,
        Number(classId),
        Number(sectionId),
        existing?.subject_id || undefined,
        true // is_class_teacher
      );
      setSectionAssignments(p => ({ ...p, [sectionId]: created.data || { ...created, teacher, is_class_teacher: true } }));
      toast.success(`${teacherDisplayName(teacher)} assigned as class teacher`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to assign');
      init(); // re-sync
    } finally {
      setSaving(false);
    }
  }, [activePicker, sectionAssignments, saving]);

  const teacherDisplayName = (t) =>
    t?.user?.name || t?.User?.name || t?.user?.username || t?.User?.username || t?.employee_id || `Teacher #${t?.id}`;

  const filteredTeachers = teachers.filter(t =>
    teacherDisplayName(t).toLowerCase().includes(pickerSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>Class Teacher Assignments</h1>
            <p style={s.pageSubtitle}>Assign class teachers to each section</p>
          </div>
        </div>
        <div style={s.emptyState}><p style={{ color: '#94a3b8' }}>Loading…</p></div>
      </div>
    );
  }

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Class Teacher Assignments</h1>
          <p style={s.pageSubtitle}>Assign a class teacher to each section — they can approve student account changes</p>
        </div>
      </div>

      {classes.length === 0 ? (
        <div style={s.emptyState}>
          <UserCog style={{ width: '48px', height: '48px', color: '#cbd5e1', marginBottom: '12px' }} />
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#475569' }}>No classes found</p>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>Create classes and sections first</p>
        </div>
      ) : (
        classes.map(cls => (
          <div key={cls.id} style={s.classCard}>
            {/* Class header */}
            <div style={s.classHeader} onClick={() => toggleExpand(cls.id)}>
              {expanded[cls.id]
                ? <ChevronDown style={{ width: '15px', height: '15px', color: '#94a3b8', flexShrink: 0 }} />
                : <ChevronRight style={{ width: '15px', height: '15px', color: '#94a3b8', flexShrink: 0 }} />}
              <div style={s.classIcon}>
                <UserCog style={{ width: '15px', height: '15px' }} />
              </div>
              <span style={s.className}>{cls.class_name}</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {cls.sections?.length || 0} section{cls.sections?.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Sections grid */}
            {expanded[cls.id] && (cls.sections || []).length > 0 && (
              <div style={{ borderTop: '1px solid #f1f5f9' }}>
                <div style={s.sectionsGrid}>
                  {cls.sections.map(sec => {
                    const assignment = sectionAssignments[sec.id];
                    const teacher = assignment?.teacher;
                    const isOpen = activePicker?.sectionId === sec.id;

                    return (
                      <div key={sec.id} style={{ ...s.sectionCard, position: 'relative', zIndex: isOpen ? 50 : 1 }}>
                        <div style={s.sectionLabel}>{cls.class_name}</div>
                        <div style={s.sectionName}>Section {sec.name}</div>

                        {assignment && teacher ? (
                          <>
                            <div style={s.assignedRow}>
                              <div style={s.avatar}>
                                {teacherDisplayName(teacher)[0]?.toUpperCase() || 'T'}
                              </div>
                              <div>
                                <div style={s.teacherName}>{teacherDisplayName(teacher)}</div>
                                {teacher?.employee_id && (
                                  <div style={s.teacherSub}>{teacher.employee_id}</div>
                                )}
                              </div>
                            </div>
                            <div style={{ position: 'relative', zIndex: isOpen ? 60 : 1 }}>
                              <button style={s.changeBtn} onClick={() => isOpen ? closePicker() : openPicker(sec.id, cls.id)}>
                                Change Teacher
                              </button>
                              {isOpen && (
                                <TeacherPicker
                                  teachers={filteredTeachers}
                                  search={pickerSearch}
                                  onSearch={setPickerSearch}
                                  hover={pickerHover}
                                  onHover={setPickerHover}
                                  onSelect={handleAssign}
                                  onClose={closePicker}
                                  saving={saving}
                                  displayName={teacherDisplayName}
                                />
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <span style={s.unassignedBadge}>
                              <span style={{ fontSize: '10px' }}>●</span> Not assigned
                            </span>
                            <div style={{ position: 'relative', zIndex: isOpen ? 60 : 1 }}>
                              <button style={s.assignBtn} onClick={() => isOpen ? closePicker() : openPicker(sec.id, cls.id)}>
                                <UserPlus style={{ width: '12px', height: '12px' }} /> Assign Teacher
                              </button>
                              {isOpen && (
                                <TeacherPicker
                                  teachers={filteredTeachers}
                                  search={pickerSearch}
                                  onSearch={setPickerSearch}
                                  hover={pickerHover}
                                  onHover={setPickerHover}
                                  onSelect={handleAssign}
                                  onClose={closePicker}
                                  saving={saving}
                                  displayName={teacherDisplayName}
                                />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Global overlay to close picker on outside click */}
      {activePicker && (
        <div style={s.pickerOverlay} onClick={closePicker} />
      )}
    </div>
  );
}

/* ── Teacher Picker Dropdown ── */
function TeacherPicker({ teachers, search, onSearch, hover, onHover, onSelect, onClose, saving, displayName }) {
  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
      background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 60,
      overflow: 'hidden',
    }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
        <input
          autoFocus
          style={{
            flex: 1, height: '36px', padding: '0 12px', fontSize: '13px',
            border: 'none', outline: 'none', fontFamily: 'inherit', background: '#fafafa',
          }}
          placeholder="Search teacher…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
        <button
          style={{ width: '32px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={onClose}
        >
          <X style={{ width: '13px', height: '13px' }} />
        </button>
      </div>
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {teachers.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>No teachers found</div>
        ) : (
          teachers.map(t => (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px', cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '13px', color: '#1e293b',
                background: hover === t.id ? '#f1f5f9' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={() => onHover(t.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => !saving && onSelect(t)}
            >
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: '#e0e7ff', color: '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 700, flexShrink: 0,
              }}>
                {displayName(t)[0]?.toUpperCase() || 'T'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{displayName(t)}</div>
                {t.employee_id && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.employee_id}</div>}
              </div>
              {hover === t.id && <Check style={{ width: '13px', height: '13px', color: '#4f46e5', flexShrink: 0 }} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
