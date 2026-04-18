import React, { useState } from 'react';
import { User, Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FirstLoginModal = ({ user, onComplete }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) return;
    
    setLoading(true);
    try {
      await api.put('/users/setup-profile', { firstName, lastName });
      toast.success(`Welcome aboard, ${firstName}!`);
      onComplete({ ...user, firstName, lastName, needsProfileSetup: false });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 font-['Kodchasan'] tracking-wide overflow-hidden">
      {/* Dynamic Animated Backdrop */}
      <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#ff5734]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#be94f5]/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white/5 border border-white/10 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        
        {/* Top Accent Gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-[#ff5734] via-[#be94f5] to-[#fccc42]"></div>

        <div className="p-10 md:p-14">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-[#ff5734] to-[#fccc42] rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3">
                <User size={44} className="text-white -rotate-3" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-[#fccc42] shadow-xl animate-bounce">
                <Sparkles size={24} />
              </div>
            </div>
            
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4 leading-tight">
              One Last Step <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5734] to-[#fccc42]">
                To Your Future.
              </span>
            </h2>
            <p className="text-slate-400 font-medium text-lg">
              Let's personalize your portal experience. Please confirm your identity to proceed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Legal First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-16 px-8 bg-white/5 border-2 border-white/10 rounded-2xl focus:border-[#ff5734] focus:ring-4 focus:ring-[#ff5734]/5 transition-all text-white font-bold outline-none placeholder:text-slate-700"
                  placeholder="e.g. Kasun"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Legal Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-16 px-8 bg-white/5 border-2 border-white/10 rounded-2xl focus:border-[#be94f5] focus:ring-4 focus:ring-[#be94f5]/5 transition-all text-white font-bold outline-none placeholder:text-slate-700"
                  placeholder="e.g. Herath"
                />
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                <span className="font-bold text-emerald-500 uppercase tracking-wider block mb-1">Identity Encryption Active</span>
                Your legal identity is used exclusively for academic records and secure certification. FASNet ensures 256-bit data integrity.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !firstName || !lastName}
              className="group relative w-full h-18 bg-white text-[#0a0a0a] rounded-3xl font-black text-xl shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                {loading ? (
                  <div className="w-6 h-6 border-4 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-widest text-sm">Launch Dashboard</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 -translate-x-full group-hover:animate-shimmer transition-transform"></div>
            </button>
          </form>

          <div className="mt-12 text-center flex items-center justify-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
            <span>Powered by FASNet Engine</span>
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
            <Heart size={10} className="text-[#ff5734]" />
            <span>Built for Excellence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginModal;
