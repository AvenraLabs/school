import React, { useState, useEffect } from 'react';
import { teachersAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { generateSingleCredentialPDF } from '../../utils/pdfGenerator';
import { Plus, UserCog, Download, Copy } from 'lucide-react';

export function TeachersManager() {
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showCredentials, setShowCredentials] = useState(null);
  const [creating, setCreating] = useState(false);
  const limit = 20;
  const toast = useToast();

  useEffect(() => { loadTeachers(); }, [page]);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await teachersAPI.list(limit, page * limit);
      setTeachers(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await teachersAPI.create();
      toast.success('Teacher created!');
      setShowCredentials({
        username: res.username,
        password: res.password_hint || `${res.username}@123`,
        employee_id: res.employee_id,
      });
      loadTeachers();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create teacher');
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (teacher) => {
    try {
      await teachersAPI.updateStatus(teacher.id, !teacher.is_active);
      toast.success(`Teacher ${!teacher.is_active ? 'activated' : 'deactivated'}`);
      loadTeachers();
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied!');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Teachers</h1>
          <p className="page-subtitle">Manage teacher accounts ({total} total)</p>
        </div>
        <button onClick={handleCreate} disabled={creating} className="btn-primary">
          <Plus className="w-4 h-4" /> {creating ? 'Creating...' : 'Create Teacher'}
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : teachers.length === 0 ? (
          <div className="empty-state">
            <UserCog className="empty-state-icon" />
            <p className="empty-state-title">No teachers</p>
            <p className="empty-state-desc">Create teachers or use Bulk Seeder</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr><th>Employee ID</th><th>Username</th><th>Name</th><th>Approval</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs">{t.employee_id || '—'}</td>
                    <td className="font-mono text-xs">{t.user?.username || '—'}</td>
                    <td>{t.user?.name || '—'}</td>
                    <td><StatusBadge status={t.approval_status || 'pending'} /></td>
                    <td><StatusBadge status={t.is_active ? 'active' : 'inactive'} /></td>
                    <td>
                      <button onClick={() => toggleStatus(t)} className={`btn-sm ${t.is_active ? 'btn-secondary' : 'btn-success'}`}>
                        {t.is_active ? 'Deactivate' : 'Activate'}
                      </button>
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

      {/* Credentials Modal */}
      <Modal isOpen={!!showCredentials} onClose={() => setShowCredentials(null)} title="Teacher Created">
        {showCredentials && (
          <div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-sm text-emerald-800">✅ Teacher account created successfully!</div>
            <div className="credential-box space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Employee ID:</span>
                <span className="font-mono font-semibold">{showCredentials.employee_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Username:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{showCredentials.username}</span>
                  <button onClick={() => copyToClipboard(showCredentials.username)} className="text-indigo-500"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{showCredentials.password}</span>
                  <button onClick={() => copyToClipboard(showCredentials.password)} className="text-indigo-500"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => generateSingleCredentialPDF(showCredentials.username, showCredentials.password, 'Teacher')} className="btn-sm btn-secondary">
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
