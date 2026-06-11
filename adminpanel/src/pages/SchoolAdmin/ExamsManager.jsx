import React, { useState, useEffect } from 'react';
import { examsAPI, classesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { FileText, Plus, Lock, Unlock } from 'lucide-react';

export function ExamsManager() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ class_id: '', name: '', start_date: '', end_date: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { if (selectedClass) loadExams(); }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch (e) { /* ignore */ }
  };

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await examsAPI.list(Number(selectedClass));
      setExams(res.items || []);
    } catch (e) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await examsAPI.create(Number(form.class_id), form.name, form.start_date || undefined, form.end_date || undefined);
      toast.success('Exam created');
      setShowCreate(false);
      if (form.class_id === selectedClass) loadExams();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleLock = async (exam) => {
    try {
      await examsAPI.lock(exam.id, !exam.is_locked);
      toast.success(`Exam ${!exam.is_locked ? 'locked' : 'unlocked'}`);
      loadExams();
    } catch (e) {
      toast.error('Failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exams</h1>
          <p className="page-subtitle">Create and manage exams</p>
        </div>
        <button onClick={() => { setShowCreate(true); setForm({ class_id: selectedClass || '', name: '', start_date: '', end_date: '' }); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select className="select-field w-48" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">Select Class</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>
      </div>

      {!selectedClass ? (
        <div className="card empty-state">
          <FileText className="empty-state-icon" />
          <p className="empty-state-title">Select a class</p>
          <p className="empty-state-desc">Choose a class to view its exams</p>
        </div>
      ) : loading ? (
        <div className="card p-8 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="card overflow-hidden">
          {exams.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-state-icon" />
              <p className="empty-state-title">No exams</p>
            </div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Exam Name</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.id}>
                    <td className="font-medium">{e.name}</td>
                    <td>{e.start_date ? new Date(e.start_date).toLocaleDateString() : '—'}</td>
                    <td>{e.end_date ? new Date(e.end_date).toLocaleDateString() : '—'}</td>
                    <td><StatusBadge status={e.is_locked ? 'locked' : 'active'} /></td>
                    <td>
                      <button onClick={() => toggleLock(e)} className={`btn-sm ${e.is_locked ? 'btn-secondary' : 'btn-primary'}`}>
                        {e.is_locked ? <><Unlock className="w-3.5 h-3.5" /> Unlock</> : <><Lock className="w-3.5 h-3.5" /> Lock</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Exam">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Class</label>
            <select className="select-field" required value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Exam Name</label>
            <input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mid-Term Exam" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input className="input-field" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input className="input-field" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
