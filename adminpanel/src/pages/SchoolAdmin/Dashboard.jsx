import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classesAPI, teachersAPI, studentsAPI, approvalsAPI } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { Layers, UserCog, GraduationCap, UserCheck, Database, BookOpen, Calendar, Bell, ArrowRight } from 'lucide-react';

const S = {
  // stat card
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' },
  statCard: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  statIconWrap: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  statValue: { fontSize: '30px', fontWeight: 800, color: '#0f172a', lineHeight: 1 },
  statLabel: { fontSize: '13px', color: '#94a3b8', marginTop: '6px' },
  // section heading
  sectionLabel: { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '12px' },
  // action grid
  actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' },
  actionCard: {
    background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
    padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px',
    textDecoration: 'none', transition: 'box-shadow 0.15s, transform 0.15s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  actionIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionLabel: { fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 },
  actionDesc: { fontSize: '11px', color: '#94a3b8', marginTop: '3px' },
};

const STATS = [
  { label: 'Classes',           key: 'classes',           icon: Layers,        accent: '#4f46e5', bg: '#eef2ff' },
  { label: 'Teachers',          key: 'teachers',          icon: UserCog,       accent: '#0284c7', bg: '#f0f9ff' },
  { label: 'Students',          key: 'students',          icon: GraduationCap, accent: '#16a34a', bg: '#f0fdf4' },
  { label: 'Pending Approvals', key: 'pendingApprovals',  icon: UserCheck,     accent: '#d97706', bg: '#fffbeb' },
];

const ACTIONS = [
  { to: '/admin/bulk-seeder',    icon: Database,      label: 'Bulk Setup',    desc: 'Create classes, students & teachers', accent: '#4f46e5', bg: '#eef2ff' },
  { to: '/admin/classes',        icon: Layers,        label: 'Classes',       desc: 'Manage classes & sections',           accent: '#7c3aed', bg: '#f5f3ff' },
  { to: '/admin/teachers',       icon: UserCog,       label: 'Teachers',      desc: 'Manage teacher accounts',             accent: '#0284c7', bg: '#f0f9ff' },
  { to: '/admin/students',       icon: GraduationCap, label: 'Students',      desc: 'Manage student accounts',             accent: '#16a34a', bg: '#f0fdf4' },
  { to: '/admin/approvals',      icon: UserCheck,     label: 'Approvals',     desc: 'Approve pending accounts',            accent: '#d97706', bg: '#fffbeb' },
  { to: '/admin/timetables',     icon: Calendar,      label: 'Timetables',    desc: 'Create section timetables',           accent: '#e11d48', bg: '#fff1f2' },
  { to: '/admin/notifications',  icon: Bell,          label: 'Notifications', desc: 'Send announcements',                  accent: '#4f46e5', bg: '#eef2ff' },
  { to: '/admin/subjects',       icon: BookOpen,      label: 'Subjects',      desc: 'Manage subject list',                 accent: '#7c3aed', bg: '#f5f3ff' },
];

export function SchoolAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ classes: 0, teachers: 0, students: 0, pendingApprovals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [cls, tch, stu, app] = await Promise.allSettled([
        classesAPI.list(), teachersAPI.list(1, 0), studentsAPI.list(1, 0), approvalsAPI.getPending(1, 0),
      ]);
      setStats({
        classes:          cls.status === 'fulfilled' ? (cls.value?.total || cls.value?.items?.length || 0) : 0,
        teachers:         tch.status === 'fulfilled' ? (tch.value?.total || 0) : 0,
        students:         stu.status === 'fulfilled' ? (stu.value?.total || 0) : 0,
        pendingApprovals: app.status === 'fulfilled' ? ((app.value?.teachers?.total || 0) + (app.value?.parents?.total || 0)) : 0,
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (user?.name || user?.username || 'Admin').split(' ')[0];

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>
          Welcome back to your school dashboard.
        </p>
      </div>

      {/* Stats */}
      <div style={S.statGrid}>
        {STATS.map(({ label, key, icon: Icon, accent, bg }) => (
          <div key={key} style={S.statCard}>
            <div style={{ ...S.statIconWrap, background: bg, color: accent }}>
              <Icon style={{ width: '20px', height: '20px' }} />
            </div>
            <div style={S.statValue}>
              {loading
                ? <span style={{ display: 'inline-block', width: '40px', height: '28px', background: '#e2e8f0', borderRadius: '6px' }} />
                : stats[key].toLocaleString()
              }
            </div>
            <div style={S.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={S.sectionLabel}>Quick Actions</div>
      <div style={S.actionGrid}>
        {ACTIONS.map(({ to, icon: Icon, label, desc, accent, bg }) => (
          <Link
            key={to} to={to}
            style={S.actionCard}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ ...S.actionIcon, background: bg, color: accent }}>
              <Icon style={{ width: '19px', height: '19px' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.actionLabel}>{label}</div>
              <div style={S.actionDesc}>{desc}</div>
            </div>
            <ArrowRight style={{ width: '14px', height: '14px', color: '#cbd5e1', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
