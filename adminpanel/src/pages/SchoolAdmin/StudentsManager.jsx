import React, { useState, useEffect } from 'react';
import { studentsAPI, classesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import { formatStudentId } from '../../utils/format';
import { generateSingleCredentialPDF } from '../../utils/pdfGenerator';
import {
  Plus,
  GraduationCap,
  Download,
  ArrowRightLeft,
  UserCheck,
  Clock,
  UserMinus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Phone
} from 'lucide-react';

import { useSearchParams } from 'react-router-dom';

export function StudentsManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterClass = searchParams.get('class_id') || '';
  const filterSection = searchParams.get('section_id') || '';
  const activeTab = searchParams.get('status') || 'ACTIVE';

  const setFilterClass = (val) => {
    setPage(0);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('class_id', val);
      else next.delete('class_id');
      next.delete('section_id');
      return next;
    });
  };

  const setFilterSection = (val) => {
    setPage(0);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('section_id', val);
      else next.delete('section_id');
      return next;
    });
  };

  const setActiveTab = (val) => {
    setPage(0);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('status', val);
      return next;
    });
  };

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
  const [showMove, setShowMove] = useState(null);
  const [createForm, setCreateForm] = useState({ class_id: '', section_id: '', name: '', guardian_phone: '' });
  const [moveSection, setMoveSection] = useState('');
  const [saving, setSaving] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const limit = 20;
  const toast = useToast();

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadStudents(); }, [page, filterClass, filterSection, activeTab]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch (e) { /* ignore */ }
  };

  const loadStudents = async () => {
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
      const res = await studentsAPI.list(
        limit,
        page * limit,
        filterClass || undefined,
        filterSection || undefined,
        status,
        approval_status
      );
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
    if (!createForm.class_id) return toast.error('Please select a class');
    if (!createForm.section_id) return toast.error('Please select a section');
    if (!createForm.name.trim()) return toast.error('Student full name is required');

    setSaving(true);
    try {
      const res = await studentsAPI.create({
        class_id: Number(createForm.class_id),
        section_id: Number(createForm.section_id),
        name: createForm.name.trim(),
        guardian_phone: createForm.guardian_phone.trim() || undefined,
      });
      toast.success('Student created successfully!');
      setShowCreate(false);
      setCreateForm({ class_id: '', section_id: '', name: '', guardian_phone: '' });
      const student = res.student || res.students?.[0] || res.data;
      if (student) {
        const rawUser = student.user?.username || student.username || student.id;
        const cleanId = formatStudentId(rawUser);
        setShowCredentials({
          username: cleanId,
          password: `${cleanId}@123`,
          roll_no: student.roll_no,
        });
      }
      loadStudents();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create student');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async () => {
    try {
      await studentsAPI.moveStudent(showMove.id, Number(moveSection));
      toast.success('Student moved successfully');
      setShowMove(null);
      loadStudents();
    } catch (e) {
      toast.error('Failed to move student');
    }
  };

  const openStatusModal = (student, status) => {
    setShowStatusModal(student);
    setTargetStatus(status);
    setStatusReason('');
  };

  const handleStatusSubmit = async () => {
    setSaving(true);
    try {
      await studentsAPI.updateStatus(showStatusModal.id, targetStatus, statusReason);
      toast.success(`Student status updated to ${targetStatus}`);
      setShowStatusModal(null);
      loadStudents();
    } catch (e) {
      toast.error('Failed to update student status');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdateDirect = async (student, status) => {
    try {
      await studentsAPI.updateStatus(student.id, status, '');
      toast.success('Student reactivated to ACTIVE');
      loadStudents();
    } catch (e) {
      toast.error('Failed to reactivate student');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Student Registry & Admissions</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="text-[#52607D]">Total Roster: {total} Students</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setShowCreate(true);
              setCreateForm({ class_id: '', section_id: '', name: '', guardian_phone: '' });
            }}
          >
            Add Student
          </Button>
        </div>
      </Card>

      {/* Tabs Row */}
      <div className="flex gap-1 border-b border-[#E4E1D8] overflow-x-auto pb-px">
        {[
          { id: 'ACTIVE', label: 'Active Roster', icon: UserCheck },
          { id: 'PENDING', label: 'Pending Approvals', icon: Clock },
          { id: 'TRANSFERRED', label: 'Transferred Out', icon: ArrowRightLeft },
          { id: 'DROPPED', label: 'Dropped', icon: UserMinus },
          { id: 'GRADUATED', label: 'Graduated', icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(0); }}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-[8px] transition-all cursor-pointer border-t border-x outline-none ${isActive
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

      {/* Filters Bar */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#52607D]">
            <Filter className="w-3.5 h-3.5 text-[#2F6F5E]" />
            <span>Filters:</span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              className="w-40 sm:w-44"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>Class {c.class_name}</option>
              ))}
            </Select>

            <Select
              className="w-40 sm:w-44"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              disabled={!filterClass}
            >
              <option value="">All Sections</option>
              {(classes.find((c) => String(c.id) === String(filterClass))?.sections || []).map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="text-xs text-[#52607D] font-mono tabular-nums">
          Total Records: <span className="font-semibold text-[#14213D]">{total}</span>
        </div>
      </div>

      {/* Student Data Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Admission No</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Class & Section</th>
                <th className="px-4 py-3">Guardian Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-4 py-3.5">
                      <div className="h-4 bg-[#EAF3F0] rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <EmptyState
                      icon={GraduationCap}
                      title="No students found"
                      description="No student records match the active status tab and filters."
                    />
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-2.5 font-mono font-semibold">{s.roll_no || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-[#52607D]">{s.admission_no || '—'}</td>
                    <td className="px-4 py-2.5 font-mono">{s.user?.username || '—'}</td>
                    <td className="px-4 py-2.5 font-medium">
                      <div className="flex items-center gap-2">
                        <UserAvatar src={s.user?.avatar_url} name={s.user?.name} fallbackChar="S" />
                        <span>{s.user?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {s.class?.class_name ? `${s.class.class_name} - ${s.section?.name || ''}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[#2F6F5E] flex items-center gap-1">
                      {s.guardian_phone ? (
                        <>
                          <Phone className="w-3 h-3 text-[#8C97AB]" />
                          <span>{s.guardian_phone}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={s.status || (s.is_active ? 'ACTIVE' : 'INACTIVE')} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {activeTab === 'ACTIVE' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStatusModal(s, 'TRANSFERRED')}
                            >
                              Transfer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#B0403A] hover:bg-[#FDF2F1]"
                              onClick={() => openStatusModal(s, 'DROPPED')}
                            >
                              Drop
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={ArrowRightLeft}
                              onClick={() => { setShowMove(s); setMoveSection(''); }}
                            >
                              Move
                            </Button>
                          </>
                        ) : (
                          activeTab !== 'PENDING' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleStatusUpdateDirect(s, 'ACTIVE')}
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

      {/* Modal: Create Student */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Student Record">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Class Target *</label>
              <Select
                required
                value={createForm.class_id}
                onChange={(e) => setCreateForm({ ...createForm, class_id: e.target.value, section_id: '' })}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>Class {c.class_name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Section Target *</label>
              <Select
                required
                value={createForm.section_id}
                onChange={(e) => setCreateForm({ ...createForm, section_id: e.target.value })}
                disabled={!createForm.class_id}
              >
                <option value="">Select section</option>
                {(classes.find((c) => String(c.id) === String(createForm.class_id))?.sections || []).map((s) => (
                  <option key={s.id} value={s.id}>Section {s.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Student Full Name *</label>
            <Input
              required
              placeholder="e.g. Pavithra R"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Guardian Phone Number (Optional)</label>
            <Input
              placeholder="10 digit mobile number"
              maxLength={10}
              value={createForm.guardian_phone}
              onChange={(e) => setCreateForm({ ...createForm, guardian_phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>Create Student</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Credentials Display */}
      <Modal isOpen={!!showCredentials} onClose={() => setShowCredentials(null)} title="Student Account Generated">
        {showCredentials && (
          <div className="space-y-4">
            <div className="p-3 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px] text-xs text-[#2F6F5E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Student account credentials successfully generated!</span>
            </div>

            <div className="bg-[#FAFAF8] border border-[#E4E1D8] rounded-[8px] p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between border-b border-[#EDEAE1] pb-2">
                <span className="text-[#52607D]">Username:</span>
                <span className="font-bold text-[#14213D]">{showCredentials.username}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#52607D]">Password:</span>
                <span className="font-bold text-[#14213D]">{showCredentials.password}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                icon={Download}
                onClick={() => generateSingleCredentialPDF(showCredentials.username, showCredentials.password, 'Student')}
              >
                Download PDF Receipt
              </Button>
              <Button variant="primary" onClick={() => setShowCredentials(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Move Section */}
      <Modal isOpen={!!showMove} onClose={() => setShowMove(null)} title="Reassign Student Section">
        <div className="space-y-4">
          <p className="text-xs text-[#52607D]">
            Move <strong>{showMove?.user?.name || showMove?.user?.username}</strong> to a different section within the institution.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Target Section</label>
            <Select value={moveSection} onChange={(e) => setMoveSection(e.target.value)}>
              <option value="">Select section</option>
              {(classes.find((c) => String(c.id) === String(showMove?.class_id || showMove?.class?.id))?.sections || []).map((s) => {
                const isCurrent = String(s.id) === String(showMove?.section_id || showMove?.section?.id);
                return (
                  <option key={s.id} value={s.id} disabled={isCurrent}>
                    Section {s.name} {isCurrent ? '(Current)' : ''}
                  </option>
                );
              })}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" onClick={() => setShowMove(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleMove} disabled={!moveSection}>Reassign Section</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Status Transition */}
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
