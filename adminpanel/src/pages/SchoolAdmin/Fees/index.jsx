import { useState } from 'react';
import { CreditCard, LayoutGrid, BarChart2, LayoutDashboard, Receipt } from 'lucide-react';
import { FeeCollect } from './FeeCollect';
import { FeeClassPlans } from './FeeClassPlans';
import { FeeReports } from './FeeReports';
import { FinanceDashboard } from './FinanceDashboard';
import { ExpenseManager } from './ExpenseManager';

const TABS = [
  {
    id: 'dashboard',
    label: 'Finance Overview',
    icon: LayoutDashboard,
    desc: 'Real-time cash flow & metrics',
  },
  {
    id: 'collect',
    label: 'Fee Collection',
    icon: CreditCard,
    desc: 'Collect fees & print receipts',
  },
  {
    id: 'create',
    label: 'Fee Structures',
    icon: LayoutGrid,
    desc: 'Configure fee heads & plans',
  },
  {
    id: 'expenses',
    label: 'Expense Manager',
    icon: Receipt,
    desc: 'Track daily vouchers & payees',
  },
  {
    id: 'reports',
    label: 'Reports & Defaulters',
    icon: BarChart2,
    desc: 'Audits, cash & ledgers',
  },
];

export function FeeManager() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Tab Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-[10px] text-left transition-all border outline-none cursor-pointer ${
                isActive
                  ? 'bg-[#EAF3F0] border-[#2F6F5E] text-[#2F6F5E] border-l-[3px] shadow-xs'
                  : 'bg-white border-[#E4E1D8] text-[#52607D] hover:bg-[#FAFAF8] hover:text-[#14213D]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2F6F5E]' : 'text-[#8C97AB]'}`} />
                <span className="font-display font-semibold text-xs truncate">{tab.label}</span>
              </div>
              <p className="text-[10px] text-[#8C97AB] truncate leading-tight">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="transition-opacity duration-150">
        {activeTab === 'dashboard' && <FinanceDashboard />}
        {activeTab === 'collect' && <FeeCollect />}
        {activeTab === 'create' && <FeeClassPlans />}
        {activeTab === 'expenses' && <ExpenseManager />}
        {activeTab === 'reports' && <FeeReports />}
      </div>
    </div>
  );
}
