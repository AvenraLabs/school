import React, { createContext, useContext, useCallback } from 'react';
import { Toaster, toast } from 'sonner';

const ToastContext = createContext();

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }) {
  const success = useCallback((msg) => {
    toast.success(msg);
  }, []);

  const error = useCallback((msg) => {
    toast.error(msg);
  }, []);

  const info = useCallback((msg) => {
    toast.info(msg);
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, info, showToast: info }}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#14213D',
            border: '1px solid #E4E1D8',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(20,33,61,0.08)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            padding: '12px 16px',
          },
          className: 'schooliq-toast',
        }}
      />
    </ToastContext.Provider>
  );
}
