import React from 'react';

export function StatusBadge({ status, label: customLabel, size = 'default' }) {
  const normKey = String(status ?? '').toLowerCase();

  const getVariant = (key) => {
    if (['active', 'approved', 'published', 'graduated', 'paid', 'true'].includes(key)) {
      return {
        bg: 'bg-[#EAF3F0]',
        text: 'text-[#2F6F5E]',
        border: 'border-[#D3E6E0]',
        dot: 'bg-[#2F6F5E]',
      };
    }
    if (['pending', 'draft', 'partial', 'warning', 'in-review'].includes(key)) {
      return {
        bg: 'bg-[#FDF8EC]',
        text: 'text-[#B8860B]',
        border: 'border-[#F7E7C4]',
        dot: 'bg-[#B8860B]',
      };
    }
    if (['rejected', 'dropped', 'terminated', 'overdue', 'unpaid', 'danger', 'failed'].includes(key)) {
      return {
        bg: 'bg-[#FDF2F1]',
        text: 'text-[#B0403A]',
        border: 'border-[#F8D7D5]',
        dot: 'bg-[#B0403A]',
      };
    }
    return {
      bg: 'bg-[#FAFAF8]',
      text: 'text-[#52607D]',
      border: 'border-[#E4E1D8]',
      dot: 'bg-[#8C97AB]',
    };
  };

  const labelMap = {
    true: 'Active',
    false: 'Inactive',
  };

  const variant = getVariant(normKey);
  const displayLabel = customLabel || labelMap[normKey] || status || 'N/A';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variant.bg} ${variant.text} ${variant.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${variant.dot}`} />
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
}
