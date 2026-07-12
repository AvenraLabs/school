import React, { useState, useEffect } from 'react';
import { studentsAPI, classesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { generateSingleCredentialPDF } from '../../utils/pdfGenerator';
import { Plus, GraduationCap, Download, Copy, ArrowRightLeft, UserCheck, Clock, UserMinus } from 'lucide-react';

export function StudentsManager() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
  const [showMove, setShowMove] = useState(null);
  const [createForm, setCreateForm] = useState({ class_id: '', section_id: '', name: '', guardian_phone: '' });
  const [moveSection, setMoveSection] = useState('');
  const [saving, setSaving] = useState(false);

  // New States for Status Scoping & Registry Action Handlers
  const [activeTab, setActiveTab] = useState('ACTIVE');
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
        status = activeTab; // TRANSFERRED, DROPPED, GRADUATED
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
    setSaving(true);
    try {
      const res = await studentsAPI.create(
        Number(createForm.class_id), 
        Number(createForm.section_id),
        createForm.name,
        createForm.guardian_phone
      );
      toast.success('Student created!');
      setShowCreate(false);
      const student = res.student || res.students?.[0];
      if (student) {
        setShowCredentials({
          username: student.user?.username || student.username,
          password: student.password_hint || `${student.user?.username || student.username}@123`,
          roll_no: student.roll_no,
        });
      }
      loadStudents();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async () => {
    try {
      await studentsAPI.moveStudent(showMove.id, Number(moveSection));
      toast.success('Student moved');
      setShowMove(null);
      loadStudents();
    } catch (e) {
      toast.error('Failed to move');
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
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdateDirect = async (student, status) => {
    try {
      await studentsAPI.updateStatus(student.id, status, '');
      toast.success(`Student reactivated to ACTIVE`);
      loadStudents();
    } catch (e) {
      toast.error('Failed to reactivate student');
    }
  };

  const selectedClassSections = classes.find((c) => String(c.id) === String(filterClass || createForm.class_id))?.sections || [];
  const allSections = classes.flatMap((c) => (c.sections || []).map((s) => ({ ...s, class_name: c.class_name, class_id: c.id })));
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page-wrapper" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{total} students total</p>
        </div>
        <button onClick={() => { setShowCreate(true); setCreateForm({ class_id: '', section_id: '', name: '', guardian_phone: '' }); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Student
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-slate-200 pb-0 overflow-x-auto scrollbar-none">
        {['ACTIVE', 'PENDING', 'TRANSFERRED', 'DROPPED', 'GRADUATED'].map((tab) => {
          const Icon = {
            ACTIVE: UserCheck,
            PENDING: Clock,
            TRANSFERRED: ArrowRightLeft,
            DROPPED: UserMinus,
            GRADUATED: GraduationCap
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

      {/* Filters */}
      <div className="filters-row">
        <select className="select-field" style={{ width: 'auto', flex: '1 1 180px' }} value={filterClass}
          onChange={e => { setFilterClass(e.target.value); setFilterSection(''); setPage(0); }}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>
        <select className="select-field" style={{ width: 'auto', flex: '1 1 180px' }} value={filterSection}
          onChange={e => { setFilterSection(e.target.value); setPage(0); }}
          disabled={!filterClass}>
          <option value="">All Sections</option>
          {(classes.find(c => String(c.id) === String(filterClass))?.sections || []).map(s => (
            <option key={s.id} value={s.id}>Section {s.name}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <GraduationCap className="empty-state-icon" />
            <p className="empty-state-title">No students found</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr><th>Roll No</th><th>Admission No</th><th>Username</th><th>Name</th><th>Class</th><th>Section</th><th>Guardian Phone</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono">{s.roll_no || '—'}</td>
                    <td className="font-mono text-xs">{s.admission_no || '—'}</td>
                    <td className="font-mono text-xs">{s.user?.username || '—'}</td>
                    <td>{s.user?.name || '—'}</td>
                    <td>{s.class?.class_name || '—'}</td>
                    <td>{s.section?.name || '—'}</td>
                    <td className="font-mono text-xs text-indigo-600">{s.guardian_phone || '—'}</td>
                    <td><StatusBadge status={s.status || (s.is_active ? 'ACTIVE' : 'INACTIVE')} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        {activeTab === 'ACTIVE' ? (
                          <>
                            <button onClick={() => openStatusModal(s, 'TRANSFERRED')} className="btn-sm btn-secondary">
                              Transfer
                            </button>
                            <button onClick={() => openStatusModal(s, 'DROPPED')} className="btn-sm btn-ghost text-red-600 hover:text-red-800">
                              Drop
                            </button>
                            <button onClick={() => { setShowMove(s); setMoveSection(''); }} className="btn-sm btn-ghost" title="Move section">
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          activeTab !== 'PENDING' && (
                            <button onClick={() => handleStatusUpdateDirect(s, 'ACTIVE')} className="btn-sm btn-success">
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
            </div>
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

      {/* Create Student */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Student">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Class</label>
            <select className="select-field" required value={createForm.class_id} onChange={(e) => setCreateForm({ ...createForm, class_id: e.target.value, section_id: '' })}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Section</label>
            <select className="select-field" required value={createForm.section_id} onChange={(e) => setCreateForm({ ...createForm, section_id: e.target.value })}>
              <option value="">Select section</option>
              {(classes.find((c) => String(c.id) === String(createForm.class_id))?.sections || []).map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Student Name (Optional)</label>
            <input type="text" className="input-field" placeholder="Auto-generated if empty" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Guardian Phone (Optional)</label>
            <input type="text" className="input-field" placeholder="10 Digit Mobile Number" maxLength={10} value={createForm.guardian_phone} onChange={(e) => setCreateForm({ ...createForm, guardian_phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Credentials */}
      <Modal isOpen={!!showCredentials} onClose={() => setShowCredentials(null)} title="Student Created">
        {showCredentials && (
          <div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-sm text-emerald-800">✅ Student account created!</div>
            <div className="credential-box space-y-2">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Username:</span><span className="font-mono font-semibold">{showCredentials.username}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Password:</span><span className="font-mono font-semibold">{showCredentials.password}</span></div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => generateSingleCredentialPDF(showCredentials.username, showCredentials.password, 'Student')} className="btn-sm btn-secondary">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Move Student */}
      <Modal isOpen={!!showMove} onClose={() => setShowMove(null)} title="Move Student">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Move <strong>{showMove?.user?.name || showMove?.user?.username}</strong> to a different section.</p>
          <div>
            <label className="label">New Section</label>
            <select className="select-field" value={moveSection} onChange={(e) => setMoveSection(e.target.value)}>
              <option value="">Select section</option>
              {allSections.map((s) => <option key={s.id} value={s.id}>{s.class_name} — Section {s.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowMove(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleMove} disabled={!moveSection} className="btn-primary">Move</button>
          </div>
        </div>
      </Modal>

      {/* Update Student Status Confirmation */}
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
