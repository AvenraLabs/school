import { useState, useEffect, useCallback } from 'react';
import { schoolAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import {
  Plus, RotateCcw, School, Copy, ChevronDown, ChevronUp,
  GraduationCap, UserCog, Users, ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────── */
function RolePill({ role }) {
  const map = {
    student: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    teacher: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
    parent:  { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  };
  const s = map[role] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {role}
    </span>
  );
}

const ROLE_STYLES = {
  student: { activeBg: '#0284c7', activeBorder: '#0284c7', idleBg: '#fff', idleColor: '#0369a1', idleBorder: '#bae6fd', countBg: '#e0f2fe', countColor: '#0369a1', countActiveBg: 'rgba(255,255,255,0.2)', countActiveColor: '#fff' },
  teacher: { activeBg: '#7c3aed', activeBorder: '#7c3aed', idleBg: '#fff', idleColor: '#6d28d9', idleBorder: '#ddd6fe', countBg: '#ede9fe', countColor: '#6d28d9', countActiveBg: 'rgba(255,255,255,0.2)', countActiveColor: '#fff' },
  parent:  { activeBg: '#059669', activeBorder: '#059669', idleBg: '#fff', idleColor: '#047857', idleBorder: '#a7f3d0', countBg: '#d1fae5', countColor: '#047857', countActiveBg: 'rgba(255,255,255,0.2)', countActiveColor: '#fff' },
};

const PAGE_SIZE = 20;

/* ─── school stats panel ──────────────────────────────────────────── */
function SchoolStatsPanel({ school }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [role, setRole]           = useState('');
  const [classId, setClassId]     = useState('');
  const [sectionId, setSectionId] = useState('');
  const [page, setPage]           = useState(0);
  const toast = useToast();

  const load = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE, offset: pg * PAGE_SIZE };
      if (role)      params.role       = role;
      if (classId)   params.class_id   = classId;
      if (sectionId) params.section_id = sectionId;
      const res = await schoolAPI.getStats(school.id, params);
      setData(res);
      setPage(pg);
    } catch {
      toast.error('Failed to load school stats');
    } finally {
      setLoading(false);
    }
  }, [school.id, role, classId, sectionId, toast]);

  useEffect(() => { load(0); }, [load]);

  const sections = classId
    ? (data?.classes?.find(c => String(c.id) === String(classId))?.sections || [])
    : [];

  const pages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-4">
      {/* Count chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Students', roleKey: 'student', countKey: 'students', icon: GraduationCap },
          { label: 'Teachers', roleKey: 'teacher', countKey: 'teachers', icon: UserCog },
          { label: 'Parents',  roleKey: 'parent',  countKey: 'parents',  icon: Users },
        ].map(({ label, roleKey, countKey, icon: Icon }) => {
          const active = role === roleKey;
          const s = ROLE_STYLES[roleKey];
          return (
            <button
              key={roleKey}
              onClick={() => { setRole(r => r === roleKey ? '' : roleKey); setClassId(''); setSectionId(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '12px', border: `1px solid ${active ? s.activeBorder : s.idleBorder}`,
                background: active ? s.activeBg : s.idleBg,
                color: active ? '#fff' : s.idleColor,
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Icon style={{ width: '16px', height: '16px' }} />
              {label}
              <span style={{
                marginLeft: '2px', padding: '1px 6px', borderRadius: '999px',
                fontSize: '12px', fontWeight: 700,
                background: active ? s.countActiveBg : s.countBg,
                color: active ? s.countActiveColor : s.countColor,
              }}>
                {data?.counts?.[countKey] ?? '…'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters — class + section side by side */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          className="select-field text-sm"
          style={{ height: '38px', minWidth: '130px', maxWidth: '160px' }}
          value={classId}
          onChange={e => { setClassId(e.target.value); setSectionId(''); }}
        >
          <option value="">All Classes</option>
          {data?.classes?.map(c => (
            <option key={c.id} value={c.id}>{c.class_name}</option>
          ))}
        </select>

        <select
          className="select-field text-sm"
          style={{ height: '38px', minWidth: '120px', maxWidth: '140px', opacity: classId ? 1 : 0.45 }}
          value={sectionId}
          onChange={e => setSectionId(e.target.value)}
          disabled={!classId}
        >
          <option value="">All Sections</option>
          {sections.map(s => (
            <option key={s.id} value={s.id}>Section {s.name}</option>
          ))}
        </select>

        {(classId || sectionId || role) && (
          <button
            onClick={() => { setClassId(''); setSectionId(''); setRole(''); }}
            style={{ height: '38px', padding: '0 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer' }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[560px]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Class</th>
                <th>Section</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading…</td></tr>
              ) : !data?.items?.length ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No records found</td></tr>
              ) : data.items.map((u, i) => (
                <tr key={i}>
                  <td className="font-medium text-slate-900 text-sm">{u.name}</td>
                  <td className="font-mono text-xs text-slate-500">@{u.username}</td>
                  <td><RolePill role={u.role} /></td>
                  <td className="text-sm text-slate-600">{u.class}</td>
                  <td className="text-sm text-slate-600">{u.section}</td>
                  <td><StatusBadge status={u.is_active ? 'active' : 'inactive'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Page {page + 1} of {pages} · {data.total} records</p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => load(page - 1)} className="btn-secondary btn-sm disabled:opacity-40"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button disabled={page >= pages - 1} onClick={() => load(page + 1)} className="btn-secondary btn-sm disabled:opacity-40"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────── */
export function SchoolManagement() {
  const [schools, setSchools]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [expanded, setExpanded]         = useState(null);
  const [showCreate, setShowCreate]     = useState(false);
  const [showResetPw, setShowResetPw]   = useState(null);
  const [showCredentials, setShowCredentials] = useState(null);
  const [creating, setCreating]         = useState(false);
  const [resetPw, setResetPw]           = useState('');
  const toast = useToast();

  const [form, setForm] = useState({
    name: '', code: '', cbse_affiliation_no: '', address: '', city: '',
    state: '', zip: '', email: '', admin_username: '', admin_password: '',
  });

  useEffect(() => { loadSchools(); }, []);

  const loadSchools = async () => {
    try {
      const res = await schoolAPI.list(100, 0);
      setSchools(res.rows || res.items || []);
    } catch {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await schoolAPI.create(form);
      toast.success('School created!');
      setShowCreate(false);
      setShowCredentials({
        school: form.name,
        username: res.admin?.username || form.admin_username,
        password: form.admin_password,
      });
      setForm({ name:'', code:'', cbse_affiliation_no:'', address:'', city:'', state:'', zip:'', email:'', admin_username:'', admin_password:'' });
      loadSchools();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create school');
    } finally {
      setCreating(false);
    }
  };

  const toggleAdmin = async (school, isActive) => {
    try {
      await schoolAPI.updateAdminStatus(school.id, isActive);
      toast.success(`Admin ${isActive ? 'activated' : 'deactivated'}`);
      loadSchools();
    } catch { toast.error('Failed to update status'); }
  };

  const handleResetPassword = async () => {
    if (!resetPw.trim()) return toast.error('Enter a new password');
    try {
      await schoolAPI.resetAdminPassword(showResetPw.id, resetPw);
      toast.success('Password reset');
      setShowResetPw(null);
      setResetPw('');
    } catch { toast.error('Failed to reset password'); }
  };

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied'); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">School Management</h1>
          <p className="page-subtitle">Create and manage schools with admin accounts</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create School
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading schools…</div>
        ) : schools.length === 0 ? (
          <div className="empty-state">
            <School className="empty-state-icon" />
            <p className="empty-state-title">No schools yet</p>
            <p className="empty-state-desc">Create your first school to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[680px]">
              <thead>
                <tr>
                  <th>School Name</th>
                  <th>Code</th>
                  <th>City</th>
                  <th>Admin Username</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s) => {
                  const admin = s.users?.[0] || s.User || s.admin;
                  const isExpanded = expanded === s.id;
                  return [
                    <tr key={s.id}>
                      <td>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : s.id)}
                          className="flex items-center gap-2 font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-left"
                        >
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                          {s.school_name}
                        </button>
                      </td>
                      <td className="font-mono text-xs text-slate-500">{s.school_code}</td>
                      <td className="text-sm">{s.city || '—'}</td>
                      <td className="font-mono text-xs text-slate-500">{admin?.username || '—'}</td>
                      <td><StatusBadge status={admin?.is_active ? 'active' : 'inactive'} /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAdmin(s, !admin?.is_active)}
                            className={`btn-sm ${admin?.is_active ? 'btn-secondary' : 'btn-success'}`}
                          >
                            {admin?.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => { setShowResetPw(s); setResetPw(''); }}
                            className="btn-sm btn-secondary"
                            title="Reset admin password"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>,
                    isExpanded && (
                      <tr key={`${s.id}-stats`}>
                        <td colSpan={6} className="p-0">
                          <SchoolStatsPanel school={s} />
                        </td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create School Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New School" maxWidth="max-w-2xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">School Name *</label>
              <input className="input-field" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Delhi Public School" />
            </div>
            <div>
              <label className="label">School Code *</label>
              <input className="input-field" required value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. DPS001" />
            </div>
            <div>
              <label className="label">CBSE Affiliation No</label>
              <input className="input-field" value={form.cbse_affiliation_no} onChange={e => setForm({...form, cbse_affiliation_no: e.target.value})} placeholder="Optional" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="school@example.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input className="input-field" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street address" />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input-field" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input-field" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
            </div>
            <div>
              <label className="label">ZIP Code</label>
              <input className="input-field" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} />
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Admin Account</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Admin Username *</label>
                <input className="input-field" required value={form.admin_username} onChange={e => setForm({...form, admin_username: e.target.value})} placeholder="e.g. dps_admin" />
              </div>
              <div>
                <label className="label">Admin Password *</label>
                <input className="input-field" required value={form.admin_password} onChange={e => setForm({...form, admin_password: e.target.value})} placeholder="Secure password" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Creating…' : 'Create School'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Credentials Modal */}
      <Modal isOpen={!!showCredentials} onClose={() => setShowCredentials(null)} title="School Admin Credentials">
        {showCredentials && (
          <div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-emerald-800 font-medium">✅ School created successfully!</p>
            </div>
            <div className="credential-box space-y-3">
              {[['School', showCredentials.school], ['Username', showCredentials.username], ['Password', showCredentials.password]].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{label}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{val}</span>
                    <button onClick={() => copy(val)} className="text-indigo-500 hover:text-indigo-700"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">Save these credentials securely.</p>
          </div>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={!!showResetPw} onClose={() => setShowResetPw(null)} title="Reset Admin Password">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Reset password for <strong>{showResetPw?.school_name}</strong>'s admin.</p>
          <div>
            <label className="label">New Password</label>
            <input className="input-field" type="text" value={resetPw} onChange={e => setResetPw(e.target.value)} placeholder="Enter new password" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowResetPw(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleResetPassword} className="btn-primary">Reset Password</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
