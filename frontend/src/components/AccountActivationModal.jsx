import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Lock, Key, Mail, ArrowRight, User, Sparkles } from 'lucide-react';
import { otpService } from '../services/otpService';

const AccountActivationModal = ({ isOpen, onClose, initialRegistrationNumber = '' }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State
    const [registrationNumber, setRegistrationNumber] = useState(initialRegistrationNumber);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');

    useEffect(() => {
        if (initialRegistrationNumber) {
            setRegistrationNumber(initialRegistrationNumber.toUpperCase());
        }
    }, [initialRegistrationNumber]);

    if (!isOpen) return null;

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await otpService.requestOTP(registrationNumber);
            setMaskedEmail(res.data.email);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to request activation code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await otpService.verifyOTP(registrationNumber, otp);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Invalid or expired code');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await otpService.setupPassword(registrationNumber, otp, newPassword);
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to set up password');
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setRegistrationNumber('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    };

    const stepColors = {
        1: 'text-[#ff5734] bg-[#ff5734]/10',
        2: 'text-[#fccc42] bg-[#fccc42]/10',
        3: 'text-[#be94f5] bg-[#be94f5]/10',
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 font-['Kodchasan'] tracking-wide">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#151313]/90 backdrop-blur-xl transition-opacity duration-500"
                onClick={(e) => {
                    if (e.target === e.currentTarget) resetAndClose();
                }}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-white dark:bg-[#1c1c1c] rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-500">

                {/* Accent Top Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#ff5734] via-[#be94f5] to-[#fccc42]"></div>

                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-[#151313] dark:text-white tracking-tighter">Account Activation</h2>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#ff5734]">Secured Student Verification</p>
                    </div>
                    <button
                        onClick={resetAndClose}
                        className="p-3 text-slate-400 hover:text-[#ff5734] hover:bg-[#ff5734]/5 rounded-2xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-10 md:p-12">

                    {/* Progress Dots */}
                    {step < 4 && (
                        <div className="flex items-center justify-center gap-4 mb-10">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 shadow-lg ${step >= num
                                            ? 'bg-[#151313] text-[#fccc42] ring-2 ring-[#fccc42]/50'
                                            : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                                            }`}
                                    >
                                        {num}
                                    </div>
                                    {num < 3 && (
                                        <div className={`w-8 h-1 rounded-full ${step > num ? 'bg-[#ff5734]' : 'bg-slate-100 dark:bg-white/5'}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="mb-8 p-6 rounded-2xl bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 flex items-start gap-4 text-red-600 animate-in shake duration-300">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse"></div>
                            <p className="text-xs font-black uppercase tracking-wider leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* STEP 1: Registration Number */}
                    {step === 1 && (
                        <form onSubmit={handleRequestOTP} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center group">
                                <div className="w-20 h-20 bg-[#ff5734]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ring-1 ring-[#ff5734]/20">
                                    <User className="w-10 h-10 text-[#ff5734]" />
                                </div>
                                <h3 className="text-xl font-black text-[#151313] dark:text-white">Verify Identity</h3>
                                <p className="text-sm text-slate-500 font-bold mt-2 font-['Kodchasan']">Enter your Registration Number to begin the activation process.</p>
                            </div>

                            <div className="text-left group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-4">Registration Number</label>
                                <input
                                    type="text"
                                    value={registrationNumber}
                                    onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                                    className="w-full h-16 px-6 bg-[#f7f7f5] dark:bg-[#151313] border-2 border-slate-200 dark:border-white/10 rounded-2xl focus:border-[#ff5734] focus:ring-4 focus:ring-[#ff5734]/5 transition-all text-[#151313] dark:text-white font-black uppercase tracking-widest outline-none"
                                    placeholder="AS2026001"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !registrationNumber}
                                className="group relative w-full h-16 bg-[#ff5734] hover:bg-[#ff6d4d] rounded-2xl font-black text-white text-lg shadow-xl shadow-[#ff5734]/20 hover:shadow-[#ff5734]/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                                    {loading ? 'Processing...' : 'Request Activation Code'}
                                    {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </div>
                            </button>
                        </form>
                    )}

                    {/* STEP 2: Verify OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-[#fccc42]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ring-1 ring-[#fccc42]/20">
                                    <Mail className="w-10 h-10 text-[#fccc42]" />
                                </div>
                                <h3 className="text-xl font-black text-[#151313] dark:text-white">Email Verification</h3>
                                <p className="text-sm text-slate-500 font-bold mt-2">
                                    We sent a 6-digit code to <br />
                                    <span className="font-black text-[#151313] dark:text-[#fccc42] tracking-normal">{maskedEmail}</span>
                                </p>
                            </div>

                            <div className="text-left group text-center">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verification Code</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full h-20 px-4 bg-[#f7f7f5] dark:bg-[#151313] border-2 border-[#fccc42]/30 rounded-2xl text-center text-4xl font-black tracking-[0.5em] text-[#151313] dark:text-[#fccc42] focus:border-[#fccc42] focus:ring-4 focus:ring-[#fccc42]/5 transition-all outline-none"
                                    placeholder="000000"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="group relative w-full h-16 bg-[#151313] border-2 border-[#fccc42] hover:bg-[#fccc42] hover:text-[#151313] rounded-2xl font-black text-[#fccc42] text-lg shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                                    {loading ? 'Verifying...' : 'Verify & Continue'}
                                    {!loading && <CheckCircle2 size={18} />}
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-center text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 hover:text-[#ff5734] transition-colors"
                                disabled={loading}
                            >
                                Return to previous step
                            </button>
                        </form>
                    )}

                    {/* STEP 3: Setup Password */}
                    {step === 3 && (
                        <form onSubmit={handleSetupPassword} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-[#be94f5]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ring-1 ring-[#be94f5]/20">
                                    <Key className="w-10 h-10 text-[#be94f5]" />
                                </div>
                                <h3 className="text-xl font-black text-[#151313] dark:text-white">Secure Account</h3>
                                <p className="text-sm text-slate-500 font-bold mt-2 font-['Kodchasan']">Create a strong password to access your dashboard.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="text-left group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-4">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-16 px-6 bg-[#f7f7f5] dark:bg-[#151313] border-2 border-slate-200 dark:border-white/10 rounded-2xl focus:border-[#be94f5] focus:ring-4 focus:ring-[#be94f5]/5 transition-all text-[#151313] dark:text-white font-bold outline-none"
                                        placeholder="Min. 8 characters"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="text-left group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-4">Confirm Identity</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-16 px-6 bg-[#f7f7f5] dark:bg-[#151313] border-2 border-slate-200 dark:border-white/10 rounded-2xl focus:border-[#be94f5] focus:ring-4 focus:ring-[#be94f5]/5 transition-all text-[#151313] dark:text-white font-bold outline-none"
                                        placeholder="Repeat your password"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !newPassword || !confirmPassword}
                                className="group relative w-full h-16 bg-[#be94f5] hover:bg-[#a878e6] rounded-2xl font-black text-[#151313] text-lg shadow-xl shadow-[#be94f5]/20 hover:shadow-[#be94f5]/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                                    {loading ? 'Activating...' : 'Finalize Activation'}
                                    {!loading && <Lock size={18} />}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer transition-transform"></div>
                            </button>
                        </form>
                    )}

                    {/* STEP 4: Success */}
                    {step === 4 && (
                        <div className="text-center py-10 animate-in fade-in zoom-in-95 duration-700">
                            <div className="relative mb-10 inline-block">
                                <div className="w-28 h-28 bg-[#fccc42]/20 rounded-full flex items-center justify-center ring-4 ring-[#fccc42]/10">
                                    <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                                </div>
                                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#ff5734] rounded-[1rem] flex items-center justify-center text-white shadow-2xl animate-bounce">
                                    <Sparkles size={24} />
                                </div>
                            </div>

                            <h3 className="text-3xl font-black text-[#151313] dark:text-white tracking-tighter mb-4 uppercase">Identity Confirmed</h3>
                            <p className="text-slate-500 font-bold mb-10 max-w-[300px] mx-auto leading-relaxed">
                                Your account is now fully active. Return to the gateway to access your student portal.
                            </p>

                            <button
                                onClick={resetAndClose}
                                className="w-full flex items-center justify-center h-16 bg-[#151313] text-[#fccc42] font-black rounded-2xl shadow-2xl transition-all transform hover:scale-[1.05] active:scale-[0.95] uppercase tracking-[0.2em]"
                            >
                                Return to Login
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AccountActivationModal;
