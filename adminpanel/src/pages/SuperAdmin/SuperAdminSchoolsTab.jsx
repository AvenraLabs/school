import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolAPI, tokenPoliciesAPI, authAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Input';
import {
  School,
  Plus,
  Edit2,
  KeyRound,
  Coins,
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  GraduationCap
} from 'lucide-react';

export function SuperAdminSchoolsTab({ schools, loading, onRefresh }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    admin_username: '',
    admin_password: '',
    admin_name: '',
  });

  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaSchool, setQuotaSchool] = useState(null);
  const [quotaForm, setQuotaForm] = useState({
    annual_limit: 10000,
    annual_tokens: 500000,
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSchool, setResetSchool] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const filteredSchools = (schools || []).filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const sName = (s.school_name || s.name || '').toLowerCase();
    const sCode = (s.code || s.board || '').toLowerCase();
    const sAdmin = (s.admin_username || s.users?.[0]?.username || '').toLowerCase();
    return sName.includes(q) || sCode.includes(q) || sAdmin.includes(q);
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.admin_username.trim() || !createForm.admin_password.trim()) {
      toast.error('School name, admin username, and admin password are required.');
      return;
    }

    setSubmitting(true);
    try {
      await schoolAPI.create({
        ...createForm,
        name: createForm.name.trim(),
        admin_username: createForm.admin_username.trim(),
      });
      toast.success(`School "${createForm.name}" registered successfully!`);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        admin_username: '',
        admin_password: '',
        admin_name: '',
      });
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register school');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuotaSubmit = async (e) => {
    e.preventDefault();
    if (!quotaSchool) return;
    setSubmitting(true);
    try {
      await tokenPoliciesAPI.updateWhatsAppQuota(
        quotaSchool.id,
        Number(quotaForm.annual_limit),
        'replace'
      );
      toast.success(`WhatsApp annual limit updated to ${quotaForm.annual_limit} messages!`);
      setShowQuotaModal(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quota');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetSchool || !newPassword || newPassword.length < 4) {
      toast.error('New password must be at least 4 characters');
      return;
    }
    setSubmitting(true);
    try {
      await authAPI.resetUserPassword(resetSchool.admin_user_id || resetSchool.id, newPassword);
      toast.success(`Admin password for ${resetSchool.name} reset successfully!`);
      setShowResetModal(false);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset admin password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (school) => {
    try {
      const current = String(school.status || '').toLowerCase();
      const nextStatus = (current === 'active' || school.is_active) ? 'suspended' : 'active';
      const schoolName = school.school_name || school.name || 'School';
      await schoolAPI.updateStatus(school.id, nextStatus);
      toast.success(`School "${schoolName}" status set to ${nextStatus}`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update school status');
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Input
            icon={Search}
            placeholder="Search school name, code, admin..."
            className="w-64 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="text-xs text-[#8C97AB] font-mono">Showing {filteredSchools.length} of {schools?.length || 0} registered schools</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Register New School
        </Button>
      </div>

      {/* School Registry Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
            <tr>
              <th className="px-4 py-3">School Name</th>
              <th className="px-4 py-3">Code / ID</th>
              <th className="px-4 py-3">Admin Handle</th>
              <th className="px-4 py-3">Contact Email & Phone</th>
              <th className="px-4 py-3">WhatsApp Usage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#8C97AB]">
                  Loading institutional registry...
                </td>
              </tr>
            ) : filteredSchools.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <EmptyState
                    icon={Building2}
                    title="No schools found"
                    description="No registered schools match your search query."
                  />
                </td>
              </tr>
            ) : (
              filteredSchools.map((s) => {
                const schoolName = s.school_name || s.name || 'School';
                const adminUsername = s.admin_username || s.users?.[0]?.username || s.admin_user?.username || `admin_${s.id}`;
                const contactEmail = s.email || '—';
                const contactPhone = s.contact_phone || s.phone || '—';
                const sentCount = s.whatsapp_sent_count || 0;
                const limitCount = s.whatsapp_annual_limit || 10000;
                const pct = Math.min(100, Math.round((sentCount / limitCount) * 100));

                return (
                  <tr key={s.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[6px] bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold font-display border border-[#D3E6E0] shrink-0">
                          {schoolName[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-[#14213D] block text-xs">{schoolName}</span>
                          <span className="text-[10px] text-[#52607D] block">
                            {s.address || 'Main Campus'} · {s.studentsCount ?? s.dataValues?.studentsCount ?? 0} Students · {s.teachersCount ?? s.dataValues?.teachersCount ?? 0} Teachers
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#2F6F5E]">{s.code || s.board || `SCH-${s.id}`}</td>
                    <td className="px-4 py-3 font-mono text-[#52607D]">
                      @{adminUsername}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <span className="block text-[#14213D]">{contactEmail}</span>
                      <span className="block text-[#8C97AB]">{contactPhone}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-[#2F6F5E] font-bold">{sentCount} sent</span>
                          <span className="text-[#8C97AB]">/ {limitCount}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#EDEAE1] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 90 ? 'bg-[#B0403A]' : pct >= 70 ? 'bg-[#B8860B]' : 'bg-[#2F6F5E]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={String(s.status || '').toLowerCase() === 'active' || s.is_active ? 'active' : 'inactive'} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          title="Edit School Profile & Settings"
                          onClick={() => navigate('/super-admin/settings')}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={MessageSquare}
                          title="Configure WhatsApp Quota"
                          onClick={() => {
                            setQuotaSchool(s);
                            setQuotaForm({ annual_limit: s.whatsapp_annual_limit || 10000, annual_tokens: 500000 });
                            setShowQuotaModal(true);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={KeyRound}
                          title="Reset Admin Password"
                          onClick={() => {
                            setResetSchool(s);
                            setNewPassword('');
                            setShowResetModal(true);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className={String(s.status || '').toLowerCase() === 'active' || s.is_active ? 'text-[#B0403A]' : 'text-[#2F6F5E]'}
                          onClick={() => handleToggleStatus(s)}
                        >
                          {String(s.status || '').toLowerCase() === 'active' || s.is_active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Register New School */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Register New Educational Institution">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">School Full Name *</label>
            <Input
              required
              placeholder="e.g. St. Xavier International Academy"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">School Code / Identifier</label>
              <Input
                placeholder="e.g. SXIA-01"
                value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Official Email</label>
              <Input
                type="email"
                placeholder="admin@school.edu"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Contact Phone</label>
              <Input
                placeholder="10-digit phone number"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Campus Address</label>
              <Input
                placeholder="City, State, Location"
                value={createForm.address}
                onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#EDEAE1] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] font-mono block">
              SCHOOL ADMIN ACCOUNT CREDENTIALS
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Admin Username *</label>
                <Input
                  required
                  placeholder="e.g. sxia_admin"
                  value={createForm.admin_username}
                  onChange={(e) => setCreateForm({ ...createForm, admin_username: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Admin Initial Password *</label>
                <Input
                  required
                  type="password"
                  placeholder="Initial password"
                  value={createForm.admin_password}
                  onChange={(e) => setCreateForm({ ...createForm, admin_password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Register School</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Configure WhatsApp Quota */}
      {showQuotaModal && quotaSchool && (
        <Modal isOpen={showQuotaModal} onClose={() => setShowQuotaModal(false)} title={`Configure Quota — ${quotaSchool.name}`}>
          <form onSubmit={handleQuotaSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-1">
              <span className="text-[10px] text-[#8C97AB] font-mono uppercase block">CURRENT WHATSAPP USAGE</span>
              <div className="flex justify-between items-center font-bold text-[#14213D]">
                <span>Messages Sent This Year:</span>
                <span className="font-mono text-[#2F6F5E]">{quotaSchool.whatsapp_sent_count || 0} messages</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Annual WhatsApp Message Limit *</label>
              <Input
                type="number"
                required
                min="0"
                placeholder="e.g. 10000"
                value={quotaForm.annual_limit}
                onChange={(e) => setQuotaForm({ ...quotaForm, annual_limit: e.target.value })}
              />
              <span className="text-[10px] text-[#8C97AB] mt-1 block">
                Outbound announcements and alerts will be paused for this school if usage reaches this threshold.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
              <Button variant="outline" type="button" onClick={() => setShowQuotaModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={submitting}>Save Quota</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Reset Admin Password */}
      {showResetModal && resetSchool && (
        <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title={`Reset Admin Password — ${resetSchool.name}`}>
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-1">
              <span className="text-[10px] text-[#8C97AB] font-mono uppercase block">TARGET ADMIN ACCOUNT</span>
              <p className="font-bold text-[#14213D] text-sm">@{resetSchool.admin_username || resetSchool.code}</p>
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">New Password *</label>
              <Input
                required
                type="password"
                placeholder="Enter new password (min 4 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
              <Button variant="outline" type="button" onClick={() => setShowResetModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={submitting}>Reset Password</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
