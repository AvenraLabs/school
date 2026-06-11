import React, { useState, useEffect } from 'react';
import { classesAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { generateRosterPDF } from '../../utils/pdfGenerator';
import { Download, ClipboardList } from 'lucide-react';

export function LoginRoster() {
  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { loadClasses(); loadRoster(); }, []);
  useEffect(() => { loadRoster(); }, [filterClass, filterSection]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch (e) { /* ignore */ }
  };

  const loadRoster = async () => {
    setLoading(true);
    try {
      const res = await classesAPI.getLoginRoster(filterClass || undefined, filterSection || undefined);
      setData(res.data || res);
    } catch (e) {
      toast.error('Failed to load roster');
    } finally {
      setLoading(false);
    }
  };

  const selectedClassSections = classes.find((c) => String(c.id) === String(filterClass))?.sections || [];

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
      toast.success('PDF downloaded');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Login Roster</h1>
          <p className="page-subtitle">View and download all login credentials</p>
        </div>
        <button onClick={handleDownloadPDF} disabled={!data} className="btn-primary">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select className="select-field w-48" value={filterRole} onChange={(e) => {
          setFilterRole(e.target.value);
          if (e.target.value === 'teachers') {
            setFilterClass('');
            setFilterSection('');
          }
        }}>
          <option value="all">All Roles</option>
          <option value="teachers">Teachers Only</option>
          <option value="students">Students Only</option>
        </select>

        {filterRole !== 'teachers' && (
          <>
            <select className="select-field w-48" value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setFilterSection(''); }}>
              <option value="">All Classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
            {filterClass && (
              <select className="select-field w-48" value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                <option value="">All Sections</option>
                {selectedClassSections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
              </select>
            )}
          </>
        )}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-slate-400">Loading roster...</div>
      ) : !data ? (
        <div className="card empty-state">
          <ClipboardList className="empty-state-icon" />
          <p className="empty-state-title">No data</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Teachers */}
          {filterRole !== 'students' && data.teachers && data.teachers.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Teachers ({data.teachers.length})</h3>
              </div>
              <table className="data-table">
                <thead><tr><th>Username</th><th>Password</th><th>Name</th><th>Employee ID</th></tr></thead>
                <tbody>
                  {data.teachers.map((t, i) => {
                    const username = t.user?.username || t.username || '';
                    return (
                      <tr key={i}>
                        <td className="font-mono text-xs">{username || '—'}</td>
                        <td className="font-mono text-xs">{username ? `${username}@123` : '—'}</td>
                        <td>{t.user?.name || t.name || '—'}</td>
                        <td className="font-mono text-xs">{t.employee_id || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Students by class */}
          {filterRole !== 'teachers' && data.classes && data.classes.map((cls, ci) => (
            <div key={ci} className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">{cls.class_name}</h3>
              </div>
              {cls.sections && cls.sections.map((sec, si) => (
                <div key={si}>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-sm font-medium text-slate-600">
                    Section {sec.name} ({sec.students?.length || 0} students)
                  </div>
                  {sec.students && sec.students.length > 0 && (
                    <table className="data-table">
                      <thead><tr><th>Roll No</th><th>Username</th><th>Password</th><th>Name</th><th>Parent Username</th><th>Parent Password</th></tr></thead>
                      <tbody>
                        {sec.students.map((s, si2) => {
                          const username = s.user?.username || s.username || '';
                          const parent = s.Parents?.[0] || s.parents?.[0];
                          const parentUsername = parent?.User?.username || parent?.user?.username || '';
                          return (
                            <tr key={si2}>
                              <td className="font-mono">{s.roll_no || '—'}</td>
                              <td className="font-mono text-xs">{username || '—'}</td>
                              <td className="font-mono text-xs">{username ? `${username}@123` : '—'}</td>
                              <td>{s.user?.name || s.name || '—'}</td>
                              <td className="font-mono text-xs">{parentUsername || '—'}</td>
                              <td className="font-mono text-xs">{parentUsername ? `${parentUsername}@123` : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
