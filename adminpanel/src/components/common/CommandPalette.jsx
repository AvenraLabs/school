import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
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
  UserCog,
  Truck,
  Search as SearchIcon,
  MessageSquare,
  Info,
  IndianRupee,
  Library,
  Sparkles,
  Command as CommandIcon
} from 'lucide-react';

const navigationItems = [
  { group: 'Daily Operations', label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { group: 'Daily Operations', label: 'Fee Management', to: '/admin/fees', icon: IndianRupee },
  { group: 'Daily Operations', label: 'Library', to: '/admin/library', icon: Library },
  { group: 'Daily Operations', label: 'School Analytics', to: '/admin/analytics', icon: BarChart3 },
  { group: 'Daily Operations', label: 'School Registry', to: '/admin/directory', icon: School },
  { group: 'Daily Operations', label: 'Announcements', to: '/admin/notifications', icon: Bell },
  { group: 'Daily Operations', label: 'Transport Logistics', to: '/admin/transport', icon: Truck },
  { group: 'Daily Operations', label: 'Lost & Found', to: '/admin/lost-found', icon: SearchIcon },
  
  { group: 'People & Approvals', label: 'Student Directory', to: '/admin/students', icon: GraduationCap },
  { group: 'People & Approvals', label: 'Teacher Directory', to: '/admin/teachers', icon: UserCog },
  { group: 'People & Approvals', label: 'Pending Approvals', to: '/admin/approvals', icon: UserCheck },

  { group: 'Academic Management', label: 'Class Timetables', to: '/admin/timetables', icon: Calendar },
  { group: 'Academic Management', label: 'Exams & Marks', to: '/admin/exams', icon: FileText },

  { group: 'System Configuration', label: 'Subject Catalog', to: '/admin/subjects', icon: BookOpen },
  { group: 'System Configuration', label: 'Teacher Mapping', to: '/admin/assignments', icon: ClipboardList },
  { group: 'System Configuration', label: 'Academic Year Setup', to: '/admin/academic-year', icon: Calendar },
  { group: 'System Configuration', label: 'Login Credentials Roster', to: '/admin/login-roster', icon: ClipboardList },
  { group: 'System Configuration', label: 'System Audit Logs', to: '/admin/audit-logs', icon: Sparkles },
  { group: 'System Configuration', label: 'Feedback & Support', to: '/admin/feedback', icon: MessageSquare },
];

export function CommandPalette({ open, setOpen }) {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  if (!open) return null;

  const handleSelect = (path) => {
    setOpen(false);
    navigate(path);
  };

  const groups = Array.from(new Set(navigationItems.map(item => item.group)));

  return (
    <div className="fixed inset-0 z-50 bg-[#14213D]/40 backdrop-blur-[2px] flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-xl bg-white border border-[#E4E1D8] rounded-[10px] shadow-[0_8px_30px_rgba(20,33,61,0.12)] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <Command className="w-full bg-white">
          <div className="flex items-center border-b border-[#EDEAE1] px-3.5 py-2.5">
            <SearchIcon className="w-4 h-4 text-[#8C97AB] mr-2.5 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search pages, modules, or press Esc to exit..."
              className="w-full bg-transparent text-sm text-[#14213D] placeholder-[#8C97AB] outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-medium text-[#52607D] bg-[#FAFAF8] border border-[#E4E1D8] rounded-[4px] font-mono select-none">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-[#EDEAE1]">
            <Command.Empty className="p-6 text-center text-xs text-[#52607D]">
              No matching pages found. Try searching for "Students", "Fees", or "Timetables".
            </Command.Empty>

            {groups.map((groupName) => (
              <Command.Group key={groupName} heading={groupName} className="py-1.5 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#8C97AB] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
                {navigationItems
                  .filter((item) => item.group === groupName)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <Command.Item
                        key={item.to}
                        value={item.label}
                        onSelect={() => handleSelect(item.to)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-xs text-[#14213D] cursor-pointer aria-selected:bg-[#EAF3F0] aria-selected:text-[#2F6F5E] transition-colors"
                      >
                        <div className="w-6 h-6 rounded-[4px] bg-[#FAFAF8] border border-[#E4E1D8] flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-[#52607D]" />
                        </div>
                        <span className="font-medium flex-1">{item.label}</span>
                        <span className="text-[10px] text-[#8C97AB] font-mono">{item.to}</span>
                      </Command.Item>
                    );
                  })}
              </Command.Group>
            ))}
          </Command.List>

          <div className="border-t border-[#EDEAE1] bg-[#FAFAF8] px-3.5 py-2 flex items-center justify-between text-[11px] text-[#8C97AB]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white border border-[#E4E1D8] rounded text-[10px]">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white border border-[#E4E1D8] rounded text-[10px]">↵</kbd> select
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#2F6F5E] font-medium">
              <CommandIcon className="w-3 h-3" /> SchooliQ Palette
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
