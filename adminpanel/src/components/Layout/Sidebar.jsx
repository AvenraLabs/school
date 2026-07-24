import { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  BarChart3,
  School,
  GraduationCap,
  UserCheck,
  BookOpen,
  ClipboardList,
  Calendar,
  Bell,
  FileText,
  LogOut,
  UserCog,
  Truck,
  Search,
  MessageSquare,
  Info,
  Camera,
  Loader2,
  PencilLine,
  CheckCircle2,
  X,
  IndianRupee,
  Library,
} from 'lucide-react';

import { authAPI, uploadAPI } from '../../api';
import { getApiAssetUrl } from '../../api/axios';

const schoolAdminLinks = [
  { section: 'Daily Operations' },
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/fees', icon: IndianRupee, label: 'Fee Management' },
  { to: '/admin/library', icon: Library, label: 'Library' },
  { to: '/admin/analytics', icon: BarChart3, label: 'School Analytics' },

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

  const displayName = user?.name || user?.username || 'Admin';
  const initial = displayName[0].toUpperCase();
  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'School Admin';

  const openProfileModal = () => {
    setProfileName(user?.name || '');
    setAvatarUrl(user?.avatar_url || '');
    setErrorMsg('');
    setSuccessMsg('');
    setIsProfileModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Please upload a JPG, PNG, or WEBP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Photo must be smaller than 5MB.');
      event.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg('');
      setSuccessMsg('');

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
      event.target.value = '';
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

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
      }, 900);
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
      setSuccessMsg('');

      await authAPI.updateProfile({ name: profileName, avatar_url: '' });
      updateUser({ avatar_url: '' });
      setAvatarUrl('');
    } catch (err) {
      console.error(err);
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
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed bottom-0 left-0 top-0 z-50 flex flex-col
          transition-all duration-300 ease-in-out
          lg:relative lg:z-auto lg:translate-x-0
          ${isOpen ? 'w-[260px] min-w-[260px] translate-x-0' : '-translate-x-full lg:w-0 lg:min-w-0 lg:overflow-hidden'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0f0c29 0%, #1e1b4b 60%, #1a1740 100%)',
          borderRight: isOpen ? '1px solid rgba(255,255,255,0.07)' : 'none',
        }}
      >
        <div
          className="flex flex-shrink-0 items-center justify-between"
          style={{
            padding: '20px 20px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            width: '260px',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex flex-shrink-0 items-center justify-center"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
            >
              <School style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
              SchoolIQ
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{ width: '30px', height: '30px', color: 'rgba(148,163,184,0.6)', cursor: 'pointer' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto"
          style={{ padding: '8px 10px', scrollbarWidth: 'none' }}
        >
          {schoolAdminLinks.map((item, idx) => {
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

            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.endsWith('dashboard')}
                onClick={handleLinkClick}
                className={({ isActive }) => (isActive ? 'nav-link-active' : 'nav-link-idle')}
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

        <div
          className="flex-shrink-0"
          style={{
            padding: '14px 12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <button
            type="button"
            onClick={openProfileModal}
            className="group flex w-full items-center gap-3 rounded-xl text-left transition-colors hover:bg-white/[0.04]"
            style={{
              padding: '8px 6px',
              marginBottom: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span
              className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-800 text-sm font-bold text-white"
              style={{
                width: '38px',
                height: '38px',
              }}
            >
              {user?.avatar_url ? (
                <img
                  src={getApiAssetUrl(user.avatar_url)}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initial
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  color: 'rgba(226,232,240,0.56)',
                  marginTop: '3px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {roleLabel}
              </span>
            </span>

            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors group-hover:bg-white/10 group-hover:text-white">
              <PencilLine className="h-3.5 w-3.5" />
            </span>
          </button>

          <button
            type="button"
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
            onMouseEnter={event => {
              event.currentTarget.style.background = 'rgba(239,68,68,0.12)';
              event.currentTarget.style.color = 'rgb(252,165,165)';
            }}
            onMouseLeave={event => {
              event.currentTarget.style.background = 'transparent';
              event.currentTarget.style.color = 'rgba(148,163,184,0.7)';
            }}
          >
            <LogOut style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Edit profile</h3>
                <p className="mt-0.5 text-xs text-slate-500">Update your photo and display name.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 px-5 pb-5 pt-5">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={isUploading || isSaving}
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-2xl font-semibold text-slate-600 disabled:cursor-not-allowed"
                >
                  {avatarUrl ? (
                    <img
                      src={getApiAssetUrl(avatarUrl)}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-950/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  </span>
                </button>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950">{profileName || displayName}</p>
                  <p className="mt-1 text-xs text-slate-500">{roleLabel}</p>
                  <p className="mt-2 text-xs text-slate-400">JPG, PNG, or WEBP. Max 5MB.</p>
                  <button
                    type="button"
                    disabled={isUploading || isSaving}
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading ? 'Uploading...' : avatarUrl ? 'Change photo' : 'Upload photo'}
                  </button>
                  {avatarUrl && !isUploading && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleDeleteAvatar}
                      className="ml-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {(errorMsg || successMsg) && (
                <div
                  className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${
                    errorMsg
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {successMsg && <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />}
                  <span>{errorMsg || successMsg}</span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileChange}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
              />

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Display name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={event => setProfileName(event.target.value)}
                  placeholder="Enter your display name"
                  disabled={isSaving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
