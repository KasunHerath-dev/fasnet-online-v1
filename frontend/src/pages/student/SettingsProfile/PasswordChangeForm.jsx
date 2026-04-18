import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Save, CheckCircle, XCircle, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../../../services/authService';

const PasswordChangeForm = () => {
    const [step, setStep] = useState('form'); // 'form' or 'otp'
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        otp: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (status.message) setStatus({ type: '', message: '' });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }
        if (formData.newPassword.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }

        setIsLoading(true);
        setStatus({ type: '', message: '' });
        try {
            const response = await authService.requestPasswordChangeOTP(formData.currentPassword);
            setStep('otp');
            setStatus({ 
                type: 'success', 
                message: response.data.message || 'Verification code sent to your email.' 
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.error?.message || 'Verification failed. Check current password.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmUpdate = async (e) => {
        e.preventDefault();
        if (!formData.otp) {
            setStatus({ type: 'error', message: 'Please enter the verification code' });
            return;
        }

        setIsLoading(true);
        try {
            await authService.confirmPasswordChange(
                formData.currentPassword,
                formData.newPassword,
                formData.otp
            );
            setStatus({ type: 'success', message: 'Password updated successfully!' });
            // Reset after delay
            setTimeout(() => {
                setStep('form');
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' });
                setStatus({ type: '', message: '' });
            }, 3000);
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.error?.message || 'Invalid or expired code'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#151313] placeholder-slate-400 focus:outline-none focus:border-[#151313] focus:ring-2 focus:ring-[#151313]/10 transition-all font-mono text-sm";

    const PasswordField = ({ name, label, showKey }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-black text-[#151313]/60 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                <input
                    type={showPasswords[showKey] ? 'text' : 'password'}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    disabled={step === 'otp'}
                    className={`${inputClass} ${step === 'otp' ? 'opacity-50' : ''}`}
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    disabled={step === 'otp'}
                    onClick={() => togglePasswordVisibility(showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#151313] transition-colors disabled:hidden"
                >
                    {showPasswords[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-7 flex flex-col h-full relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#151313] flex items-center justify-center shrink-0">
                    {step === 'form' ? (
                        <Lock className="w-5 h-5 text-[#fccc42]" strokeWidth={2.5} />
                    ) : (
                        <ShieldCheck className="w-5 h-5 text-[#ff5734]" strokeWidth={2.5} />
                    )}
                </div>
                <div>
                    <h3 className="text-base font-black text-[#151313]">
                        {step === 'form' ? 'Security Settings' : 'Verify Identity'}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {step === 'form' ? 'Update your account password' : 'Enter the code sent to your email'}
                    </p>
                </div>
            </div>

            {/* Status Message */}
            {status.message && (
                <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 ${status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                    {status.type === 'success'
                        ? <CheckCircle className="w-4 h-4 shrink-0" />
                        : <XCircle className="w-4 h-4 shrink-0" />}
                    {status.message}
                </div>
            )}

            {step === 'form' ? (
                <form onSubmit={handleRequestOTP} className="flex flex-col flex-1 gap-4">
                    <PasswordField name="currentPassword" label="Current Password" showKey="current" />
                    <PasswordField name="newPassword" label="New Password" showKey="new" />
                    <PasswordField name="confirmPassword" label="Confirm New Password" showKey="confirm" />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-auto w-full flex items-center justify-center gap-2 py-3.5 bg-[#ff5734] hover:bg-[#e84d2e] text-white font-black rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 shadow-md group"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Get Verification Code</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleConfirmUpdate} className="flex flex-col flex-1 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-[#151313]/60 uppercase tracking-widest ml-1 text-center block">Verification Code</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Key className="w-5 h-5 text-slate-300 group-focus-within:text-[#ff5734] transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                maxLength={6}
                                required
                                autoFocus
                                className="w-full pl-12 pr-4 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black tracking-[0.5em] text-center text-[#151313] focus:outline-none focus:border-[#ff5734] focus:bg-white transition-all placeholder:text-slate-200"
                                placeholder="000000"
                            />
                        </div>
                        <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-tighter">
                            Didn't receive it? <button type="button" onClick={() => setStep('form')} className="text-[#ff5734] hover:underline">Go back</button>
                        </p>
                    </div>

                    <div className="mt-auto space-y-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-[#151313] hover:bg-black text-white font-black rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 shadow-lg"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Confirm & Update
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('form')}
                            className="w-full py-3 text-xs font-black text-slate-400 hover:text-[#151313] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PasswordChangeForm;
