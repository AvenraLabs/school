import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../common/CommandPalette';
import { Menu, Search, Command as CommandIcon, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const titleMap = {
  '/admin/dashboard': 'Dashboard Overview',
  '/admin/fees': 'Fee Management & Collections',
  '/admin/library': 'Library & Catalog System',
  '/admin/analytics': 'School Performance Analytics',
  '/admin/directory': 'Master School Registry',
  '/admin/notifications': 'Announcements & Push Center',
  '/admin/transport': 'Transport & Bus Fleet Logistics',
  '/admin/lost-found': 'Campus Lost & Found',
  '/admin/students': 'Student Directory & Records',
  '/admin/teachers': 'Faculty & Staff Roster',
  '/admin/approvals': 'Registration Approvals Queue',
  '/admin/timetables': 'Class Master Timetables',
  '/admin/exams': 'Exams, Marks & Report Cards',
  '/admin/subjects': 'Curriculum & Subject Catalog',
  '/admin/assignments': 'Teacher Class Mapping',
  '/admin/academic-year': 'Academic Sessions & Term Setup',
  '/admin/login-roster': 'Portal Credentials Roster',
  '/admin/audit-logs': 'System Security Audit Logs',
  '/admin/feedback': 'Feedback & Helpdesk',
};

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const currentTitle = titleMap[location.pathname] || 'School Administration';

  return (
    <div className="flex h-screen w-full bg-[#FAFAF8] overflow-hidden text-[#14213D]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Command Palette mounted globally */}
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />

      {/* Main Content Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Slim Sticky Top Header */}
        <header className="h-14 px-4 sm:px-6 bg-white border-b border-[#EDEAE1] flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0 shadow-[0_1px_2px_rgba(20,33,61,0.02)]">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 rounded-[6px] border border-[#E4E1D8] bg-[#FAFAF8] text-[#52607D] flex items-center justify-center cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex flex-col min-w-0">
              <h1 className="font-display font-bold text-base text-[#14213D] truncate tracking-tight">
                {currentTitle}
              </h1>
            </div>
          </div>

          {/* Top Actions: Command Palette trigger & Institutional Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#FAFAF8] hover:bg-[#EAF3F0] border border-[#E4E1D8] hover:border-[#D3E6E0] text-xs text-[#52607D] transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#8C97AB]" />
              <span className="hidden sm:inline">Search modules</span>
              <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#2F6F5E] bg-white border border-[#E4E1D8] rounded-[4px] shadow-2xs">
                Ctrl + K
              </kbd>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF3F0] border border-[#D3E6E0] text-[11px] font-medium text-[#2F6F5E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F5E] animate-pulse" />
              <span>{user?.school_name || 'Main Campus'}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body Container */}
        <main className="flex-1 overflow-y-auto bg-[#FAFAF8]">
          <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
