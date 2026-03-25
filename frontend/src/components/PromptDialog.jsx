import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle, MessageSquare, X } from 'lucide-react';

/**
 * PromptDialog - Custom premium modal replacing window.prompt
 */
export function PromptDialog({
    isOpen,
    onConfirm,
    onCancel,
    title = 'Input Required',
    message = '',
    placeholder = 'Type here...',
    confirmLabel = 'Submit',
    cancelLabel = 'Cancel',
    defaultValue = '',
    type = 'text',
    multiLine = false
}) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setInputValue(defaultValue);
            // Focus input for keyboard accessibility
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, defaultValue]);

    useEffect(() => {
        const handleKey = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onCancel?.();
            if (e.key === 'Enter') onConfirm?.(inputValue);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onConfirm, onCancel, inputValue]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Card */}
            <div
                className="relative w-full max-w-md bg-white dark:bg-[#13151f] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                style={{ animation: 'fadeInScale 0.18s cubic-bezier(0.34,1.56,0.64,1) both' }}
            >
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-600" />

                <div className="p-6 sm:p-8">
                    {/* Header row */}
                    <div className="flex items-start gap-4 mb-5">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                            <MessageSquare className="w-7 h-7" />
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                            <h2
                                id="prompt-title"
                                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug"
                            >
                                {title}
                            </h2>
                            {message && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {message}
                                </p>
                            )}
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

                    {/* Input Field */}
                    <div className="mb-7">
                        {multiLine ? (
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={placeholder}
                                className="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium transition-all resize-none"
                            />
                        ) : (
                            <input
                                ref={inputRef}
                                type={type}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={placeholder}
                                className="w-full h-14 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium transition-all"
                            />
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            disabled={!inputValue.trim()}
                            onClick={() => onConfirm(inputValue)}
                            className="px-6 py-2.5 rounded-xl font-black text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:scale-100"
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
