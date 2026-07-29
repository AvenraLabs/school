import React from 'react';

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white border border-[#E4E1D8] rounded-[10px] shadow-[0_1px_2px_rgba(20,33,61,0.04)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div
      className={`px-5 py-4 border-b border-[#EDEAE1] flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3
      className={`font-display text-base font-semibold text-[#14213D] leading-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p
      className={`text-xs text-[#52607D] mt-0.5 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div
      className={`px-5 py-3 bg-[#FAFAF8] border-t border-[#EDEAE1] flex items-center justify-end gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
