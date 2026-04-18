import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, CalendarBlank, ArrowRight, X,
  CheckCircle, Link, ArrowLeft, Lightning,
  GraduationCap, ListChecks, ArrowsClockwise,
  MagnifyingGlass, Sparkle, Megaphone, CaretDown
} from '@phosphor-icons/react';
import lmsService from '../../services/lmsService';
import { useNavigate, useParams } from 'react-router-dom';
import UnifiedPageLoader from '../../components/loaders/UnifiedPageLoader';

// ── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  assignment: { label: 'Assignment', color: 'text-orange-500', bg: 'from-orange-500/20 to-[#fccc42]/20', border: 'border-orange-500/10', tag: 'bg-orange-500/10 text-orange-500 border-orange-500/10' },
  tutorial:   { label: 'Tutorial',   color: 'text-blue-500',   bg: 'from-blue-500/20 to-blue-300/20',     border: 'border-blue-500/10',   tag: 'bg-blue-500/10 text-blue-500 border-blue-500/10'     },
  quiz:       { label: 'Quiz',       color: 'text-purple-500', bg: 'from-purple-500/20 to-pink-300/20',   border: 'border-purple-500/10', tag: 'bg-purple-500/10 text-purple-500 border-purple-500/10' },
  exam:       { label: 'Exam',       color: 'text-red-500',    bg: 'from-red-500/20 to-rose-300/20',      border: 'border-red-500/10',    tag: 'bg-red-500/10 text-red-500 border-red-500/10'         },
  other:      { label: 'Task',       color: 'text-slate-500',  bg: 'from-slate-300/40 to-slate-200/40',   border: 'border-slate-200',     tag: 'bg-slate-100 text-slate-500 border-slate-200'         },
};

function getUrgency(dueDate) {
  if (!dueDate) return { label: 'No Date', color: 'text-slate-400', dot: 'bg-slate-300', days: null };
  const days = Math.ceil((new Date(dueDate) - Date.now()) / 86400000);
  if (days < 0)   return { label: 'Overdue',          color: 'text-red-500',    dot: 'bg-red-500',           days };
  if (days === 0) return { label: 'Due Today',         color: 'text-red-500',    dot: 'bg-red-500 animate-pulse', days };
  if (days === 1) return { label: 'Tomorrow',          color: 'text-orange-500', dot: 'bg-orange-500 animate-pulse', days };
  if (days <= 3)  return { label: `${days} days left`, color: 'text-amber-500',  dot: 'bg-amber-500',         days };
  if (days <= 7)  return { label: `${days} days left`, color: 'text-blue-500',   dot: 'bg-blue-400',          days };
  return           { label: `${days} days left`, color: 'text-slate-400',  dot: 'bg-emerald-400',       days };
}

function fmtDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (d.getHours() === 0 && d.getMinutes() === 0) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function typeIcon(type) {
  if (type === 'quiz')  return <Lightning size={22} weight="duotone" />;
  if (type === 'exam')  return <GraduationCap size={22} weight="duotone" />;
  return <BookOpen size={22} weight="duotone" />;
}

// ── Detail Modal ─────────────────────────────────────────────────────────────

