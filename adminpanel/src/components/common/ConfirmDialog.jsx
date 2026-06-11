import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-rose-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`w-7 h-7 ${danger ? 'text-rose-600' : 'text-amber-600'}`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex items-center gap-3 p-6 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className={`${danger ? 'btn-danger' : 'btn-primary'} flex-1`} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
