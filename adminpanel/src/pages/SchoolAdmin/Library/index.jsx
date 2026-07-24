import { useState } from 'react';
import { BookOpen, BookPlus, RotateCcw, History, BarChart2, Settings } from 'lucide-react';
import { LibraryBooks } from './LibraryBooks';
import { LibraryIssue } from './LibraryIssue';
import { LibraryReturn } from './LibraryReturn';
import { LibraryHistory } from './LibraryHistory';
import { LibraryReports } from './LibraryReports';
import { LibrarySettings } from './LibrarySettings';

const TABS = [
  { id: 'books',    label: 'Books',       icon: BookOpen,   desc: 'Master book register' },
  { id: 'issue',    label: 'Issue Book',  icon: BookPlus,   desc: 'Issue to a student' },
  { id: 'return',   label: 'Return Book', icon: RotateCcw,  desc: 'Collect returned books' },
  { id: 'history',  label: 'History',     icon: History,    desc: 'Full issue log' },
  { id: 'reports',  label: 'Reports',     icon: BarChart2,  desc: 'Books, Issued, Overdue, Lost' },
  { id: 'settings', label: 'Settings',    icon: Settings,   desc: 'Loan period & notifications' },
];

export function LibraryManager() {
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" /> Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">Digital library register — issue, return, and track books</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`library-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-200/80 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
              <span className="text-xs font-bold block leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div>
        {activeTab === 'books'    && <LibraryBooks />}
        {activeTab === 'issue'    && <LibraryIssue />}
        {activeTab === 'return'   && <LibraryReturn />}
        {activeTab === 'history'  && <LibraryHistory />}
        {activeTab === 'reports'  && <LibraryReports />}
        {activeTab === 'settings' && <LibrarySettings />}
      </div>
    </div>
  );
}
