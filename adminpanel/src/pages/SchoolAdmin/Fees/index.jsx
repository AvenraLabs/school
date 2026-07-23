import { useState } from 'react';
import { IndianRupee, Layers, Tag, History, PieChart, Wallet } from 'lucide-react';
import { FeeCollect } from './FeeCollect';
import { FeePaymentHistory } from './FeePaymentHistory';
import { FeeClassPlans } from './FeeClassPlans';
import { FeeCategories } from './FeeCategories';
import { FeeReports } from './FeeReports';

const TASKS = [
  { id: 'collect', label: 'Collect Payment', icon: Wallet, desc: 'Receive daily payments & print receipts' },
  { id: 'history', label: 'Payment History', icon: History, desc: 'View records & void payments' },
  { id: 'plans', label: 'Class Fee Plans', icon: Layers, desc: 'Set up fee plans per class' },
  { id: 'categories', label: 'Fee Categories', icon: Tag, desc: 'Define tuition, transport, books, etc.' },
  { id: 'reports', label: 'Reports', icon: PieChart, desc: 'Collection summary & defaulters' },
];

export function FeeManager() {
  const [activeTask, setActiveTask] = useState('collect');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-600" /> Fee Management
          </h1>
        </div>
      </div>

      {/* Task Navigation Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {TASKS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTask === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTask(t.id)}
              className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-200/80 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
              <span className="text-xs font-bold block leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Task View */}
      <div>
        {activeTask === 'collect' && <FeeCollect />}
        {activeTask === 'history' && <FeePaymentHistory />}
        {activeTask === 'plans' && <FeeClassPlans />}
        {activeTask === 'categories' && <FeeCategories />}
        {activeTask === 'reports' && <FeeReports />}
      </div>
    </div>
  );
}
