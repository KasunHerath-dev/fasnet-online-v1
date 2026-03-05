import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Save, CheckCircle, XCircle } from 'lucide-react';
import { authService } from '../../../services/authService';

const PasswordChangeForm = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
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

    const handleSubmit = async (e) => {
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
            await authService.updatePassword(formData.currentPassword, formData.newPassword);
            setStatus({ type: 'success', message: 'Password updated successfully!' });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update password'
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
                    className={inputClass}
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => togglePasswordVisibility(showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#151313] transition-colors"
                >
                    {showPasswords[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-7 flex flex-col h-full">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#151313] flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-[#fccc42]" strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-base font-black text-[#151313]">Security Settings</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Update your account password</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-4">

                {/* Status Message */}
                {status.message && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 ${status.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                        {status.type === 'success'
                            ? <CheckCircle className="w-4 h-4 shrink-0" />
                            : <XCircle className="w-4 h-4 shrink-0" />}
                        {status.message}
                    </div>
                )}

                <PasswordField name="currentPassword" label="Current Password" showKey="current" />
                <PasswordField name="newPassword" label="New Password" showKey="new" />
                <PasswordField name="confirmPassword" label="Confirm New Password" showKey="confirm" />

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-auto w-full flex items-center justify-center gap-2 py-3.5 bg-[#ff5734] hover:bg-[#e84d2e] text-white font-black rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 shadow-md"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Update Password
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default PasswordChangeForm;
