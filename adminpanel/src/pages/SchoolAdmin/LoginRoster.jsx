import React, { useState, useEffect, useMemo } from 'react';
import { classesAPI, authAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { generateRosterPDF } from '../../utils/pdfGenerator';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Download, ClipboardList, KeyRound, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

export function LoginRoster() {
  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [page, setPage] = useState(0);
  const LIMIT = 15;
  const toast = useToast();

  useEffect(() => { loadClasses(); loadRoster(); }, []);
  useEffect(() => { loadRoster(); }, [filterClass, filterSection]);
  useEffect(() => { setPage(0); }, [filterRole, filterClass, filterSection]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.data || res.items || []);
    } catch (e) { /* ignore */ }
  };

  const loadRoster = async () => {
    try {
      setLoading(true);
      const res = await classesAPI.getLoginRoster(filterClass, filterSection);
      setData(res.data || res);
    } catch (e) {
      toast.error('Failed to load login roster');
    } finally {
      setLoading(false);
    }
  };

  const allRows = useMemo(() => {
    if (!data) return [];
    const list = [];
    if (filterRole === 'all' || filterRole === 'teachers') {
      (data.teachers || []).forEach((t) => {
        list.push({
          key: `teacher-${t.id}`,
          type: 'teacher',
          userId: t.user?.id,
          name: t.user?.name || '—',
          username: t.user?.username || '—',
          roleLabel: 'Teacher',
          placement: 'Faculty Staff',
        });
      });
    }
    if (filterRole === 'all' || filterRole === 'students') {
      (data.classes || []).forEach((c) => {
        (c.sections || []).forEach((sec) => {
          (sec.students || []).forEach((st) => {
            list.push({
              key: `student-${st.id}`,
              type: 'student',
              userId: st.user?.id,
              name: st.user?.name || '—',
              username: st.user?.username || '—',
              roleLabel: 'Student',
              placement: `${c.class_name} - Sec ${sec.name}`,
            });
          });
        });
      });
    }
    return list;
  }, [data, filterRole]);

  const totalPages = Math.ceil(allRows.length / LIMIT);
  const paginatedRows = useMemo(() => {
    return allRows.slice(page * LIMIT, (page + 1) * LIMIT);
  }, [allRows, page, LIMIT]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    setResetting(true);
    try {
      await authAPI.resetUserPassword(resetModal.userId, newPassword);
      toast.success(`Password for ${resetModal.name} reset successfully`);
      setResetModal(null);
      setNewPassword('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const selectedClassSections = classes.find(c => String(c.id) === String(filterClass))?.sections || [];

  const handleDownloadPDF = () => {
    if (data) {
      let filteredData = { ...data };
      if (filterRole === 'teachers') {
        filteredData.classes = [];
      } else if (filterRole === 'students') {
        filteredData.teachers = [];
      }

      const labelParts = [];
      if (filterRole === 'teachers') {
        labelParts.push('Teachers Roster');
      } else if (filterRole === 'students') {
        labelParts.push('Students Roster');
      } else {
        labelParts.push('Full Roster');
      }

      if (filterRole !== 'teachers') {
        if (filterClass) {
          labelParts.push(`Class: ${classes.find((c) => String(c.id) === String(filterClass))?.class_name || filterClass}`);
        }
        if (filterSection) {
          labelParts.push(`Section: ${selectedClassSections.find((s) => String(s.id) === String(filterSection))?.name || filterSection}`);
        }
      }

      generateRosterPDF(filteredData, labelParts.join(' | '));
      toast.success('PDF roster downloaded');
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-[#14213D]">User Account Login Credentials Roster</span>
          {data && (
            <Button variant="primary" size="sm" icon={Download} onClick={handleDownloadPDF}>
              Download Credentials PDF
            </Button>
          )}
        </div>
      </Card>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-3 shadow-xs flex flex-wrap items-center gap-3">
        <Select className="w-40 text-xs" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="students">Students Only</option>
          <option value="teachers">Teachers Only</option>
        </Select>

        {filterRole !== 'teachers' && (
          <>
            <Select className="w-44 text-xs" value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setFilterSection(''); }}>
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </Select>

            {filterClass && (
              <Select className="w-44 text-xs" value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                <option value="">All Sections</option>
                {selectedClassSections.map((s) => (
                  <option key={s.id} value={s.id}>Section {s.name}</option>
                ))}
              </Select>
            )}
          </>
        )}
      </div>

      {/* Credentials Roster Table */}
      <Card>
        <CardHeader>
          <CardTitle>Master User Login Directory ({allRows.length})</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Account Name</th>
                <th className="px-4 py-3">Login Username</th>
                <th className="px-4 py-3">User Role</th>
                <th className="px-4 py-3">Placement</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#8C97AB]">Loading login roster...</td></tr>
              ) : allRows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center"><EmptyState icon={ClipboardList} title="No user accounts" description="No login credentials found." /></td></tr>
              ) : (
                paginatedRows.map((item) => (
                  <tr key={item.key} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-2.5 font-bold text-[#14213D]">{item.name}</td>
                    <td className="px-4 py-2.5 font-mono text-[#2F6F5E]">{item.username}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={item.type === 'teacher' ? 'active' : 'warning'} label={item.roleLabel} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-[#52607D]">{item.placement}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={KeyRound}
                        onClick={() => setResetModal({ userId: item.userId, name: item.name })}
                      >
                        Reset Password
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#FAFAF8] border-t border-[#E4E1D8] flex items-center justify-between text-xs text-[#52607D]">
            <span>
              Page <strong className="text-[#14213D] font-mono">{page + 1}</strong> of <strong className="text-[#14213D] font-mono">{totalPages}</strong> ({allRows.length} Total Users)
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

      {/* Modal: Reset Password */}
      <Modal isOpen={!!resetModal} onClose={() => { setResetModal(null); setShowPassword(false); }} title={`Reset Password for ${resetModal?.name}`}>
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">New Password (Min 4 chars) *</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={4}
                placeholder="Enter new password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C97AB] hover:text-[#14213D] cursor-pointer p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => { setResetModal(null); setShowPassword(false); }}>Cancel</Button>
            <Button variant="primary" type="submit" loading={resetting}>Update Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
