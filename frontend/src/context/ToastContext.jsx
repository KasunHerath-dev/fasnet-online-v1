import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

// Toast Component (Internal)
const Toast = ({ id, message, type, onClose }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const bgColors = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800',
        warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
    };

    return (
        <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md 
      transition-all duration-300 animate-slideInRight min-w-[300px] max-w-md
      ${bgColors[type] || bgColors.info}
    `}>
            {icons[type] || icons.info}
            <p className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        warning: (msg) => addToast(msg, 'warning'),
        info: (msg) => addToast(msg, 'info')
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {createPortal(
                <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                    <div className="pointer-events-auto flex flex-col gap-2">
                        {toasts.map(t => (
                            <Toast key={t.id} {...t} onClose={removeToast} />
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
