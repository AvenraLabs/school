import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', width: '100%' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
          <h3 className="text-lg font-semibold text-slate-900" style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              color: '#94a3b8',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="modal-body" style={{ textAlign: 'center', padding: '16px 24px 20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: danger ? '#ffe4e6' : '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <AlertTriangle style={{
              width: '24px',
              height: '24px',
              color: danger ? '#e11d48' : '#d97706'
            }} />
          </div>
          <p style={{
            fontSize: '14px',
            color: '#475569',
            lineHeight: '1.5',
            margin: 0
          }}>
            {message}
          </p>
        </div>

        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '0', display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, minHeight: '40px', fontWeight: 600 }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={danger ? 'btn-danger' : 'btn-primary'}
            style={{ flex: 1, minHeight: '40px', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