function DeadlineModal({ item, onClose, onToggle }) {
  if (!item) return null;
  const cfg     = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
  const urgency = getUrgency(item.dueDate);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white/95 dark:bg-[#1c1c1c]/95 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl shadow-[#ff5734]/10 overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${cfg.bg} border ${cfg.border} flex items-center justify-center ${cfg.color}`}>
              {typeIcon(item.type)}
            </div>
            <div>
              <p className="text-[10px] font-black text-[#ff5734] uppercase tracking-widest">Deadline Detail</p>
              <div className="flex items-center gap-2 mt-0.5">
                <CalendarBlank size={12} className="text-slate-400" />
                <span className="text-[11px] text-slate-500 font-bold">{fmtDate(item.dueDate)}</span>
                {fmtTime(item.dueDate) && (
                  <span className="text-[11px] text-slate-500 font-bold">@ {fmtTime(item.dueDate)}</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all">
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${cfg.tag}`}>
              {cfg.label}
            </span>
            {item.moduleCode && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md">
                {item.moduleCode}
              </span>
            )}
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 ${urgency.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
              {urgency.label}
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">{item.title}</h2>

          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</span>
              <span className="text-sm font-black text-[#151313]">{fmtDate(item.dueDate)}{fmtTime(item.dueDate) && ` · ${fmtTime(item.dueDate)}`}</span>
            </div>
            {item.moduleCode && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module</span>
                <span className="text-sm font-black text-[#151313]">{item.moduleCode}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
              <span className={`text-sm font-black ${item.isCompleted ? 'text-emerald-500' : urgency.color}`}>
                {item.isCompleted ? 'Completed ✓' : urgency.label}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</span>
              <div className="flex items-center gap-1 text-[10px] font-black text-[#ff5734] uppercase tracking-widest">
                <ArrowsClockwise size={10} />
                LMS Auto-Synced
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkle size={12} className="text-[#ff5734]" /> Auto-synced from Moodle
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { onToggle(item._id); onClose(); }}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest ${
                item.isCompleted
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
              }`}
            >
              {item.isCompleted ? 'Mark Incomplete' : 'Mark Done'}
            </button>
            <button onClick={onClose} className="px-7 py-2.5 bg-[#ff5734] hover:bg-[#e64a2e] text-white text-[11px] font-black rounded-2xl transition-all shadow-lg shadow-[#ff5734]/25 uppercase tracking-widest">
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function StudentSchedule() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const [loading,     setLoading]     = useState(true);
  const [lmsLinked,   setLmsLinked]   = useState(false);
  const [lmsUsername, setLmsUsername] = useState(null);
  const [lastSync,    setLastSync]    = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [filter,      setFilter]      = useState('upcoming');
  const [typeFilter,  setTypeFilter]  = useState('all');
  const [search,      setSearch]      = useState('');

  const fetchData = async () => {
    try {
      const res = await lmsService.getAssignments();
      const d   = res?.data;
      if (!d) return;

      setLmsLinked(!!d.lmsLinked);
      setLmsUsername(d.lmsUsername || '');
      setLastSync(d.lastSync);
      setAssignments(Array.isArray(d.data) ? d.data : []);
    } catch (err) {
      console.error("Failed to fetch deadlines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (assignId) => {
    try {
      const res = await lmsService.toggleComplete(assignId);
      setAssignments(prev =>
        prev.map(a => a._id === assignId ? { ...a, isCompleted: res.data.data.isCompleted } : a)
      );
    } catch { /* silent */ }
  };

  const filtered = useMemo(() => {
    if (!Array.isArray(assignments)) return [];
    let list = [...assignments];
    const q = search?.trim()?.toLowerCase();
    
    if (filter === 'upcoming') {
      list = list.filter(a => a && !a.isCompleted && (!a.dueDate || new Date(a.dueDate) >= new Date(Date.now() - 86400000)));
    } else if (filter === 'completed') {
      list = list.filter(a => a && a.isCompleted);
    }
    
    if (typeFilter !== 'all') {
      list = list.filter(a => a && a.type === typeFilter);
    }
    
    if (q) {
      list = list.filter(a => 
        (a?.title?.toLowerCase() || '').includes(q) || 
        (a?.moduleCode?.toLowerCase() || '').includes(q)
      );
    }
    
    return list.sort((a, b) => {
      if (!a?.dueDate) return 1;
      if (!b?.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [assignments, filter, typeFilter, search]);

  const upcomingCount = (assignments || []).filter(a => a && !a.isCompleted && (!a.dueDate || new Date(a.dueDate) >= new Date(Date.now() - 86400000))).length;
  const overdueCount  = (assignments || []).filter(a => a && !a.isCompleted && a.dueDate && new Date(a.dueDate) < new Date(Date.now() - 86400000)).length;

  // ── Skeleton Loader Component ──
  const Skeleton = ({ className }) => (
    <div className={`bg-slate-100 animate-pulse rounded-2xl ${className}`} />
  );

  if (loading) return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Status Bar Skeletons */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-40 rounded-2xl" />
        <Skeleton className="h-10 w-44 rounded-2xl" />
      </div>

      {/* Search & Filters Skeleton */}
      <div className="bg-white rounded-[2.5rem] p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <div className="flex gap-2">
          <Skeleton className="h-12 w-32 rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>
      </div>

      {/* Task List Skeleton */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-sm min-h-[400px]">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
              <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Not linked ─────────────────────────────────────────────────────────────
  if (!lmsLinked) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
        {/* Header handled by TopNavbar */}
        <div className="bg-white rounded-[2.5rem] p-16 border border-slate-200 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-[#ff5734]/10 flex items-center justify-center mx-auto mb-6">
            <Link size={36} weight="duotone" className="text-[#ff5734]" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Connect Your LMS</h2>
          <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            Link your Moodle account to automatically sync deadlines, assignments, and tutorials.
          </p>
          <button
            onClick={() => navigate(`/${id}/profile?section=lms`)}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#ff5734] text-white font-black text-sm hover:bg-[#e64a2e] transition-all shadow-lg shadow-[#ff5734]/25"
          >
            Connect LMS Account
            <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // ── Main View ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Status Bar */}
      {(overdueCount > 0 || upcomingCount > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          {overdueCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-2xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{overdueCount} Overdue Tasks</span>
            </div>
          )}
          {upcomingCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-[#ff5734]/5 border border-[#ff5734]/10 rounded-2xl shadow-sm">
              <ListChecks size={18} weight="duotone" className="text-[#ff5734]" />
              <p className="text-[10px] font-bold text-[#ff5734] leading-tight uppercase tracking-widest">
                {upcomingCount} Upcoming Tasks
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Search & Filters ── */}
      <div className="bg-white rounded-[2.5rem] p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="flex-1 relative group">
          <MagnifyingGlass size={16} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff5734] transition-colors" />
          <input
            type="text"
            placeholder="Search tasks, modules, or deadlines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5734]/20 focus:border-[#ff5734] transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg transition-colors">
              <X size={14} weight="bold" className="text-slate-400" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Desktop Filters (Hidden on small screens) */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-2xl">
              {['upcoming', 'completed', 'all'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-[#151313] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-2xl">
              {['all', 'assignment', 'quiz', 'tutorial'].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    typeFilter === t ? 'bg-[#ff5734] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t === 'all' ? 'All' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Filters (Dropdowns - shown on small screens) */}
          <div className="flex lg:hidden items-center gap-2 w-full">
            <div className="relative flex-1 group">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff5734]/20"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="all">All Status</option>
              </select>
              <CaretDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative flex-1 group">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-[#ff5734] focus:outline-none focus:ring-2 focus:ring-[#ff5734]/20"
              >
                <option value="all">All Types</option>
                <option value="assignment">Assignments</option>
                <option value="quiz">Quizzes</option>
                <option value="tutorial">Tutorials</option>
              </select>
              <CaretDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#ff5734] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Task List ── */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-sm min-h-[400px]">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle size={40} weight="duotone" className="mx-auto text-emerald-400 mb-4" />
            <p className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">All Clear!</p>
            <p className="text-xs text-slate-400">No tasks match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, index) => {
              const cfg     = TYPE_CONFIG[a.type] || TYPE_CONFIG.other;
              const urgency = getUrgency(a.dueDate);

              return (
                <button
                  key={a._id}
                  onClick={() => setSelected(a)}
                  className={`w-full group flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer
                    animate-in fade-in slide-in-from-right-4 duration-500
                    ${a.isCompleted
                      ? 'bg-slate-50/50 border-slate-100 opacity-60 hover:opacity-80'
                      : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-[#ff5734]/20 hover:shadow-lg hover:shadow-black/[0.03]'
                    }`}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                  {/* Type Icon */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${cfg.color}`}>
                    {typeIcon(a.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${cfg.tag}`}>
                        {cfg.label}
                      </span>
                      {a.moduleCode && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md">
                          {a.moduleCode}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                        <CalendarBlank size={12} weight="fill" className="text-slate-400" />
                        {fmtDate(a.dueDate)}{fmtTime(a.dueDate) && ` · ${fmtTime(a.dueDate)}`}
                      </span>
                    </div>
                    <h4 className={`text-sm font-black text-slate-800 group-hover:text-[#ff5734] transition-colors truncate leading-tight ${a.isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {a.title}
                    </h4>
                    <p className={`text-[11px] mt-1 leading-relaxed flex items-center gap-1 font-bold ${urgency.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urgency.dot}`} />
                      {a.isCompleted ? 'Completed' : urgency.label}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all uppercase tracking-tighter hidden sm:block">
                      View Details
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#ff5734] transition-all shadow-xl">
                      <ArrowRight size={16} weight="bold" className="text-slate-400 group-hover:text-white transition-all" />
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Auto-sync footer hint */}
            {filtered.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#ff5734]/5 border border-[#ff5734]/10">
                <ArrowsClockwise size={13} className="text-[#ff5734]" />
                <p className="text-[10px] font-black text-[#ff5734] uppercase tracking-widest">
                  Auto Sync Active · Every 12 Hours
                  {lastSync && ` · Last: ${new Date(lastSync).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <DeadlineModal
        item={selected}
        onClose={() => setSelected(null)}
        onToggle={(id) => { handleToggle(id); setSelected(prev => prev ? { ...prev, isCompleted: !prev.isCompleted } : null); }}
      />
    </div>
  );
}
