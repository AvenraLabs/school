import React, { useState, useEffect } from 'react';
import { reportCardsAPI, examsAPI, studentsAPI, classesAPI, subjectsAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Award, Plus, Save, Send, Eye } from 'lucide-react';

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

  useEffect(() => { loadClasses(); loadSubjects(); }, []);
  useEffect(() => { if (selectedClass) loadExams(); }, [selectedClass]);
  useEffect(() => { if (selectedClass) loadStudents(); }, [selectedClass]);

  const loadClasses = async () => {
    try { const res = await classesAPI.list(); setClasses(res.items || []); } catch (e) { /* ignore */ }
  };

  const loadSubjects = async () => {
    try { const res = await subjectsAPI.list(); setSubjects(res.items || []); } catch (e) { /* ignore */ }
  };

  const loadExams = async () => {
    try { const res = await examsAPI.list(Number(selectedClass)); setExams(res.items || []); } catch (e) { /* ignore */ }
  };

  const loadStudents = async () => {
    try { const res = await studentsAPI.getOptions(Number(selectedClass)); setStudents(res.items || []); } catch (e) { /* ignore */ }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await reportCardsAPI.create(Number(selectedStudent), Number(selectedExam));
      toast.success('Report card created');
      setShowCreate(false);
      // Open marks entry
      setShowMarks(res.data || res);
      setMarks(subjects.map((s) => ({ subject_id: s.id, subject_name: s.name, marks_obtained: '', max_marks: 100 })));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const validMarks = marks.filter((m) => m.marks_obtained !== '').map((m) => ({
        subject_id: m.subject_id,
        marks_obtained: Number(m.marks_obtained),
        max_marks: Number(m.max_marks),
      }));
      await reportCardsAPI.setMarks(showMarks.id, validMarks);
      toast.success('Marks saved');
      setShowMarks(null);
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
    } catch (e) {
      toast.error('Failed to publish');
    }
  };

  const viewReportCard = async (id) => {
    try {
      const res = await reportCardsAPI.getById(id);
      setReportCard(res.data || res);
      setShowView(id);
    } catch (e) {
      toast.error('Failed to load report card');
    }
  };

  const updateMark = (idx, field, value) => {
    const updated = [...marks];
    updated[idx][field] = value;
    setMarks(updated);
  };

  return (
    <div>
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
              {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
        </div>

        {selectedClass && selectedExam && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Students</h4>
            <div className="space-y-2">
              {students.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-medium text-sm">{s.user?.name || s.User?.name || s.user?.username || s.User?.username || `Student #${s.id}`}</span>
                    <span className="text-xs text-slate-400 ml-2">Roll: {s.roll_no}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => viewReportCard(s.id)} className="btn-sm btn-secondary">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create */}
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
              {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
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
          {marks.map((m, idx) => (
            <div key={m.subject_id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium flex-1">{m.subject_name}</span>
              <div className="flex items-center gap-2">
                <input className="input-field w-20" type="number" placeholder="Marks" value={m.marks_obtained} onChange={(e) => updateMark(idx, 'marks_obtained', e.target.value)} />
                <span className="text-slate-400">/</span>
                <input className="input-field w-20" type="number" value={m.max_marks} onChange={(e) => updateMark(idx, 'max_marks', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => setShowMarks(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleSaveMarks} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Marks'}
          </button>
        </div>
      </Modal>

      {/* View Report Card */}
      <Modal isOpen={!!showView} onClose={() => setShowView(null)} title="Report Card">
        {reportCard ? (
          <div>
            <div className="space-y-2 mb-4">
              {reportCard.marks?.map((m, i) => (
                <div key={i} className="flex justify-between p-2 bg-slate-50 rounded-lg text-sm">
                  <span>{m.subject?.name || `Subject #${m.subject_id}`}</span>
                  <span className="font-mono font-medium">{m.marks_obtained}/{m.max_marks}</span>
                </div>
              ))}
            </div>
            {!reportCard.is_published && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div>
                  <label className="label">Remarks (optional)</label>
                  <textarea className="input-field" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Teacher remarks..." />
                </div>
                <button onClick={() => handlePublish(showView)} className="btn-primary w-full">
                  <Send className="w-4 h-4" /> Publish Report Card
                </button>
              </div>
            )}
            {reportCard.is_published && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800">
                ✅ This report card has been published.
                {reportCard.remarks && <p className="mt-1">Remarks: {reportCard.remarks}</p>}
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
