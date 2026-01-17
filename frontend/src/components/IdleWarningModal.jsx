import React from 'react';
import { useIdleTimer } from '../context/IdleTimerContext';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';

export default function IdleWarningModal() {
    const { showWarning, remainingTime, resetTimer, handleLogout } = useIdleTimer();

    if (!showWarning) return null;

    // Convert seconds to MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full mx-4 border border-red-100 dark:border-red-900/30 transform transition-all scale-100 animate-scaleIn relative overflow-hidden">

                {/* Background decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 dark:bg-red-900/10 rounded-bl-full -mr-10 -mt-10"></div>

                <div className="relative">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                            <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Session Expiring</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">You have been inactive for a while.</p>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6 border border-red-100 dark:border-red-800/30">
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-sm font-medium text-red-600 dark:text-red-300 uppercase tracking-widest mb-1">Auto-Logout In</span>
                            <span className="text-4xl font-black text-red-600 dark:text-red-400 tabular-nums">
                                {formatTime(remainingTime)}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleLogout}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout Now
                        </button>
                        <button
                            onClick={resetTimer}
                            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Stay Logged In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
