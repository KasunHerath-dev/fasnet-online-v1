// src/components/student/LmsDeadlineCard.jsx
// Bento-grid card showing the next upcoming LMS deadlines.

import React, { useState, useEffect } from 'react';
import { 
  CalendarBlank, 
  CaretRight, 
  BookOpen, 
  ArrowsClockwise, 
  Lightning, 
  GraduationCap,
  Sparkle,
  CheckCircle
} from '@phosphor-icons/react';
import lmsService from '../../services/lmsService';
import { useNavigate, useParams } from 'react-router-dom';

const TYPE_CONFIG = {
  assignment: { label: 'Assignment', color: 'text-orange-500', bg: 'from-orange-500/10 to-orange-400/5', icon: <BookOpen size={18} weight="duotone" /> },
  tutorial:   { label: 'Tutorial',   color: 'text-blue-500',   bg: 'from-blue-500/10 to-blue-400/5',     icon: <BookOpen size={18} weight="duotone" /> },
  quiz:       { label: 'Quiz',       color: 'text-purple-500', bg: 'from-purple-500/10 to-pink-400/5',   icon: <Lightning size={18} weight="duotone" /> },
  exam:       { label: 'Exam',       color: 'text-red-500',    bg: 'from-red-500/10 to-rose-400/5',      icon: <GraduationCap size={18} weight="duotone" /> },
  other:      { label: 'Task',       color: 'text-slate-500',  bg: 'from-slate-300/20 to-slate-200/10',   icon: <CalendarBlank size={18} weight="duotone" /> },
};

function getUrgency(dueDate) {
  if (!dueDate) return { label: 'No date', color: 'text-slate-400', dot: 'bg-slate-300', days: null };
  const days = Math.ceil((new Date(dueDate) - Date.now()) / 86400000);
  if (days < 0) return { label: 'Overdue', color: 'text-red-500', dot: 'bg-red-500', days };
  if (days === 0) return { label: 'Due Today', color: 'text-red-500', dot: 'bg-red-500 animate-pulse', days };
  if (days === 1) return { label: 'Tomorrow', color: 'text-orange-500', dot: 'bg-orange-500 animate-pulse', days };
  if (days <= 3) return { label: `${days}d left`, color: 'text-amber-500', dot: 'bg-amber-500', days };
  return { label: `${days}d left`, color: 'text-slate-400', dot: 'bg-emerald-500', days };
}

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function LmsDeadlineCard({ isDark = false }) {
  const [assignments, setAssignments] = useState([]);
  const [lmsLinked, setLmsLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchData = async () => {
    try {
      const res = await lmsService.getAssignments();
      const d = res?.data;
      if (!d) return;

      setLmsLinked(!!d.lmsLinked);
      setLastSync(d.lastSync);
      const upcoming = (Array.isArray(d.data) ? d.data : [])
        .filter(a => !a.isCompleted && (!a.dueDate || new Date(a.dueDate) >= new Date(Date.now() - 86400000)))
        .slice(0, 4);
      setAssignments(upcoming);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (!loading && !lmsLinked) {
    return (
      <div className="h-auto flex flex-col items-center justify-center gap-6 text-center px-8 py-10 font-['Kodchasan']">
        <div className="w-16 h-16 rounded-[2rem] bg-[#ff5734]/5 border border-[#ff5734]/10 flex items-center justify-center">
          <GraduationCap size={32} weight="duotone" className="text-[#ff5734]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-[#151313] font-black text-lg tracking-tight">Sync Academic Tasks</h3>
          <p className="text-slate-400 text-xs font-bold leading-relaxed">Link your Moodle to track your assignments and quizzes here.</p>
        </div>
        <button
          onClick={() => navigate(`/${id}/profile?section=lms`)}
          className="group flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#ff5734] text-white text-[11px] font-black hover:bg-[#e64a2e] transition-all shadow-lg shadow-[#ff5734]/20 uppercase tracking-widest"
        >
          Connect Account <CaretRight size={14} weight="bold" />
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-auto p-8 space-y-6 font-['Kodchasan'] animate-pulse">
        <div className="h-5 w-32 bg-slate-100 rounded-lg" />
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-full bg-slate-50 rounded" />
                <div className="h-2 w-20 bg-slate-50 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className={`h-auto flex flex-col items-center justify-center gap-4 text-center px-8 py-12 font-['Kodchasan'] ${isDark ? 'text-white' : ''}`}>
        <div className={`w-16 h-16 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50/50'} rounded-[2.5rem] flex items-center justify-center`}>
          <CheckCircle size={32} weight="duotone" className="text-emerald-500" />
        </div>
        <div className="space-y-1">
          <p className={`${isDark ? 'text-white' : 'text-[#151313]'} font-black text-xs uppercase tracking-[0.2em]`}>Academic Peace</p>
          <p className="text-slate-400 text-[10px] font-bold">No upcoming deadlines detected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-auto p-6 flex flex-col font-['Kodchasan'] ${isDark ? 'bg-[#151313]' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} flex items-center justify-center text-[#ff5734]`}>
            <Sparkle size={20} weight="duotone" />
          </div>
          <div>
            <h3 className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-[#151313]'} uppercase tracking-widest leading-none`}>Upcoming</h3>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">LMS Deadlines</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/${id}/schedule`)}
          className={`w-8 h-8 flex items-center justify-center rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#151313] text-white hover:bg-black'} transition-all shadow-lg`}
        >
          <CaretRight size={14} weight="bold" />
        </button>
      </div>

      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        {assignments.map((a) => {
          const urgency = getUrgency(a.dueDate);
          const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.other;
          return (
            <button
              key={a._id}
              onClick={() => navigate(`/${id}/schedule`)}
              className={`group w-full flex items-center gap-3 p-3 rounded-[1.5rem] ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08]' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-[#ff5734]/20'} border transition-all text-left`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.bg} flex items-center justify-center shrink-0 ${cfg.color} group-hover:scale-110 transition-transform`}>
                {cfg.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`${isDark ? 'text-white' : 'text-[#151313]'} text-[11px] font-black truncate leading-tight group-hover:text-[#ff5734] transition-colors`}>{a.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'} border ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${urgency.color} flex items-center gap-1`}>
                    <span className={`w-1 h-1 rounded-full ${urgency.dot}`} />
                    {urgency.label}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`${isDark ? 'text-white' : 'text-[#151313]'} text-[10px] font-black`}>{formatDate(a.dueDate)}</p>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tighter">Due</p>
              </div>
            </button>
          );
        })}
      </div>

      {lastSync && (
        <div className={`mt-5 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-50'} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-2">
            <ArrowsClockwise size={12} className="text-[#ff5734] animate-spin-slow" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Auto Sync Active</span>
          </div>
          <span className="text-[9px] font-bold text-slate-400">
            {new Date(lastSync).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
}
