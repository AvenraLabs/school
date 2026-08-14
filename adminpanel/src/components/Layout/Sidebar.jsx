import { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  LayoutDashboard,
  BarChart3,
  School,
  GraduationCap,
  UserCheck,
  BookOpen,
  ClipboardList,
  Calendar,
  Clock,
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
  CheckCircle2,
  X,
  IndianRupee,
  Library,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  User,
  Sliders,
  Sparkles,
  Database,
  ShieldAlert,
} from 'lucide-react';

import { authAPI, uploadAPI } from '../../api';
import { getApiAssetUrl } from '../../api/axios';

const schoolAdminGroups = [
  {
    group: 'Daily Operations',
    defaultOpen: true,
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/fees', icon: IndianRupee, label: 'Fee Management', moduleKey: 'finance' },
      { to: '/admin/library', icon: Library, label: 'Library', moduleKey: 'library' },
      { to: '/admin/notifications', icon: Bell, label: 'Announcements' },
      { to: '/admin/transport', icon: Truck, label: 'Transport', moduleKey: 'transport' },
      { to: '/admin/lost-found', icon: Search, label: 'Lost & Found' },
      { to: '/admin/analytics', icon: BarChart3, label: 'School Analytics' },
    ],
  },
  {
    group: 'Academic Management',
    defaultOpen: true,
    items: [
      { to: '/admin/timetable-hub?tab=schedule', icon: Calendar, label: 'Timetables' },
      { to: '/admin/bell-schedules', icon: Bell, label: 'Period Templates' },
      { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
      { to: '/admin/assignments', icon: ClipboardList, label: 'Class & Subject Teachers' },
      { to: '/admin/exams', icon: FileText, label: 'Exams' },
      { to: '/admin/question-papers', icon: Sparkles, label: 'Question Papers (AI)', moduleKey: 'ai_tools' },
    ],
  },
  {
    group: 'People & Settings',
    defaultOpen: false,
    items: [
      { to: '/admin/students', icon: GraduationCap, label: 'Students' },
      { to: '/admin/teachers', icon: UserCog, label: 'Teachers' },
      { to: '/admin/approvals', icon: UserCheck, label: 'Approvals' },
      { to: '/admin/directory', icon: School, label: 'School Registry' },
      { to: '/admin/login-roster', icon: ClipboardList, label: 'Login Roster' },
      { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
    ],
  },
];

const superAdminLinks = [
  { section: 'Platform Operations' },
  { to: '/super-admin', icon: LayoutDashboard, label: 'SuperAdmin Desk' },
  { to: '/super-admin/settings', icon: Sliders, label: 'School Settings' },
  { to: '/super-admin/billing', icon: IndianRupee, label: 'Billing & Telemetry' },
  { to: '/super-admin/feedback', icon: MessageSquare, label: 'Support & Feedback' },

  { section: 'System Management' },
  { to: '/super-admin/seeder', icon: Database, label: 'Seeder' },
];

export function Sidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }) {
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

  // Collapsible sidebar groups — Daily Operations open by default
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(schoolAdminGroups.map((g) => [g.group, g.defaultOpen]))
  );
  const toggleGroup = (group) =>
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));

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
      setErrorMsg('Image size must be less than 5MB.');
      event.target.value = '';
      return;
    }

    try {
      setErrorMsg('');
      setIsUploading(true);
      const response = await uploadAPI.uploadAvatar(file);
      const uploadedUrl = response?.url || response?.data?.url;

      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        setSuccessMsg('Photo uploaded. Click Save to update profile.');
      } else {
        setErrorMsg('Upload response missing image URL.');
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setErrorMsg('Name is required.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg('');

      const response = await authAPI.updateProfile({
        name: profileName.trim(),
        avatar_url: avatarUrl,
      });

      const updatedUser = response?.user || response?.data?.user || {
        ...user,
        name: profileName.trim(),
        avatar_url: avatarUrl,
      };

      updateUser(updatedUser);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Save profile error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#14213D]/40 backdrop-blur-[2px] z-40 lg:hidden"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-[#E4E1D8] flex flex-col justify-between shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform lg:transition-none`}
      >
        {/* Top Brand & Header */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-14 px-4 border-b border-[#EDEAE1] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-display font-bold text-sm text-[#14213D] tracking-tight leading-tight">
                    SchooliQ <span className="text-[10px] uppercase tracking-wider text-[#2F6F5E] font-semibold">ERP</span>
                  </span>
                  <span className="text-[10px] text-[#8C97AB] truncate">Admin Console</span>
                </div>
              )}
            </div>

            {/* Collapse toggle desktop button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-6 h-6 rounded-[6px] border border-[#E4E1D8] bg-[#FAFAF8] text-[#52607D] hover:bg-[#EAF3F0] hover:text-[#2F6F5E] items-center justify-center cursor-pointer transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Nav links list */}
          <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
            {user?.role === 'super_admin' ? (
              /* Super Admin: flat list */
              superAdminLinks.map((item, idx) => {
                if (item.section) {
                  if (isCollapsed) return <div key={idx} className="my-2 border-t border-[#EDEAE1]" />;
                  return (
                    <div key={idx} className="pt-3 pb-1.5 px-2.5 text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                      {item.section}
                    </div>
                  );
                }
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/super-admin'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-xs font-medium transition-all ${
                        isActive ? 'bg-[#EAF3F0] text-[#2F6F5E] font-semibold border-l-[3px] border-l-[#2F6F5E] pl-2' : 'text-[#52607D] hover:bg-[#FAFAF8] hover:text-[#14213D]'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })
            ) : (
              /* School Admin: collapsible groups filtered by licensed modules */
              schoolAdminGroups.map((grp) => {
                const isOpen = openGroups[grp.group];
                const enabledModules = user?.enabled_modules || user?.school?.enabled_modules || {};
                const visibleItems = grp.items.filter((item) => {
                  if (!item.moduleKey) return true;
                  return enabledModules[item.moduleKey] !== false;
                });

                if (visibleItems.length === 0) return null;

                return (
                  <div key={grp.group}>
                    {/* Group header toggle */}
                    {!isCollapsed ? (
                      <button
                        onClick={() => toggleGroup(grp.group)}
                        className="w-full flex items-center justify-between px-2.5 pt-3 pb-1.5 text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono hover:text-[#52607D] transition-colors cursor-pointer group"
                      >
                        <span>{grp.group}</span>
                        <ChevronDown
                          className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                      </button>
                    ) : (
                      <div className="my-2 border-t border-[#EDEAE1]" />
                    )}

                    {/* Group items — animated collapse */}
                    <AnimatePresence initial={false}>
                      {(isOpen || isCollapsed) && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: 'easeInOut' }}
                          className="overflow-hidden space-y-0.5"
                        >
                          {visibleItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-xs font-medium transition-all ${
                                    isActive
                                      ? 'bg-[#EAF3F0] text-[#2F6F5E] font-semibold border-l-[3px] border-l-[#2F6F5E] pl-2'
                                      : 'text-[#52607D] hover:bg-[#FAFAF8] hover:text-[#14213D]'
                                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                                }
                                title={isCollapsed ? item.label : undefined}
                              >
                                <Icon className="w-4 h-4 shrink-0" />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                              </NavLink>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </nav>

          {/* Bottom user profile menu with Radix DropdownMenu */}
          <div className="p-2.5 border-t border-[#EDEAE1] shrink-0 bg-[#FAFAF8]">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className={`w-full flex items-center gap-2.5 p-2 rounded-[8px] hover:bg-white border border-transparent hover:border-[#E4E1D8] transition-colors outline-none cursor-pointer text-left ${
                    isCollapsed ? 'justify-center p-1.5' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    {avatarUrl ? (
                      <img
                        src={getApiAssetUrl(avatarUrl)}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover border border-[#E4E1D8]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#2F6F5E] text-white flex items-center justify-center font-display font-semibold text-xs shadow-xs">
                        {initial}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#14213D] truncate leading-tight">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-[#8C97AB] truncate">
                        {roleLabel}
                      </p>
                    </div>
                  )}

                  {!isCollapsed && <MoreVertical className="w-4 h-4 text-[#8C97AB] shrink-0" />}
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="w-56 bg-white border border-[#E4E1D8] rounded-[10px] shadow-[0_4px_16px_rgba(20,33,61,0.08)] p-1.5 z-50 text-xs text-[#14213D] animate-in zoom-in-95 duration-100 outline-none"
                >
                  <div className="px-2 py-1.5 border-b border-[#EDEAE1] mb-1">
                    <p className="font-semibold truncate">{displayName}</p>
                    <p className="text-[10px] text-[#8C97AB] truncate">{user?.email || 'admin@schooliq.edu'}</p>
                  </div>

                  <DropdownMenu.Item
                    onClick={openProfileModal}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] cursor-pointer hover:bg-[#EAF3F0] hover:text-[#2F6F5E] transition-colors outline-none"
                  >
                    <User className="w-3.5 h-3.5 text-[#52607D]" />
                    <span>Edit Admin Profile</span>
                  </DropdownMenu.Item>

                  {user?.role === 'super_admin' && (
                    <DropdownMenu.Item
                      onClick={() => navigate('/super-admin')}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] cursor-pointer hover:bg-[#FDF8EC] hover:text-[#B8860B] transition-colors outline-none"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span>Super Admin Panel</span>
                    </DropdownMenu.Item>
                  )}

                  <DropdownMenu.Separator className="h-px bg-[#EDEAE1] my-1" />

                  <DropdownMenu.Item
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] cursor-pointer hover:bg-[#FDF2F1] hover:text-[#B0403A] text-[#B0403A] transition-colors outline-none font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </motion.aside>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Admin Profile Settings"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-[8px] bg-[#FDF2F1] border border-[#F8D7D5] text-xs text-[#B0403A]">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-[8px] bg-[#EAF3F0] border border-[#D3E6E0] text-xs text-[#2F6F5E] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center p-4 bg-[#FAFAF8] border border-[#E4E1D8] rounded-[10px]">
            <div className="relative group mb-3">
              {avatarUrl ? (
                <img
                  src={getApiAssetUrl(avatarUrl)}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#2F6F5E] text-white flex items-center justify-center font-display font-bold text-2xl shadow-xs">
                  {initial}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-[#14213D]/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              type="button"
              loading={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </Button>
            <p className="text-[10px] text-[#8C97AB] mt-1">JPG, PNG or WEBP up to 5MB</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">
              Full Name
            </label>
            <Input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Principal Sarah Jenkins"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setIsProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSaving}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
