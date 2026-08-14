import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolAPI, authAPI } from '../../api';
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
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function SuperAdminSchoolsTab({ schools = [], loading, onRefresh }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const defaultYearName = `${currentYear}-${currentYear + 1}`;

  const [createForm, setCreateForm] = useState({
    name: '',
    board: 'CBSE',
    academic_year_name: defaultYearName,
    academic_year_start: `${currentYear}-06-01`,
    academic_year_end: `${currentYear + 1}-05-31`,
    phone: '',
    admin_username: '',
    admin_password: '',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editSchool, setEditSchool] = useState(null);
  const [editForm, setEditForm] = useState({
    school_name: '',
    board: 'CBSE',
    contact_phone: '',
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSchool, setResetSchool] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const totalSchools = schools?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalSchools / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedSchools = (schools || []).slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        board: createForm.board || 'CBSE',
      });
      toast.success(`School "${createForm.name}" registered successfully with initial Academic Year ${createForm.academic_year_name}!`);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        board: 'CBSE',
        academic_year_name: defaultYearName,
        academic_year_start: `${currentYear}-06-01`,
        academic_year_end: `${currentYear + 1}-05-31`,
        phone: '',
        admin_username: '',
        admin_password: '',
      });
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register school');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (school) => {
    setEditSchool(school);
    setEditForm({
      school_name: school.school_name || school.name || '',
      board: school.board || 'CBSE',
      contact_phone: school.contact_phone || school.phone || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editSchool) return;
    if (!editForm.school_name.trim()) {
      toast.error('School name is required');
      return;
    }
    setSubmitting(true);
    try {
      await schoolAPI.update(editSchool.id, {
        school_name: editForm.school_name.trim(),
        board: editForm.board || 'CBSE',
        contact_phone: editForm.contact_phone ? editForm.contact_phone.trim() : null,
      });
      toast.success(`School "${editForm.school_name}" updated successfully!`);
      setShowEditModal(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update school');
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
      toast.success(`Admin password for ${resetSchool.name || resetSchool.school_name} reset successfully!`);
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
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-3 shadow-xs flex items-center justify-between gap-3">
        <h3 className="font-display font-bold text-sm text-[#14213D]">Registered Institutions</h3>

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
              <th className="px-4 py-3">Contact Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#8C97AB]">
                  Loading institutional registry...
                </td>
              </tr>
            ) : paginatedSchools.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <EmptyState
                    icon={Building2}
                    title="No schools registered"
                    description="No educational institutions have been registered yet."
                  />
                </td>
              </tr>
            ) : (
              paginatedSchools.map((s) => {
                const schoolName = s.school_name || s.name || 'School';
                const adminUsername = s.admin_username || s.users?.[0]?.username || s.admin_user?.username || `admin_${s.id}`;
                const contactPhone = s.contact_phone || s.phone || '—';

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
                            {s.studentsCount ?? s.dataValues?.studentsCount ?? 0} Students · {s.teachersCount ?? s.dataValues?.teachersCount ?? 0} Teachers
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#2F6F5E]">{s.code || s.board || `SCH-${s.id}`}</td>
                    <td className="px-4 py-3 font-mono text-[#52607D]">
                      @{adminUsername}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#14213D]">
                      {contactPhone}
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
                          title="Edit School Details"
                          onClick={() => handleOpenEdit(s)}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-2 text-xs text-[#52607D]">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalSchools)} of {totalSchools} schools
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="px-2 font-mono text-xs font-semibold text-[#14213D]">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={ChevronRight}
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Register New School */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Register School">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
          {/* Section 1: Institution Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[#14213D]">1. Institution Details</h4>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">School Name *</label>
              <Input
                required
                placeholder="e.g. Delhi Public School"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Board *</label>
                <Select
                  value={createForm.board}
                  onChange={(e) => setCreateForm({ ...createForm, board: e.target.value })}
                >
                  <option value="CBSE">CBSE</option>
                  <option value="STATE">State Board</option>
                </Select>
              </div>

              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Contact Phone</label>
                <Input
                  placeholder="10-digit phone number"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Year */}
          <div className="pt-3 border-t border-[#EDEAE1] space-y-3">
            <h4 className="font-bold text-xs text-[#14213D]">2. Academic Year</h4>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Year *</label>
                <Input
                  required
                  placeholder="e.g. 2026-2027"
                  value={createForm.academic_year_name}
                  onChange={(e) => setCreateForm({ ...createForm, academic_year_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Start Date *</label>
                <Input
                  required
                  type="date"
                  value={createForm.academic_year_start}
                  onChange={(e) => setCreateForm({ ...createForm, academic_year_start: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">End Date *</label>
                <Input
                  required
                  type="date"
                  value={createForm.academic_year_end}
                  onChange={(e) => setCreateForm({ ...createForm, academic_year_end: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Primary Admin Account */}
          <div className="pt-3 border-t border-[#EDEAE1] space-y-3">
            <h4 className="font-bold text-xs text-[#14213D]">3. School Admin</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Username *</label>
                <Input
                  required
                  placeholder="e.g. dps_admin"
                  value={createForm.admin_username}
                  onChange={(e) => setCreateForm({ ...createForm, admin_username: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Password *</label>
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

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Register & Initialize School</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit School Profile */}
      {showEditModal && editSchool && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit School — ${editSchool.school_name || editSchool.name || 'School'}`}>
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">School Name *</label>
              <Input
                required
                placeholder="e.g. Delhi Public School"
                value={editForm.school_name}
                onChange={(e) => setEditForm({ ...editForm, school_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Board *</label>
                <Select
                  value={editForm.board}
                  onChange={(e) => setEditForm({ ...editForm, board: e.target.value })}
                >
                  <option value="CBSE">CBSE</option>
                  <option value="STATE">State Board</option>
                </Select>
              </div>

              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Contact Phone</label>
                <Input
                  placeholder="10-digit phone number"
                  value={editForm.contact_phone}
                  onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={submitting}>Save Changes</Button>
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
