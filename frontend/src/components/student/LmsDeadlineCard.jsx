// src/components/student/LmsDeadlineCard.jsx
import React, { useState, useEffect } from 'react';
import {
  CalendarBlank, CaretRight, BookOpen,
  Lightning, GraduationCap, Sparkle, CheckCircle,
  Warning, ArrowRight, Clock
} from '@phosphor-icons/react';
import lmsService from '../../services/lmsService';
import { useNavigate, useParams } from 'react-router-dom';

// Per-item color themes (white bg, colored accent)
const ITEM_THEMES = [
  { accent: 'bg-[#ff5734]', icon: 'bg-[#ff5734] text-white',      pill: 'bg-[#ff5734]/10 text-[#ff5734]'  },
  { accent: 'bg-[#fccc42]', icon: 'bg-[#fccc42] text-[#151313]',  pill: 'bg-[#fccc42]/30 text-[#b45309]'  },
  { accent: 'bg-[#be94f5]', icon: 'bg-[#be94f5] text-white',      pill: 'bg-[#be94f5]/20 text-purple-800' },
  { accent: 'bg-[#60a5fa]', icon: 'bg-[#60a5fa] text-white',      pill: 'bg-blue-100 text-blue-700'        },
];

const TYPE_ICONS = {
  assignment: <BookOpen size={14} weight="fill" />,
  tutorial:   <BookOpen size={14} weight="fill" />,
  quiz:       <Lightning size={14} weight="fill" />,
  exam:       <GraduationCap size={14} weight="fill" />,
  other:      <CalendarBlank size={14} weight="fill" />,
};

function getUrgency(dueDate) {
  if (!dueDate) return { label: 'No date', hot: false };
  const days = Math.ceil((new Date(dueDate) - Date.now()) / 86400000);
  if (days < 0)   return { label: 'Overdue',   hot: true,  red: true, days };
  if (days === 0) return { label: 'Due Today', hot: true,  red: true, days };
  if (days === 1) return { label: 'Tomorrow',  hot: true,  red: false, days };
  if (days <= 3)  return { label: `${days}d`,  hot: true,  red: false, days };
  return            { label: `${days}d`,        hot: false, red: false, days };
}

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/* ─── Single deadline row ─────────────────────────────────── */
const DeadlineItem = ({ assignment, idx, onClick }) => {
  const urgency = getUrgency(assignment.dueDate);
  const icon    = TYPE_ICONS[assignment.type] || TYPE_ICONS.other;
  const theme   = ITEM_THEMES[idx % ITEM_THEMES.length];
  const typeLabel = (assignment.type || 'task').charAt(0).toUpperCase() + (assignment.type || 'task').slice(1);

  // Overdue / urgent overrides icon background to red
  const iconClass = urgency.red
    ? 'bg-rose-500 text-white'
    : theme.icon;

  return (
    <button
      onClick={onClick}
      className="w-full group flex items-center gap-0 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md active:scale-[0.99] transition-all text-left overflow-hidden"
    >
      {/* Left accent */}
      <div className={`w-[4px] self-stretch flex-shrink-0 ${urgency.red ? 'bg-rose-500' : theme.accent}`} />

      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mx-3 ${iconClass}`}>
        {urgency.red ? <Warning size={14} weight="fill" /> : icon}
      </div>

      {/* Info */}
      <div className="flex-1 py-3.5 min-w-0 pr-1">
        <p className="text-[13px] font-black text-[#151313] leading-snug line-clamp-1 group-hover:text-[#ff5734] transition-colors">
          {assignment.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {assignment.moduleCode && (
            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-[#151313] text-white">
              {assignment.moduleCode}
            </span>
          )}
          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${theme.pill}`}>
            {typeLabel}
          </span>
          {urgency.hot && (
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${urgency.red ? 'bg-rose-500 text-white' : 'bg-[#ff5734]/10 text-[#ff5734]'}`}>
              {urgency.label}
            </span>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="flex flex-col items-end pr-3 flex-shrink-0">
        <span className="text-[12px] font-black text-[#151313]">{formatDate(assignment.dueDate)}</span>
        {!urgency.hot && (
          <span className="text-[9px] text-slate-400 font-semibold">{urgency.label}</span>
        )}
      </div>
    </button>
  );
};

/* ─── Main Card ───────────────────────────────────────────── */
export default function LmsDeadlineCard() {
  const [assignments, setAssignments] = useState([]);
  const [lmsLinked,   setLmsLinked]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [lastSync,    setLastSync]    = useState(null);
  const navigate = useNavigate();
  const { id }   = useParams();

  useEffect(() => {
    (async () => {
      try {
        const res = await lmsService.getAssignments();
        const d   = res?.data;
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
    })();
  }, []);

  /* Loading */
  if (loading) return (
    <div className="p-5 space-y-2.5 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-[60px] bg-slate-50 border border-slate-100 rounded-2xl flex overflow-hidden">
          <div className="w-1 bg-slate-200" />
        </div>
      ))}
    </div>
  );

  /* Not linked */
  if (!lmsLinked) return (
    <div className="p-6 flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-14 h-14 rounded-[1.5rem] bg-[#151313] flex items-center justify-center">
        <GraduationCap size={26} weight="fill" className="text-[#fccc42]" />
      </div>
      <div>
        <p className="text-sm font-black text-[#151313]">Sync Academic Tasks</p>
        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">Link your Moodle to track assignments and quizzes.</p>
      </div>
      <button
        onClick={() => navigate(`/${id}/profile?section=lms`)}
        className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#ff5734] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#e64a2e] transition-all"
      >
        Connect Account <CaretRight size={12} weight="bold" />
      </button>
    </div>
  );

  /* Empty */
  if (assignments.length === 0) return (
    <div className="p-6 flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-14 h-14 rounded-[1.5rem] bg-[#fccc42] flex items-center justify-center">
        <CheckCircle size={26} weight="fill" className="text-[#151313]" />
      </div>
      <div>
        <p className="text-sm font-black text-[#151313]">All Clear!</p>
        <p className="text-xs text-slate-400 font-medium mt-1">No upcoming deadlines.</p>
      </div>
    </div>
  );

  /* Main */
  return (
    <div className="p-5 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#151313] flex items-center justify-center">
            <Sparkle size={15} weight="fill" className="text-[#fccc42]" />
          </div>
          <div>
            <p className="text-[11px] font-black text-[#151313] uppercase tracking-widest leading-none">Upcoming</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">LMS Deadlines</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/${id}/schedule`)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#151313] text-[#fccc42] text-[9px] font-black uppercase tracking-widest hover:bg-[#ff5734] hover:text-white transition-all"
        >
          All <CaretRight size={9} weight="bold" />
        </button>
      </div>

      {/* Items */}
      {assignments.map((a, idx) => (
        <DeadlineItem key={a._id} assignment={a} idx={idx} onClick={() => navigate(`/${id}/schedule`)} />
      ))}

      {/* Sync footer */}
      {lastSync && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auto Sync</span>
          </div>
          <span className="text-[9px] font-semibold text-slate-300">
            {new Date(lastSync).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
}
