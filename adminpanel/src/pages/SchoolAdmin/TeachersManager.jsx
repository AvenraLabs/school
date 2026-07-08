import React, { useState, useEffect } from 'react';
import { teachersAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { generateSingleCredentialPDF } from '../../utils/pdfGenerator';
import { Plus, UserCog, Download, Copy, UserCheck, Clock, UserMinus, Award, UserX } from 'lucide-react';

export function TeachersManager() {
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showCredentials, setShowCredentials] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // States for Status Scoping & Registry Action Handlers
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const limit = 20;
  const toast = useToast();

  useEffect(() => { loadTeachers(); }, [page, activeTab]);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      let status = undefined;
      let approval_status = undefined;
      if (activeTab === 'ACTIVE') {
        status = 'ACTIVE';
        approval_status = 'approved';
      } else if (activeTab === 'PENDING') {
        approval_status = 'pending';
      } else {
        status = activeTab; // RESIGNED, RETIRED, TERMINATED
      }
      const res = await teachersAPI.list(limit, page * limit, status, approval_status);
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

  const openStatusModal = (teacher, status) => {
    setShowStatusModal(teacher);
    setTargetStatus(status);
    setStatusReason('');
  };

  const handleStatusSubmit = async () => {
    setSaving(true);
    try {
      await teachersAPI.updateStatus(showStatusModal.id, targetStatus, statusReason);
      toast.success(`Teacher status updated to ${targetStatus}`);
      setShowStatusModal(null);
      loadTeachers();
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdateDirect = async (teacher, status) => {
    try {
      await teachersAPI.updateStatus(teacher.id, status, '');
      toast.success(`Teacher reactivated to ACTIVE`);
      loadTeachers();
    } catch (e) {
      toast.error('Failed to reactivate teacher');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied!');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Teachers</h1>
          <p className="page-subtitle">Manage teacher accounts ({total} total)</p>
        </div>
        <button onClick={handleCreate} disabled={creating} className="btn-primary">
          <Plus className="w-4 h-4" /> {creating ? 'Creating...' : 'Create Teacher'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-slate-200 pb-0 overflow-x-auto scrollbar-none">
        {['ACTIVE', 'PENDING', 'RESIGNED', 'RETIRED', 'TERMINATED'].map((tab) => {
          const Icon = {
            ACTIVE: UserCheck,
            PENDING: Clock,
            RESIGNED: UserMinus,
            RETIRED: Award,
            TERMINATED: UserX
          }[tab];
          
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(0); }}
              className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200 outline-none whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400'}`} />}
              <span>{tab.charAt(0) + tab.slice(1).toLowerCase().replace('_', ' ')}</span>
            </button>
          );
        })}
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
                    <td><StatusBadge status={t.status || (t.is_active ? 'ACTIVE' : 'INACTIVE')} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        {activeTab === 'ACTIVE' ? (
                          <>
                            <button onClick={() => openStatusModal(t, 'RESIGNED')} className="btn-sm btn-secondary">
                              Resign
                            </button>
                            <button onClick={() => openStatusModal(t, 'RETIRED')} className="btn-sm btn-secondary">
                              Retire
                            </button>
                            <button onClick={() => openStatusModal(t, 'TERMINATED')} className="btn-sm btn-ghost text-red-600 hover:text-red-800">
                              Terminate
                            </button>
                          </>
                        ) : (
                          activeTab !== 'PENDING' && (
                            <button onClick={() => handleStatusUpdateDirect(t, 'ACTIVE')} className="btn-sm btn-success">
                              Reactivate
                            </button>
                          )
                        )}
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

      {/* Update Teacher Status Confirmation */}
      <Modal isOpen={!!showStatusModal} onClose={() => setShowStatusModal(null)} title={`Confirm ${targetStatus}`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to change the status of <strong>{showStatusModal?.user?.name || showStatusModal?.user?.username}</strong> to <strong>{targetStatus}</strong>?
          </p>
          <div>
            <label className="label">Reason / Remarks (Optional)</label>
            <textarea
              className="input-field min-h-[80px] py-2"
              placeholder="Provide a reason for this status change..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowStatusModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleStatusSubmit} className="btn-primary" disabled={saving}>
              {saving ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
