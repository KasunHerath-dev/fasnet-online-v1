import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, Info, AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * ConfirmDialog - Custom premium modal replacing window.confirm
 *
 * Usage:
 *   const { confirm } = useConfirm();
 *   const ok = await confirm({ title, message, type, confirmLabel, cancelLabel });
 *
 * Or as raw component:
 *   <ConfirmDialog isOpen={...} onConfirm={...} onCancel={...} ... />
 */

const VARIANTS = {
    danger: {
        icon: <Trash2 className="w-7 h-7" />,
        iconBg: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
        confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20',
        border: 'border-red-200 dark:border-red-800/60',
        badge: 'DANGER',
        badgeBg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
    warning: {
        icon: <AlertTriangle className="w-7 h-7" />,
        iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
        confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
        border: 'border-amber-200 dark:border-amber-800/60',
        badge: 'WARNING',
        badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    info: {
        icon: <Info className="w-7 h-7" />,
        iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
        confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
        border: 'border-blue-200 dark:border-blue-800/60',
        badge: null,
        badgeBg: '',
    },
    success: {
        icon: <CheckCircle className="w-7 h-7" />,
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
        confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        badge: null,
        badgeBg: '',
    },
};

export function ConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
    title = 'Are you sure?',
    message = '',
    type = 'warning',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
}) {
    const variant = VARIANTS[type] || VARIANTS.warning;
    const confirmRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Focus confirm button for keyboard accessibility
            setTimeout(() => confirmRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKey = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onCancel?.();
            if (e.key === 'Enter') onConfirm?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onConfirm, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Card */}
            <div
                className={`relative w-full max-w-md bg-white dark:bg-[#13151f] rounded-3xl shadow-2xl border ${variant.border} overflow-hidden
                    animate-[fadeInScale_0.15s_ease-out]`}
                style={{ animation: 'fadeInScale 0.18s cubic-bezier(0.34,1.56,0.64,1) both' }}
            >
                {/* Top accent bar */}
                <div className={`h-1 w-full ${type === 'danger' ? 'bg-gradient-to-r from-red-500 to-rose-600' : type === 'warning' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : type === 'success' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} />

                <div className="p-6 sm:p-8">
                    {/* Header row */}
                    <div className="flex items-start gap-4 mb-5">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${variant.iconBg}`}>
                            {variant.icon}
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                            {variant.badge && (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 ${variant.badgeBg}`}>
                                    ⚠ {variant.badge}
                                </span>
                            )}
                            <h2
                                id="confirm-title"
                                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug"
                            >
                                {title}
                            </h2>
                        </div>

                        {/* Close X */}
                        <button
                            onClick={onCancel}
                            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Message */}
                    {message && (
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-7 pl-[4.5rem]">
                            {message}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            ref={confirmRef}
                            onClick={onConfirm}
                            className={`px-6 py-2.5 rounded-xl font-black text-sm shadow-lg transition-all hover:scale-[1.03] active:scale-95 ${variant.confirmBtn}`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.88) translateY(8px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
            `}</style>
        </div>
    );
}
