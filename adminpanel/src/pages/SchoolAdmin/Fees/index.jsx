import { useState } from 'react';
import { CreditCard, LayoutGrid, BarChart2 } from 'lucide-react';
import { FeeCollect } from './FeeCollect';
import { FeeClassPlans } from './FeeClassPlans';
import { FeeReports } from './FeeReports';

const TABS = [
  {
    id: 'collect',
    label: 'Collect Payment',
    icon: CreditCard,
    desc: 'Record a fee payment for a student',
    color: 'emerald',
  },
  {
    id: 'create',
    label: 'Manage Fees',
    icon: LayoutGrid,
    desc: 'Create and assign fees to classes',
    color: 'indigo',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart2,
    desc: 'Daily cash, collections & defaulters',
    color: 'violet',
  },
];

const colorMap = {
  emerald: {
    active: 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100',
    icon: 'text-white',
    desc: 'text-emerald-100',
    idle: 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50',
    idleIcon: 'text-emerald-500',
  },
  indigo: {
    active: 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100',
    icon: 'text-white',
    desc: 'text-indigo-100',
    idle: 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50',
    idleIcon: 'text-indigo-500',
  },
  violet: {
    active: 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-100',
    icon: 'text-white',
    desc: 'text-violet-100',
    idle: 'border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50/50',
    idleIcon: 'text-violet-500',
  },
};

export function FeeManager() {
  const [activeTab, setActiveTab] = useState('collect');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Tab Navigation ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const c = colorMap[tab.color];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 ${
                isActive ? c.active : c.idle
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                <Icon className={`w-4.5 h-4.5 ${isActive ? c.icon : c.idleIcon}`} style={{ width: '18px', height: '18px' }} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {tab.label}
                </p>
                <p className={`text-[11px] mt-0.5 leading-snug ${isActive ? c.desc : 'text-slate-400'}`}>
                  {tab.desc}
                </p>
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-3 h-3 overflow-hidden">
                  <div className={`w-3 h-3 rotate-45 translate-y-[-50%] translate-x-[0%] ${
                    tab.color === 'emerald' ? 'bg-emerald-600' : tab.color === 'indigo' ? 'bg-indigo-600' : 'bg-violet-600'
                  }`} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ──────────────────────────────────── */}
      <div className="animate-fade-in">
        {activeTab === 'collect' && <FeeCollect />}
        {activeTab === 'create' && <FeeClassPlans />}
        {activeTab === 'reports' && <FeeReports />}
      </div>
    </div>
  );
}
