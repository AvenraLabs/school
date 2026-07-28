import React, { useState, useEffect } from 'react';
import { classesAPI, authAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { generateRosterPDF } from '../../utils/pdfGenerator';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Download, ClipboardList, KeyRound } from 'lucide-react';

export function LoginRoster() {
  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const toast = useToast();

  useEffect(() => { loadClasses(); loadRoster(); }, []);
  useEffect(() => { loadRoster(); }, [filterClass, filterSection]);

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
          <CardTitle>Master User Login Directory</CardTitle>
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
              ) : !data ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center"><EmptyState icon={ClipboardList} title="No user accounts" description="No login credentials found." /></td></tr>
              ) : (
                <>
                  {(filterRole === 'all' || filterRole === 'teachers') && (data.teachers || []).map((t) => (
                    <tr key={`teacher-${t.id}`} className="hover:bg-[#FAFAF8]">
                      <td className="px-4 py-2.5 font-bold text-[#14213D]">{t.user?.name || '—'}</td>
                      <td className="px-4 py-2.5 font-mono text-[#2F6F5E]">{t.user?.username || '—'}</td>
                      <td className="px-4 py-2.5"><StatusBadge status="active" label="Teacher" size="sm" /></td>
                      <td className="px-4 py-2.5 text-[#52607D]">Faculty Staff</td>
                      <td className="px-4 py-2.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={KeyRound}
                          onClick={() => setResetModal({ userId: t.user?.id, name: t.user?.name })}
                        >
                          Reset Password
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {(filterRole === 'all' || filterRole === 'students') && (data.classes || []).flatMap((c) =>
                    (c.sections || []).flatMap((sec) =>
                      (sec.students || []).map((st) => (
                        <tr key={`student-${st.id}`} className="hover:bg-[#FAFAF8]">
                          <td className="px-4 py-2.5 font-bold text-[#14213D]">{st.user?.name || '—'}</td>
                          <td className="px-4 py-2.5 font-mono text-[#2F6F5E]">{st.user?.username || '—'}</td>
                          <td className="px-4 py-2.5"><StatusBadge status="warning" label="Student" size="sm" /></td>
                          <td className="px-4 py-2.5 text-[#52607D]">{c.class_name} - Sec {sec.name}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={KeyRound}
                              onClick={() => setResetModal({ userId: st.user?.id, name: st.user?.name })}
                            >
                              Reset Password
                            </Button>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Reset Password */}
      <Modal isOpen={!!resetModal} onClose={() => setResetModal(null)} title={`Reset Password for ${resetModal?.name}`}>
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">New Password (Min 4 chars) *</label>
            <Input
              type="password"
              required
              minLength={4}
              placeholder="Enter new password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setResetModal(null)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={resetting}>Update Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
