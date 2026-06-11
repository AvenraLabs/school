import React from 'react';

export function StatsCard({ icon, label, value, color = 'indigo', subtext }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
    sky: 'bg-sky-50 text-sky-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${colorMap[color] || colorMap.indigo}`}>
        {icon}
      </div>
      <div>
        <div className="stat-card-value">{value ?? '—'}</div>
        <div className="stat-card-label">{label}</div>
        {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
      </div>
    </div>
  );
}
