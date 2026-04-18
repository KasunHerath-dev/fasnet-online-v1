import React, { useState } from 'react';
import { User, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';

const ProfileSetupModal = ({ isOpen, user, onComplete }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) {
            setError('Please enter both your First Name and Last Name.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await authService.completeProfileSetup(firstName, lastName);
            if (response.data && response.data.user) {
                onComplete(response.data.user);
            } else {
                setError('Failed to complete profile setup. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Kodchasan'] tracking-wide">
            {/* Backdrop with stronger blur */}
            <div className="absolute inset-0 bg-[#151313]/90 backdrop-blur-xl transition-opacity duration-700"></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-xl bg-white dark:bg-[#1c1c1c] rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 ease-out">

                {/* Accent Top Bar - Orange & Yellow Gradient */}
                <div className="h-2 w-full bg-gradient-to-r from-[#ff5734] to-[#fccc42]"></div>

                <div className="relative p-10 md:p-12">
                    {/* Decorative background glow using Learnify colors */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#ff5734]/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-[#fccc42]/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative flex flex-col items-center text-center">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-[#ff5734]/10 rounded-[2rem] flex items-center justify-center ring-1 ring-[#ff5734]/20 shadow-2xl">
                                <User className="w-12 h-12 text-[#ff5734]" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#fccc42] rounded-full flex items-center justify-center text-[#151313] shadow-lg animate-bounce">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black text-[#151313] dark:text-white mb-4 tracking-tight">
                            Personalize Your <br />
                            <span className="text-[#ff5734]">
                                Dashboard
                            </span>
                        </h2>

                        <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 max-w-sm">
                            Welcome, <span className="text-[#ff5734]">{user?.username}</span>. Please enter your name to finalize your account activation.
                        </p>

                        <form onSubmit={handleSubmit} className="w-full space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="text-left group">
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-4">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="E.g. Kasun"
                                        className="w-full h-16 px-6 bg-[#f7f7f5] dark:bg-[#151313] border border-slate-200 dark:border-white/10 rounded-2xl text-[#151313] dark:text-white font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#ff5734]/10 focus:border-[#ff5734] placeholder:text-slate-300 dark:placeholder:text-white/10"
                                        required
                                    />
                                </div>

                                <div className="text-left group">
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-4">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="E.g. Herath"
                                        className="w-full h-16 px-6 bg-[#f7f7f5] dark:bg-[#151313] border border-slate-200 dark:border-white/10 rounded-2xl text-[#151313] dark:text-white font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#ff5734]/10 focus:border-[#ff5734] placeholder:text-slate-300 dark:placeholder:text-white/10"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake duration-300">
                                    <p className="text-sm font-bold text-red-500 text-center">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full h-16 bg-[#ff5734] hover:bg-[#ff6d4d] rounded-2xl font-black text-white text-lg shadow-xl shadow-[#ff5734]/20 hover:shadow-[#ff5734]/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span className="animate-pulse tracking-widest uppercase text-sm">Activating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="uppercase tracking-widest text-sm">Secure My Account</span>
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        <div className="mt-10 flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            Final Security Check Complete
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetupModal;
