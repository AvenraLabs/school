import React, { useState, useEffect } from 'react';
import { approvalsAPI, teachersAPI, parentsAPI, studentsAPI } from '../../api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { UserCheck, CheckCircle, XCircle } from 'lucide-react';

export function Approvals() {
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teachers');
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedParents, setSelectedParents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const toast = useToast();

  const openDetails = (type, item) => {
    setSelectedItem(item);
    setModalType(type);
  };

  const closeDetails = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const renderDetailsContent = () => {
    if (!selectedItem) return null;
    const user = selectedItem.user || selectedItem.User || {};

    return (
      <div className="flex flex-col gap-6">
        {/* Avatar and basic info */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-indigo-600">
                {(user.name || 'P')[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-950">{user.name || '—'}</h4>
            <p className="text-sm text-slate-500">@{user.username || '—'}</p>
          </div>
        </div>

        {/* Dynamic details based on type */}
        {modalType === 'teacher' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400 block mb-1">Employee ID</span>
              <span className="font-medium text-slate-800 font-mono">{selectedItem.employee_id || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Designation</span>
              <span className="font-medium text-slate-800">{selectedItem.designation || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Qualification</span>
              <span className="font-medium text-slate-800">{selectedItem.qualification || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Experience</span>
              <span className="font-medium text-slate-800">{selectedItem.experience !== null ? `${selectedItem.experience} Years` : '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Gender</span>
              <span className="font-medium text-slate-800 capitalize">{selectedItem.gender || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Email Address</span>
              <span className="font-medium text-slate-800">{user.email || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Phone Number</span>
              <span className="font-medium text-slate-800">{user.phone || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Joining Date</span>
              <span className="font-medium text-slate-800">{selectedItem.joining_date || '—'}</span>
            </div>
          </div>
        )}

        {modalType === 'student' && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <span className="text-slate-400 block mb-0.5">Admission Number</span>
              <span className="font-medium text-slate-800 font-mono">{selectedItem.admission_no || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Class & Section</span>
              <span className="font-medium text-slate-800">{selectedItem.class?.class_name || '—'} · Section {selectedItem.section?.name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Date of Birth</span>
              <span className="font-medium text-slate-800">{selectedItem.dob || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Gender</span>
              <span className="font-medium text-slate-800 capitalize">{selectedItem.gender || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Blood Group</span>
              <span className="font-medium text-slate-800 uppercase">{selectedItem.blood_group || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Family Annual Income</span>
              <span className="font-medium text-slate-800">{selectedItem.family_income ? `$${selectedItem.family_income}` : '—'}</span>
            </div>
            <div className="col-span-2 border-t border-slate-100 pt-3 mt-1">
              <h5 className="font-semibold text-slate-900 mb-2">Family & Contact Details</h5>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Father's Name</span>
              <span className="font-medium text-slate-800">{selectedItem.father_name || '—'} {selectedItem.father_occupation ? `(${selectedItem.father_occupation})` : ''}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Mother's Name</span>
              <span className="font-medium text-slate-800">{selectedItem.mother_name || '—'} {selectedItem.mother_occupation ? `(${selectedItem.mother_occupation})` : ''}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Guardian Name</span>
              <span className="font-medium text-slate-800">{selectedItem.guardian_name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Contact Email</span>
              <span className="font-medium text-slate-800">{user.email || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Contact Phone</span>
              <span className="font-medium text-slate-800">{user.phone || '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block mb-0.5">Address</span>
              <span className="font-medium text-slate-800 block whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-100">{selectedItem.address || '—'}</span>
            </div>
          </div>
        )}

        {modalType === 'parent' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400 block mb-1">Relation Type</span>
              <span className="font-medium text-slate-800 capitalize">{selectedItem.relation_type || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Contact Email</span>
              <span className="font-medium text-slate-800">{user.email || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Contact Phone</span>
              <span className="font-medium text-slate-800">{user.phone || '—'}</span>
            </div>
            <div className="col-span-2 border-t border-slate-100 pt-3 mt-1">
              <h5 className="font-semibold text-slate-900 mb-2">Linked Student Profile</h5>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Student Name</span>
              <span className="font-medium text-slate-800">{selectedItem.student?.user?.name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Student Username</span>
              <span className="font-medium text-slate-800 font-mono">@{selectedItem.student?.user?.username || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Student Class & Section</span>
              <span className="font-medium text-slate-800">
                {selectedItem.student?.class?.class_name || '—'} · Section {selectedItem.student?.section?.name || '—'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => { loadPending(); }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await approvalsAPI.getPending(100, 0);
      setTeachers(res.teachers?.items || []);
      setParents(res.parents?.items || []);
      setStudents(res.students?.items || []);
    } catch (e) {
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type, id, action) => {
    try {
      await approvalsAPI.approveRequest(type, id, action);
      toast.success(`${type} ${action}d`);
      loadPending();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const handleBulkTeachers = async (action) => {
    if (selectedTeachers.length === 0) return toast.error('Select teachers first');
    setProcessing(true);
    try {
      await teachersAPI.bulkApprove(selectedTeachers, action);
      toast.success(`${selectedTeachers.length} teachers ${action}d`);
      setSelectedTeachers([]);
      loadPending();
    } catch (e) {
      toast.error('Bulk action failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkParents = async (action) => {
    if (selectedParents.length === 0) return toast.error('Select parents first');
    setProcessing(true);
    try {
      await parentsAPI.bulkApprove(selectedParents, action);
      toast.success(`${selectedParents.length} parents ${action}d`);
      setSelectedParents([]);
      loadPending();
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
      loadPending();
    } catch (e) {
      toast.error('Bulk action failed');
    } finally {
      setProcessing(false);
    }
  };

  const toggleTeacher = (id) => {
    setSelectedTeachers((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleParent = (id) => {
    setSelectedParents((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleStudent = (id) => {
    setSelectedStudents((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleAllTeachers = () => {
    setSelectedTeachers(selectedTeachers.length === teachers.length ? [] : teachers.map((t) => t.id));
  };

  const toggleAllParents = () => {
    setSelectedParents(selectedParents.length === parents.length ? [] : parents.map((p) => p.id));
  };

  const toggleAllStudents = () => {
    setSelectedStudents(selectedStudents.length === students.length ? [] : students.map((s) => s.id));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Approvals</h1>
          <p className="page-subtitle">
            {teachers.length} pending teachers, {parents.length} pending parents, {students.length} pending students
          </p>
        </div>
      </div>

      <div className="tabs mb-6">
        <button className={`tab ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => setActiveTab('teachers')}>
          Teachers ({teachers.length})
        </button>
        <button className={`tab ${activeTab === 'parents' ? 'active' : ''}`} onClick={() => setActiveTab('parents')}>
          Parents ({parents.length})
        </button>
        <button className={`tab ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
          Students ({students.length})
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-slate-400">Loading...</div>
      ) : activeTab === 'teachers' ? (
        <div className="card overflow-hidden">
          {teachers.length > 0 && (
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50">
              <button onClick={() => handleBulkTeachers('approve')} disabled={processing || selectedTeachers.length === 0} className="btn-sm btn-success">
                <CheckCircle className="w-3.5 h-3.5" /> Approve Selected ({selectedTeachers.length})
              </button>
              <button onClick={() => handleBulkTeachers('reject')} disabled={processing || selectedTeachers.length === 0} className="btn-sm btn-danger">
                <XCircle className="w-3.5 h-3.5" /> Reject Selected
              </button>
            </div>
          )}
          {teachers.length === 0 ? (
            <div className="empty-state">
              <UserCheck className="empty-state-icon" />
              <p className="empty-state-title">No pending teachers</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" className="checkbox-custom" checked={selectedTeachers.length === teachers.length} onChange={toggleAllTeachers} /></th>
                  <th>Employee ID</th><th>Username</th><th>Name</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="cursor-pointer hover:bg-slate-50" onClick={() => openDetails('teacher', t)}>
                    <td onClick={(e) => e.stopPropagation()}><input type="checkbox" className="checkbox-custom" checked={selectedTeachers.includes(t.id)} onChange={() => toggleTeacher(t.id)} /></td>
                    <td className="font-mono text-xs">{t.employee_id || '—'}</td>
                    <td className="font-mono text-xs">{t.user?.username || '—'}</td>
                    <td>{t.user?.name || '—'}</td>
                    <td><StatusBadge status="pending" /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove('teacher', t.id, 'approve')} className="btn-sm btn-success">Approve</button>
                        <button onClick={() => handleApprove('teacher', t.id, 'reject')} className="btn-sm btn-danger">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : activeTab === 'parents' ? (
        <div className="card overflow-hidden">
          {parents.length > 0 && (
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50">
              <button onClick={() => handleBulkParents('approve')} disabled={processing || selectedParents.length === 0} className="btn-sm btn-success">
                <CheckCircle className="w-3.5 h-3.5" /> Approve Selected ({selectedParents.length})
              </button>
              <button onClick={() => handleBulkParents('reject')} disabled={processing || selectedParents.length === 0} className="btn-sm btn-danger">
                <XCircle className="w-3.5 h-3.5" /> Reject Selected
              </button>
            </div>
          )}
          {parents.length === 0 ? (
            <div className="empty-state">
              <UserCheck className="empty-state-icon" />
              <p className="empty-state-title">No pending parents</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" className="checkbox-custom" checked={selectedParents.length === parents.length} onChange={toggleAllParents} /></th>
                  <th>Username</th><th>Name</th><th>Student</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((p) => (
                  <tr key={p.id} className="cursor-pointer hover:bg-slate-50" onClick={() => openDetails('parent', p)}>
                    <td onClick={(e) => e.stopPropagation()}><input type="checkbox" className="checkbox-custom" checked={selectedParents.includes(p.id)} onChange={() => toggleParent(p.id)} /></td>
                    <td className="font-mono text-xs">{p.user?.username || '—'}</td>
                    <td>{p.user?.name || '—'}</td>
                    <td>{p.student?.user?.name || '—'}</td>
                    <td><StatusBadge status="pending" /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove('parent', p.id, 'approve')} className="btn-sm btn-success">Approve</button>
                        <button onClick={() => handleApprove('parent', p.id, 'reject')} className="btn-sm btn-danger">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {students.length > 0 && (
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50">
              <button onClick={() => handleBulkStudents('approve')} disabled={processing || selectedStudents.length === 0} className="btn-sm btn-success">
                <CheckCircle className="w-3.5 h-3.5" /> Approve Selected ({selectedStudents.length})
              </button>
              <button onClick={() => handleBulkStudents('reject')} disabled={processing || selectedStudents.length === 0} className="btn-sm btn-danger">
                <XCircle className="w-3.5 h-3.5" /> Reject Selected
              </button>
            </div>
          )}
          {students.length === 0 ? (
            <div className="empty-state">
              <UserCheck className="empty-state-icon" />
              <p className="empty-state-title">No pending students</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" className="checkbox-custom" checked={selectedStudents.length === students.length} onChange={toggleAllStudents} /></th>
                  <th>Admission No</th><th>Username</th><th>Name</th><th>Class</th><th>Section</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="cursor-pointer hover:bg-slate-50" onClick={() => openDetails('student', s)}>
                    <td onClick={(e) => e.stopPropagation()}><input type="checkbox" className="checkbox-custom" checked={selectedStudents.includes(s.id)} onChange={() => toggleStudent(s.id)} /></td>
                    <td className="font-mono text-xs">{s.admission_no || '—'}</td>
                    <td className="font-mono text-xs">{s.user?.username || '—'}</td>
                    <td>{s.user?.name || '—'}</td>
                    <td>{s.class?.class_name || '—'}</td>
                    <td>{s.section?.name || '—'}</td>
                    <td><StatusBadge status="pending" /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove('student', s.id, 'approve')} className="btn-sm btn-success">Approve</button>
                        <button onClick={() => handleApprove('student', s.id, 'reject')} className="btn-sm btn-danger">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={closeDetails}
          title={`Review Pending ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <button
                onClick={() => {
                  handleApprove(modalType, selectedItem.id, 'reject');
                  closeDetails();
                }}
                className="btn btn-danger btn-sm"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleApprove(modalType, selectedItem.id, 'approve');
                  closeDetails();
                }}
                className="btn btn-success btn-sm"
              >
                Approve
              </button>
            </div>
          }
        >
          {renderDetailsContent()}
        </Modal>
      )}
    </div>
  );
}
