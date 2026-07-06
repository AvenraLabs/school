import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

// APIs
import { schoolAPI, analyticsAPI, tokenPoliciesAPI } from '../../api';

// Common components
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';

// Icons
import {
  School, BarChart3, Coins, LogOut, Sparkles,
  Plus, RotateCcw, Copy, ChevronDown, ChevronUp,
  GraduationCap, UserCog, Users, ChevronLeft, ChevronRight,
  Cpu, RefreshCw, Check,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════════
   SHARED HELPERS
════════════════════════════════════════════════════════════════════ */
function RolePill({ role }) {
  const map = {
    student:      'bg-sky-50 text-sky-700 border-sky-200',
    teacher:      'bg-violet-50 text-violet-700 border-violet-200',
    school_admin: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {role?.replace(/_/g, ' ')}
    </span>
  );
}

function TableWrap({ children }) {
  return (
    <div className="overflow-x-auto w-full">
      <div className="min-w-[580px]">{children}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SCHOOL SECTION — helpers
════════════════════════════════════════════════════════════════════ */
const ROLE_STYLES = {
  student: { activeBg: '#0284c7', activeBorder: '#0284c7', idleBg: '#fff', idleColor: '#0369a1', idleBorder: '#bae6fd', countBg: '#e0f2fe', countColor: '#0369a1', countActiveBg: 'rgba(255,255,255,0.2)', countActiveColor: '#fff' },
  teacher: { activeBg: '#7c3aed', activeBorder: '#7c3aed', idleBg: '#fff', idleColor: '#6d28d9', idleBorder: '#ddd6fe', countBg: '#ede9fe', countColor: '#6d28d9', countActiveBg: 'rgba(255,255,255,0.2)', countActiveColor: '#fff' },
};
const SCHOOL_PAGE_SIZE = 20;

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
      const params = { limit: SCHOOL_PAGE_SIZE, offset: pg * SCHOOL_PAGE_SIZE };
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
  const pages = data ? Math.ceil(data.total / SCHOOL_PAGE_SIZE) : 0;

  return (
    <div className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-4">
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Students', roleKey: 'student', countKey: 'students', icon: GraduationCap },
          { label: 'Teachers', roleKey: 'teacher', countKey: 'teachers', icon: UserCog },
        ].map(({ label, roleKey, countKey, icon: Icon }) => {
          const active = role === roleKey;
          const s = ROLE_STYLES[roleKey];
          return (
            <button
              key={roleKey}
              onClick={() => { setRole(r => r === roleKey ? '' : roleKey); setClassId(''); setSectionId(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '12px',
                border: `1px solid ${active ? s.activeBorder : s.idleBorder}`,
                background: active ? s.activeBg : s.idleBg,
                color: active ? '#fff' : s.idleColor,
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <Icon style={{ width: '16px', height: '16px' }} />
              {label}
              <span style={{ marginLeft: '2px', padding: '1px 6px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: active ? s.countActiveBg : s.countBg, color: active ? s.countActiveColor : s.countColor }}>
                {data?.counts?.[countKey] ?? '…'}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <select className="select-field text-sm" style={{ height: '38px', minWidth: '130px', maxWidth: '160px' }} value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }}>
          <option value="">All Classes</option>
          {data?.classes?.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>
        <select className="select-field text-sm" style={{ height: '38px', minWidth: '120px', maxWidth: '140px', opacity: classId ? 1 : 0.45 }} value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId}>
          <option value="">All Sections</option>
          {sections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
        </select>
        {(classId || sectionId || role) && (
          <button onClick={() => { setClassId(''); setSectionId(''); setRole(''); }} style={{ height: '38px', padding: '0 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
            Clear filters
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <TableWrap>
          <table className="data-table min-w-[560px]">
            <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Class</th><th>Section</th><th>Status</th></tr></thead>
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
        </TableWrap>
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

/* ════════════════════════════════════════════════════════════════════
   COMBINED TOKEN EDITOR — edits and saves both limits together
════════════════════════════════════════════════════════════════════ */
function CombinedTokenEditor({ policies, onSaved }) {
  const studentPol = policies.find(p => p.role === 'student');
  const teacherPol = policies.find(p => p.role === 'teacher');

  const [studentVal, setStudentVal] = useState(studentPol?.monthly_tokens ?? 0);
  const [teacherVal, setTeacherVal] = useState(teacherPol?.monthly_tokens ?? 0);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setStudentVal(studentPol?.monthly_tokens ?? 0);
  }, [studentPol?.monthly_tokens]);

  useEffect(() => {
    setTeacherVal(teacherPol?.monthly_tokens ?? 0);
  }, [teacherPol?.monthly_tokens]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await tokenPoliciesAPI.updateBoth(Number(studentVal), Number(teacherVal), 'replace');
      toast.success('Token limits updated successfully');
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Coins style={{ width: '22px', height: '22px', color: '#fff' }} />
        </div>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Monthly Token Limits</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Adjust AI token budgets for all users in the school</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Student Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap style={{ width: '18px', height: '18px', color: '#0284c7' }} />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#334155' }}>Students</span>
          </div>
          
          <div style={{ background: '#f0f9ff', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: 500 }}>Current limit</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '16px', color: '#0369a1' }}>
              {(studentPol?.monthly_tokens ?? 0).toLocaleString()}
            </span>
          </div>

          <input
            type="number"
            min="0"
            value={studentVal}
            onChange={e => setStudentVal(e.target.value)}
            onFocus={e => e.target.select()}
            placeholder="Student tokens limit"
            style={{
              padding: '12px 16px', borderRadius: '10px',
              border: '1px solid #e2e8f0', background: '#f8fafc',
              fontSize: '15px', fontFamily: 'monospace', fontWeight: 600,
              color: '#0f172a', outline: 'none', width: '100%',
            }}
          />
        </div>

        {/* Teacher Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCog style={{ width: '18px', height: '18px', color: '#7c3aed' }} />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#334155' }}>Teachers</span>
          </div>

          <div style={{ background: '#f5f3ff', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6d28d9', fontWeight: 500 }}>Current limit</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '16px', color: '#6d28d9' }}>
              {(teacherPol?.monthly_tokens ?? 0).toLocaleString()}
            </span>
          </div>

          <input
            type="number"
            min="0"
            value={teacherVal}
            onChange={e => setTeacherVal(e.target.value)}
            onFocus={e => e.target.select()}
            placeholder="Teacher tokens limit"
            style={{
              padding: '12px 16px', borderRadius: '10px',
              border: '1px solid #e2e8f0', background: '#f8fafc',
              fontSize: '15px', fontFamily: 'monospace', fontWeight: 600,
              color: '#0f172a', outline: 'none', width: '100%',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleSave} disabled={saving}
        style={{
          marginTop: '8px', padding: '12px 24px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: '#fff', fontSize: '15px', fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.75 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
          transition: 'all 0.15s',
        }}
      >
        {saving
          ? <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
          : <Check style={{ width: '16px', height: '16px' }} />}
        {saving ? 'Saving Limits…' : 'Save Limits'}
      </button>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════ */
const MAIN_TABS = [
  { key: 'school',    label: 'School',       icon: School },
  { key: 'analytics', label: 'AI Analytics', icon: BarChart3 },
  { key: 'tokens',    label: 'Tokens',       icon: Coins },
];


export function SuperAdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const displayName = user?.name || user?.username || 'Admin';
  const initial = displayName[0].toUpperCase();

  /* ── main tab ── */
  const [activeTab, setActiveTab] = useState('school');

  /* ── SCHOOL state ── */
  const [schools, setSchools]               = useState([]);
  const [schoolLoading, setSchoolLoading]   = useState(true);
  const [expanded, setExpanded]             = useState(null);
  const [showCreate, setShowCreate]         = useState(false);
  const [showResetPw, setShowResetPw]       = useState(null);
  const [showCredentials, setShowCredentials] = useState(null);
  const [creating, setCreating]             = useState(false);
  const [resetPw, setResetPw]               = useState('');
  const [form, setForm] = useState({
    name: '', code: '', cbse_affiliation_no: '', address: '',
    city: '', state: '', zip: '', email: '', admin_username: '', admin_password: '',
  });

  /* ── ANALYTICS state ── */
  const [schoolData, setSchoolData]       = useState([]);
  const [userData, setUserData]           = useState([]);
  const [classData, setClassData]         = useState([]);
  const [roleFilter, setRoleFilter]       = useState('');
  const [analyticsTab, setAnalyticsTab]   = useState('overview');
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  /* ── TOKEN state ── */
  const [policies, setPolicies]             = useState([]);
  const [tokenLoaded, setTokenLoaded]       = useState(false);
  const [tokenLoading, setTokenLoading]     = useState(false);

  /* ──────────────────────── SCHOOL LOADERS ──────────────────────── */
  const loadSchools = useCallback(async () => {
    try {
      const res = await schoolAPI.list(100, 0);
      setSchools(res.rows || res.items || []);
    } catch { toast.error('Failed to load schools'); }
    finally { setSchoolLoading(false); }
  }, [toast]);

  const handleCreate = async (e) => {
    e.preventDefault(); setCreating(true);
    try {
      const res = await schoolAPI.create(form);
      toast.success('School created!');
      setShowCreate(false);
      setShowCredentials({ school: form.name, username: res.admin?.username || form.admin_username, password: form.admin_password });
      setForm({ name:'', code:'', cbse_affiliation_no:'', address:'', city:'', state:'', zip:'', email:'', admin_username:'', admin_password:'' });
      loadSchools();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create school'); }
    finally { setCreating(false); }
  };

  const toggleAdmin = async (school, isActive) => {
    try { await schoolAPI.updateAdminStatus(school.id, isActive); toast.success(`Admin ${isActive ? 'activated' : 'deactivated'}`); loadSchools(); }
    catch { toast.error('Failed to update status'); }
  };

  const handleResetPassword = async () => {
    if (!resetPw.trim()) return toast.error('Enter a new password');
    try { await schoolAPI.resetAdminPassword(showResetPw.id, resetPw); toast.success('Password reset'); setShowResetPw(null); setResetPw(''); }
    catch { toast.error('Failed to reset password'); }
  };

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied'); };

  /* ──────────────────────── ANALYTICS LOADERS ──────────────────────── */
  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const [school, users, classes] = await Promise.all([
        analyticsAPI.getAISchoolData(),
        analyticsAPI.getAIUserData(),
        analyticsAPI.getAIClassData(),
      ]);
      setSchoolData(Array.isArray(school) ? school : []);
      setUserData(Array.isArray(users) ? users : []);
      setClassData(Array.isArray(classes) ? classes : []);
      setAnalyticsLoaded(true);
    } catch { toast.error('Failed to load analytics'); }
    finally { setAnalyticsLoading(false); }
  }, [toast]);

  const loadAnalyticsUsers = useCallback(async (rf) => {
    try { const users = await analyticsAPI.getAIUserData(rf || undefined); setUserData(Array.isArray(users) ? users : []); }
    catch { /* ignore */ }
  }, []);

  /* ──────────────────────── TOKEN LOADERS ──────────────────────── */
  const loadPolicies = useCallback(async () => {
    const pol = await tokenPoliciesAPI.list();
    setPolicies(pol?.items || []);
  }, []);

  /* ──────────────────────── LIFECYCLE ──────────────────────── */
  useEffect(() => { loadSchools(); }, [loadSchools]);

  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsLoaded) loadAnalytics();
    if (activeTab === 'tokens' && !tokenLoaded) {
      setTokenLoading(true);
      loadPolicies()
        .finally(() => { setTokenLoading(false); setTokenLoaded(true); });
    }
  }, [activeTab, analyticsLoaded, tokenLoaded, loadAnalytics, loadPolicies]);

  useEffect(() => {
    if (analyticsTab === 'users') loadAnalyticsUsers(roleFilter);
  }, [roleFilter, analyticsTab, loadAnalyticsUsers]);

  /* ──────────────────────── DERIVED ──────────────────────── */
  const totalAICalls  = schoolData.reduce((s, r) => s + (r.total_calls || 0), 0);
  const totalAITokens = schoolData.reduce((s, r) => s + (r.total_tokens || 0), 0);
  const policyFor = (role) => policies.find(p => p.role === role) || { role, monthly_tokens: 0, updated_by: null };

  /* ────────────────────────── RENDER ──────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', flex: 1, background: '#f8fafc' }}>

      {/* ── Top bar ── */}
      <header style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1e1b4b 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>School App</p>
              <p style={{ fontSize: '11px', color: 'rgba(165,180,252,0.55)', marginTop: '3px', fontWeight: 500 }}>Super Admin</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {initial}
              </div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{displayName}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgb(252,165,165)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
            >
              <LogOut style={{ width: '15px', height: '15px' }} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main tab bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '2px' }}>
          {MAIN_TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 22px', fontSize: '14px', fontWeight: 600,
                border: 'none', borderBottom: activeTab === key ? '2px solid #6366f1' : '2px solid transparent',
                background: 'transparent', cursor: 'pointer',
                color: activeTab === key ? '#6366f1' : '#64748b',
                transition: 'all 0.15s',
              }}>
              <Icon style={{ width: '16px', height: '16px' }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '36px 24px' }}>

          {/* ═══════════ SCHOOL TAB ═══════════ */}
          {activeTab === 'school' && (
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
                {schoolLoading ? (
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
                        <tr><th>School Name</th><th>Code</th><th>City</th><th>Admin Username</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {schools.map(s => {
                          const admin = s.users?.[0] || s.User || s.admin;
                          const isExpanded = expanded === s.id;
                          return [
                            <tr key={s.id}>
                              <td>
                                <button onClick={() => setExpanded(isExpanded ? null : s.id)} className="flex items-center gap-2 font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-left">
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                                  {s.school_name}
                                </button>
                              </td>
                              <td className="font-mono text-xs text-slate-500">{s.school_code}</td>
                              <td className="text-sm">{s.city || '—'}</td>
                              <td className="font-mono text-xs text-slate-500">{admin?.username || '—'}</td>
                              <td><StatusBadge status={admin?.is_active ? 'active' : 'inactive'} /></td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => toggleAdmin(s, !admin?.is_active)} className={`btn-sm ${admin?.is_active ? 'btn-secondary' : 'btn-success'}`}>
                                    {admin?.is_active ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button onClick={() => { setShowResetPw(s); setResetPw(''); }} className="btn-sm btn-secondary" title="Reset admin password">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>,
                            isExpanded && (
                              <tr key={`${s.id}-stats`}>
                                <td colSpan={6} className="p-0"><SchoolStatsPanel school={s} /></td>
                              </tr>
                            ),
                          ];
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════ AI ANALYTICS TAB ═══════════ */}
          {activeTab === 'analytics' && (
            <div>
              <div className="page-header">
                <div>
                  <h1 className="page-title">AI Analytics</h1>
                  <p className="page-subtitle">Track AI usage across the platform</p>
                </div>
                <button onClick={loadAnalytics} className="btn-secondary flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>
              <div className="stats-grid mb-8">
                {[
                  { label: 'Total AI Calls',   value: totalAICalls.toLocaleString(),   color: 'indigo', Icon: Cpu },
                  { label: 'Total Tokens Used', value: totalAITokens.toLocaleString(), color: 'violet', Icon: BarChart3 },
                  { label: 'Active Users',      value: userData.length,                color: 'emerald', Icon: Users },
                ].map(({ label, value, color, Icon }) => (
                  <div key={label} className="card flex items-center gap-4 p-5">
                    <div className={`w-11 h-11 rounded-xl bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{label}</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsLoading ? '…' : value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tabs mb-6">
                {[{ key: 'overview', label: 'By Role' }, { key: 'users', label: 'By User' }, { key: 'classes', label: 'By Class' }].map(t => (
                  <button key={t.key} className={`tab ${analyticsTab === t.key ? 'active' : ''}`} onClick={() => setAnalyticsTab(t.key)}>{t.label}</button>
                ))}
              </div>
              <div className="card overflow-hidden">
                {analyticsLoading ? (
                  <div className="p-8 text-center text-slate-400">Loading analytics…</div>
                ) : analyticsTab === 'overview' ? (
                  <table className="data-table">
                    <thead><tr><th>Role</th><th>Total Calls</th><th>Total Tokens</th></tr></thead>
                    <tbody>
                      {schoolData.length === 0 ? <tr><td colSpan={3} className="text-center text-slate-400 py-8">No data available</td></tr>
                        : schoolData.map((r, i) => <tr key={i}><td className="capitalize font-medium">{r.role}</td><td>{(r.total_calls || 0).toLocaleString()}</td><td>{(r.total_tokens || 0).toLocaleString()}</td></tr>)}
                    </tbody>
                  </table>
                ) : analyticsTab === 'users' ? (
                  <>
                    <div className="p-4 border-b border-slate-100">
                      <select className="select-field w-48" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="">All Roles</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>
                    <table className="data-table">
                      <thead><tr><th>User ID</th><th>Role</th><th>Total Calls</th><th>Total Tokens</th></tr></thead>
                      <tbody>
                        {userData.length === 0 ? <tr><td colSpan={4} className="text-center text-slate-400 py-8">No data</td></tr>
                          : userData.map((u, i) => <tr key={i}><td className="font-mono text-xs">{u.user_id}</td><td className="capitalize">{u.role}</td><td>{(u.total_calls || 0).toLocaleString()}</td><td>{(u.total_tokens || 0).toLocaleString()}</td></tr>)}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <table className="data-table">
                    <thead><tr><th>Class</th><th>Total Calls</th><th>Total Tokens</th></tr></thead>
                    <tbody>
                      {classData.length === 0 ? <tr><td colSpan={3} className="text-center text-slate-400 py-8">No data</td></tr>
                        : classData.map((c, i) => <tr key={i}><td className="font-medium">{c.class_name}</td><td>{(c.total_calls || 0).toLocaleString()}</td><td>{(c.total_tokens || 0).toLocaleString()}</td></tr>)}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ═══════════ TOKENS TAB ═══════════ */}
          {activeTab === 'tokens' && (
            <div>
              <div className="page-header">
                <div>
                  <h1 className="page-title">Token Management</h1>
                  <p className="page-subtitle">Set monthly AI token limits for students &amp; teachers</p>
                </div>
                <button onClick={loadPolicies} className="btn-secondary flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>

              {tokenLoading ? (
                <div className="card p-12 text-center text-slate-400">Loading…</div>
              ) : (
                <CombinedTokenEditor policies={policies} onSaved={loadPolicies} />
              )}
            </div>
          )}

        </div>
      </main>


      {/* ══════ MODALS ══════ */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New School" maxWidth="max-w-2xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">School Name *</label><input className="input-field" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Delhi Public School" /></div>
            <div><label className="label">School Code *</label><input className="input-field" required value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. DPS001" /></div>
            <div><label className="label">CBSE Affiliation No</label><input className="input-field" value={form.cbse_affiliation_no} onChange={e => setForm({...form, cbse_affiliation_no: e.target.value})} placeholder="Optional" /></div>
            <div><label className="label">Email</label><input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="school@example.com" /></div>
            <div className="sm:col-span-2"><label className="label">Address</label><input className="input-field" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street address" /></div>
            <div><label className="label">City</label><input className="input-field" value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
            <div><label className="label">State</label><input className="input-field" value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
            <div><label className="label">ZIP Code</label><input className="input-field" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} /></div>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Admin Account</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Admin Username *</label><input className="input-field" required value={form.admin_username} onChange={e => setForm({...form, admin_username: e.target.value})} placeholder="e.g. dps_admin" /></div>
              <div><label className="label">Admin Password *</label><input className="input-field" required value={form.admin_password} onChange={e => setForm({...form, admin_password: e.target.value})} placeholder="Secure password" /></div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating…' : 'Create School'}</button>
          </div>
        </form>
      </Modal>

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

      <Modal isOpen={!!showResetPw} onClose={() => setShowResetPw(null)} title="Reset Admin Password">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Reset password for <strong>{showResetPw?.school_name}</strong>'s admin.</p>
          <div><label className="label">New Password</label><input className="input-field" type="text" value={resetPw} onChange={e => setResetPw(e.target.value)} placeholder="Enter new password" /></div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowResetPw(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleResetPassword} className="btn-primary">Reset Password</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
