import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  RefreshCw, Users, BookOpen, Zap, Activity, Trash2, Play,
  CheckCircle, XCircle, AlertTriangle, Search, Clock, Link2,
  TrendingUp, ChevronRight, MoreVertical, Wifi, WifiOff,
  Send, UserPlus, MessageSquare, CheckSquare, Square, Shield
} from 'lucide-react';

// ── API helpers ───────────────────────────────────────────────────────────────
const lmsAdmin = {
  getStats:          () => api.get('/admin/lms/stats'),
  getStudents:       (p) => api.get('/admin/lms/students', { params: p }),
  getUnlinked:       (p) => api.get('/admin/lms/students/unlinked', { params: p }),
  getAssignments:    (p) => api.get('/admin/lms/assignments', { params: p }),
  syncAll:           () => api.post('/admin/lms/sync/all'),
  runSystemAudit:    () => api.post('/admin/lms/sync/system-audit'),
  syncStudent:       (id) => api.post(`/admin/lms/sync/${id}`),
  removeCredentials: (id) => api.delete(`/admin/lms/students/${id}/credentials`),
  sendInvite:        (studentIds, message) => api.post('/admin/lms/invite', { studentIds, message }),
  health:            () => api.get('/admin/lms/service/health'),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  const days = Math.ceil((new Date(d) - Date.now()) / 86400000);
  const abs = Math.abs(days);
  if (days < 0)  return `${abs}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d`;
}
function fmtTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function urgencyClass(d) {
  if (!d) return 'text-slate-400';
  const days = Math.ceil((new Date(d) - Date.now()) / 86400000);
  if (days < 0)  return 'text-red-400';
  if (days <= 1) return 'text-red-400';
  if (days <= 3) return 'text-orange-400';
  if (days <= 7) return 'text-yellow-400';
  return 'text-slate-300';
}

