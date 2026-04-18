/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Calendar, CheckCircle2, Clock, Info, 
  ChevronRight, AlertCircle, Bookmark, CheckSquare, 
  Layers, Download, Zap, Sparkles 
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api/v1';

const PRIORITY_COLORS = {
  urgent: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: <Zap className="w-4 h-4" /> },
  high:   { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5', icon: <AlertCircle className="w-4 h-4" /> },
  medium: { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe', icon: <Layers className="w-4 h-4" /> },
  low:    { bg: '#f9fafb', text: '#4b5563', border: '#e5e7eb', icon: <Bookmark className="w-4 h-4" /> },
};

export default function DeadlineCompanion({ accountId }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('upcoming'); // 'upcoming', 'calendar', 'completed'

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/lms/resources?accountId=${accountId}&limit=100&type=assignment`);
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const toggleStatus = async (resource) => {
    const newStatus = resource.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`${API}/lms/resources/${resource._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setResources(prev => prev.map(r => r._id === resource._id ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const upcomingTasks = useMemo(() => {
    const isAdmin = authService.getUser()?.roles?.some(r => ['admin', 'superadmin'].includes(r));
    const now = new Date();
    
    return resources
      .filter(r => {
        if (r.status === 'completed') return false;
        if (!r.deadline) return false;
        
        // If student, only show future deadlines
        if (!isAdmin) {
          return new Date(r.deadline) >= now;
        }
        
        return true;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [resources]);

  const completedTasksCount = useMemo(() => {
    return resources.filter(r => r.status === 'completed').length;
  }, [resources]);

  const urgentCount = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return upcomingTasks.filter(t => new Date(t.deadline) <= tomorrow).length;
  }, [upcomingTasks]);

  return (
    <div style={sh.container}>
      {/* Header Stat Strip */}
      <div style={sh.grid}>
        <div style={{ ...sh.card, borderBottom: `3px solid #f97316` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Upcoming</p>
              <p style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{upcomingTasks.length}</p>
            </div>
          </div>
        </div>
        <div style={{ ...sh.card, borderBottom: `3px solid #ef4444` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap className="w-5 h-5 text-red-500" />
            <div>
              <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Urgent</p>
              <p style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{urgentCount}</p>
            </div>
          </div>
        </div>
        <div style={{ ...sh.card, borderBottom: `3px solid #10b981` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Completed</p>
              <p style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{completedTasksCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={sh.content}>
        {/* Left Column: Task List */}
        <div style={sh.listSection}>
          <div style={sh.sectionHeader}>
            <h3 style={sh.sectionTitle}>Smart Deadlines</h3>
            <div style={sh.tabs}>
              <button 
                onClick={() => setView('upcoming')}
                style={{
                  ...sh.tab,
                  background: view === 'upcoming' ? '#2563eb' : 'transparent',
                  color: view === 'upcoming' ? '#fff' : '#64748b',
                  fontWeight: view === 'upcoming' ? 600 : 400,
                }}
              >Pending</button>
              <button 
                onClick={() => setView('completed')}
                style={{
                  ...sh.tab,
                  background: view === 'completed' ? '#2563eb' : 'transparent',
                  color: view === 'completed' ? '#fff' : '#64748b',
                  fontWeight: view === 'completed' ? 600 : 400,
                }}
              >History</button>
            </div>
          </div>

          {loading ? (
             <div style={sh.loading}>Loading your companion...</div>
          ) : upcomingTasks.length === 0 && view === 'upcoming' ? (
            <div style={sh.empty}>
              <Sparkles className="w-12 h-12 text-blue-300 mb-2" />
              <p>Hooray! No pending deadlines.</p>
            </div>
          ) : (
            <div style={sh.scrollArea}>
              {(view === 'upcoming' ? upcomingTasks : resources.filter(r => r.status === 'completed')).map(task => (
                <div 
                  key={task._id}
                  onClick={() => setSelectedId(task._id)}
                  style={{ 
                    ...sh.taskItem, 
                    borderLeft: `4px solid ${ (view === 'upcoming' && (new Date(task.deadline) - Date.now() < 86400000)) ? '#ef4444' : (PRIORITY_COLORS[task.priority]?.text || '#2563eb')}`,
                    background: selectedId === task._id ? '#f8fafc' : '#fff'
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleStatus(task); }}
                      style={task.status === 'completed' ? sh.checkBtnDone : sh.checkBtn}
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ ...sh.taskName, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                        <span style={{ color: '#2563eb', fontSize: 10, display: 'block', marginBottom: 2 }}>{task.moduleCode || task.courseName.split(' ')[0]}</span>
                        {task.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                         <span style={{ 
                           ...sh.pBadge, 
                           background: (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium).bg, 
                           color: (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium).text, 
                           borderColor: (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium).border 
                         }}>
                           {task.priority || 'medium'}
                         </span>
                         <span style={sh.timeText}>
                           {new Date(task.deadline).toLocaleDateString()}
                         </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Insights & Details */}
        <div style={sh.detailSection}>
          {selectedId ? (
            <div style={sh.details}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                 <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Task Insights</h3>
                 <button onClick={() => setSelectedId(null)} style={sh.closeBtn}>×</button>
              </div>

              {(() => {
                const task = resources.find(r => r._id === selectedId);
                const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                return (
                  <>
                    <div style={{ marginBottom: 20 }}>
                      <p style={sh.subTitle}>MODULE NAME</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 12px' }}>{task.moduleCode || task.courseName}</p>
                      
                      <p style={sh.subTitle}>DOCUMENT NAME</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 12px' }}>{task.name}</p>

                      <p style={sh.subTitle}>DEADLINE</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', margin: '0 0 12px' }}>{new Date(task.deadline).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </div>

                    <div style={sh.aiBox}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span style={{ fontSize: 10, fontWeight: 900, color: '#1e40af', letterSpacing: 1 }}>INSTRUCTIONS</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#1e3a8a', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                        {task.aiSummary || "No specific instructions extracted. Please refer to the Moodle activity for details."}
                      </p>
                    </div>

                    {task.aiKeywords?.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <p style={sh.subTitle}>KEY CONSTRAINTS</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {task.aiKeywords.map(k => (
                            <span key={k} style={sh.keywordChip}>{k}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={sh.footerGrid}>
                       <div style={sh.infoBox}>
                         <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Submission</p>
                         <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: 0 }}>{task.submissionFormat || 'Moodle'}</p>
                       </div>
                       <div style={sh.infoBox}>
                         <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Priority</p>
                         <p style={{ fontSize: 13, fontWeight: 600, color: p.text, margin: 0 }}>{task.priority}</p>
                       </div>
                    </div>

                    {task.driveUrl && (
                      <a href={task.driveUrl} target="_blank" rel="noreferrer" style={sh.driveBtn}>
                        <Download className="w-4 h-4" /> Download Related Materials
                      </a>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div style={sh.detailPlaceholder}>
              <Info className="w-10 h-10 text-gray-300 mb-3" />
              <p>Select a deadline to see<br/>AI-powered insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles (Premium UI) ───────────────────────────────────────────────────────
const sh = {
  container: { maxWidth: 1000, margin: '20px auto', fontFamily: 'Inter, system-ui, sans-serif' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  card: { background: '#fff', padding: '16px 20px', borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  content: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, height: 600 },
  listSection: { background: '#fff', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' },
  tabs: { display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3 },
  tab: { border: 'none', padding: '6px 12px', fontSize: 13, borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' },
  scrollArea: { flex: 1, overflowY: 'auto', paddingRight: 4 },
  taskItem: { padding: '14px 16px', borderRadius: 12, marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #f1f5f9', position: 'relative' },
  checkBtn: { width: 22, height: 22, borderRadius: '50%', border: '2px solid #cbd5e1', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkBtnDone: { width: 22, height: 22, borderRadius: '50%', border: '2px solid #10b981', background: '#10b981', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  taskName: { margin: 0, fontSize: 14, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  pBadge: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, border: '1px solid' },
  timeText: { fontSize: 12, color: '#94a3b8' },
  detailSection: { background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' },
  detailPlaceholder: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#94a3b8' },
  details: { padding: 24, height: '100%', display: 'flex', flexDirection: 'column' },
  aiBox: { background: '#eff6ff', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #dbeafe' },
  subTitle: { fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5, marginBottom: 8 },
  keywordChip: { fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 6 },
  footerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 'auto' },
  infoBox: { background: '#f8fafc', padding: 12, borderRadius: 8 },
  driveBtn: { marginTop: 20, background: '#2563eb', color: '#fff', borderRadius: 10, padding: '12px', textAlign: 'center', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  loading: { padding: 40, textAlign: 'center', color: '#64748b' },
  empty: { padding: 60, textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }
};
