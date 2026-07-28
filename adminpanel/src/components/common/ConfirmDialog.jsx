import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  danger = false,
  loading = false,
}) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-[#14213D]/40 backdrop-blur-[2px] z-50 animate-in fade-in duration-200" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border border-[#E4E1D8] rounded-[10px] shadow-[0_4px_16px_rgba(20,33,61,0.08)] z-50 outline-none overflow-hidden p-5 text-center animate-in zoom-in-95 duration-150">
          <div className="flex justify-end">
            <DialogPrimitive.Close
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#52607D] hover:bg-[#FAFAF8] transition-colors outline-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </div>

          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3.5 ${
              danger ? 'bg-[#FDF2F1] text-[#B0403A]' : 'bg-[#FDF8EC] text-[#B8860B]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <DialogPrimitive.Title className="font-display text-base font-semibold text-[#14213D] mb-1">
            {title}
          </DialogPrimitive.Title>

          <DialogPrimitive.Description className="text-xs text-[#52607D] leading-relaxed mb-6">
            {message}
          </DialogPrimitive.Description>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant={danger ? 'destructive' : 'primary'}
              onClick={onConfirm}
              loading={loading}
              className="flex-1"
            >
              {confirmText}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
