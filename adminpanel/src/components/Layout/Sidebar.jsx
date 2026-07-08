import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, School,
  GraduationCap, UserCheck, BookOpen,
  ClipboardList, Calendar, Bell, FileText,
  Award, LogOut, UserCog,
  Layers, X, Database, Sparkles, Truck,
  Search, MessageSquare, Info
} from 'lucide-react';

// Super admin no longer uses the sidebar — it has its own top-bar layout (SuperAdminPage).
// This sidebar is exclusively for school_admin.

const schoolAdminLinks = [
  { section: 'Daily Operations' },
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/directory', icon: School, label: 'School Registry' },
  { to: '/admin/notifications', icon: Bell, label: 'Announcements' },
  { to: '/admin/transport', icon: Truck, label: 'Transport' },
  { to: '/admin/lost-found', icon: Search, label: 'Lost & Found' },

  { section: 'People & Approvals' },
  { to: '/admin/students', icon: GraduationCap, label: 'Students' },
  { to: '/admin/teachers', icon: UserCog, label: 'Teachers' },
  { to: '/admin/approvals', icon: UserCheck, label: 'Approvals' },

  { section: 'Academic Management' },
  { to: '/admin/timetables', icon: Calendar, label: 'Timetables' },
  { to: '/admin/exams', icon: FileText, label: 'Exams' },
  { to: '/admin/report-cards', icon: Award, label: 'Report Cards' },

  { section: 'System Configuration' },
  { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/admin/assignments', icon: ClipboardList, label: 'Teacher Mapping' },
  { to: '/admin/academic-year', icon: Calendar, label: 'Academic Year' },
  { to: '/admin/login-roster', icon: ClipboardList, label: 'Login Roster' },
  { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/admin/about', icon: Info, label: 'About App' },
];

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = schoolAdminLinks;
  const displayName = user?.name || user?.username || 'Admin';
  const initial = displayName[0].toUpperCase();
  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'School Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 flex flex-col
          lg:relative lg:translate-x-0 lg:z-auto
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-[260px] min-w-[260px]' : '-translate-x-full lg:w-0 lg:min-w-0 lg:overflow-hidden'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0f0c29 0%, #1e1b4b 60%, #1a1740 100%)',
          borderRight: isOpen ? '1px solid rgba(255,255,255,0.07)' : 'none',
        }}
      >

        {/* ── Brand header ── */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{
            padding: '20px 20px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            width: '260px', // Maintain static header width to prevent text squishing during transitions
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
            >
              <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                School App
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(165,180,252,0.55)', marginTop: '4px', fontWeight: 500 }}>
                {roleLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{ width: '30px', height: '30px', color: 'rgba(148,163,184,0.6)', cursor: 'pointer' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{ padding: '8px 10px', scrollbarWidth: 'none' }}
        >
          {links.map((item, idx) => {
            /* Section label */
            if (item.section) {
              return (
                <p
                  key={`s-${idx}`}
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'rgba(148,163,184,0.4)',
                    padding: idx === 0 ? '6px 10px 8px' : '22px 10px 8px',
                  }}
                >
                  {item.section}
                </p>
              );
            }

            /* Nav link */
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.endsWith('dashboard')}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  isActive ? 'nav-link-active' : 'nav-link-idle'
                }
                style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '2px' }}
              >
                <Icon style={{ width: '17px', height: '17px', flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* ── User footer ── */}
        <div
          className="flex-shrink-0"
          style={{
            padding: '12px 10px 14px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* User card */}
          <div
            className="flex items-center gap-3"
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              marginBottom: '4px',
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(148,163,184,0.5)', marginTop: '3px' }}>
                {roleLabel}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="sign-out-btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              padding: '11px 12px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 500,
              color: 'rgba(148,163,184,0.7)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
              e.currentTarget.style.color = 'rgb(252,165,165)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(148,163,184,0.7)';
            }}
          >
            <LogOut style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Scoped styles — avoids Tailwind purge issues with dynamic active states */}
      <style>{`
        .nav-link-active {
          display: flex;
          align-items: center;
          padding: 11px 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, rgba(99,102,241,0.85), rgba(139,92,246,0.75));
          box-shadow: 0 2px 14px rgba(99,102,241,0.3);
          text-decoration: none;
        }
        .nav-link-idle {
          display: flex;
          align-items: center;
          padding: 11px 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: rgba(148,163,184,0.8);
          background: transparent;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .nav-link-idle:hover {
          background: rgba(255,255,255,0.07);
          color: #fff;
        }
      `}</style>
    </>
  );
}
