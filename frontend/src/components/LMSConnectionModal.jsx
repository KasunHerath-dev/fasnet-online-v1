import React, { useState } from 'react';
import { X, ShieldCheck, RefreshCw, Key, User, Lock } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const LMSConnectionModal = ({ isOpen, onClose, request }) => {
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });

    if (!isOpen || !request) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            return toast.error('Please fill in both fields');
        }

        setIsSubmitting(true);
        try {
            await api.post(`/lms/student/request/${request._id}/submit`, formData);
            toast.success('Credentials submitted successfully!');
            onClose();
            // Optional: Trigger a global refresh event if needed
            window.dispatchEvent(new CustomEvent('lms-account-linked'));
        } catch (err) {
            toast.error(err.response?.data?.error || 'Submission failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                
                {/* Decorative Header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white font-['Kodchasan'] leading-tight">Link Moodle Account</h2>
                        <p className="text-blue-100/80 text-xs mt-2 uppercase tracking-widest font-black">Secure Connection</p>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-8">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full text-white transition-colors z-20"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="mb-8 text-center md:text-left">
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Administration requested access to <b>{request.label}</b>. This link is required to synchronize your module progress automatically.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-500 transition-colors flex items-center gap-2">
                                <User className="w-3 h-3" />
                                Moodle Username
                            </label>
                            <input 
                                type="text" 
                                placeholder="Enter Registration No (e.g. 21CS001)"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-blue-500/20 outline-none transition-all placeholder:text-slate-300"
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-500 transition-colors flex items-center gap-2">
                                <Lock className="w-3 h-3" />
                                Moodle Password
                            </label>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 ring-blue-500/20 outline-none transition-all placeholder:text-slate-300"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Key className="w-5 h-5" />
                                    Confirm Account Link
                                </>
                            )}
                        </button>
                        
                        <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-2 mt-6 select-none opacity-60">
                            <ShieldCheck className="w-3 h-3 text-blue-500" />
                            Encrypted & Privacy Compliant Connection
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LMSConnectionModal;
