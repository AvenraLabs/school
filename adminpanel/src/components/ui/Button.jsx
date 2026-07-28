import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(({
  children,
  variant = 'primary', // primary | secondary | outline | ghost | destructive
  size = 'md', // sm | md | lg | icon
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F5E] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-[8px] cursor-pointer";
  
  const variants = {
    primary: "bg-[#2F6F5E] hover:bg-[#245749] text-white shadow-xs border border-[#2F6F5E]",
    secondary: "bg-[#EAF3F0] hover:bg-[#D3E6E0] text-[#2F6F5E] border border-transparent font-semibold",
    outline: "bg-white hover:bg-[#FAFAF8] text-[#14213D] border border-[#E4E1D8] shadow-xs",
    ghost: "bg-transparent hover:bg-[#EAF3F0] text-[#52607D] hover:text-[#14213D]",
    destructive: "bg-[#B0403A] hover:bg-[#983631] text-white shadow-xs border border-[#B0403A]",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-9 px-3.5 text-sm gap-2",
    lg: "h-10 px-4 text-base gap-2",
    icon: "h-9 w-9 p-0 text-sm",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
      {!loading && IconRight ? <IconRight className="w-4 h-4 shrink-0" /> : null}
    </button>
  );
});

Button.displayName = 'Button';
