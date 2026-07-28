import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatsCard({
  title,
  value,
  icon: Icon,
  subtext,
  trend = null, // 'up' | 'down' | null
  trendValue = null,
  active = false, // If true, adds the 3px signature teal left border
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-[10px] border border-[#E4E1D8] p-4.5 shadow-[0_1px_2px_rgba(20,33,61,0.04)] relative overflow-hidden transition-all hover:shadow-[0_2px_6px_rgba(20,33,61,0.06)] ${
        active ? 'border-l-[3px] border-l-[#2F6F5E]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-[#52607D] tracking-tight">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-[6px] bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-display font-bold text-2xl text-[#14213D] tabular-nums tracking-tight">
          {value}
        </span>

        {trendValue && (
          <span
            className={`inline-flex items-center text-xs font-semibold tabular-nums ${
              trend === 'up' ? 'text-[#2F6F5E]' : trend === 'down' ? 'text-[#B0403A]' : 'text-[#52607D]'
            }`}
          >
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {trendValue}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-[#8C97AB] mt-1 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}
