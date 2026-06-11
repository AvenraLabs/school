import React, { useState, useEffect } from 'react';
import { approvalsAPI, teachersAPI, parentsAPI, studentsAPI } from '../../api';
import { StatusBadge } from '../../components/common/StatusBadge';
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
  const toast = useToast();

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
                  <tr key={t.id}>
                    <td><input type="checkbox" className="checkbox-custom" checked={selectedTeachers.includes(t.id)} onChange={() => toggleTeacher(t.id)} /></td>
                    <td className="font-mono text-xs">{t.employee_id || '—'}</td>
                    <td className="font-mono text-xs">{t.user?.username || '—'}</td>
                    <td>{t.user?.name || '—'}</td>
                    <td><StatusBadge status="pending" /></td>
                    <td>
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
                  <tr key={p.id}>
                    <td><input type="checkbox" className="checkbox-custom" checked={selectedParents.includes(p.id)} onChange={() => toggleParent(p.id)} /></td>
                    <td className="font-mono text-xs">{p.user?.username || '—'}</td>
                    <td>{p.user?.name || '—'}</td>
                    <td>{p.student?.user?.name || '—'}</td>
                    <td><StatusBadge status="pending" /></td>
                    <td>
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
                  <tr key={s.id}>
                    <td><input type="checkbox" className="checkbox-custom" checked={selectedStudents.includes(s.id)} onChange={() => toggleStudent(s.id)} /></td>
                    <td className="font-mono text-xs">{s.admission_no || '—'}</td>
                    <td className="font-mono text-xs">{s.user?.username || '—'}</td>
                    <td>{s.user?.name || '—'}</td>
                    <td>{s.class?.class_name || '—'}</td>
                    <td>{s.section?.name || '—'}</td>
                    <td><StatusBadge status="pending" /></td>
                    <td>
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
    </div>
  );
}
