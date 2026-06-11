import React, { useState, useEffect } from 'react';
import { parentsAPI, studentsAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { generateSingleCredentialPDF } from '../../utils/pdfGenerator';
import { Plus, Users, Link2, Download, Copy } from 'lucide-react';

export function ParentsManager() {
  const [parents, setParents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [createForm, setCreateForm] = useState({ student_id: '', relation_type: 'guardian' });
  const [linkForm, setLinkForm] = useState({ parent_user_id: '', student_id: '', relation_type: 'guardian' });
  const [saving, setSaving] = useState(false);
  const limit = 20;
  const toast = useToast();

  useEffect(() => { loadParents(); }, [page, statusFilter]);

  const loadParents = async () => {
    setLoading(true);
    try {
      const res = await parentsAPI.list(limit, page * limit, statusFilter || undefined);
      setParents(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      toast.error('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [stuRes, parRes] = await Promise.all([
        studentsAPI.getOptions(),
        parentsAPI.getOptions(),
      ]);
      setStudentOptions(stuRes.items || []);
      setParentOptions(parRes.items || []);
    } catch (e) { /* ignore */ }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await parentsAPI.create(Number(createForm.student_id), createForm.relation_type);
      toast.success('Parent created!');
      setShowCreate(false);
      setShowCredentials({
        username: res.username,
        password: res.password_hint || `${res.username}@123`,
      });
      loadParents();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLink = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await parentsAPI.link(Number(linkForm.parent_user_id), Number(linkForm.student_id), linkForm.relation_type);
      toast.success('Parent linked to student!');
      setShowLink(false);
      loadParents();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Parents</h1>
          <p className="page-subtitle">{total} parents total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowLink(true); loadOptions(); setLinkForm({ parent_user_id: '', student_id: '', relation_type: 'guardian' }); }} className="btn-secondary">
            <Link2 className="w-4 h-4" /> Link Parent
          </button>
          <button onClick={() => { setShowCreate(true); loadOptions(); setCreateForm({ student_id: '', relation_type: 'guardian' }); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Parent
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <select className="select-field w-48" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : parents.length === 0 ? (
          <div className="empty-state">
            <Users className="empty-state-icon" />
            <p className="empty-state-title">No parents found</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr><th>Username</th><th>Name</th><th>Phone</th><th>Student</th><th>Approval</th><th>Status</th></tr>
              </thead>
              <tbody>
                {parents.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs">{p.user?.username || p.username || '—'}</td>
                    <td>{p.user?.name || p.name || '—'}</td>
                    <td>{p.user?.phone || p.phone || '—'}</td>
                    <td className="text-sm">{p.student?.user?.name || p.student?.user?.username || '—'}</td>
                    <td><StatusBadge status={p.approval_status || 'pending'} /></td>
                    <td><StatusBadge status={p.is_active ? 'active' : 'inactive'} /></td>
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

      {/* Create Parent */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Parent">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Student</label>
            <select className="select-field" required value={createForm.student_id} onChange={(e) => setCreateForm({ ...createForm, student_id: e.target.value })}>
              <option value="">Select student</option>
              {studentOptions.map((s) => {
                const name = s.User?.name || s.user?.name || '';
                const username = s.User?.username || s.user?.username || '';
                const display = name && name !== username
                  ? `${name} (${username})`
                  : username || `ID: ${s.id}`;
                return (
                  <option key={s.id} value={s.id}>
                    {display} — {s.class?.class_name || '—'} Section {s.section?.name || '—'}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="label">Relation</label>
            <select className="select-field" value={createForm.relation_type} onChange={(e) => setCreateForm({ ...createForm, relation_type: e.target.value })}>
              <option value="mother">Mother</option>
              <option value="father">Father</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Link Parent */}
      <Modal isOpen={showLink} onClose={() => setShowLink(false)} title="Link Parent to Student">
        <form onSubmit={handleLink} className="space-y-4">
          <div>
            <label className="label">Existing Parent</label>
            <select className="select-field" required value={linkForm.parent_user_id} onChange={(e) => setLinkForm({ ...linkForm, parent_user_id: e.target.value })}>
              <option value="">Select parent</option>
              {parentOptions.map((p) => {
                const parentUser = p.User || p.user || p;
                const parentName = parentUser?.name || '';
                const parentUsername = parentUser?.username || '';

                const display = parentName && parentName !== parentUsername
                  ? `${parentUsername} (${parentName})`
                  : parentUsername;

                return (
                  <option key={parentUser?.id || p.id} value={parentUser?.id || p.id}>
                    {display}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="label">Student</label>
            <select className="select-field" required value={linkForm.student_id} onChange={(e) => setLinkForm({ ...linkForm, student_id: e.target.value })}>
              <option value="">Select student</option>
              {studentOptions.map((s) => {
                const name = s.User?.name || s.user?.name || '';
                const username = s.User?.username || s.user?.username || '';
                const display = name && name !== username
                  ? `${name} (${username})`
                  : username || `ID: ${s.id}`;
                return (
                  <option key={s.id} value={s.id}>
                    {display} — {s.class?.class_name || '—'} Section {s.section?.name || '—'}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="label">Relation</label>
            <select className="select-field" value={linkForm.relation_type} onChange={(e) => setLinkForm({ ...linkForm, relation_type: e.target.value })}>
              <option value="mother">Mother</option>
              <option value="father">Father</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowLink(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Linking...' : 'Link'}</button>
          </div>
        </form>
      </Modal>

      {/* Credentials */}
      <Modal isOpen={!!showCredentials} onClose={() => setShowCredentials(null)} title="Parent Created">
        {showCredentials && (
          <div>
            <div className="credential-box space-y-2">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Username:</span><span className="font-mono font-semibold">{showCredentials.username}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Password:</span><span className="font-mono font-semibold">{showCredentials.password}</span></div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => generateSingleCredentialPDF(showCredentials.username, showCredentials.password, 'Parent')} className="btn-sm btn-secondary">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
