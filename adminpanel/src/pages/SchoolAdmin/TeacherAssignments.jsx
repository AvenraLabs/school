import { useState, useEffect, useCallback } from 'react';
import { teacherAssignmentsAPI, teachersAPI, classesAPI, subjectsAPI } from '../../api';
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
  tabRow: {
    display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', position: 'relative', zIndex: 1,
  },
  tabBtn: (isActive) => ({
    padding: '10px 20px', fontSize: '14px', fontWeight: 600,
    background: 'none', border: 'none', borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
    color: isActive ? '#4f46e5' : '#64748b', cursor: 'pointer', transition: 'all 0.15s',
    outline: 'none', marginBottom: '-1px',
  }),
  subjectSectionsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px', padding: '16px',
  },
};

export function TeacherAssignments() {
  const [activeTab, setActiveTab] = useState('class-teachers'); // 'class-teachers' | 'subject-teachers'
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  /* sectionAssignments: { [sectionId]: assignment | null } */
  const [sectionAssignments, setSectionAssignments] = useState({});
  /* subjectAssignments: { [sectionId]: { [subjectId]: assignment } } */
  const [subjectAssignments, setSubjectAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  /* picker state */
  const [activePicker, setActivePicker] = useState(null); // { sectionId, classId, subjectId }
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerHover, setPickerHover] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { init(); }, []);

  const init = async () => {
    setLoading(true);
    try {
      const [clsRes, tRes, assignRes, subRes] = await Promise.all([
        classesAPI.list(),
        teachersAPI.getOptions(),
        teacherAssignmentsAPI.list(500, 0),
        subjectsAPI.list(),
      ]);

      const classList = clsRes.items || [];
      const teacherList = tRes.items || [];
      const allAssignments = assignRes.items || [];
      const subjectList = subRes.items || [];

      setClasses(classList);
      setTeachers(teacherList);
      setSubjects(subjectList);

      // Build maps
      const classMap = {};
      const subjectMap = {};

      for (const cls of classList) {
        for (const sec of cls.sections || []) {
          classMap[sec.id] = null; // default: unassigned
          subjectMap[sec.id] = {};
        }
      }

      for (const a of allAssignments) {
        if (a.section_id) {
          if (a.is_class_teacher) {
            classMap[a.section_id] = a;
          }
          if (a.subject_id) {
            if (!subjectMap[a.section_id]) {
              subjectMap[a.section_id] = {};
            }
            subjectMap[a.section_id][a.subject_id] = a;
          }
        }
      }

      setSectionAssignments(classMap);
      setSubjectAssignments(subjectMap);

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

  const openPicker = (sectionId, classId, subjectId = null) => {
    setPickerSearch('');
    setPickerHover(null);
    setActivePicker({ sectionId, classId, subjectId });
  };

  const closePicker = () => setActivePicker(null);

  const handleAssign = useCallback(async (teacher) => {
    if (!activePicker || saving) return;
    const { sectionId, classId, subjectId } = activePicker;

    setSaving(true);
    closePicker();
    try {
      if (subjectId) {
        // --- Subject Teacher Assignment ---
        const existing = subjectAssignments[sectionId]?.[subjectId];
        if (existing) {
          await teacherAssignmentsAPI.delete(existing.id);
        }
        const created = await teacherAssignmentsAPI.create(
          teacher.id,
          Number(classId),
          Number(sectionId),
          Number(subjectId),
          false // is_class_teacher
        );

        setSubjectAssignments(p => {
          const updatedSec = { ...p[sectionId] };
          updatedSec[subjectId] = created.data || { ...created, teacher, subject: subjects.find(s => s.id === subjectId) };
          return { ...p, [sectionId]: updatedSec };
        });
        toast.success(`${teacherDisplayName(teacher)} assigned for ${subjects.find(s => s.id === subjectId)?.name || 'subject'}`);
      } else {
        // --- Class Teacher Assignment ---
        const existing = sectionAssignments[sectionId];
        if (existing) {
          await teacherAssignmentsAPI.delete(existing.id);
        }
        const created = await teacherAssignmentsAPI.create(
          teacher.id,
          Number(classId),
          Number(sectionId),
          undefined,
          true // is_class_teacher
        );
        setSectionAssignments(p => ({ ...p, [sectionId]: created.data || { ...created, teacher, is_class_teacher: true } }));
        toast.success(`${teacherDisplayName(teacher)} assigned as class teacher`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to assign');
      init(); // re-sync
    } finally {
      setSaving(false);
    }
  }, [activePicker, sectionAssignments, subjectAssignments, subjects, saving]);

  const handleRemoveSubject = async (sectionId, subjectId) => {
    const existing = subjectAssignments[sectionId]?.[subjectId];
    if (!existing || saving) return;

    setSaving(true);
    try {
      await teacherAssignmentsAPI.delete(existing.id);

      setSubjectAssignments(p => {
        const updatedSec = { ...p[sectionId] };
        delete updatedSec[subjectId];
        return { ...p, [sectionId]: updatedSec };
      });
      toast.success('Subject assignment removed');
    } catch (e) {
      toast.error('Failed to remove assignment');
    } finally {
      setSaving(false);
    }
  };

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
            <h1 style={s.pageTitle}>Teacher Assignments</h1>
            <p style={s.pageSubtitle}>Assign class teachers and subject teachers</p>
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
          <h1 style={s.pageTitle}>Teacher Assignments</h1>
          <p style={s.pageSubtitle}>Assign class teachers and subject teachers to sections</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        <button
          style={s.tabBtn(activeTab === 'class-teachers')}
          onClick={() => { setActiveTab('class-teachers'); closePicker(); }}
        >
          Class Teachers
        </button>
        <button
          style={s.tabBtn(activeTab === 'subject-teachers')}
          onClick={() => { setActiveTab('subject-teachers'); closePicker(); }}
        >
          Subject Teachers
        </button>
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
                <div style={activeTab === 'subject-teachers' ? s.subjectSectionsGrid : s.sectionsGrid}>
                  {cls.sections.map(sec => {
                    const classAssignment = sectionAssignments[sec.id];
                    const classTeacher = classAssignment?.teacher;
                    const isClassPickerOpen = activePicker?.sectionId === sec.id && !activePicker?.subjectId;

                    return (
                      <div key={sec.id} style={{ ...s.sectionCard, position: 'relative', zIndex: (activePicker?.sectionId === sec.id) ? 50 : 1 }}>
                        <div style={s.sectionLabel}>{cls.class_name}</div>
                        <div style={s.sectionName}>Section {sec.name}</div>

                        {activeTab === 'class-teachers' ? (
                          /* Class Teacher assignment card contents */
                          classAssignment && classTeacher ? (
                            <>
                              <div style={s.assignedRow}>
                                <div style={s.avatar}>
                                  {teacherDisplayName(classTeacher)[0]?.toUpperCase() || 'T'}
                                </div>
                                <div>
                                  <div style={s.teacherName}>{teacherDisplayName(classTeacher)}</div>
                                  {classTeacher?.employee_id && (
                                    <div style={s.teacherSub}>{classTeacher.employee_id}</div>
                                  )}
                                </div>
                              </div>
                              <div style={{ position: 'relative', zIndex: isClassPickerOpen ? 60 : 1 }}>
                                <button style={s.changeBtn} onClick={() => isClassPickerOpen ? closePicker() : openPicker(sec.id, cls.id)}>
                                  Change Teacher
                                </button>
                                {isClassPickerOpen && (
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
                              <div style={{ position: 'relative', zIndex: isClassPickerOpen ? 60 : 1 }}>
                                <button style={s.assignBtn} onClick={() => isClassPickerOpen ? closePicker() : openPicker(sec.id, cls.id)}>
                                  <UserPlus style={{ width: '12px', height: '12px' }} /> Assign Teacher
                                </button>
                                {isClassPickerOpen && (
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
                          )
                        ) : (
                          /* Subject Teacher list */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                            {subjects.map(sub => {
                              const assignment = subjectAssignments[sec.id]?.[sub.id];
                              const teacher = assignment?.teacher;
                              const isSubPickerOpen = activePicker?.sectionId === sec.id && activePicker?.subjectId === sub.id;

                              return (
                                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', border: '1px solid #f1f5f9', borderRadius: '8px', background: '#f8fafc', position: 'relative', zIndex: isSubPickerOpen ? 60 : 1 }}>
                                  <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</div>
                                    {teacher ? (
                                      <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                                        👤 {teacherDisplayName(teacher)}
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Unassigned</div>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px', position: 'relative', zIndex: isSubPickerOpen ? 70 : 1 }}>
                                    {teacher ? (
                                      <>
                                        <button style={{ ...s.changeBtn, marginTop: 0, height: '24px', padding: '0 8px', fontSize: '10px' }} onClick={() => isSubPickerOpen ? closePicker() : openPicker(sec.id, cls.id, sub.id)}>
                                          Edit
                                        </button>
                                        <button style={{ ...s.changeBtn, marginTop: 0, height: '24px', color: '#f43f5e', borderColor: '#fecdd3', background: '#fff5f5', padding: '0 8px', fontSize: '10px' }} onClick={() => handleRemoveSubject(sec.id, sub.id)}>
                                          Del
                                        </button>
                                      </>
                                    ) : (
                                      <button style={{ ...s.assignBtn, marginTop: 0, height: '24px', padding: '0 8px', fontSize: '10px' }} onClick={() => isSubPickerOpen ? closePicker() : openPicker(sec.id, cls.id, sub.id)}>
                                        Assign
                                      </button>
                                    )}
                                    {isSubPickerOpen && (
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
                                </div>
                              );
                            })}
                          </div>
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
