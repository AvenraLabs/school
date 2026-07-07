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
    transferred: 'badge-info',
    dropped: 'badge-rejected',
    graduated: 'badge-approved',
    resigned: 'badge-inactive',
    retired: 'badge-info',
    terminated: 'badge-rejected',
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
        key === 'active' || key === 'approved' || key === 'true' || key === 'published' || key === 'graduated' ? 'bg-emerald-500' :
        key === 'pending' || key === 'draft' ? 'bg-amber-500' :
        key === 'rejected' || key === 'dropped' || key === 'terminated' ? 'bg-rose-500' :
        key === 'inactive' || key === 'false' || key === 'resigned' ? 'bg-slate-400' :
        'bg-indigo-500'
      }`} />
      {label}
    </span>
  );
}
