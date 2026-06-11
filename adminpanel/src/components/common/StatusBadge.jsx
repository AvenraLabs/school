import React from 'react';

export function StatusBadge({ status, size = 'default' }) {
  const classMap = {
    active: 'badge-active',
    inactive: 'badge-inactive',
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    locked: 'badge-info',
    published: 'badge-approved',
    draft: 'badge-pending',
    true: 'badge-active',
    false: 'badge-inactive',
  };

  const labelMap = {
    true: 'Active',
    false: 'Inactive',
  };

  const key = String(status).toLowerCase();
  const className = classMap[key] || 'badge-info';
  const label = labelMap[key] || status;

  return (
    <span className={`${className} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        key === 'active' || key === 'approved' || key === 'true' || key === 'published' ? 'bg-emerald-500' :
        key === 'pending' || key === 'draft' ? 'bg-amber-500' :
        key === 'rejected' ? 'bg-rose-500' :
        key === 'inactive' || key === 'false' ? 'bg-slate-400' :
        'bg-indigo-500'
      }`} />
      {label}
    </span>
  );
}
