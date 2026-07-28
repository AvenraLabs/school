import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  footer,
}) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-[#14213D]/40 backdrop-blur-[2px] z-50 animate-in fade-in duration-200" />
        <DialogPrimitive.Content
          className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${maxWidth} bg-white border border-[#E4E1D8] rounded-[10px] shadow-[0_4px_16px_rgba(20,33,61,0.08)] z-50 outline-none overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150`}
        >
          <div className="px-5 py-4 border-b border-[#EDEAE1] flex items-center justify-between">
            <DialogPrimitive.Title className="font-display text-base font-semibold text-[#14213D]">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#52607D] hover:bg-[#EAF3F0] hover:text-[#14213D] transition-colors outline-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </div>
          
          <div className="p-5 overflow-y-auto flex-1">
            {children}
          </div>

          {footer && (
            <div className="px-5 py-3 bg-[#FAFAF8] border-t border-[#EDEAE1] flex items-center justify-end gap-2.5">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
