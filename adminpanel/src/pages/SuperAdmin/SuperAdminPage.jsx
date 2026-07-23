import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

// APIs
import { schoolAPI, analyticsAPI, tokenPoliciesAPI } from '../../api';

// Common components
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';

// School Admin sub-pages mapped to Super Admin
import { ClassesManager } from '../SchoolAdmin/ClassesManager';
import { BulkSeeder } from '../SchoolAdmin/BulkSeeder';
import { FeedbackManager } from './FeedbackManager';

// Icons
import {
  School, BarChart3, Coins, LogOut, Sparkles,
  Plus, RotateCcw, Copy, ChevronDown, ChevronUp,
  GraduationCap, UserCog, Users, ChevronLeft, ChevronRight,
  Cpu, RefreshCw, Check, Edit3, Database, Layers,
  MessageSquare, Trash2
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
   COMBINED TOKEN EDITOR — edits and saves both limits together
════════════════════════════════════════════════════════════════════ */
function CombinedTokenEditor({ policies, onSaved }) {
  const studentPol = policies.find(p => p.role === 'student');
  const teacherPol = policies.find(p => p.role === 'teacher');

  const [studentVal, setStudentVal] = useState(studentPol?.annual_tokens ?? 0);
  const [teacherVal, setTeacherVal] = useState(teacherPol?.annual_tokens ?? 0);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setStudentVal(studentPol?.annual_tokens ?? 0);
  }, [studentPol?.annual_tokens]);

  useEffect(() => {
    setTeacherVal(teacherPol?.annual_tokens ?? 0);
  }, [teacherPol?.annual_tokens]);

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
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Annual Token Limits</p>
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
              {(studentPol?.annual_tokens ?? 0).toLocaleString()}
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
              {(teacherPol?.annual_tokens ?? 0).toLocaleString()}
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
  { key: 'school',       label: 'School Settings',    icon: School },
  { key: 'analytics',    label: 'AI Analytics',       icon: BarChart3 },
  { key: 'tokens',       label: 'Tokens',             icon: Coins },
  { key: 'classes',      label: 'Classes & Sections', icon: Layers },
  { key: 'bulk-seeder',  label: 'Bulk Seeder',        icon: Database },
  { key: 'feedback',     label: 'Feedback Management', icon: MessageSquare },
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
  const [showEditSchool, setShowEditSchool] = useState(null);
  const [showResetPw, setShowResetPw]       = useState(null);
  const [showCredentials, setShowCredentials] = useState(null);
  const [creating, setCreating]             = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [resetPw, setResetPw]               = useState('');
  const [form, setForm] = useState({
    name: '', address: '',
    city: '', state: '', zip: '', email: '', contact_phone: '', admin_username: '', admin_password: '',
    promotion_wizard_enabled: true,
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
      setForm({ name:'', address:'', city:'', state:'', zip:'', email:'', contact_phone: '', admin_username:'', admin_password:'' });
      loadSchools();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create school'); }
    finally { setCreating(false); }
  };

  const handleEditSchoolSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await schoolAPI.update(showEditSchool.id, {
        school_name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        email: form.email,
        contact_phone: form.contact_phone,
        whatsapp_bus_start_enabled: form.whatsapp_bus_start_enabled,
        whatsapp_bus_end_enabled: form.whatsapp_bus_end_enabled,
        google_maps_enabled: form.google_maps_enabled,
        promotion_wizard_enabled: form.promotion_wizard_enabled,
      });
      toast.success('School settings updated!');
      setShowEditSchool(null);
      loadSchools();
    } catch (err) {
      toast.error('Failed to update school settings');
    } finally {
      setSaving(false);
    }
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
  const totalAICalls  = schoolData.reduce((s, r) => s + Number(r.total_calls || 0), 0);
  const totalAITokens = schoolData.reduce((s, r) => s + Number(r.total_tokens || 0), 0);
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
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>Avenra Campus</p>
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

          {/* ═══════════ SCHOOL SETTINGS TAB (SINGLE SCHOOL) ═══════════ */}
          {activeTab === 'school' && (
            <div>
              {/* Header section with school brand highlight */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 leading-tight">School Settings</h1>
                      <p className="text-sm text-slate-500">Configure profile, contact details, and admin accounts</p>
                    </div>
                  </div>
                </div>
                {schools[0] && (
                  <button onClick={() => {
                    const sch = schools[0];
                    setForm({
                      name: sch.school_name,
                      address: sch.address || '',
                      city: sch.city || '',
                      state: sch.state || '',
                      zip: sch.zip || '',
                      email: sch.email || '',
                      contact_phone: sch.contact_phone || '',
                      whatsapp_bus_start_enabled: sch.whatsapp_bus_start_enabled || false,
                      whatsapp_bus_end_enabled: sch.whatsapp_bus_end_enabled || false,
                      google_maps_enabled: sch.google_maps_enabled || false,
                      promotion_wizard_enabled: sch.promotion_wizard_enabled ?? true,
                    });
                    setShowEditSchool(sch);
                  }} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200">
                    <Edit3 className="w-4 h-4" /> Edit School Profile
                  </button>
                )}
              </div>
              
              {schoolLoading ? (
                <div className="card p-12 text-center text-slate-400">Loading school settings…</div>
              ) : schools.length === 0 ? (
                <div className="empty-state">
                  <School className="empty-state-icon" />
                  <p className="empty-state-title">No school configured</p>
                  <p className="empty-state-desc">Use the Bulk Seeder or database seed to create a school</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: General Info and Address */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* General Info Card */}
                    <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block"></span>
                        School Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">School Name</span>
                          <span className="text-base font-bold text-slate-800">{schools[0].school_name}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Email Address</span>
                          <span className="text-base font-bold text-slate-800">{schools[0].email || '—'}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150 sm:col-span-2">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Contact Phone</span>
                          <span className="text-base font-bold text-slate-800">{schools[0].contact_phone || '—'}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150 sm:col-span-2">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">WhatsApp Automation Settings</span>
                          <div className="space-y-1 mt-1">
                            <p className="text-sm font-semibold text-slate-700">
                              Trip Starts Notification: <span className={schools[0].whatsapp_bus_start_enabled ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>{schools[0].whatsapp_bus_start_enabled ? 'ENABLED' : 'DISABLED'}</span>
                            </p>
                            <p className="text-sm font-semibold text-slate-700">
                              Trip Ends Notification: <span className={schools[0].whatsapp_bus_end_enabled ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>{schools[0].whatsapp_bus_end_enabled ? 'ENABLED' : 'DISABLED'}</span>
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150 sm:col-span-2">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Live Tracking Map Settings</span>
                          <div className="space-y-1 mt-1">
                            <p className="text-sm font-semibold text-slate-700">
                              Map Provider: <span className={schools[0].google_maps_enabled ? "text-emerald-600 font-bold" : "text-indigo-500 font-bold"}>{schools[0].google_maps_enabled ? 'GOOGLE MAPS' : 'LEAFLET (DEFAULT)'}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* School User Counts Card (For Billing) */}
                    <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block"></span>
                        School User Counts (Billing Metrics)
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Students</span>
                          <span className="text-2xl font-bold text-slate-800">{schools[0].studentsCount ?? 0}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Teachers</span>
                          <span className="text-2xl font-bold text-slate-800">{schools[0].teachersCount ?? 0}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">School Admins</span>
                          <span className="text-2xl font-bold text-slate-800">{schools[0].schoolAdminsCount ?? 0}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Drivers</span>
                          <span className="text-2xl font-bold text-slate-800">{schools[0].driversCount ?? 0}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Active Accounts</span>
                          <span className="text-2xl font-bold text-emerald-600">{schools[0].activeUsersCount ?? 0}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Inactive Accounts</span>
                          <span className="text-2xl font-bold text-rose-500">{schools[0].inactiveUsersCount ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Address Card */}
                    <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block"></span>
                        Address Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150 sm:col-span-2">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Street Address</span>
                          <span className="text-base font-bold text-slate-800">{schools[0].address || '—'}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">City</span>
                          <span className="text-base font-bold text-slate-800">{schools[0].city || '—'}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">State</span>
                          <span className="text-base font-bold text-slate-800">{schools[0].state || '—'}</span>
                        </div>
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 hover:bg-slate-50 transition-colors duration-150 sm:col-span-2">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">ZIP Code</span>
                          <span className="text-base font-bold text-slate-800">{schools[0].zip || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Admin Actions */}
                  <div className="space-y-8">
                    <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                          <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block"></span>
                          School Admin Account
                        </h3>
                        {(() => {
                          const admin = schools[0].users?.[0] || schools[0].User || schools[0].admin;
                          return (
                            <div className="space-y-6">
                              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Admin Username</span>
                                <span className="text-base font-mono font-bold text-slate-800">{admin?.username || '—'}</span>
                              </div>
                              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 flex items-center justify-between">
                                <div>
                                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Account Status</span>
                                  <span className="inline-block mt-0.5"><StatusBadge status={admin?.is_active ? 'active' : 'inactive'} /></span>
                                </div>
                              </div>
                              <div className="pt-4 border-t border-slate-100 space-y-3">
                                <button onClick={() => toggleAdmin(schools[0], !admin?.is_active)} className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 ${
                                  admin?.is_active 
                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100/80 border border-rose-200/50' 
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80 border border-emerald-200/50'
                                }`}>
                                  {admin?.is_active ? 'Deactivate Admin' : 'Activate Admin'}
                                </button>
                                <button onClick={() => { setShowResetPw(schools[0]); setResetPw(''); }} className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-700 transition-all duration-150 flex items-center justify-center gap-2">
                                  <RotateCcw className="w-4 h-4" /> Reset Admin Password
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block"></span>
                        School Subscription Status
                      </h3>
                      <div className="space-y-6">
                        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Subscription Status</span>
                            <span className="inline-block mt-0.5">
                              <StatusBadge status={schools[0].status === 'active' ? 'active' : 'inactive'} />
                            </span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                          {schools[0].status === 'active' ? (
                            <button
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to pause all operations for this school?')) {
                                  try {
                                    await schoolAPI.updateStatus(schools[0].id, 'suspended');
                                    toast.success('School operations paused!');
                                    loadSchools();
                                  } catch {
                                    toast.error('Failed to pause school operations');
                                  }
                                }
                              }}
                              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-rose-50 text-rose-600 hover:bg-rose-100/80 border border-rose-200/50 transition-all duration-150 flex items-center justify-center gap-2"
                            >
                              Pause School Operations
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  await schoolAPI.updateStatus(schools[0].id, 'active');
                                  toast.success('School operations resumed!');
                                  loadSchools();
                                } catch {
                                  toast.error('Failed to resume school operations');
                                }
                              }}
                              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80 border border-emerald-200/50 transition-all duration-150 flex items-center justify-center gap-2"
                            >
                              Resume School Operations
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </>
            )}
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

          {/* ═══════════ CLASSES & SECTIONS TAB ═══════════ */}
          {activeTab === 'classes' && (
            <ClassesManager />
          )}

          {/* ═══════════ BULK SEEDER TAB ═══════════ */}
          {activeTab === 'bulk-seeder' && (
            <BulkSeeder />
          )}

          {/* ═══════════ FEEDBACK TAB ═══════════ */}
          {activeTab === 'feedback' && (
            <FeedbackManager />
          )}

        </div>
      </main>


      {/* ══════ MODALS ══════ */}
      <Modal isOpen={!!showEditSchool} onClose={() => setShowEditSchool(null)} title="Edit School Settings" maxWidth="max-w-2xl">
        <form onSubmit={handleEditSchoolSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">School Name *</label>
              <input className="input-field" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Delhi Public School" />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="school@example.com" />
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input className="input-field" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} placeholder="Optional" />
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
            <div className="sm:col-span-2 space-y-2 mt-2">
              <label className="label font-bold text-slate-700 block mb-1">Automated WhatsApp Settings</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.whatsapp_bus_start_enabled || false}
                    onChange={e => setForm({...form, whatsapp_bus_start_enabled: e.target.checked})}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  Send automated WhatsApp when Bus Driver starts trip (leaves school)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.whatsapp_bus_end_enabled || false}
                    onChange={e => setForm({...form, whatsapp_bus_end_enabled: e.target.checked})}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  Send automated WhatsApp when Bus Driver ends trip (reaches school)
                </label>
              </div>
            </div>
            <div className="sm:col-span-2 space-y-2 mt-2">
              <label className="label font-bold text-slate-700 block mb-1">Map Configuration Settings</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.google_maps_enabled || false}
                    onChange={e => setForm({...form, google_maps_enabled: e.target.checked})}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  Enable Google Maps for live bus tracking (uses Leaflet if disabled)
                </label>
              </div>
            </div>
            <div className="sm:col-span-2 space-y-2 mt-2">
              <label className="label font-bold text-slate-700 block mb-1">License & Wizard Settings</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.promotion_wizard_enabled || false}
                    onChange={e => setForm({...form, promotion_wizard_enabled: e.target.checked})}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  Enable Student Promotion & Graduation Wizard in School Admin panel
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowEditSchool(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
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
