import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Users, Plus, Trash2, UserPlus, UserMinus, Phone, Home, Edit2, Check, X } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { studentsAPI } from '../../api';

export function FamilyManager() {
  const toast = useToast();
  const [families, setFamilies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // Create / Edit modal
  const [showForm, setShowForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [form, setForm] = useState({ guardian_phone: '', student_ids: [] });
  const [formLoading, setFormLoading] = useState(false);

  // Add student modal
  const [addModal, setAddModal] = useState(null); // { familyId }
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    loadFamilies(page);
  }, [page]);

  const loadFamilies = async (pg) => {
    setLoading(true);
    try {
      const res = await api.get(`/students/families?limit=${PAGE_SIZE}&offset=${pg * PAGE_SIZE}`);
      setFamilies(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (e) {
      toast.error('Failed to load families');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = async () => {
    setEditingFamily(null);
    setForm({ guardian_phone: '', student_ids: [] });
    setShowForm(true);
    try {
      const res = await studentsAPI.listOptions();
      setStudentOptions(res.data?.items || []);
    } catch {
      setStudentOptions([]);
    }
  };

  const openEdit = (family) => {
    setEditingFamily(family);
    setForm({
      guardian_phone: family.guardian_phone || '',
      student_ids: [] // not editable from the edit modal
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingFamily) {
        await api.put(`/students/families/${editingFamily.id}`, form);
        toast.success('Family updated');
      } else {
        await api.post('/students/families', form);
        toast.success('Family created');
      }
      setShowForm(false);
      loadFamilies(page);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save family');
    } finally {
      setFormLoading(false);
    }
  };

  const openAddStudent = async (familyId) => {
    setAddModal({ familyId });
    setSelectedStudentId('');
    try {
      const res = await studentsAPI.listOptions();
      setStudentOptions(res.data?.items || []);
    } catch {
      setStudentOptions([]);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) return;
    setAddLoading(true);
    try {
      await api.post(`/students/families/${addModal.familyId}/students`, { student_id: Number(selectedStudentId) });
      toast.success('Student added to family');
      setAddModal(null);
      loadFamilies(page);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add student');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveStudent = async (familyId, studentId) => {
    if (!window.confirm('Remove this student from the family?')) return;
    try {
      await api.delete(`/students/families/${familyId}/students/${studentId}`);
      toast.success('Student removed from family');
      loadFamilies(page);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Families</h1>
          <p className="page-subtitle">
            Link siblings by guardian phone. {total} families total.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            New Family
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-slate-400">Loading...</div>
      ) : families.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users className="empty-state-icon" />
            <p className="empty-state-title">No families yet</p>
            <p className="empty-state-desc">Create a family to link siblings by guardian phone number.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {families.map((family) => (
            <div key={family.id} className="card p-4">
              {/* Family header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">#{family.id}</span>
                    {family.guardian_phone && (
                      <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                        <Phone className="w-3 h-3" />
                        {family.guardian_phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="btn-sm btn-secondary" onClick={() => openEdit(family)}>
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button className="btn-sm btn-primary" onClick={() => openAddStudent(family.id)}>
                    <UserPlus className="w-3 h-3" />
                    Add
                  </button>
                </div>
              </div>

              {/* Students */}
              {(family.students || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No students linked</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {family.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                    >
                      <span className="font-medium text-slate-800">
                        {student.user?.name || '—'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {student.class?.class_name || ''}
                        {student.section?.name ? ` · ${student.section.name}` : ''}
                      </span>
                      <button
                        onClick={() => handleRemoveStudent(family.id, student.id)}
                        className="text-red-400 hover:text-red-600 ml-1"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between card p-4">
              <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-sm btn-secondary"
                >Previous</button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-sm btn-secondary"
                >Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editingFamily ? 'Edit Family' : 'New Family'}
          maxWidth="max-w-md"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <button onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
              <button
                onClick={handleFormSubmit}
                disabled={formLoading}
                className="btn btn-primary btn-sm"
              >
                {formLoading ? 'Saving...' : editingFamily ? 'Update' : 'Create'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div>
              <label className="form-label">Guardian Phone <span className="text-indigo-500">(key for linking)</span></label>
              <input
                className="input"
                value={form.guardian_phone}
                onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
                placeholder="e.g. 9876543210"
              />
            </div>
            {!editingFamily && (
              <div>
                <label className="form-label">Select Siblings to Link <span className="text-slate-400 font-normal">(Hold Ctrl/Cmd to select multiple)</span></label>
                <select
                  multiple
                  className="input p-2"
                  style={{ minHeight: '140px' }}
                  value={form.student_ids || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                    setForm({ ...form, student_ids: selected });
                  }}
                >
                  {studentOptions.map((s) => (
                    <option key={s.id} value={s.id} className="py-1">
                      {s.name} ({s.username})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">You can also add more students later using the Add button.</p>
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* Add Student Modal */}
      {addModal && (
        <Modal
          isOpen={!!addModal}
          onClose={() => setAddModal(null)}
          title="Add Student to Family"
          maxWidth="max-w-sm"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <button onClick={() => setAddModal(null)} className="btn btn-secondary btn-sm">Cancel</button>
              <button
                onClick={handleAddStudent}
                disabled={!selectedStudentId || addLoading}
                className="btn btn-primary btn-sm"
              >
                {addLoading ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <label className="form-label">Select Student</label>
            <select
              className="input"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- Select a student --</option>
              {studentOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.username})
                </option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
