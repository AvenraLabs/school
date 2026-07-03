import React, { useState, useEffect } from 'react';
import { studentsAPI, classesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { generateSingleCredentialPDF } from '../../utils/pdfGenerator';
import { Plus, GraduationCap, Download, Copy, ArrowRightLeft } from 'lucide-react';

export function StudentsManager() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
  const [showMove, setShowMove] = useState(null);
  const [createForm, setCreateForm] = useState({ class_id: '', section_id: '', name: '', guardian_phone: '' });
  const [moveSection, setMoveSection] = useState('');
  const [saving, setSaving] = useState(false);
  const limit = 20;
  const toast = useToast();

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadStudents(); }, [page, filterClass, filterSection]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch (e) { /* ignore */ }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await studentsAPI.list(limit, page * limit, filterClass || undefined, filterSection || undefined);
      setStudents(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await studentsAPI.create(
        Number(createForm.class_id), 
        Number(createForm.section_id),
        createForm.name,
        createForm.guardian_phone
      );
      toast.success('Student created!');
      setShowCreate(false);
      const student = res.student || res.students?.[0];
      if (student) {
        setShowCredentials({
          username: student.user?.username || student.username,
          password: student.password_hint || `${student.user?.username || student.username}@123`,
          roll_no: student.roll_no,
        });
      }
      loadStudents();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async () => {
    try {
      await studentsAPI.moveStudent(showMove.id, Number(moveSection));
      toast.success('Student moved');
      setShowMove(null);
      loadStudents();
    } catch (e) {
      toast.error('Failed to move');
    }
  };

  const toggleStatus = async (student) => {
    try {
      await studentsAPI.updateStatus(student.id, !student.is_active);
      toast.success(`Student ${!student.is_active ? 'activated' : 'deactivated'}`);
      loadStudents();
    } catch (e) {
      toast.error('Failed');
    }
  };

  const selectedClassSections = classes.find((c) => String(c.id) === String(filterClass || createForm.class_id))?.sections || [];
  const allSections = classes.flatMap((c) => (c.sections || []).map((s) => ({ ...s, class_name: c.class_name, class_id: c.id })));
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{total} students total</p>
        </div>
        <button onClick={() => { setShowCreate(true); setCreateForm({ class_id: '', section_id: '', name: '', guardian_phone: '' }); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select className="select-field w-48" value={filterClass}
          onChange={e => { setFilterClass(e.target.value); setFilterSection(''); setPage(0); }}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>
        <select className="select-field w-48" value={filterSection}
          onChange={e => { setFilterSection(e.target.value); setPage(0); }}
          disabled={!filterClass}>
          <option value="">All Sections</option>
          {(classes.find(c => String(c.id) === String(filterClass))?.sections || []).map(s => (
            <option key={s.id} value={s.id}>Section {s.name}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <GraduationCap className="empty-state-icon" />
            <p className="empty-state-title">No students found</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr><th>Roll No</th><th>Admission No</th><th>Username</th><th>Name</th><th>Class</th><th>Section</th><th>Guardian Phone</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono">{s.roll_no || '—'}</td>
                    <td className="font-mono text-xs">{s.admission_no || '—'}</td>
                    <td className="font-mono text-xs">{s.user?.username || '—'}</td>
                    <td>{s.user?.name || '—'}</td>
                    <td>{s.class?.class_name || '—'}</td>
                    <td>{s.section?.name || '—'}</td>
                    <td className="font-mono text-xs text-indigo-600">{s.guardian_phone || '—'}</td>
                    <td><StatusBadge status={s.is_active ? 'active' : 'inactive'} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleStatus(s)} className={`btn-sm ${s.is_active ? 'btn-secondary' : 'btn-success'}`}>
                          {s.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => { setShowMove(s); setMoveSection(''); }} className="btn-sm btn-ghost" title="Move section">
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-sm btn-secondary">Previous</button>
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-sm btn-secondary">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Student */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Student">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Class</label>
            <select className="select-field" required value={createForm.class_id} onChange={(e) => setCreateForm({ ...createForm, class_id: e.target.value, section_id: '' })}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Section</label>
            <select className="select-field" required value={createForm.section_id} onChange={(e) => setCreateForm({ ...createForm, section_id: e.target.value })}>
              <option value="">Select section</option>
              {(classes.find((c) => String(c.id) === String(createForm.class_id))?.sections || []).map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Student Name (Optional)</label>
            <input type="text" className="input-field" placeholder="Auto-generated if empty" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Guardian Phone (Optional)</label>
            <input type="text" className="input-field" placeholder="For Family Linking" value={createForm.guardian_phone} onChange={(e) => setCreateForm({ ...createForm, guardian_phone: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Credentials */}
      <Modal isOpen={!!showCredentials} onClose={() => setShowCredentials(null)} title="Student Created">
        {showCredentials && (
          <div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-sm text-emerald-800">✅ Student account created!</div>
            <div className="credential-box space-y-2">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Username:</span><span className="font-mono font-semibold">{showCredentials.username}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Password:</span><span className="font-mono font-semibold">{showCredentials.password}</span></div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => generateSingleCredentialPDF(showCredentials.username, showCredentials.password, 'Student')} className="btn-sm btn-secondary">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Move Student */}
      <Modal isOpen={!!showMove} onClose={() => setShowMove(null)} title="Move Student">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Move <strong>{showMove?.user?.name || showMove?.user?.username}</strong> to a different section.</p>
          <div>
            <label className="label">New Section</label>
            <select className="select-field" value={moveSection} onChange={(e) => setMoveSection(e.target.value)}>
              <option value="">Select section</option>
              {allSections.map((s) => <option key={s.id} value={s.id}>{s.class_name} — Section {s.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowMove(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleMove} disabled={!moveSection} className="btn-primary">Move</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