const TYPE_BADGE = {
  assignment: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  tutorial:   'bg-blue-500/15 text-blue-400 border-blue-500/25',
  quiz:       'bg-purple-500/15 text-purple-400 border-purple-500/25',
  exam:       'bg-red-500/15 text-red-400 border-red-500/25',
  other:      'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'text-white', sub }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/8 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-white/5 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value ?? '—'}</p>
        <p className="text-xs text-slate-500 font-bold">{label}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LmsAdminPage() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [unlinked, setUnlinked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [assignSearch, setAssignSearch] = useState('');
  const [assignType, setAssignType] = useState('all');
  const [assignStatus, setAssignStatus] = useState('upcoming');
  const [unlinkedSearch, setUnlinkedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [inviteMsg, setInviteMsg] = useState('');
  const [sending, setSending] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadStats = useCallback(async () => {
    try {
      const r = await lmsAdmin.getStats();
      setStats(r.data.data);
    } catch { /* silent */ }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const r = await lmsAdmin.getStudents({ search: studentSearch, limit: 50 });
      setStudents(r.data.data);
    } catch { /* silent */ }
  }, [studentSearch]);

  const loadAssignments = useCallback(async () => {
    try {
      const r = await lmsAdmin.getAssignments({ search: assignSearch, type: assignType, status: assignStatus, limit: 50 });
      setAssignments(r.data.data);
    } catch { /* silent */ }
  }, [assignSearch, assignType, assignStatus]);

  const loadUnlinked = useCallback(async () => {
    try {
      const r = await lmsAdmin.getUnlinked({ search: unlinkedSearch, limit: 100 });
      setUnlinked(r.data.data);
    } catch { /* silent */ }
  }, [unlinkedSearch]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadStats();
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (tab === 'students') loadStudents(); }, [tab, loadStudents]);
  useEffect(() => { if (tab === 'assignments') loadAssignments(); }, [tab, loadAssignments]);
  useEffect(() => { if (tab === 'invite') loadUnlinked(); }, [tab, loadUnlinked]);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      await lmsAdmin.syncAll();
      showToast('Sync triggered for all enabled students.');
      setTimeout(loadStats, 3000);
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'LMS Sync Service unreachable.', 'error');
    } finally { setSyncing(false); }
  };

  const handleRunAudit = async () => {
    setSyncing(true);
    try {
      await lmsAdmin.runSystemAudit();
      showToast('Full system audit and sync started in background.');
      setTimeout(loadStats, 3000);
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'LMS Sync Service unreachable.', 'error');
    } finally { setSyncing(false); }
  };

  const handleSyncStudent = async (studentId, name) => {
    setSyncingId(studentId);
    try {
      await lmsAdmin.syncStudent(studentId);
      showToast(`Sync started for ${name}`);
      setTimeout(loadStudents, 3000);
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Sync failed.', 'error');
    } finally { setSyncingId(null); }
  };

  const handleRemove = async (studentId, name) => {
    if (!confirm(`Remove LMS credentials for ${name}? Their synced deadlines will also be deleted.`)) return;
    try {
      await lmsAdmin.removeCredentials(studentId);
      showToast(`Credentials removed for ${name}`);
      loadStudents();
      loadStats();
    } catch {
      showToast('Failed to remove credentials.', 'error');
    }
  };

  const handleSendInvite = async () => {
    if (selectedIds.length === 0) return;
    setSending(true);
    try {
      const r = await lmsAdmin.sendInvite(selectedIds, inviteMsg);
      showToast(r.data.message);
      setSelectedIds([]);
      setInviteMsg('');
      loadUnlinked();
      loadStats();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to send invitations.', 'error');
    } finally { setSending(false); }
  };

  const toggleSelect = (id) => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
  const selectAll = () => setSelectedIds(unlinked.map(s => s._id));
  const clearAll = () => setSelectedIds([]);

  return (
    <div className="min-h-full p-4 md:p-6 space-y-5 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Hero Header ── */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Admin Control</span>
              {stats !== null && (
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                  stats?.serviceOnline
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/20 border-red-500/30 text-red-300'
                }`}>
                  {stats?.serviceOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  Sync Service {stats?.serviceOnline ? 'Online' : 'Offline'}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">LMS Sync Hub</h1>
            <p className="text-white/50 text-sm mt-1">Monitor, manage, and trigger Moodle calendar synchronisation</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAudit}
              disabled={syncing}
              title="Full system sync + Coverage check"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all disabled:opacity-50 flex-shrink-0"
            >
              <Shield className={`w-4 h-4 ${syncing ? 'animate-pulse' : ''}`} />
              System Audit
            </button>
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/20 border border-white/30 text-white font-bold text-sm hover:bg-white/30 transition-all disabled:opacity-50 flex-shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing All...' : 'Sync All Students'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Link2}      label="LMS Linked"       value={stats?.totalLinked}         color="text-indigo-400" />
          <StatCard icon={Zap}        label="Sync Enabled"     value={stats?.totalEnabled}         color="text-emerald-400" />
          <StatCard icon={BookOpen}   label="Total Deadlines"  value={stats?.totalAssignments}     color="text-blue-400" />
          <StatCard icon={TrendingUp} label="Upcoming"         value={stats?.upcomingAssignments}  color="text-yellow-400" />
          <StatCard icon={AlertTriangle} label="Overdue"       value={stats?.overdueAssignments}   color="text-red-400" />
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/8 rounded-2xl w-fit">
        {[
          { id: 'overview',    label: 'Recent Syncs' },
          { id: 'students',    label: 'Students' },
          { id: 'assignments', label: 'All Deadlines' },
          { id: 'invite',      label: `Invite (${stats?.totalUnlinked ?? '…'})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.id === 'invite' ? (
              <span className="flex items-center gap-1.5">
                <Send className="w-3 h-3" />
                Invite Students
              </span>
            ) : t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Syncs */}
          <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/8 overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <h3 className="text-white font-black text-sm">Recent Activity</h3>
              <button onClick={loadStats} className="text-slate-500 hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {!stats?.recentSyncs?.length ? (
              <div className="p-12 text-center text-slate-500 text-sm">No syncs yet — trigger a sync to get started.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {stats.recentSyncs.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <span className="text-indigo-400 text-xs font-black">{s?.lmsCredentials?.username?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm font-mono">{s?.lmsCredentials?.username}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Automated Sync Completed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {fmtTime(s?.lmsCredentials?.lastSync)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coverage Alerts */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-white/5 border border-white/8 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Coverage Alerts</h3>
              </div>
              
              {!stats?.uncoveredGroups?.length ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-white font-bold text-sm">Full Coverage!</p>
                  <p className="text-xs text-slate-500 mt-1">Every combination has at least one student syncing LMS.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    The following groups have <span className="text-orange-400 font-bold underline">ZERO</span> students linked. 
                    Deadlines for these modules will NOT be updated.
                  </p>
                  {stats.uncoveredGroups.map((g, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-between group">
                      <div>
                        <p className="text-white font-bold text-xs">{g.label}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{g.studentCount} students unlinked</p>
                      </div>
                      <button 
                        onClick={() => {
                          setTab('invite');
                          setUnlinkedSearch(g.label);
                        }}
                        className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-500/20"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setTab('invite')}
                    className="w-full mt-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Open Inviter
                  </button>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="rounded-3xl bg-indigo-600/10 border border-indigo-500/20 p-6">
              <h4 className="text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">Sync Intelligence</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We only need <span className="text-white font-bold">one student</span> per combination to sync for the entire group to see updated deadlines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Students Tab ── */}
      {tab === 'students' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by LMS username..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <button onClick={loadStudents} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">LMS User</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Last Sync</th>
                  <th className="text-center px-5 py-3">Deadlines</th>
                  <th className="text-center px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500">No students with LMS credentials found.</td></tr>
                ) : students.map(s => (
                  <tr key={s._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-white font-bold text-sm">{s.name || '—'}</p>
                      <p className="text-slate-500 text-xs font-mono">{s.registrationNumber}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-indigo-400 font-mono text-xs">{s.lmsUsername}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-slate-400 text-xs">{fmtTime(s.lastSync)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-white font-black">{s.assignmentCount}</span>
                      {s.upcomingCount > 0 && <span className="text-yellow-400 text-xs ml-1">({s.upcomingCount} up)</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        s.syncEnabled
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-slate-500/15 text-slate-400 border border-slate-500/25'
                      }`}>
                        {s.syncEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSyncStudent(s._id, s.name)}
                          disabled={syncingId === s._id}
                          title="Sync now"
                          className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-all disabled:opacity-40"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === s._id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleRemove(s._id, s.name)}
                          title="Remove credentials"
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Assignments Tab ── */}
      {tab === 'assignments' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search title or module..."
                value={assignSearch}
                onChange={e => setAssignSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all w-60"
              />
            </div>
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              {['upcoming','all','overdue','completed'].map(s => (
                <button key={s} onClick={() => setAssignStatus(s)}
                  className={`px-3 py-2.5 text-xs font-bold capitalize transition-all ${assignStatus === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              {['all','assignment','tutorial','quiz','exam'].map(t => (
                <button key={t} onClick={() => setAssignType(t)}
                  className={`px-3 py-2.5 text-xs font-bold capitalize transition-all ${assignType === t ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                  {t === 'all' ? 'All' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="text-left px-5 py-3">Assignment</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Student</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Type</th>
                  <th className="text-right px-5 py-3">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assignments.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-500">No assignments found for this filter.</td></tr>
                ) : assignments.map(a => (
                  <tr key={a._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-white font-semibold text-sm line-clamp-1">{a.title}</p>
                      {a.moduleCode && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${TYPE_BADGE[a.type] || TYPE_BADGE.other}`}>{a.moduleCode}</span>}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-slate-300 text-xs font-bold">{a.student?.name || '—'}</p>
                      <p className="text-slate-600 text-[10px] font-mono">{a.student?.registrationNumber}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border capitalize ${TYPE_BADGE[a.type] || TYPE_BADGE.other}`}>{a.type}</span>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-black text-sm ${urgencyClass(a.dueDate)}`}>
                      {fmtDate(a.dueDate)}
                      <p className="text-slate-600 text-[10px] font-normal mt-0.5">
                        {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : ''}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Invite Tab ── */}
      {tab === 'invite' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Student Selector */}
          <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/8 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-white font-black text-sm">Unlinked Students</h3>
                <p className="text-slate-500 text-xs mt-0.5">{unlinked.length} students haven't connected their Moodle account yet</p>
              </div>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">All</button>
                <span className="text-slate-700">·</span>
                <button onClick={clearAll} className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">None</button>
              </div>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by reg number..."
                  value={unlinkedSearch}
                  onChange={e => setUnlinkedSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl bg-white/5 border border-white/8 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500/40 transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
              {unlinked.length === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-emerald-400 font-bold text-sm">All students have linked their account!</p>
                </div>
              ) : unlinked.map(s => {
                const sel = selectedIds.includes(s._id);
                return (
                  <label key={s._id} className={`flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-white/5 transition-colors ${sel ? 'bg-indigo-500/5' : ''}`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${sel ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'}`}>
                      {sel && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" className="sr-only" checked={sel} onChange={() => toggleSelect(s._id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{s.name || '—'}</p>
                      <p className="text-slate-500 text-xs font-mono">{s.registrationNumber}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Compose & Send */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-white/5 border border-white/8 p-5 space-y-4">
              <div>
                <h3 className="text-white font-black text-sm">Compose Invitation</h3>
                <p className="text-slate-500 text-xs mt-1">Selected: <span className="text-indigo-400 font-bold">{selectedIds.length} student{selectedIds.length !== 1 ? 's' : ''}</span></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Custom Message (optional)</label>
                <textarea
                  value={inviteMsg}
                  onChange={e => setInviteMsg(e.target.value)}
                  rows={5}
                  placeholder="Leave blank to use the default invitation message..."
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              {/* Preview of default message */}
              {!inviteMsg && (
                <div className="p-3 rounded-xl bg-indigo-500/8 border border-indigo-500/20 text-xs text-slate-400 leading-relaxed">
                  <p className="font-bold text-indigo-400 mb-1">Default message:</p>
                  Your administrator has invited you to connect your Moodle LMS account. Link it from your Profile to get automatic deadline reminders.
                </div>
              )}

              <button
                onClick={handleSendInvite}
                disabled={selectedIds.length === 0 || sending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/30"
              >
                <Send className={`w-4 h-4 ${sending ? 'animate-pulse' : ''}`} />
                {sending ? 'Sending...' : `Send Invite${selectedIds.length > 1 ? 's' : ''} (${selectedIds.length})`}
              </button>
            </div>

            {/* Info card */}
            <div className="rounded-3xl bg-white/5 border border-white/8 p-5 space-y-2">
              <h4 className="text-white font-bold text-xs">How It Works</h4>
              <ol className="space-y-2 text-xs text-slate-400">
                <li className="flex gap-2"><span className="text-indigo-400 font-black">1.</span> Select students who haven't linked their Moodle account</li>
                <li className="flex gap-2"><span className="text-indigo-400 font-black">2.</span> Send a real-time notification (appears in their notification bell)</li>
                <li className="flex gap-2"><span className="text-indigo-400 font-black">3.</span> Student taps notification → goes to Profile → links account</li>
                <li className="flex gap-2"><span className="text-indigo-400 font-black">4.</span> Sync service picks up credentials and pulls their Moodle deadlines</li>
              </ol>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
