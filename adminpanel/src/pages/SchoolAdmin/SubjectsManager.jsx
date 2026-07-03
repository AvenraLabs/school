import React, { useState, useEffect } from 'react';
import { subjectsAPI } from '../../api';
import './Academic.css';
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
    <div className="academic-page-container">
      <div className="academic-page-header">
        <div>
          <h1 className="academic-title">Subjects</h1>
          <p className="academic-subtitle">Manage school subjects</p>
        </div>
        <button onClick={() => { setShowAdd(true); setName(''); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {loading ? (
        <div className="academic-empty">
          <p className="academic-empty-desc">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="academic-empty">
          <BookOpen className="academic-empty-icon" />
          <h2 className="academic-empty-title">No subjects yet</h2>
          <p className="academic-empty-desc">Create subjects to assign to your classes.</p>
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map((s) => (
            <div key={s.id} className="academic-card subject-card">
              <div>
                <div className="subject-icon-wrap">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="subject-name">{s.name}</h3>
                <p className="subject-id">ID: {s.id}</p>
              </div>
              
              <div className="subject-actions">
                <button
                  className="btn-card-action"
                  title="Edit Subject"
                  onClick={() => { setShowEdit(s); setName(s.name); }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  className="btn-card-action danger"
                  title="Delete Subject"
                  onClick={() => setDeleteTarget(s)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Subject">
        <form onSubmit={handleAdd} className="form-container">
          <div>
            <label className="label">Subject Name</label>
            <input className="input-field" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" autoFocus />
          </div>
          <div className="modal-actions">
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
