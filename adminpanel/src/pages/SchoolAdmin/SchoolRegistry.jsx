import React, { useState, useEffect } from 'react';
import { schoolAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { getApiAssetUrl } from '../../api/axios';
import {
  GraduationCap,
  Users,
  Award,
  Layers,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  MapPin,
  Clock,
  Briefcase,
  X,
  Sparkles,
} from 'lucide-react';
import './SchoolRegistry.css';

const getExamDisplayName = (exam) => exam?.name || exam?.master?.name || exam?.exam_master?.name || 'Exam';
const getExamDateDisplay = (exam) => {
  const slots = [...(exam?.exam_subjects || exam?.examSubjects || [])]
    .sort((a, b) => String(a.exam_date || '').localeCompare(String(b.exam_date || '')));
  if (slots.length === 0) return exam?.start_date || '';
  if (slots.length === 1) return slots[0].exam_date;
  return `${slots[0].exam_date} - ${slots[slots.length - 1].exam_date}`;
};

export function SchoolRegistry() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Nav states
  const [activeMainTab, setActiveMainTab] = useState('classes'); // classes, teachers
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  // Detail Drawer states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  // Attendance calendar states
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  // Production Optimization & Lazy Loading states
  const [sectionStudents, setSectionStudents] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [calendarLogs, setCalendarLogs] = useState([]);
  const [calendarLogsLoading, setCalendarLogsLoading] = useState(false);

  // Lazy load roster when selectedSectionId changes
  useEffect(() => {
    if (!selectedSectionId) {
      setSectionStudents([]);
      return;
    }

    async function loadRoster() {
      try {
        setSectionLoading(true);
        const res = await schoolAPI.getSectionRoster(selectedSectionId);
        setSectionStudents(res.data?.students || []);
      } catch (err) {
        console.error('Failed to load section roster', err);
        showToast('Failed to load section roster details.', 'error');
      } finally {
        setSectionLoading(false);
      }
    }

    loadRoster();
  }, [selectedSectionId]);

  useEffect(() => {
    async function loadDirectory() {
      try {
        setLoading(true);
        const res = await schoolAPI.getDirectory();
        setData(res.data);
        
        // Auto-select first class and first section
        if (res.data?.classes?.length > 0) {
          const firstClass = res.data.classes[0];
          setSelectedClassId(firstClass.id);
          if (firstClass.sections?.length > 0) {
            setSelectedSectionId(firstClass.sections[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load directory details', err);
        showToast('Failed to load school registry data.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadDirectory();
  }, []);

  if (loading) {
    return (
      <div className="sr-spinner-wrap">
        <div className="sr-spinner"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="sr-error">
        <p className="sr-error__text">Failed to load school registry data.</p>
      </div>
    );
  }

  const { classes, teachers } = data;

  // Selected Class details
  const activeClass = classes.find(c => c.id === selectedClassId);
  const activeClassSections = activeClass?.sections || [];
  const activeSection = activeClassSections.find(s => s.id === selectedSectionId);

  // Teacher Assignments in active class/section
  const sectionTeachers = activeSection ? teachers.filter(t => 
    t.teacher_assignments?.some(ta => ta.class_id === selectedClassId && ta.section_id === selectedSectionId)
  ) : [];



  // Calendar rendering helpers
  const prevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Open calendar & fetch logs on-demand
  const openCalendar = async (student) => {
    setCalendarMonth(new Date());
    setCalendarOpen(true);
    setCalendarLogs([]);
    try {
      setCalendarLogsLoading(true);
      const res = await schoolAPI.getStudentAttendanceLogs(student.id);
      setCalendarLogs(res.data?.logs || res.data || []);
    } catch (err) {
      console.error('Failed to load attendance logs', err);
      showToast('Failed to load calendar attendance logs.', 'error');
    } finally {
      setCalendarLogsLoading(false);
    }
  };

  const getCalendarCells = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ key: `empty-${i}`, day: null });
    }
    for (let i = 1; i <= totalDays; i++) {
      cells.push({ key: `day-${i}`, day: new Date(year, month, i) });
    }
    return cells;
  };
  const calendarCells = getCalendarCells();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="sr-page" style={{ paddingTop: '8px' }}>
      {/* ── Main Tab Navigation (Segmented Pill Group) ── */}
      <div className="sr-tabs" style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setActiveMainTab('classes')}
          className={`sr-tab ${activeMainTab === 'classes' ? 'sr-tab--active' : ''}`}
        >
          <GraduationCap style={{ width: 16, height: 16 }} />
          Students
        </button>
        <button
          onClick={() => setActiveMainTab('teachers')}
          className={`sr-tab ${activeMainTab === 'teachers' ? 'sr-tab--active' : ''}`}
        >
          <Users style={{ width: 16, height: 16 }} />
          Teachers ({teachers.length})
        </button>
      </div>

      {/* ── 1. CLASSES REGISTRY TAB ── */}
      {activeMainTab === 'classes' && (
        <div className="sr-classes-layout">
          {/* Class Cards (Horizontal Deck) */}
          <div className="sr-class-deck">
            {classes.map((c) => {
              const isClassSelected = c.id === selectedClassId;
              return (
                <div
                  key={c.id}
                  className={`sr-class-card ${isClassSelected ? 'sr-class-card--active' : ''}`}
                  onClick={() => {
                    setSelectedClassId(c.id);
                    if (c.sections?.length > 0) {
                      setSelectedSectionId(c.sections[0].id);
                    } else {
                      setSelectedSectionId(null);
                    }
                  }}
                >
                  <Layers style={{ width: 18, height: 18 }} />
                  <span className="sr-class-card__name">{c.class_name}</span>
                  <span className="sr-class-card__badge">{c.sections?.length || 0} Sec</span>
                </div>
              );
            })}
          </div>

          {/* Section Pills (Shown if a class is selected) */}
          {activeClass && activeClass.sections && activeClass.sections.length > 0 && (
            <div className="sr-section-pills">
              {activeClass.sections.map((sec) => {
                const isSecSelected = sec.id === selectedSectionId;
                return (
                  <button
                    key={sec.id}
                    className={`sr-section-pill ${isSecSelected ? 'sr-section-pill--active' : ''}`}
                    onClick={() => setSelectedSectionId(sec.id)}
                  >
                    Section {sec.name} ({sec.student_count || 0})
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Content Area (Students Grid) */}
          <div className="sr-main-content">
            {activeSection ? (
              <div className="sr-registry-panel">
                <div className="sr-registry-panel__header" style={{ borderBottom: 'none', paddingBottom: '0px' }}>
                  <div>
                    <h3 className="sr-registry-panel__title" style={{ fontSize: '24px', fontWeight: 900 }}>
                      {activeClass.class_name.replace(/class\s+/gi, '')}-{activeSection.name}
                    </h3>
                  </div>
                </div>

                {/* Roster content */}
                {sectionLoading ? (
                  <div className="sr-spinner-wrap" style={{ minHeight: '180px' }}>
                    <div className="sr-spinner"></div>
                  </div>
                ) : (
                  sectionStudents.length === 0 ? (
                    <div className="sr-empty">
                      No students registered in this section yet.
                    </div>
                  ) : (
                    <div className="sr-grid">
                      {sectionStudents.map((stud) => {
                        const userObj = stud.user || stud.User || {};
                        const studentName = userObj.name || 'Student';
                        const cleanName = studentName.replace(/^(Student Class|Student)\s+/gi, '').trim() || 'Student';
                        const avatarUrl = userObj.avatar_url;
                        return (
                          <div
                            key={stud.id}
                            onClick={() => setSelectedStudent(stud)}
                            className="sr-person-row"
                          >
                            <div className="sr-person-row__avatar sr-person-row__avatar--student" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {avatarUrl ? (
                                <img src={getApiAssetUrl(avatarUrl)} alt={cleanName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                cleanName[0]?.toUpperCase() || 'S'
                              )}
                            </div>
                            <div className="sr-person-row__info">
                              <h4 className="sr-person-row__name">{cleanName}</h4>
                            </div>
                            <ChevronRight className="sr-person-row__chevron" style={{ width: 16, height: 16 }} />
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="sr-registry-panel">
                <div className="sr-empty">
                  Please select a class and section to view details.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. ALL TEACHERS DIRECTORY TAB ── */}
      {activeMainTab === 'teachers' && (
        <div className="sr-grid">
          {teachers.map((teach) => {
            const userObj = teach.user || teach.User || {};
            return (
              <div
                key={teach.id}
                onClick={() => setSelectedTeacher(teach)}
                className="sr-dir-card"
              >
                <div className="sr-dir-card__profile">
                  <div className="sr-dir-card__avatar">
                    {userObj.name?.[0]?.toUpperCase() || 'T'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="sr-dir-card__name">{userObj.name}</h3>
                    <p className="sr-dir-card__email">{userObj.email || '—'}</p>
                  </div>
                </div>
                
                <div className="sr-dir-card__footer">
                  <div className="sr-dir-card__stat">
                    <span className="sr-dir-card__stat-label">CLASSES</span>
                    <span className="sr-dir-card__stat-value">
                      {teach.teacher_assignments?.length || 0} assigned
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* ── DETAIL DRAWERS ── */}

      {/* 1. Student Detail Drawer */}
      {selectedStudent && (
        <div className="sr-drawer-overlay">
          <div className="sr-drawer-backdrop" onClick={() => setSelectedStudent(null)} />
          <div className="sr-drawer">
            <div className="sr-drawer__header">
              <h2 className="sr-drawer__header-title">Student Profile Summary</h2>
              <button onClick={() => setSelectedStudent(null)} className="sr-drawer__close">
                <X style={{ width: 22, height: 22 }} />
              </button>
            </div>

            <div className="sr-drawer__body">
              {/* Header profile details */}
              <div className="sr-profile-header">
                <div className="sr-profile-header__avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedStudent.user?.avatar_url ? (
                    <img src={getApiAssetUrl(selectedStudent.user.avatar_url)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (selectedStudent.user?.name || 'S')[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="sr-profile-header__name">
                    {(selectedStudent.user?.name || 'Student').replace(/^(Student Class|Student)\s+/gi, '').trim()}
                  </h3>
                  <p className="sr-profile-header__role">@{selectedStudent.user?.username || ''}</p>
                </div>
              </div>

              {/* Roster & Academic Details */}
              <div className="sr-drawer-section">
                <h4 className="sr-drawer-section__title">Academic Details</h4>
                <div className="sr-info-grid">
                  <div className="sr-info-grid__item">
                    <span className="sr-info-grid__label">ADMISSION NO</span>
                    <span className="sr-info-grid__value sr-info-grid__value--mono">{selectedStudent.admission_no || '—'}</span>
                  </div>
                  <div className="sr-info-grid__item">
                    <span className="sr-info-grid__label">ROLL NO</span>
                    <span className="sr-info-grid__value">{selectedStudent.roll_no || '—'}</span>
                  </div>
                  <div className="sr-info-grid__item">
                    <span className="sr-info-grid__label">CLASS</span>
                    <span className="sr-info-grid__value">{activeClass?.class_name || '—'}</span>
                  </div>
                  <div className="sr-info-grid__item">
                    <span className="sr-info-grid__label">SECTION</span>
                    <span className="sr-info-grid__value">{activeSection?.name || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="sr-drawer-section">
                <h4 className="sr-drawer-section__title">Personal Profile</h4>
                <div className="sr-info-grid">
                  <div className="sr-info-grid__item">
                    <span className="sr-info-grid__label">DATE OF BIRTH</span>
                    <span className="sr-info-grid__value">{selectedStudent.dob || '—'}</span>
                  </div>
                  <div className="sr-info-grid__item">
                    <span className="sr-info-grid__label">GENDER</span>
                    <span className="sr-info-grid__value sr-info-grid__value--capitalize">{selectedStudent.gender || '—'}</span>
                  </div>
                  <div className="sr-info-grid__item">
                    <span className="sr-info-grid__label">BLOOD GROUP</span>
                    <span className="sr-info-grid__value sr-info-grid__value--upper">{selectedStudent.blood_group || '—'}</span>
                  </div>
                  <div className="sr-info-grid__item sr-info-grid__item--full">
                    <span className="sr-info-grid__label">ADDRESS</span>
                    <span className="sr-info-grid__value">{selectedStudent.address || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Parent / Guardian Details */}
              <div className="sr-drawer-section">
                <h4 className="sr-drawer-section__title">Parent / Guardian Details</h4>
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--sr-slate-50)',
                  border: '1px solid var(--sr-slate-100)',
                  borderRadius: 'var(--sr-radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--sr-slate-600)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sr-slate-400)' }}>Father Name:</span>
                      <span style={{ fontWeight: '600', color: 'var(--sr-slate-800)' }}>{selectedStudent.father_name || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sr-slate-400)' }}>Mother Name:</span>
                      <span style={{ fontWeight: '600', color: 'var(--sr-slate-800)' }}>{selectedStudent.mother_name || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sr-slate-400)' }}>Guardian Name:</span>
                      <span style={{ fontWeight: '600', color: 'var(--sr-slate-800)' }}>{selectedStudent.guardian_name || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid var(--sr-slate-100)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--sr-slate-400)' }}>
                        <Phone style={{ width: 12, height: 12, color: 'var(--sr-slate-400)' }} /> Parents Phone:
                      </span>
                      <span style={{ fontWeight: '700', color: 'var(--sr-slate-800)' }}>{selectedStudent.user?.phone || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--sr-slate-400)' }}>
                        <Phone style={{ width: 12, height: 12, color: 'var(--sr-slate-400)' }} /> Emergency Contact:
                      </span>
                      <span style={{ fontWeight: '700', color: 'var(--sr-slate-800)' }}>{selectedStudent.emergency_contact || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>



              {/* Attendance Statistics — clickable to open calendar */}
              <div className="sr-drawer-section">
                <h4 className="sr-drawer-section__title">Attendance Over The Year</h4>
                <div
                  className="sr-attendance"
                  onClick={() => openCalendar(selectedStudent)}
                >
                  <div className="sr-attendance__ring">
                    {selectedStudent.attendance?.percentage}%
                  </div>
                  <div>
                    <p className="sr-attendance__label">Overall Attendance</p>
                    <p className="sr-attendance__detail">
                      {selectedStudent.attendance?.present_days} present, {selectedStudent.attendance?.absent_days} absent
                    </p>
                    <p className="sr-attendance__hint">
                      <Calendar style={{ width: 12, height: 12 }} /> Click to view calendar
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject-wise Attendance Breakdown */}
              <div className="sr-drawer-section">
                <h4 className="sr-drawer-section__title">Subject Attendance Breakdown</h4>
                {(!selectedStudent.attendance?.subject_stats || Object.keys(selectedStudent.attendance.subject_stats).length === 0) ? (
                  <p className="sr-empty" style={{ padding: '16px 0' }}>No subject attendance logs recorded yet.</p>
                ) : (
                  <div className="sr-subject-stats-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {Object.entries(selectedStudent.attendance.subject_stats).map(([subjectName, stats]) => {
                      const percentage = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;
                      return (
                        <div key={subjectName} className="sr-subject-stat-card" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          background: 'var(--sr-slate-50)',
                          border: '1px solid var(--sr-slate-100)',
                          borderRadius: 'var(--sr-radius-md)'
                        }}>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--sr-slate-800)' }}>{subjectName}</span>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--sr-slate-500)', marginTop: '2px' }}>
                              Attended {stats.present} of {stats.total} sessions
                            </span>
                          </div>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '800',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: percentage >= 75 ? 'var(--sr-emerald-faint)' : '#fff1f2',
                            color: percentage >= 75 ? 'var(--sr-emerald)' : 'var(--sr-rose)',
                            border: `1px solid ${percentage >= 75 ? 'var(--sr-emerald-border)' : '#fecdd3'}`
                          }}>
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Historical Grades Timeline */}
              <div className="sr-drawer-section">
                <h4 className="sr-drawer-section__title">Marks &amp; Exam History</h4>
                {selectedStudent.report_cards?.length === 0 ? (
                  <p className="sr-empty" style={{ padding: '16px 0' }}>No exam records graded yet.</p>
                ) : (
                  selectedStudent.report_cards.map((rc) => (
                    <div key={rc.id} className="sr-exam-card">
                      <div className="sr-exam-card__header">
                        <span className="sr-exam-card__name">{getExamDisplayName(rc.exam)}</span>
                        <span className="sr-exam-card__date">{getExamDateDisplay(rc.exam)}</span>
                      </div>
                      <div className="sr-exam-card__marks">
                        {rc.report_card_marks?.map((m) => {
                          const percentage = m.max_marks ? Math.round((m.marks_obtained / m.max_marks) * 100) : 0;
                          return (
                            <div key={m.id} className="sr-exam-card__mark-row">
                              <span>{m.subject?.name || 'Subject'}</span>
                              <span className="sr-exam-card__mark-value">{m.marks_obtained}/{m.max_marks} ({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                      {rc.remarks && (
                        <p className="sr-exam-card__remarks">
                          Remarks: "{rc.remarks}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Teacher Detail Drawer */}
      {selectedTeacher && (
        <div className="sr-drawer-overlay">
          <div className="sr-drawer-backdrop" onClick={() => setSelectedTeacher(null)} />
          <div className="sr-drawer">
            <div className="sr-drawer__header">
              <h2 className="sr-drawer__header-title">Teacher Profile Summary</h2>
              <button onClick={() => setSelectedTeacher(null)} className="sr-drawer__close">
                <X style={{ width: 22, height: 22 }} />
              </button>
            </div>

            <div className="sr-drawer__body">
              <div className="sr-profile-header">
                <div className="sr-profile-header__avatar">
                  {(selectedTeacher.user?.name || 'T')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="sr-profile-header__name">{selectedTeacher.user?.name}</h3>
                  <p className="sr-profile-header__role">Teacher Account</p>
                </div>
              </div>

              <div className="sr-drawer-section">
                <h4 className="sr-drawer-section__title">Contact Details</h4>
                <div className="sr-contact-box">
                  <div className="sr-contact-row">
                    <Mail className="sr-contact-row__icon" style={{ width: 16, height: 16 }} />
                    <span>{selectedTeacher.user?.email || '—'}</span>
                  </div>
                  <div className="sr-contact-row">
                    <Phone className="sr-contact-row__icon" style={{ width: 16, height: 16 }} />
                    <span>{selectedTeacher.user?.phone || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="sr-drawer-section">
                <h4 className="sr-drawer-section__title">Professional Info</h4>
                <div className="sr-contact-box">
                  <div className="sr-info-grid__item">
                    <span className="sr-info-grid__label">QUALIFICATION</span>
                    <span className="sr-info-grid__value">{selectedTeacher.qualification || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="sr-drawer-section">
                <h4 className="sr-drawer-section__title">Teacher Assignments</h4>
                {selectedTeacher.teacher_assignments?.length === 0 ? (
                  <p className="sr-empty" style={{ padding: '16px 0' }}>No active subject assignments found.</p>
                ) : (
                  <div className="sr-assignment-list">
                    {selectedTeacher.teacher_assignments.map((ta) => (
                      <div key={ta.id} className="sr-assignment-card">
                        <div>
                          <p className="sr-assignment-card__subject">{ta.subject?.name || 'Subject'}</p>
                          <p className="sr-assignment-card__class">
                            {ta.class?.class_name} - Section {ta.section?.name}
                          </p>
                        </div>
                        {ta.is_class_teacher && (
                          <span className="sr-sub-card__badge sr-sub-card__badge--emerald">
                            Class Incharge
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      )}



      {/* Attendance Calendar Modal */}
      {calendarOpen && selectedStudent && (
        <div className="sr-cal-overlay">
          <div className="sr-cal-backdrop" onClick={() => setCalendarOpen(false)} />
          <div className="sr-cal-modal">
            <div className="sr-cal-header">
              <h3 className="sr-cal-header__title">
                Attendance: {(selectedStudent.user?.name || '').replace(/^(Student Class|Student)\s+/gi, '').trim()}
              </h3>
              <button className="sr-drawer__close" onClick={() => setCalendarOpen(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div className="sr-cal-nav">
              <button className="sr-cal-nav__btn" onClick={prevMonth}>
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>
              <span className="sr-cal-nav__label">
                {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button className="sr-cal-nav__btn" onClick={nextMonth}>
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {calendarLogsLoading ? (
              <div className="sr-spinner-wrap" style={{ minHeight: '200px' }}>
                <div className="sr-spinner"></div>
              </div>
            ) : (
              <div className="sr-cal-grid">
                {weekdays.map(d => (
                  <div key={d} className="sr-cal-weekday">{d}</div>
                ))}
                {calendarCells.map(({ key, day }) => {
                  if (!day) {
                    return <div key={key} className="sr-cal-day sr-cal-day--empty" />;
                  }

                  const y = day.getFullYear();
                  const m = String(day.getMonth() + 1).padStart(2, '0');
                  const d = String(day.getDate()).padStart(2, '0');
                  const dateStr = `${y}-${m}-${d}`;

                  const logs = calendarLogs || [];
                  const matches = logs.filter(l => {
                    if (!l.date) return false;
                    const logDateStr = typeof l.date === 'string'
                      ? l.date.substring(0, 10)
                      : new Date(l.date).toISOString().substring(0, 10);
                    return logDateStr === dateStr;
                  });
                  let statusClass = '';
                  if (matches.length > 0) {
                    const hasPresent = matches.some(l => l.status === 'present');
                    statusClass = hasPresent ? ' sr-cal-day--present' : ' sr-cal-day--absent';
                  }

                  const today = new Date();
                  const isToday = day.getFullYear() === today.getFullYear() &&
                                  day.getMonth() === today.getMonth() &&
                                  day.getDate() === today.getDate();
                  const todayClass = isToday ? ' sr-cal-day--today' : '';

                  return (
                    <div key={key} className={`sr-cal-day${statusClass}${todayClass}`}>
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="sr-cal-legend">
              <div className="sr-cal-legend__item">
                <span className="sr-cal-legend__dot sr-cal-legend__dot--present" />
                <span>Present</span>
              </div>
              <div className="sr-cal-legend__item">
                <span className="sr-cal-legend__dot sr-cal-legend__dot--absent" />
                <span>Absent</span>
              </div>
              <div className="sr-cal-legend__item">
                <span className="sr-cal-legend__dot sr-cal-legend__dot--today" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
