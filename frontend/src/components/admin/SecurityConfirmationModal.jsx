import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert, Loader2, ChevronRight } from 'lucide-react';

const SecurityConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Security Alert', 
    message = 'This action is destructive and cannot be undone.', 
    confirmText = 'CONFIRM',
    loading = false
}) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setInputValue('');
            setError(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (inputValue.toUpperCase() === confirmText.toUpperCase()) {
            onConfirm();
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 font-['Kodchasan'] tracking-wide">
            {/* Backdrop with extreme blur and dark tint */}
            <div 
                className="absolute inset-0 bg-[#151313]/95 backdrop-blur-2xl transition-opacity duration-500"
                onClick={!loading ? onClose : undefined}
            ></div>

            {/* Modal Container */}
            <div className={`relative w-full max-w-lg bg-white dark:bg-[#1c1c1c] rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-red-500/10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-12 duration-500 ease-out ${error ? 'animate-shake' : ''}`}>
                
                {/* Danger Strip */}
                <div className="h-2 w-full bg-gradient-to-r from-red-600 via-[#ff5734] to-red-600 animate-shimmer bg-[length:200%_auto]"></div>

                <div className="p-10 md:p-12">
                    {/* Header Icon */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-20 h-20 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center mb-6 relative">
                            <ShieldAlert className="w-10 h-10 text-red-600" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-black text-[#151313] dark:text-white uppercase tracking-tighter mb-3">
                            {title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Interaction Zone */}
                    <div className="space-y-6">
                        <div className="text-left group">
                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-4">
                                Verification Required
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={loading}
                                    placeholder={`Type "${confirmText}" to proceed`}
                                    className={`w-full h-16 px-6 bg-[#f7f7f5] dark:bg-[#151313] border-2 rounded-2xl text-[#151313] dark:text-white font-black transition-all focus:outline-none focus:ring-4 focus:ring-red-500/5 placeholder:text-slate-300 dark:placeholder:text-white/5 tracking-[0.05em] uppercase ${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-red-500'}`}
                                />
                                {inputValue.toUpperCase() === confirmText.toUpperCase() && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in-50 duration-300">
                                        <Loader2 className="w-6 h-6 animate-spin opacity-20" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="h-16 rounded-2xl font-black text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading || inputValue.toUpperCase() !== confirmText.toUpperCase()}
                                className="group relative h-16 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 dark:disabled:bg-white/5 disabled:text-slate-400 rounded-2xl font-black text-white shadow-xl shadow-red-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="uppercase tracking-widest text-xs">Execute Action</span>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50">
                        <X size={10} />
                        Destructive Operation • Admin Access Only
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    from { background-position: 200% 0; }
                    to { background-position: -200% 0; }
                }
                .animate-shimmer {
                    animation: shimmer 4s linear infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default SecurityConfirmationModal;
