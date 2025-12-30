import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helpers
  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    // Backward compatibility if showToast was used differently:
    show: (msg, opts = {}) => addToast(msg, opts.type || 'info', opts.duration),
  };

  // Backward compatibility
  const showToast = useCallback((args) => {
    if (typeof args === 'string') {
      addToast(args, 'info');
    } else {
      const { msg, duration } = args || {};
      addToast(msg, 'info', duration);
    }
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast, showToast }}>
      {children}
      {createPortal(
        <ToastContainer toasts={toasts} removeToast={removeToast} />,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

