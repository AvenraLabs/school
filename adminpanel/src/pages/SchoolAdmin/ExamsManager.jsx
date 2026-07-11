import React, { useEffect, useMemo, useState } from 'react';
import { examsAPI, classesAPI, subjectsAPI, reportCardsAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Unlock,
} from 'lucide-react';
import './ExamsManager.css';

const getExamName = (exam) => exam?.name || exam?.master?.name || exam?.exam_master?.name || `Exam #${exam?.id}`;
const getSubjectSlots = (exam) => [...(exam?.exam_subjects || exam?.examSubjects || [])]
  .sort((a, b) => String(a.exam_date || '').localeCompare(String(b.exam_date || '')));
const getSubjectName = (slot) => slot?.subject?.name || slot?.Subject?.name || `Subject #${slot?.subject_id}`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

export function ExamsManager() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [scheduleExams, setScheduleExams] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [createForm, setCreateForm] = useState({ class_id: '', name: '' });
  const [scheduleForm, setScheduleForm] = useState({
    class_id: '',
    exam_id: '',
    subject_id: '',
    exam_date: '',
    syllabus: '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [showGradingScales, setShowGradingScales] = useState(false);
  const [gradingScales, setGradingScales] = useState([]);
  const [loadingScales, setLoadingScales] = useState(false);
  const [savingScales, setSavingScales] = useState(false);

  const openGradingScales = async () => {
    setShowGradingScales(true);
    setLoadingScales(true);
    try {
      const res = await reportCardsAPI.getGradingScales();
      setGradingScales(res.data || []);
    } catch (e) {
      toast.error('Failed to load grading scales');
    } finally {
      setLoadingScales(false);
    }
  };

  const handleSaveGradingScales = async (e) => {
    e.preventDefault();
    setSavingScales(true);
    try {
      await reportCardsAPI.saveGradingScales(gradingScales);
      toast.success('Grading scales updated successfully');
      setShowGradingScales(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save grading scales');
    } finally {
      setSavingScales(false);
    }
  };

  const handleScaleChange = (index, field, value) => {
    const updated = [...gradingScales];
    if (field === 'min_percentage') {
      updated[index][field] = value === '' ? '' : Number(value);
    } else {
      updated[index][field] = value;
    }
    setGradingScales(updated);
  };

  const addGradingRow = () => {
    setGradingScales((prev) => [
      ...prev,
      { grade_name: '', min_percentage: 0, is_pass: true, color_code: '#10b981' },
    ]);
  };

  const removeGradingRow = (index) => {
    setGradingScales((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadExams(selectedClass);
    } else {
      setExams([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (scheduleForm.class_id) {
      loadScheduleExams(scheduleForm.class_id);
    } else {
      setScheduleExams([]);
    }
  }, [scheduleForm.class_id]);

  const selectedClassName = useMemo(
    () => classes.find((item) => String(item.id) === String(selectedClass))?.class_name || '',
    [classes, selectedClass]
  );

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch (e) {
      toast.error('Failed to load classes');
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await subjectsAPI.list();
      setSubjects(res.items || []);
    } catch (e) {
      toast.error('Failed to load subjects');
    }
  };

  const loadExams = async (classId = selectedClass) => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await examsAPI.list(Number(classId));
      setExams(res.items || []);
    } catch (e) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleExams = async (classId) => {
    try {
      const res = await examsAPI.list(Number(classId));
      setScheduleExams(res.items || []);
      if (scheduleForm.exam_id && !(res.items || []).some((exam) => String(exam.id) === String(scheduleForm.exam_id))) {
        setScheduleForm((prev) => ({ ...prev, exam_id: '' }));
      }
    } catch (e) {
      setScheduleExams([]);
      toast.error('Failed to load exams for this class');
    }
  };

  const openCreateExam = () => {
    setCreateForm({ class_id: selectedClass || '', name: '' });
    setShowCreateExam(true);
  };

  const openSchedule = (exam = null, slot = null) => {
    setScheduleForm({
      class_id: exam?.class_id || selectedClass || '',
      exam_id: exam?.id || '',
      subject_id: slot?.subject_id || '',
      exam_date: slot?.exam_date || '',
      syllabus: slot?.syllabus || '',
    });
    setShowSchedule(true);
  };

  const handleCreateExam = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await examsAPI.create(Number(createForm.class_id), createForm.name.trim());
      toast.success('Exam created for class');
      setShowCreateExam(false);
      if (String(createForm.class_id) === String(selectedClass)) await loadExams(createForm.class_id);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create exam');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleSubject = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await examsAPI.upsertSubject(
        Number(scheduleForm.exam_id),
        Number(scheduleForm.subject_id),
        scheduleForm.exam_date,
        scheduleForm.syllabus.trim() || null
      );
      toast.success('Test schedule saved');
      setShowSchedule(false);
      if (String(scheduleForm.class_id) === String(selectedClass)) await loadExams(scheduleForm.class_id);
      await loadScheduleExams(scheduleForm.class_id);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const toggleLock = async (exam) => {
    try {
      await examsAPI.lock(exam.id, !exam.is_locked);
      toast.success(`Exam ${!exam.is_locked ? 'locked' : 'unlocked'}`);
      await loadExams();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update exam');
    }
  };

  const removeSubject = async (exam, slot) => {
    try {
      await examsAPI.removeSubject(exam.id, slot.subject_id);
      toast.success('Subject schedule removed');
      await loadExams();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to remove subject');
    }
  };

  return (
    <div className="exams-page">
      <div className="exams-header">
        <div>
          <h1 className="exams-title">Exams</h1>
          <p className="exams-subtitle">
            Create exams per class, then schedule subject-wise tests with date and syllabus.
          </p>
        </div>
        <div className="exams-header-actions" style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={openGradingScales} className="exam-btn exam-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClipboardList size={16} /> Grading Scales
          </button>
          <button type="button" onClick={openCreateExam} className="exam-btn exam-btn-primary">
            <Plus size={16} /> Create Exam
          </button>
          <button type="button" onClick={() => openSchedule()} className="exam-btn exam-btn-secondary">
            <CalendarDays size={16} /> Schedule Test
          </button>
        </div>
      </div>

      <section className="exam-toolbar">
        <div>
          <label className="exam-label">Class</label>
          <select className="exam-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Select class</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>{item.class_name}</option>
            ))}
          </select>
        </div>
        {selectedClassName && (
          <div className="exam-toolbar-summary">
            <CheckCircle2 size={18} />
            <span>Viewing exams for <strong>{selectedClassName}</strong></span>
          </div>
        )}
      </section>

      {!selectedClass ? (
        <div className="exam-empty">
          <FileText size={42} />
          <h3>Select a class</h3>
          <p>Choose a class to see exam cards and scheduled subject tests.</p>
        </div>
      ) : loading ? (
        <div className="exam-empty">
          <ClipboardList size={42} />
          <h3>Loading exams…</h3>
          <p>Fetching class exam setup.</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="exam-empty">
          <FileText size={42} />
          <h3>No exams created</h3>
          <p>Create an exam name for this class first, then schedule subject tests under it.</p>
          <button type="button" onClick={openCreateExam} className="exam-btn exam-btn-primary">
            <Plus size={16} /> Create first exam
          </button>
        </div>
      ) : (
        <div className="exam-card-grid">
          {exams.map((exam) => {
            const slots = getSubjectSlots(exam);
            return (
              <article key={exam.id} className="exam-card">
                <div className="exam-card-top">
                  <div className="exam-card-icon"><FileText size={22} /></div>
                  <div className="exam-card-title-wrap">
                    <h2>{getExamName(exam)}</h2>
                    <p>{slots.length} scheduled subject{slots.length === 1 ? '' : 's'}</p>
                  </div>
                  <span className={`exam-status ${exam.is_locked ? 'exam-status-locked' : 'exam-status-active'}`}>
                    {exam.is_locked ? 'Locked' : 'Active'}
                  </span>
                </div>

                <div className="exam-schedule-list">
                  {slots.length === 0 ? (
                    <div className="exam-no-slots">
                      <BookOpen size={20} />
                      <span>No subject tests scheduled yet.</span>
                    </div>
                  ) : (
                    slots.map((slot) => (
                      <div key={slot.id || slot.subject_id} className="exam-slot-card">
                        <div className="exam-slot-main">
                          <div>
                            <h3>{getSubjectName(slot)}</h3>
                            <p><CalendarDays size={14} /> {formatDate(slot.exam_date)}</p>
                          </div>
                          {!exam.is_locked && (
                            <div className="exam-slot-actions">
                              <button type="button" onClick={() => openSchedule(exam, slot)} title="Edit schedule">
                                <Pencil size={14} />
                              </button>
                              <button type="button" onClick={() => removeSubject(exam, slot)} title="Remove schedule">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        {slot.syllabus && (
                          <div className="exam-syllabus">
                            <span>Syllabus heading</span>
                            <p>{slot.syllabus}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="exam-card-actions">
                  <button type="button" onClick={() => openSchedule(exam)} disabled={exam.is_locked} className="exam-btn exam-btn-secondary">
                    <Plus size={15} /> Add Subject Test
                  </button>
                  <button type="button" onClick={() => toggleLock(exam)} className="exam-btn exam-btn-ghost">
                    {exam.is_locked ? <Unlock size={15} /> : <Lock size={15} />}
                    {exam.is_locked ? 'Unlock' : 'Lock'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreateExam} onClose={() => setShowCreateExam(false)} title="Create Class Exam">
        <form onSubmit={handleCreateExam} className="exam-modal-form">
          <div>
            <label className="exam-label">Class</label>
            <select
              className="exam-select"
              required
              value={createForm.class_id}
              onChange={(e) => setCreateForm({ ...createForm, class_id: e.target.value })}
            >
              <option value="">Select class</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>{item.class_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="exam-label">Exam Name</label>
            <input
              className="exam-input"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g. Unit Test 1, Class Test, Half Yearly"
            />
          </div>
          <div className="exam-modal-actions">
            <button type="button" onClick={() => setShowCreateExam(false)} className="exam-btn exam-btn-ghost">Cancel</button>
            <button type="submit" disabled={saving || !createForm.name.trim()} className="exam-btn exam-btn-primary">
              {saving ? 'Creating…' : 'Create Exam'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule Subject Test">
        <form onSubmit={handleScheduleSubject} className="exam-modal-form">
          <div className="exam-form-grid">
            <div>
              <label className="exam-label">Class</label>
              <select
                className="exam-select"
                required
                value={scheduleForm.class_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, class_id: e.target.value, exam_id: '' })}
              >
                <option value="">Select class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.class_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="exam-label">Exam</label>
              <select
                className="exam-select"
                required
                value={scheduleForm.exam_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, exam_id: e.target.value })}
                disabled={!scheduleForm.class_id}
              >
                <option value="">Select exam</option>
                {scheduleExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>{getExamName(exam)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="exam-form-grid">
            <div>
              <label className="exam-label">Subject</label>
              <select
                className="exam-select"
                required
                value={scheduleForm.subject_id}
                onChange={(e) => setScheduleForm({ ...scheduleForm, subject_id: e.target.value })}
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="exam-label">Exam Date</label>
              <input
                className="exam-input"
                type="date"
                required
                value={scheduleForm.exam_date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, exam_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="exam-label">Syllabus Heading</label>
            <textarea
              className="exam-textarea"
              value={scheduleForm.syllabus}
              onChange={(e) => setScheduleForm({ ...scheduleForm, syllabus: e.target.value })}
              placeholder="e.g. Fractions and decimals, Chapter 3, Grammar: Tenses"
              rows={3}
            />
          </div>

          <div className="exam-modal-actions">
            <button type="button" onClick={() => setShowSchedule(false)} className="exam-btn exam-btn-ghost">Cancel</button>
            <button
              type="submit"
              disabled={saving || !scheduleForm.exam_id || !scheduleForm.subject_id || !scheduleForm.exam_date}
              className="exam-btn exam-btn-primary"
            >
              {saving ? 'Saving…' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Configure Grading Scales Modal */}
      <Modal isOpen={showGradingScales} onClose={() => setShowGradingScales(false)} title="Configure Grading Scales">
        {loadingScales ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading scales...</div>
        ) : (
          <form onSubmit={handleSaveGradingScales} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Set up grading ranges for exam marks. Grades are evaluated automatically based on the minimum percentage of marks obtained.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              {gradingScales.map((scale, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Grade Name (e.g. A+)"
                    value={scale.grade_name}
                    onChange={(e) => handleScaleChange(index, 'grade_name', e.target.value)}
                    style={{ flex: 2, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    placeholder="Min %"
                    value={scale.min_percentage}
                    onChange={(e) => handleScaleChange(index, 'min_percentage', e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                  <input
                    type="color"
                    value={scale.color_code || '#10b981'}
                    onChange={(e) => handleScaleChange(index, 'color_code', e.target.value)}
                    style={{ width: '40px', height: '36px', border: '1px solid #d1d5db', borderRadius: '4px', padding: '2px', cursor: 'pointer' }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={scale.is_pass !== false}
                      onChange={(e) => handleScaleChange(index, 'is_pass', e.target.checked)}
                    />
                    Pass
                  </label>
                  <button
                    type="button"
                    onClick={() => removeGradingRow(index)}
                    style={{ padding: '6px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addGradingRow}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
            >
              <Plus size={16} /> Add Grade Range
            </button>

            <div className="exam-modal-actions" style={{ marginTop: '12px' }}>
              <button type="button" onClick={() => setShowGradingScales(false)} className="exam-btn exam-btn-ghost">Cancel</button>
              <button
                type="submit"
                disabled={savingScales}
                className="exam-btn exam-btn-primary"
              >
                {savingScales ? 'Saving…' : 'Save Grading Scale'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
