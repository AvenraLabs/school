import React, { useState, useEffect } from 'react';
import { approvalsAPI, teachersAPI, studentsAPI } from '../../api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { UserCheck, CheckCircle, XCircle } from 'lucide-react';

export function Approvals() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
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

  const PAGE_SIZE = 50;

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
      const res = await approvalsAPI.getPending(PAGE_SIZE, 0);
      setTeachers(res.teachers?.items || []);
      setTeachersTotal(res.teachers?.total || 0);
      setTeachersPage(0);

      setStudents(res.students?.items || []);
      setStudentsTotal(res.students?.total || 0);
      setStudentsPage(0);
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
      toast.success(`${type} ${action}d`);
      const pg = type === 'teacher' ? teachersPage : studentsPage;
      const currentItems = type === 'teacher' ? teachers : students;
      const nextPg = (currentItems.length === 1 && pg > 0) ? pg - 1 : pg;
      await loadTab(type, nextPg);
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

  return (
    <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Approvals</h1>
          <p className="page-subtitle">
            {teachersTotal} pending teachers, {studentsTotal} pending students
          </p>
        </div>
      </div>

      <div className="tabs mb-6">
        <button className={`tab ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => setActiveTab('teachers')}>
          Teachers ({teachersTotal})
        </button>
        <button className={`tab ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
          Students ({studentsTotal})
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
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" className="checkbox-custom" checked={selectedTeachers.length === teachers.length && teachers.length > 0} onChange={toggleAllTeachers} /></th>
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
              {teachersTotalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
                  <span className="text-sm text-slate-500">Page {teachersPage + 1} of {teachersTotalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => loadTab('teacher', Math.max(0, teachersPage - 1))} disabled={teachersPage === 0} className="btn-sm btn-secondary">Previous</button>
                    <button onClick={() => loadTab('teacher', Math.min(teachersTotalPages - 1, teachersPage + 1))} disabled={teachersPage >= teachersTotalPages - 1} className="btn-sm btn-secondary">Next</button>
                  </div>
                </div>
              )}
            </>
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
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" className="checkbox-custom" checked={selectedStudents.length === students.length && students.length > 0} onChange={toggleAllStudents} /></th>
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
              {studentsTotalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
                  <span className="text-sm text-slate-500">Page {studentsPage + 1} of {studentsTotalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => loadTab('student', Math.max(0, studentsPage - 1))} disabled={studentsPage === 0} className="btn-sm btn-secondary">Previous</button>
                    <button onClick={() => loadTab('student', Math.min(studentsTotalPages - 1, studentsPage + 1))} disabled={studentsPage >= studentsTotalPages - 1} className="btn-sm btn-secondary">Next</button>
                  </div>
                </div>
              )}
            </>
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
