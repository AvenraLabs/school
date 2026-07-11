import { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, School,
  GraduationCap, UserCheck, BookOpen,
  ClipboardList, Calendar, Bell, FileText,
  Award, LogOut, UserCog,
  Layers, X, Database, Sparkles, Truck,
  Search, MessageSquare, Info, Camera, Loader2
} from 'lucide-react';
import { authAPI, uploadAPI } from '../../api';

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

  { section: 'System Configuration' },
  { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/admin/assignments', icon: ClipboardList, label: 'Teacher Mapping' },
  { to: '/admin/academic-year', icon: Calendar, label: 'Academic Year' },
  { to: '/admin/login-roster', icon: ClipboardList, label: 'Login Roster' },
  { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/admin/about', icon: Info, label: 'About App' },
];

export function Sidebar({ isOpen, onClose }) {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const links = schoolAdminLinks;
  const displayName = user?.name || user?.username || 'Admin';
  const initial = displayName[0].toUpperCase();
  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'School Admin';

  const getAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    let cleanBackend = backendUrl.replace(/\/$/, '');
    const hasApi = cleanBackend.endsWith('/api');
    const host = hasApi ? cleanBackend.replace(/\/api$/, '') : cleanBackend;
    
    let cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (cleanPath.startsWith('/uploads')) {
      cleanPath = `/api${cleanPath}`;
    } else if (hasApi && !cleanPath.startsWith('/api')) {
      cleanPath = `/api${cleanPath}`;
    }
    return `${host}${cleanPath}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrorMsg('');
      const res = await uploadAPI.uploadAvatar(file);
      if (res.success) {
        setAvatarUrl(res.url);
      } else {
        setErrorMsg('Upload failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      await authAPI.updateProfile({
        name: profileName,
        avatar_url: avatarUrl,
      });
      updateUser({
        name: profileName,
        avatar_url: avatarUrl,
      });
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => {
        setIsProfileModalOpen(false);
        setSuccessMsg('');
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsSaving(true);
      setErrorMsg('');
      await authAPI.updateProfile({ name: profileName, avatar_url: '' });
      updateUser({ avatar_url: '' });
      setAvatarUrl('');
    } catch (err) {
      setErrorMsg('Failed to remove avatar.');
    } finally {
      setIsSaving(false);
    }
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
              <School style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                SchoolIQ
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
            onClick={() => {
              setProfileName(user?.name || '');
              setAvatarUrl(user?.avatar_url || '');
              setIsProfileModalOpen(true);
            }}
            className="flex items-center gap-3 cursor-pointer group"
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              marginBottom: '4px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0 overflow-hidden"
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
              {user?.avatar_url ? (
                <img
                  src={getAssetUrl(user.avatar_url)}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initial
              )}
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

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <h3 className="text-base font-bold text-white">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 text-xs font-semibold text-rose-200 bg-rose-500/20 border border-rose-500/30 rounded-lg">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 text-xs font-semibold text-emerald-200 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                  {successMsg}
                </div>
              )}

              {/* Avatar Uploader Section */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/50 bg-slate-800 flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={getAssetUrl(avatarUrl)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">{initial}</span>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploading || isSaving}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    disabled={isUploading || isSaving}
                    onClick={handleDeleteAvatar}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Display Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="Enter name"
                  disabled={isSaving}
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-transparent hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
