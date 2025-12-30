import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
};

const styles = {
    success: 'border-green-500/20 bg-green-50/90 dark:bg-green-900/10',
    error: 'border-red-500/20 bg-red-50/90 dark:bg-red-900/10',
    warning: 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-900/10',
    info: 'border-blue-500/20 bg-blue-50/90 dark:bg-blue-900/10',
};

function ToastItem({ id, message, type, duration, onRemove }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // If not auto-dismissing via context (e.g. infinite duration), handle here?
        // Context handles removal time, but we want animation before removal.
        // Syncing animation with context removal is tricky without a dedicated library.
        // Simpler approach: Just animate in. Context removes it from DOM, which is abrupt.
        // To fix abruptness: Context should wait for animation? Or just use CSS/Keyframes for 'enter'.
    }, []);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(id), 300); // Wait for exit aimation
    };

    return (
        <div
            className={`
        relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300
        ${styles[type] || styles.info}
        ${isExiting ? 'animate-leave opacity-0 translate-x-full' : 'animate-enter'}
        min-w-[300px] max-w-md pointer-events-auto
      `}
            role="alert"
        >
            <div className="shrink-0 mt-0.5">{icons[type] || icons.info}</div>
            <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight">
                {message}
            </div>
            <button
                onClick={() => onRemove(id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
                <X size={16} />
            </button>

            {/* Progress Line (Optional aesthetic touch) */}
            {duration > 0 && (
                <div
                    className="absolute bottom-0 left-0 h-[3px] bg-current opacity-20"
                    style={{
                        width: '100%',
                        animation: `shrink ${duration}ms linear forwards`
                    }}
                />
            )}
        </div>
    );
}

export default function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(100%) scale(0.9); }
        }
        @keyframes shrink { 
          from { width: 100%; } 
          to { width: 0%; } 
        }
        
        .animate-enter {
          animation: slideIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-leave {
          animation: slideOut 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
      `}</style>
            {toasts.map((t) => (
                <ToastItem key={t.id} {...t} onRemove={removeToast} />
            ))}
        </div>
    );
}
