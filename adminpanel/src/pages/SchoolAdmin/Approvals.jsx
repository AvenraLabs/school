import React, { useState, useEffect } from 'react';
import { approvalsAPI, teachersAPI, studentsAPI } from '../../api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import { UserCheck, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  let cleanPath = path;
  if (path.startsWith('/uploads')) {
    cleanPath = `/api${path}`;
  }
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const host = baseUrl.replace(/\/api$/, '');
  return `${host}${cleanPath}`;
};

export function Approvals() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [profileUpdates, setProfileUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teachers');
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const toast = useToast();

  const [teachersPage, setTeachersPage] = useState(0);
  const [studentsPage, setStudentsPage] = useState(0);

  const [teachersTotal, setTeachersTotal] = useState(0);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [profileUpdatesTotal, setProfileUpdatesTotal] = useState(0);

  const PAGE_SIZE = 50;

  const openDetails = (type, item) => {
    setSelectedItem(item);
    setModalType(type);
  };

  const closeDetails = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  useEffect(() => { loadPending(); }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await approvalsAPI.getPending(PAGE_SIZE, 0);
      setTeachers(res.teachers?.items || []);
      setTeachersTotal(res.teachers?.total || 0);
      setTeachersPage(0);

      setStudents(res.students?.items || []);
      setStudentsTotal(res.students?.total || 0);
      setStudentsPage(0);

      const profileRes = await approvalsAPI.listProfileUpdates();
      setProfileUpdates(profileRes || []);
      setProfileUpdatesTotal(profileRes?.length || 0);
    } catch (e) {
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const loadTab = async (type, pg) => {
    try {
      const res = await approvalsAPI.getPending(PAGE_SIZE, pg * PAGE_SIZE, undefined, undefined, type);
      if (type === 'teacher') {
        setTeachers(res.teachers?.items || []);
        setTeachersTotal(res.teachers?.total || 0);
        setTeachersPage(pg);
      } else if (type === 'student') {
        setStudents(res.students?.items || []);
        setStudentsTotal(res.students?.total || 0);
        setStudentsPage(pg);
      }
    } catch (e) {
      toast.error(`Failed to load ${type} approvals`);
    }
  };

  const handleApprove = async (type, id, action) => {
    try {
      await approvalsAPI.approveRequest(type, id, action);
      toast.success(`${type} ${action}d successfully`);
      const pg = type === 'teacher' ? teachersPage : studentsPage;
      const currentItems = type === 'teacher' ? teachers : students;
      const nextPg = (currentItems.length === 1 && pg > 0) ? pg - 1 : pg;
      await loadTab(type, nextPg);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to process request');
    }
  };

  const handleProcessProfileUpdate = async (id, action, reason) => {
    try {
      await approvalsAPI.processProfileUpdate(id, action, reason);
      toast.success(`Profile update request ${action}d`);
      const profileRes = await approvalsAPI.listProfileUpdates();
      setProfileUpdates(profileRes || []);
      setProfileUpdatesTotal(profileRes?.length || 0);
      closeDetails();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to process request');
    }
  };

  const handleBulkTeachers = async (action) => {
    if (selectedTeachers.length === 0) return toast.error('Select teachers first');
    setProcessing(true);
    try {
      await teachersAPI.bulkApprove(selectedTeachers, action);
      toast.success(`${selectedTeachers.length} teachers ${action}d`);
      setSelectedTeachers([]);
      const nextPg = (teachers.length === selectedTeachers.length && teachersPage > 0) ? teachersPage - 1 : teachersPage;
      await loadTab('teacher', nextPg);
    } catch (e) {
      toast.error('Bulk action failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkStudents = async (action) => {
    if (selectedStudents.length === 0) return toast.error('Select students first');
    setProcessing(true);
    try {
      await studentsAPI.bulkApprove(selectedStudents, action);
      toast.success(`${selectedStudents.length} students ${action}d`);
      setSelectedStudents([]);
      const nextPg = (students.length === selectedStudents.length && studentsPage > 0) ? studentsPage - 1 : studentsPage;
      await loadTab('student', nextPg);
    } catch (e) {
      toast.error('Bulk action failed');
    } finally {
      setProcessing(false);
    }
  };

  const toggleTeacher = (id) => {
    setSelectedTeachers((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleStudent = (id) => {
    setSelectedStudents((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleAllTeachers = () => {
    setSelectedTeachers(selectedTeachers.length === teachers.length ? [] : teachers.map((t) => t.id));
  };

  const toggleAllStudents = () => {
    setSelectedStudents(selectedStudents.length === students.length ? [] : students.map((s) => s.id));
  };

  const teachersTotalPages = Math.ceil(teachersTotal / PAGE_SIZE);
  const studentsTotalPages = Math.ceil(studentsTotal / PAGE_SIZE);

  const renderDetailsContent = () => {
    if (!selectedItem) return null;
    const user = selectedItem.user || selectedItem.User || {};

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-[#EDEAE1]">
          <div className="w-14 h-14 rounded-full bg-[#EAF3F0] border border-[#D3E6E0] flex items-center justify-center overflow-hidden shrink-0">
            {user.avatar_url ? (
              <img src={getAssetUrl(user.avatar_url)} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-lg text-[#2F6F5E]">
                {(user.name || 'P')[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-[#14213D]">{user.name || '—'}</h4>
            <p className="text-xs text-[#52607D]">@{user.username || '—'}</p>
          </div>
        </div>

        {modalType === 'teacher' && (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#8C97AB] block mb-0.5">Employee ID</span>
              <span className="font-semibold text-[#14213D] font-mono">{selectedItem.employee_id || '—'}</span>
            </div>
            <div>
              <span className="text-[#8C97AB] block mb-0.5">Designation</span>
              <span className="font-semibold text-[#14213D]">{selectedItem.designation || '—'}</span>
            </div>
            <div>
              <span className="text-[#8C97AB] block mb-0.5">Qualification</span>
              <span className="font-semibold text-[#14213D]">{selectedItem.qualification || '—'}</span>
            </div>
            <div>
              <span className="text-[#8C97AB] block mb-0.5">Experience</span>
              <span className="font-semibold text-[#14213D]">{selectedItem.experience !== null ? `${selectedItem.experience} Years` : '—'}</span>
            </div>
            <div>
              <span className="text-[#8C97AB] block mb-0.5">Email</span>
              <span className="font-semibold text-[#14213D]">{user.email || '—'}</span>
            </div>
            <div>
              <span className="text-[#8C97AB] block mb-0.5">Phone</span>
              <span className="font-semibold text-[#14213D]">{user.phone || '—'}</span>
            </div>
          </div>
        )}

        {modalType === 'student' && (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#8C97AB] block mb-0.5">Admission Number</span>
              <span className="font-semibold text-[#14213D] font-mono">{selectedItem.admission_no || '—'}</span>
            </div>
            <div>
              <span className="text-[#8C97AB] block mb-0.5">Class & Section</span>
              <span className="font-semibold text-[#14213D]">{selectedItem.class?.class_name || '—'} · Section {selectedItem.section?.name || '—'}</span>
            </div>
            <div>
              <span className="text-[#8C97AB] block mb-0.5">Father's Name</span>
              <span className="font-semibold text-[#14213D]">{selectedItem.father_name || '—'}</span>
            </div>
            <div>
              <span className="text-[#8C97AB] block mb-0.5">Mother's Name</span>
              <span className="font-semibold text-[#14213D]">{selectedItem.mother_name || '—'}</span>
            </div>
          </div>
        )}

        {modalType === 'profile_update' && (
          <div className="space-y-3 text-xs">
            <p className="text-[#52607D]">Review proposed profile modifications below:</p>
            <div className="border border-[#E4E1D8] rounded-[8px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#8C97AB] font-semibold uppercase">
                  <tr>
                    <th className="px-3 py-2">Field</th>
                    <th className="px-3 py-2">Current Value</th>
                    <th className="px-3 py-2">Proposed Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEAE1]">
                  {Object.entries(selectedItem.pending_data || {}).map(([key, newVal]) => {
                    let currentVal = '—';
                    const activeProfile = selectedItem.user?.student || selectedItem.user?.Student || selectedItem.user?.teacher || selectedItem.user?.Teacher || {};
                    if (key === 'name' || key === 'email' || key === 'phone' || key === 'avatar_url') {
                      currentVal = selectedItem.user?.[key];
                    } else {
                      currentVal = activeProfile[key];
                    }
                    return (
                      <tr key={key}>
                        <td className="px-3 py-2 font-semibold text-[#14213D] capitalize">{key.replace(/_/g, ' ')}</td>
                        <td className="px-3 py-2 text-[#52607D]">{String(currentVal ?? '—')}</td>
                        <td className="px-3 py-2 font-semibold text-[#2F6F5E] bg-[#EAF3F0]/30">{String(newVal ?? '—')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Compact Action Toolbar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Approvals & Verification Queue</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="text-[#52607D]">Total Pending: {teachersTotal + studentsTotal + profileUpdatesTotal}</span>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-1 border-b border-[#E4E1D8] overflow-x-auto pb-px">
        {[
          { id: 'teachers', label: `Teachers (${teachersTotal})` },
          { id: 'students', label: `Students (${studentsTotal})` },
          { id: 'profile_updates', label: `Profile Updates (${profileUpdatesTotal})` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-[8px] transition-all cursor-pointer border-t border-x outline-none ${
                isActive
                  ? 'bg-white border-[#E4E1D8] border-t-[3px] border-t-[#2F6F5E] text-[#2F6F5E] -mb-px shadow-2xs'
                  : 'bg-transparent border-transparent text-[#52607D] hover:text-[#14213D] hover:bg-[#FAFAF8]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Card */}
      <Card>
        {loading ? (
          <div className="p-8 text-center text-xs text-[#8C97AB]">Loading approvals...</div>
        ) : activeTab === 'teachers' ? (
          <div>
            {teachers.length > 0 && (
              <div className="p-3 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={CheckCircle}
                  disabled={processing || selectedTeachers.length === 0}
                  onClick={() => handleBulkTeachers('approve')}
                >
                  Approve Selected ({selectedTeachers.length})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  icon={XCircle}
                  disabled={processing || selectedTeachers.length === 0}
                  onClick={() => handleBulkTeachers('reject')}
                >
                  Reject Selected
                </Button>
              </div>
            )}

            {teachers.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title="No pending teachers"
                description="All teacher registration requests have been processed."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedTeachers.length === teachers.length && teachers.length > 0}
                          onChange={toggleAllTeachers}
                          className="rounded border-[#E4E1D8] text-[#2F6F5E] cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3">Employee ID</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                    {teachers.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                        onClick={() => openDetails('teacher', t)}
                      >
                        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedTeachers.includes(t.id)}
                            onChange={() => toggleTeacher(t.id)}
                            className="rounded border-[#E4E1D8] text-[#2F6F5E] cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-2.5 font-mono font-semibold">{t.employee_id || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[#52607D]">{t.user?.username || '—'}</td>
                        <td className="px-4 py-2.5 font-medium">{t.user?.name || '—'}</td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status="pending" size="sm" />
                        </td>
                        <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleApprove('teacher', t.id, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleApprove('teacher', t.id, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'students' ? (
          <div>
            {students.length > 0 && (
              <div className="p-3 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={CheckCircle}
                  disabled={processing || selectedStudents.length === 0}
                  onClick={() => handleBulkStudents('approve')}
                >
                  Approve Selected ({selectedStudents.length})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  icon={XCircle}
                  disabled={processing || selectedStudents.length === 0}
                  onClick={() => handleBulkStudents('reject')}
                >
                  Reject Selected
                </Button>
              </div>
            )}

            {students.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title="No pending students"
                description="All student registration requests have been processed."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === students.length && students.length > 0}
                          onChange={toggleAllStudents}
                          className="rounded border-[#E4E1D8] text-[#2F6F5E] cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3">Admission No</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Class & Section</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                    {students.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                        onClick={() => openDetails('student', s)}
                      >
                        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(s.id)}
                            onChange={() => toggleStudent(s.id)}
                            className="rounded border-[#E4E1D8] text-[#2F6F5E] cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-2.5 font-mono font-semibold">{s.admission_no || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[#52607D]">{s.user?.username || '—'}</td>
                        <td className="px-4 py-2.5 font-medium">{s.user?.name || '—'}</td>
                        <td className="px-4 py-2.5">
                          {s.class?.class_name ? `${s.class.class_name} - ${s.section?.name || ''}` : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status="pending" size="sm" />
                        </td>
                        <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleApprove('student', s.id, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleApprove('student', s.id, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {profileUpdates.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title="No pending profile updates"
                description="There are no profile modification requests waiting for review."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                    <tr>
                      <th className="px-4 py-3">User ID</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Fields Changed</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                    {profileUpdates.map((u) => {
                      const changedCount = Object.keys(u.pending_data || {}).length;
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                          onClick={() => openDetails('profile_update', u)}
                        >
                          <td className="px-4 py-2.5 font-mono font-semibold">#{u.user_id}</td>
                          <td className="px-4 py-2.5 capitalize font-medium">{u.role}</td>
                          <td className="px-4 py-2.5 font-mono text-[#52607D]">{u.user?.username || '—'}</td>
                          <td className="px-4 py-2.5 font-medium">{u.user?.name || '—'}</td>
                          <td className="px-4 py-2.5 text-[#2F6F5E] font-semibold">{changedCount} field(s)</td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status="pending" size="sm" />
                          </td>
                          <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleProcessProfileUpdate(u.id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleProcessProfileUpdate(u.id, 'reject')}
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Details Inspect Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={closeDetails}
          title={
            modalType === 'profile_update'
              ? 'Review Profile Modification Request'
              : `Review ${modalType.charAt(0).toUpperCase() + modalType.slice(1)} Registration`
          }
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="destructive"
                onClick={() => {
                  if (modalType === 'profile_update') {
                    handleProcessProfileUpdate(selectedItem.id, 'reject');
                  } else {
                    handleApprove(modalType, selectedItem.id, 'reject');
                    closeDetails();
                  }
                }}
              >
                Reject Request
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (modalType === 'profile_update') {
                    handleProcessProfileUpdate(selectedItem.id, 'approve');
                  } else {
                    handleApprove(modalType, selectedItem.id, 'approve');
                    closeDetails();
                  }
                }}
              >
                Approve Request
              </Button>
            </div>
          }
        >
          {renderDetailsContent()}
        </Modal>
      )}
    </div>
  );
}
