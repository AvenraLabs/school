import React, { useState, useEffect } from 'react';
import { reportCardsAPI, examsAPI, studentsAPI, classesAPI, subjectsAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Award, Plus, Save, Send, Eye, Edit2 } from 'lucide-react';

const getExamName = (exam) => exam?.name || exam?.master?.name || exam?.exam_master?.name || `Exam #${exam?.id}`;
const getExamSubjectSlots = (exam) => [...(exam?.exam_subjects || exam?.examSubjects || [])]
  .sort((a, b) => String(a.exam_date || '').localeCompare(String(b.exam_date || '')));
const getSubjectName = (subject) => subject?.name || subject?.Subject?.name || subject?.subject?.name || `Subject #${subject?.subject_id || subject?.id}`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

export function ReportCards() {
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showMarks, setShowMarks] = useState(null);
  const [showView, setShowView] = useState(null);
  const [marks, setMarks] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [reportCard, setReportCard] = useState(null);
  const toast = useToast();

  const [reportCards, setReportCards] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => { loadClasses(); loadSubjects(); }, []);
  useEffect(() => { if (selectedClass) loadExams(); }, [selectedClass]);
  useEffect(() => { if (selectedClass) loadStudents(); }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedExam) {
      loadReportCards(selectedClass, selectedExam);
    } else {
      setReportCards([]);
    }
  }, [selectedClass, selectedExam]);

  const loadClasses = async () => {
    try { const res = await classesAPI.list(); setClasses(res.items || []); } catch (e) { /* ignore */ }
  };

  const loadSubjects = async () => {
    try { const res = await subjectsAPI.list(); setSubjects(res.items || []); } catch (e) { /* ignore */ }
  };

  const loadExams = async () => {
    try {
      const res = await examsAPI.list(Number(selectedClass));
      const items = res.items || [];
      setExams(items);
      if (selectedExam && !items.some((exam) => String(exam.id) === String(selectedExam))) {
        setSelectedExam('');
      }
    } catch (e) { /* ignore */ }
  };

  const loadStudents = async () => {
    try { const res = await studentsAPI.getOptions(Number(selectedClass)); setStudents(res.items || []); } catch (e) { /* ignore */ }
  };

  const loadReportCards = async (classId, examId) => {
    setLoadingReports(true);
    try {
      const res = await reportCardsAPI.list(Number(classId), Number(examId));
      setReportCards(res.data || res || []);
    } catch (e) {
      toast.error('Failed to load report cards');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await reportCardsAPI.create(Number(selectedStudent), Number(selectedExam));
      toast.success('Report card created');
      setShowCreate(false);
      await loadReportCards(selectedClass, selectedExam);
      
      const newRc = res.data || res;
      openGradeMarks(newRc);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickCreate = async (studentId) => {
    setSaving(true);
    try {
      const res = await reportCardsAPI.create(Number(studentId), Number(selectedExam));
      toast.success('Report card created');
      await loadReportCards(selectedClass, selectedExam);
      
      const newRc = res.data || res;
      openGradeMarks(newRc);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create report card');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const validMarks = marks.filter((m) => m.marks_obtained !== '').map((m) => ({
        subject_id: Number(m.subject_id),
        marks_obtained: Number(m.marks_obtained),
        max_marks: Number(m.max_marks),
      }));
      if (validMarks.length === 0) {
        toast.error('Enter marks for at least one scheduled subject');
        return;
      }
      await reportCardsAPI.setMarks(showMarks.id, validMarks);
      toast.success('Marks saved');
      setShowMarks(null);
      await loadReportCards(selectedClass, selectedExam);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await reportCardsAPI.publish(id, remarks);
      toast.success('Report card published');
      setShowView(null);
      await loadReportCards(selectedClass, selectedExam);
    } catch (e) {
      toast.error('Failed to publish');
    }
  };

  const viewReportCard = async (id) => {
    try {
      const res = await reportCardsAPI.getById(id);
      setReportCard(res.data || res);
      setRemarks(res.data?.remarks || res.remarks || '');
      setShowView(id);
    } catch (e) {
      toast.error('Failed to load report card');
    }
  };

  const openGradeMarks = (rc) => {
    setShowMarks(rc);
    const exam = exams.find((item) => Number(item.id) === Number(rc.exam_id)) || rc.exam || rc.Exam;
    const scheduledSubjects = getExamSubjectSlots(exam);

    if (scheduledSubjects.length === 0) {
      toast.error('No subjects are scheduled for this exam yet');
      setMarks([]);
      return;
    }

    const prefilledMarks = scheduledSubjects.map((slot) => {
      const existing = (rc.report_card_marks || rc.marks || [])?.find((m) => Number(m.subject_id) === Number(slot.subject_id));
      return {
        subject_id: slot.subject_id,
        subject_name: getSubjectName(slot.subject || slot),
        exam_date: slot.exam_date,
        syllabus: slot.syllabus || '',
        marks_obtained: existing ? String(existing.marks_obtained) : '',
        max_marks: existing ? String(existing.max_marks) : '100',
      };
    });
    setMarks(prefilledMarks);
  };

  const updateMark = (idx, field, value) => {
    const updated = [...marks];
    updated[idx][field] = value;
    setMarks(updated);
  };

  const selectedExamDetails = exams.find((exam) => String(exam.id) === String(selectedExam));
  const selectedExamSlots = getExamSubjectSlots(selectedExamDetails);

  return (
    <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Report Cards</h1>
          <p className="page-subtitle">Create, grade, and publish report cards</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Report Card
        </button>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Lookup</h3>
        <div className="flex gap-3 mb-4">
          <select className="select-field w-48" value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedExam(''); }}>
            <option value="">Select Class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
          </select>
          {selectedClass && (
            <select className="select-field w-48" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
              <option value="">Select Exam</option>
              {exams.map((e) => <option key={e.id} value={e.id}>{getExamName(e)}</option>)}
            </select>
          )}
        </div>

        {selectedExamDetails && (
          <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-sm text-indigo-900">
            <strong>{getExamName(selectedExamDetails)}</strong>
            <span className="text-indigo-700"> has {selectedExamSlots.length} scheduled subject{selectedExamSlots.length === 1 ? '' : 's'}.</span>
          </div>
        )}

        {selectedClass && selectedExam && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Students and Grades
            </h4>
            {loadingReports ? (
              <div className="text-center text-slate-400 py-8">Loading report cards...</div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No students found in this class</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Status</th>
                      <th>Marks Preview</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const rc = reportCards.find((r) => Number(r.student_id) === Number(s.id));
                      const name = s.User?.name || s.user?.name || s.User?.username || s.user?.username || `Student #${s.id}`;
                      const username = s.User?.username || s.user?.username || '';
                      
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50">
                          <td>
                            <div className="font-semibold text-slate-900">{name}</div>
                            {username && username !== name && (
                              <div className="text-xs text-slate-400 font-mono">@{username}</div>
                            )}
                          </td>
                          <td className="font-mono text-slate-600 text-sm">{s.roll_no || '—'}</td>
                          <td>
                            {rc ? (
                              rc.published_at ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                  Draft
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                Not Created
                              </span>
                            )}
                          </td>
                          <td className="max-w-md">
                            {rc && (rc.report_card_marks || rc.marks) && (rc.report_card_marks || rc.marks).length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                                {(rc.report_card_marks || rc.marks).map((m) => {
                                  const slot = selectedExamSlots.find((item) => Number(item.subject_id) === Number(m.subject_id));
                                  const subjectName = m.subject?.name || slot?.subject?.name || subjects.find(sub => Number(sub.id) === Number(m.subject_id))?.name || `Sub #${m.subject_id}`;
                                  return (
                                    <span key={m.id} className="inline-block bg-slate-100 border border-slate-200 text-xs px-2 py-0.5 rounded-lg text-slate-700">
                                      {subjectName}: <strong>{m.marks_obtained}/{m.max_marks}</strong>
                                    </span>
                                  );
                                })}
                              </div>
                            ) : rc ? (
                              <span className="text-xs text-slate-400 italic">No marks entered yet</span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              {rc ? (
                                <>
                                  <button onClick={() => viewReportCard(rc.id)} className="btn-sm btn-secondary flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" /> View
                                  </button>
                                  {!rc.published_at && (
                                    <>
                                      <button onClick={() => openGradeMarks(rc)} className="btn-sm btn-primary flex items-center gap-1">
                                        <Edit2 className="w-3.5 h-3.5" /> Grade
                                      </button>
                                      <button onClick={() => handlePublish(rc.id)} className="btn-sm btn-success flex items-center gap-1">
                                        <Send className="w-3.5 h-3.5" /> Publish
                                      </button>
                                    </>
                                  )}
                                </>
                              ) : (
                                <button onClick={() => handleQuickCreate(s.id)} className="btn-sm btn-success flex items-center gap-1">
                                  <Plus className="w-3.5 h-3.5" /> Create & Grade
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Report Card">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Class</label>
            <select className="select-field" required value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">Select</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Exam</label>
            <select className="select-field" required value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
              <option value="">Select</option>
              {exams.map((e) => <option key={e.id} value={e.id}>{getExamName(e)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Student</label>
            <select className="select-field" required value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="">Select</option>
              {students.map((s) => {
                const name = s.User?.name || s.user?.name || '';
                const username = s.User?.username || s.user?.username || '';
                const display = name && name !== username
                  ? `${name} (${username})`
                  : username || `ID: ${s.id}`;
                return (
                  <option key={s.id} value={s.id}>
                    {display} {s.roll_no ? `(Roll: ${s.roll_no})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Enter Marks */}
      <Modal isOpen={!!showMarks} onClose={() => setShowMarks(null)} title="Enter Marks" maxWidth="max-w-2xl">
        <div className="space-y-3">
          {marks.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
              Schedule subjects in the Exams module before entering marks.
            </div>
          )}
          {marks.map((m, idx) => (
            <div key={m.subject_id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{m.subject_name}</div>
                  <div className="text-xs text-slate-500">Date: {formatDate(m.exam_date)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input className="input-field w-24 text-center" type="number" placeholder="Marks" value={m.marks_obtained} onChange={(e) => updateMark(idx, 'marks_obtained', e.target.value)} />
                  <span className="text-slate-400">/</span>
                  <input className="input-field w-24 text-center bg-slate-100" type="number" value={m.max_marks} onChange={(e) => updateMark(idx, 'max_marks', e.target.value)} />
                </div>
              </div>
              {m.syllabus && (
                <div className="mt-2 text-xs text-slate-500">
                  <span className="font-semibold">Syllabus:</span> {m.syllabus}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setShowMarks(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleSaveMarks} disabled={saving || marks.length === 0} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Marks'}
          </button>
        </div>
      </Modal>

      {/* View Report Card */}
      <Modal isOpen={!!showView} onClose={() => setShowView(null)} title="Report Card">
        {reportCard ? (
          <div>
            <div className="space-y-2 mb-4">
              {(reportCard.report_card_marks || reportCard.marks)?.map((m, i) => {
                const reportExam = reportCard.exam || reportCard.Exam || selectedExamDetails;
                const slot = getExamSubjectSlots(reportExam).find((item) => Number(item.subject_id) === Number(m.subject_id));
                const subjectName = m.subject?.name || slot?.subject?.name || subjects.find(sub => Number(sub.id) === Number(m.subject_id))?.name || `Subject #${m.subject_id}`;
                return (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg text-sm border border-slate-100">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">{subjectName}</span>
                      <span className="font-mono font-semibold text-slate-900">{m.marks_obtained}/{m.max_marks}</span>
                    </div>
                    {slot && (
                      <div className="mt-1 text-xs text-slate-500">
                        Date: {formatDate(slot.exam_date)}
                        {slot.syllabus ? <> · Syllabus: {slot.syllabus}</> : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {!reportCard.published_at && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div>
                  <label className="label">Remarks (optional)</label>
                  <textarea className="input-field" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Teacher remarks..." />
                </div>
                <button onClick={() => handlePublish(showView)} className="btn-primary w-full justify-center">
                  <Send className="w-4 h-4" /> Publish Report Card
                </button>
              </div>
            )}
            {reportCard.published_at && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-sm text-emerald-800">
                ✅ This report card has been published.
                {reportCard.remarks && <p className="mt-2 font-medium bg-white/50 p-2 rounded border border-emerald-100">Remarks: {reportCard.remarks}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-4">Loading...</div>
        )}
      </Modal>
    </div>
  );
}
