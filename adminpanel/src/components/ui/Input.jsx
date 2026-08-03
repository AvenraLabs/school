import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const Input = forwardRef(({
  className = '',
  type = 'text',
  error = false,
  icon: Icon = null,
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#52607D]">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={`w-full h-9 bg-white text-[#14213D] placeholder-[#8C97AB] text-sm rounded-[8px] border ${
          error ? 'border-[#B0403A] focus:ring-[#B0403A]' : 'border-[#E4E1D8] focus:border-[#2F6F5E]'
        } ${Icon ? 'pl-9' : 'px-3'} pr-3 outline-none transition-colors focus:ring-2 focus:ring-[#2F6F5E]/15 disabled:opacity-50 disabled:bg-[#FAFAF8] ${className}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

const extractOptionsFromChildren = (childrenNode) => {
  let opts = [];
  React.Children.forEach(childrenNode, (child) => {
    if (!child) return;
    if (React.isValidElement(child)) {
      if (child.type === 'option' || child.props.value !== undefined) {
        let label = child.props.children;
        if (Array.isArray(label)) {
          label = label.map((item) => (typeof item === 'object' ? '' : item)).join('');
        }
        opts.push({
          value: child.props.value ?? '',
          label: label !== undefined && label !== null ? String(label) : '',
          disabled: child.props.disabled ?? false,
        });
      } else if (child.props && child.props.children) {
        opts = opts.concat(extractOptionsFromChildren(child.props.children));
      }
    } else if (Array.isArray(child)) {
      opts = opts.concat(extractOptionsFromChildren(child));
    }
  });
  return opts;
};

export const Select = forwardRef(({
  className = '',
  error = false,
  value,
  onChange,
  disabled = false,
  name,
  required = false,
  placeholder,
  children,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef(null);
  const hiddenSelectRef = useRef(null);

  const parsedOptions = props.options && props.options.length > 0 ? props.options : extractOptionsFromChildren(children);
  const selectedOption = parsedOptions.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 220 && rect.top > 200) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  const handleSelect = (optValue) => {
    if (disabled) return;
    setIsOpen(false);

    if (hiddenSelectRef.current) {
      hiddenSelectRef.current.value = optValue;
      const event = new Event('change', { bubbles: true });
      hiddenSelectRef.current.dispatchEvent(event);
    }

    if (onChange) {
      onChange({
        target: {
          name: name || '',
          value: optValue,
        },
      });
    }
  };

  const hasWidthClass = /\b(w-|max-w-)\S+/.test(className);

  return (
    <div ref={containerRef} className={`relative ${hasWidthClass ? '' : 'w-full'} ${className}`}>
      {/* Hidden native select for React synthetic event propagation */}
      <select
        ref={(node) => {
          hiddenSelectRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        value={value}
        onChange={onChange}
        name={name}
        disabled={disabled}
        required={required}
        className="sr-only pointer-events-none absolute opacity-0 w-0 h-0"
        tabIndex={-1}
      >
        {children}
      </select>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-9 bg-white text-[#14213D] text-xs font-semibold rounded-[8px] border ${
          error ? 'border-[#B0403A]' : isOpen ? 'border-[#2F6F5E] ring-2 ring-[#2F6F5E]/15' : 'border-[#E4E1D8] hover:border-[#2F6F5E]/60'
        } px-3 flex items-center justify-between outline-none transition-all cursor-pointer disabled:opacity-50 disabled:bg-[#FAFAF8] disabled:cursor-not-allowed`}
        {...props}
      >
        <span className="truncate text-left">{selectedOption ? selectedOption.label : (placeholder || 'Select option...')}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#52607D] shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#2F6F5E]' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'} bg-white border border-[#E4E1D8] rounded-[8px] shadow-lg z-50 max-h-56 overflow-y-auto py-1`}>
          {parsedOptions.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <div
                key={idx}
                onClick={() => !opt.disabled && handleSelect(opt.value)}
                className={`px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  opt.disabled
                    ? 'opacity-40 cursor-not-allowed text-[#8C97AB]'
                    : isSelected
                    ? 'bg-[#EAF3F0] text-[#2F6F5E] font-bold'
                    : 'text-[#14213D] hover:bg-[#EAF3F0] hover:text-[#2F6F5E]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#2F6F5E] shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export const Textarea = forwardRef(({
  className = '',
  error = false,
  rows = 3,
  ...props
}, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`w-full bg-white text-[#14213D] placeholder-[#8C97AB] text-sm rounded-[8px] border p-3 ${
        error ? 'border-[#B0403A]' : 'border-[#E4E1D8] focus:border-[#2F6F5E]'
      } outline-none transition-colors focus:ring-2 focus:ring-[#2F6F5E]/15 disabled:opacity-50 disabled:bg-[#FAFAF8] ${className}`}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
