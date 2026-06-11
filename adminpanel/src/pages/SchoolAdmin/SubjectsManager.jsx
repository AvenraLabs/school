import React, { useState, useEffect } from 'react';
import { subjectsAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

export function SubjectsManager() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { loadSubjects(); }, []);

  const loadSubjects = async () => {
    try {
      const res = await subjectsAPI.list();
      setSubjects(res.items || []);
    } catch (e) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await subjectsAPI.create(name);
      toast.success('Subject created');
      setShowAdd(false);
      setName('');
      loadSubjects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await subjectsAPI.update(showEdit.id, name);
      toast.success('Subject updated');
      setShowEdit(null);
      loadSubjects();
    } catch (e) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await subjectsAPI.delete(deleteTarget.id);
      toast.success('Subject deleted');
      setDeleteTarget(null);
      loadSubjects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="page-subtitle">Manage school subjects</p>
        </div>
        <button onClick={() => { setShowAdd(true); setName(''); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : subjects.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-state-icon" />
            <p className="empty-state-title">No subjects yet</p>
            <p className="empty-state-desc">Add subjects for your school</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Subject Name</th><th>ID</th><th>Actions</th></tr></thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-slate-900">{s.name}</td>
                  <td className="font-mono text-xs text-slate-400">{s.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setShowEdit(s); setName(s.name); }} className="btn-sm btn-secondary">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(s)} className="btn-sm btn-ghost text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Subject">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="label">Subject Name</label>
            <input className="input-field" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" autoFocus />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Subject">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="label">Subject Name</label>
            <input className="input-field" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowEdit(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Subject" message={`Delete "${deleteTarget?.name}"?`} confirmText="Delete" danger />
    </div>
  );
}
