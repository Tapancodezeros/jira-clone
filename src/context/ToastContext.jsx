import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, msg: '', actionLabel: null, onAction: null });
  const timerRef = useRef();

  const showToast = useCallback(({ msg, actionLabel = null, onAction = null, duration = 3000 }) => {
    // clear any existing
    if (timerRef.current) { clearTimeout(timerRef.current); }
    setToast({ visible: true, msg, actionLabel, onAction });
    timerRef.current = setTimeout(() => setToast({ visible: false, msg: '', actionLabel: null, onAction: null }), duration);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: false, msg: '', actionLabel: null, onAction: null });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast.visible && (
        <Toast msg={toast.msg} actionLabel={toast.actionLabel} onAction={() => { if (toast.onAction) toast.onAction(); hideToast(); }} />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
