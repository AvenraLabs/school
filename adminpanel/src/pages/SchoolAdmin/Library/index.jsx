import { useState } from 'react';
import { BookOpen, BookPlus, RotateCcw, History, BarChart2, Settings } from 'lucide-react';
import { LibraryBooks } from './LibraryBooks';
import { LibraryIssue } from './LibraryIssue';
import { LibraryReturn } from './LibraryReturn';
import { LibraryHistory } from './LibraryHistory';
import { LibraryReports } from './LibraryReports';
import { LibrarySettings } from './LibrarySettings';

const TABS = [
  { id: 'books', label: 'Book Catalog', icon: BookOpen },
  { id: 'issue', label: 'Issue Book', icon: BookPlus },
  { id: 'return', label: 'Return Book', icon: RotateCcw },
  { id: 'history', label: 'Issue History', icon: History },
  { id: 'reports', label: 'Reports & Fines', icon: BarChart2 },
  { id: 'settings', label: 'Policy Settings', icon: Settings },
];

export function LibraryManager() {
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-[#E4E1D8] overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-[8px] transition-all cursor-pointer border-t border-x outline-none ${
                isActive
                  ? 'bg-white border-[#E4E1D8] border-t-[3px] border-t-[#2F6F5E] text-[#2F6F5E] -mb-px shadow-2xs'
                  : 'bg-transparent border-transparent text-[#52607D] hover:text-[#14213D] hover:bg-[#FAFAF8]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2F6F5E]' : 'text-[#8C97AB]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div>
        {activeTab === 'books' && <LibraryBooks />}
        {activeTab === 'issue' && <LibraryIssue />}
        {activeTab === 'return' && <LibraryReturn />}
        {activeTab === 'history' && <LibraryHistory />}
        {activeTab === 'reports' && <LibraryReports />}
        {activeTab === 'settings' && <LibrarySettings />}
      </div>
    </div>
  );
}
