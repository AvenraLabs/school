import React, { useState, useEffect } from 'react';
import { teachersAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import { generateSingleCredentialPDF } from '../../utils/pdfGenerator';
import {
  Plus,
  UserCog,
  Download,
  Copy,
  UserCheck,
  Clock,
  UserMinus,
  Award,
  UserX,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export function TeachersManager() {
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showCredentials, setShowCredentials] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

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
        status = activeTab;
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
      toast.success('Teacher created successfully!');
      setShowCredentials({
        username: res.username,
        password: res.password_hint || `${res.username}@123`,
        employee_id: formatEmployeeId(res.employee_id),
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
      toast.error('Failed to update teacher status');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdateDirect = async (teacher, status) => {
    try {
      await teachersAPI.updateStatus(teacher.id, status, '');
      toast.success('Teacher reactivated to ACTIVE');
      loadTeachers();
    } catch (e) {
      toast.error('Failed to reactivate teacher');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Compact Action Toolbar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Faculty Roster Directory</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="text-[#52607D]">Total Active Staff: {total}</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            loading={creating}
            onClick={handleCreate}
          >
            Add Teacher Account
          </Button>
        </div>
      </Card>

      {/* Tabs Row */}
      <div className="flex gap-1 border-b border-[#E4E1D8] overflow-x-auto pb-px">
        {[
          { id: 'ACTIVE', label: 'Active Faculty', icon: UserCheck },
          { id: 'PENDING', label: 'Pending Approvals', icon: Clock },
          { id: 'RESIGNED', label: 'Resigned', icon: UserMinus },
          { id: 'RETIRED', label: 'Retired', icon: Award },
          { id: 'TERMINATED', label: 'Terminated', icon: UserX },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(0); }}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-[8px] transition-all cursor-pointer border-t border-x outline-none ${
                isActive
                  ? 'bg-white border-[#E4E1D8] border-t-[3px] border-t-[#2F6F5E] text-[#2F6F5E] -mb-px shadow-2xs'
                  : 'bg-transparent border-transparent text-[#52607D] hover:text-[#14213D] hover:bg-[#FAFAF8]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2F6F5E]' : 'text-[#8C97AB]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Data Table Container */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Faculty Name</th>
                <th className="px-4 py-3">Approval</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-4 py-3.5">
                      <div className="h-4 bg-[#EAF3F0] rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <EmptyState
                      icon={UserCog}
                      title="No teachers found"
                      description="No faculty records match the selected status filter."
                    />
                  </td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-2.5 font-mono font-semibold">{t.employee_id || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-[#52607D]">{t.user?.username || '—'}</td>
                    <td className="px-4 py-2.5 font-medium">
                      <div className="flex items-center gap-2">
                        <UserAvatar src={t.user?.avatar_url} name={t.user?.name} fallbackChar="T" />
                        <span>{t.user?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={t.approval_status || 'pending'} size="sm" />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={t.status || (t.is_active ? 'ACTIVE' : 'INACTIVE')} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {activeTab === 'ACTIVE' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStatusModal(t, 'RESIGNED')}
                            >
                              Resign
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStatusModal(t, 'RETIRED')}
                            >
                              Retire
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#B0403A] hover:bg-[#FDF2F1]"
                              onClick={() => openStatusModal(t, 'TERMINATED')}
                            >
                              Terminate
                            </Button>
                          </>
                        ) : (
                          activeTab !== 'PENDING' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleStatusUpdateDirect(t, 'ACTIVE')}
                            >
                              Reactivate
                            </Button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#FAFAF8] border-t border-[#E4E1D8] flex items-center justify-between text-xs text-[#52607D]">
            <span>
              Page <strong className="text-[#14213D] font-mono">{page + 1}</strong> of{' '}
              <strong className="text-[#14213D] font-mono">{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconRight={ChevronRight}
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal: Credentials */}
      <Modal isOpen={!!showCredentials} onClose={() => setShowCredentials(null)} title="Teacher Account Generated">
        {showCredentials && (
          <div className="space-y-4">
            <div className="p-3 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px] text-xs text-[#2F6F5E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Teacher account created successfully!</span>
            </div>

            <div className="bg-[#FAFAF8] border border-[#E4E1D8] rounded-[8px] p-4 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#EDEAE1] pb-2">
                <span className="text-[#52607D]">Employee ID:</span>
                <span className="font-bold text-[#14213D]">{showCredentials.employee_id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#EDEAE1] pb-2">
                <span className="text-[#52607D]">Username:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#14213D]">{showCredentials.username}</span>
                  <button onClick={() => copyToClipboard(showCredentials.username)} className="text-[#2F6F5E] hover:underline cursor-pointer">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#52607D]">Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#14213D]">{showCredentials.password}</span>
                  <button onClick={() => copyToClipboard(showCredentials.password)} className="text-[#2F6F5E] hover:underline cursor-pointer">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
              <Button
                variant="outline"
                icon={Download}
                onClick={() => generateSingleCredentialPDF(showCredentials.username, showCredentials.password, 'Teacher')}
              >
                Download PDF
              </Button>
              <Button variant="primary" onClick={() => setShowCredentials(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Status Update Confirmation */}
      <Modal isOpen={!!showStatusModal} onClose={() => setShowStatusModal(null)} title={`Confirm Status Change: ${targetStatus}`}>
        <div className="space-y-4">
          <p className="text-xs text-[#52607D]">
            Are you sure you want to transition <strong>{showStatusModal?.user?.name || showStatusModal?.user?.username}</strong> to <strong>{targetStatus}</strong>?
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Administrative Remarks / Reason</label>
            <Textarea
              placeholder="Enter official reason for record transition..."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" onClick={() => setShowStatusModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleStatusSubmit} loading={saving}>Confirm Status Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
