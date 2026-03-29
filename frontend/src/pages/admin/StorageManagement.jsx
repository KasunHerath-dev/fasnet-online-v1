import React, { useState, useEffect, useCallback } from 'react'
import {
  CloudArrowUp, HardDrive, Folders, Lightning, Spinner,
  XCircle, Play, Stop, Eye, MagnifyingGlass, Check,
  CaretRight, CaretDown, FileText, Database,
  ArrowClockwise, Warning, Cloud
} from '@phosphor-icons/react'
import api from '../../services/api'
import { toast } from 'react-hot-toast'
import ResourceManagement from '../../components/admin/ResourceManagement'
import StorageExplorer from '../../components/admin/StorageExplorer'
import GoogleDriveConfig from '../../components/admin/GoogleDriveConfig'

/* ─── helpers ─── */
const pct = (p) => p?.total ? Math.round((p.current / p.total) * 100) : 0

const CATEGORY_COLORS = {
  Tutorials: '#6366f1',
  'Past Papers': '#f59e0b',
  Assignments: '#10b981',
  'Marking Schemes': '#06b6d4',
  'Reference Books': '#8b5cf6',
  'General Resources': '#64748b',
}

/* ─── Tokens ─── */
const T = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  text: '#0f172a',
  textMid: '#334155',
  textSub: '#64748b',
  textMuted: '#94a3b8',
}

/* ─── ConfigSection ─── */
const ConfigSection = ({ title, icon: Icon, accentColor, badge, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: T.card,
        border: `1px solid ${open ? `${accentColor}40` : T.border}`,
        boxShadow: open ? `0 4px 20px ${accentColor}12` : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left transition-colors"
        style={{
          borderBottom: open ? `1px solid ${T.border}` : 'none',
          background: open ? `${accentColor}06` : 'transparent',
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
        >
          <Icon size={17} weight="duotone" style={{ color: accentColor }} />
        </div>
        <p className="text-sm font-bold flex-1" style={{ color: T.text }}>{title}</p>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full mr-3"
          style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
        >
          {badge}
        </span>
        <CaretDown
          size={14}
          className="flex-shrink-0 transition-transform duration-200"
          style={{ color: T.textSub, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        />
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

/* ─── StatCard ─── */
const StatCard = ({ label, value, color, icon: Icon, sub }) => (
  <div
    className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3"
    style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      boxShadow: `0 2px 12px ${color}12`,
    }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}
    >
      <Icon size={20} style={{ color }} weight="duotone" />
    </div>
    <div>
      <p className="text-3xl font-bold tracking-tight" style={{ color: T.text }}>{value}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>{sub}</p>}
    </div>
    <div
      className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none"
      style={{ background: color }}
    />
  </div>
)

/* ─── StepBadge ─── */
const StepBadge = ({ step, label, desc, current, completed }) => (
  <div
    className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200"
    style={{
      background: current ? '#6366f108' : completed ? '#10b98108' : 'transparent',
      border: current ? '1px solid #6366f130' : completed ? '1px solid #10b98120' : `1px solid transparent`,
    }}
  >
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5"
      style={{
        background: current ? '#6366f1' : completed ? '#10b981' : '#e2e8f0',
        color: current || completed ? '#fff' : T.textMuted,
        boxShadow: current ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
      }}
    >
      {completed ? <Check size={13} weight="bold" /> : step}
    </div>
    <div>
      <p className="text-sm font-semibold leading-tight" style={{ color: current || completed ? T.text : T.textMuted }}>
        {label}
      </p>
      <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>{desc}</p>
    </div>
  </div>
)

/* ─── TreeNode ─── */
const TreeNode = ({ nodeKey, value, depth = 0, expandedNodes, toggleNode, prefix = '' }) => {
  const currentPath = `${prefix}${nodeKey}`
  const isExpanded = expandedNodes.has(currentPath)
  const isLevel = nodeKey.startsWith('Level')
  const isSemester = nodeKey.startsWith('Semester')
  const isModule = !isLevel && !isSemester && value.files
  const count = value.count ?? value.files?.length ?? 0
  const accentColor = isLevel ? '#6366f1' : isSemester ? '#8b5cf6' : '#f59e0b'

  return (
    <div className={depth > 0 ? 'pl-4 border-l' : ''} style={{ borderColor: '#e2e8f0' }}>
      <button
        onClick={() => toggleNode(currentPath)}
        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg my-0.5 text-left transition-colors hover:bg-slate-50 group"
      >
        <span className="text-slate-400 w-3.5 flex-shrink-0">
          {isExpanded ? <CaretDown size={12} /> : <CaretRight size={12} />}
        </span>
        <Folders size={15} weight="duotone" style={{ color: accentColor, flexShrink: 0 }} />
        <span className="text-sm font-medium truncate flex-1" style={{ color: isLevel ? '#4f46e5' : isSemester ? '#7c3aed' : '#92400e' }}>
          {nodeKey}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
          style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}25` }}
        >
          {count}
        </span>
      </button>
      {isExpanded && (
        <div>
          {value.semesters && Object.entries(value.semesters).map(([k, v]) => (
            <TreeNode key={k} nodeKey={k} value={v} depth={depth + 1} expandedNodes={expandedNodes} toggleNode={toggleNode} prefix={currentPath + '/'} />
          ))}
          {value.modules && Object.entries(value.modules).map(([k, v]) => (
            <TreeNode key={k} nodeKey={k} value={v} depth={depth + 1} expandedNodes={expandedNodes} toggleNode={toggleNode} prefix={currentPath + '/'} />
          ))}
          {isModule && value.files.map(file => (
            <div key={file.id} className="flex items-center gap-2 pl-7 py-1 text-[11px] hover:bg-slate-50" style={{ color: T.textSub }}>
              <FileText size={12} style={{ color: T.textMuted }} />
              <span className="truncate flex-1" style={{ color: T.textMid }}>{file.title}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ background: `${CATEGORY_COLORS[file.category] || '#64748b'}15`, color: CATEGORY_COLORS[file.category] || '#64748b' }}>
                {file.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─── */
const StorageManagement = () => {
  const [activeTab, setActiveTab] = useState('migration')
  const [stats, setStats] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [migrationMap, setMigrationMap] = useState(null)
  const [migrationStep, setMigrationStep] = useState(1)
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  const fetchStatsAndStatus = useCallback(async () => {
    try {
      const [sR, pR] = await Promise.all([
        api.get('/settings/migration/stats'),
        api.get('/settings/migration/status'),
      ])
      setStats(sR.data.stats)
      setProgress(pR.data.progress)
      if (pR.data.progress?.active) setMigrationStep(3)
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    fetchStatsAndStatus()
    const id = setInterval(() => { if (migrationStep === 3) fetchStatsAndStatus() }, 4000)
    return () => clearInterval(id)
  }, [fetchStatsAndStatus, migrationStep])

  const startScan = async () => {
    setScanning(true)
    try {
      const res = await api.get('/settings/migration/map')
      setMigrationMap(res.data.tree)
      setMigrationStep(2)
      toast.success('Discovery scan complete!')
    } catch (e) {
      toast.error('Scan failed: ' + (e.response?.data?.message || e.message))
    } finally { setScanning(false) }
  }

  const startMigration = async () => {
    setLoading(true)
    try {
      await api.post('/settings/migration/start')
      setMigrationStep(3)
      toast.success('Storage Sync Engine started!')
      fetchStatsAndStatus()
    } catch (e) {
      toast.error('Failed: ' + (e.response?.data?.message || e.message))
    } finally { setLoading(false) }
  }

  const stopMigration = async () => {
    try {
      await api.post('/settings/migration/stop')
      toast.success('Stop signal sent. Finishing current file…')
    } catch (e) {
      toast.error('Stop failed: ' + (e.response?.data?.message || e.message))
    }
  }

  const toggleNode = (path) => {
    const next = new Set(expandedNodes)
    next.has(path) ? next.delete(path) : next.add(path)
    setExpandedNodes(next)
  }

  const totalFiles = stats ? stats.megaCount + stats.driveCount : 0
  const migratedPct = stats && totalFiles > 0 ? Math.round((stats.driveCount / totalFiles) * 100) : 0

  const tabs = [
    { id: 'migration', label: 'Sync Center', icon: Lightning },
    { id: 'explorer', label: 'Explorer', icon: HardDrive },
    { id: 'config', label: 'Config', icon: CloudArrowUp },
  ]

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: T.bg, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
          >
            <Database size={24} weight="duotone" className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.text }}>Cloud Storage Center</h1>
            <p className="text-sm mt-0.5" style={{ color: T.textSub }}>Scan, preview, and migrate your cloud file ecosystem</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div
          className="flex p-1 rounded-xl gap-1"
          style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          {tabs.map((t) => {
            const active = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: active ? '#6366f1' : 'transparent',
                  color: active ? '#fff' : T.textSub,
                  boxShadow: active ? '0 2px 10px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                <t.icon size={16} weight={active ? 'fill' : 'regular'} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Config Tab ── */}
      {activeTab === 'config' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <ConfigSection title="Google Drive Integration" icon={Cloud} accentColor="#6366f1" badge="Cloud Provider" defaultOpen={false}>
            <GoogleDriveConfig />
          </ConfigSection>
          <ConfigSection title="Resource Management" icon={Folders} accentColor="#10b981" badge="Content" defaultOpen={true}>
            <ResourceManagement />
          </ConfigSection>
        </div>
      )}

      {/* ── Explorer Tab ── */}
      {activeTab === 'explorer' && (
        <div className="animate-in fade-in duration-300">
          <StorageExplorer />
        </div>
      )}

      {/* ── Migration Tab ── */}
      {activeTab === 'migration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-300">

          {/* Left Panel */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <StatCard label="On Mega Drive" value={stats?.megaCount ?? '—'} color="#f59e0b" icon={Database} sub={stats?.activeStorage === 'mega' ? 'Active Storage' : 'Pending Sync'} />
              <StatCard label="On Google Drive" value={stats?.driveCount ?? '—'} color="#10b981" icon={CloudArrowUp} sub={stats?.activeStorage === 'google_drive' ? 'Active Storage' : 'Pending Sync'} />
            </div>

            {/* Progress Ring */}
            <div className="rounded-2xl p-5 flex flex-col items-center gap-3" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#lgrad)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2.51327 * migratedPct} ${2.51327 * (100 - migratedPct)}`}
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                  <defs>
                    <linearGradient id="lgrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: T.text }}>{migratedPct}%</span>
                  <span className="text-[9px] font-medium" style={{ color: T.textMuted }}>migrated</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: T.text }}>{stats?.driveCount ?? 0} / {totalFiles} files synced</p>
                <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>Total cloud ecosystem</p>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest px-1 mb-1" style={{ color: T.textMuted }}>Sync Workflow</p>
              <StepBadge step={1} label="Discovery Scan" desc={`Map ${stats?.activeStorage === 'mega' ? 'Drive → Mega' : 'Mega → Drive'} hierarchy`} current={migrationStep === 1} completed={migrationStep > 1} />
              <StepBadge step={2} label="Preview Structure" desc="Review placement tree" current={migrationStep === 2} completed={migrationStep > 2} />
              <StepBadge step={3} label="Execute Transfer" desc="Cloud-to-cloud streaming" current={migrationStep === 3} completed={false} />

              <div className="mt-3 space-y-2">
                {migrationStep === 1 && (
                  <button onClick={startScan} disabled={scanning}
                    className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white transition-all active:scale-[0.97] disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                    {scanning ? <Spinner size={16} className="animate-spin" /> : <MagnifyingGlass size={16} weight="bold" />}
                    {scanning ? 'Scanning…' : 'Run Discovery Scan'}
                  </button>
                )}
                {migrationStep === 2 && (
                  <>
                    <button onClick={startMigration} disabled={loading}
                      className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white transition-all active:scale-[0.97] disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                      {loading ? <Spinner size={16} className="animate-spin" /> : <Play size={16} weight="fill" />}
                      Confirm & Start Sync
                    </button>
                    <button onClick={() => setMigrationStep(1)}
                      className="w-full py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={{ background: '#f1f5f9', color: T.textSub, border: `1px solid ${T.border}` }}>
                      ← Re-scan
                    </button>
                  </>
                )}
                {migrationStep === 3 && (
                  <button onClick={stopMigration}
                    className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                    <Stop size={16} weight="fill" />
                    Stop Sync
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Tree Viewer */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="rounded-2xl flex flex-col overflow-hidden" style={{ background: T.card, border: `1px solid ${T.border}`, minHeight: '600px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: '#f8fafc' }}>
                <div className="flex items-center gap-3">
                  <Eye size={18} className="text-indigo-500" weight="duotone" />
                  <h3 className="text-sm font-bold" style={{ color: T.text }}>Structural Placement Preview</h3>
                </div>
                <div className="flex items-center gap-3">
                  {migrationStep === 3 && progress?.active && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[11px] text-green-600 font-semibold">LIVE</span>
                    </div>
                  )}
                  <button onClick={fetchStatsAndStatus} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <ArrowClockwise size={15} style={{ color: T.textSub }} />
                  </button>
                </div>
              </div>

              {/* Legend */}
              {migrationStep === 2 && (
                <div className="flex items-center gap-5 px-5 py-2 text-[10px] font-medium flex-shrink-0 flex-wrap" style={{ borderBottom: `1px solid ${T.border}`, background: '#fafbfc' }}>
                  {[{ color: '#6366f1', label: 'Level' }, { color: '#8b5cf6', label: 'Semester' }, { color: '#f59e0b', label: 'Module' }].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: `${color}30`, border: `1.5px solid ${color}` }} />
                      <span style={{ color }}>{label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

                {/* Step 1: empty */}
                {migrationStep === 1 && (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                      <MagnifyingGlass size={40} weight="duotone" className="text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: T.text }}>No Discovery Map Yet</h3>
                      <p className="text-sm max-w-sm mt-1 leading-relaxed" style={{ color: T.textSub }}>
                        Run a discovery scan to analyze your {stats?.activeStorage === 'mega' ? 'Google Drive' : 'Mega'} files and generate a visual hierarchy preview showing exactly how they'll be organized on {stats?.activeStorage === 'mega' ? 'Mega Cloud' : 'Google Drive'}.
                      </p>
                    </div>
                    <button onClick={startScan} disabled={scanning}
                      className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 text-white transition-all active:scale-[0.97] disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                      {scanning ? <Spinner size={16} className="animate-spin" /> : <MagnifyingGlass size={16} weight="bold" />}
                      {scanning ? 'Scanning…' : 'Start Discovery Scan'}
                    </button>
                  </div>
                )}

                {/* Step 2: Tree */}
                {migrationStep === 2 && migrationMap && (
                  <div>
                    <p className="text-[11px] italic mb-4" style={{ color: T.textMuted }}>
                      Showing how your {stats?.activeStorage === 'mega' ? 'Google Drive' : 'Mega'} files will be placed on {stats?.activeStorage === 'mega' ? 'Mega' : 'Google Drive'}. Click any folder to expand.
                    </p>
                    {Object.entries(migrationMap).map(([key, value]) => (
                      <TreeNode key={key} nodeKey={key} value={value} depth={0} expandedNodes={expandedNodes} toggleNode={toggleNode} prefix="" />
                    ))}
                  </div>
                )}

                {/* Step 3: Running */}
                {migrationStep === 3 && (
                  <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full animate-spin"
                        style={{ border: '3px solid #e0e7ff', borderTop: '3px solid #6366f1', boxShadow: '0 0 20px rgba(99,102,241,0.2)' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lightning size={32} weight="fill" className="text-indigo-500" />
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="text-xl font-bold" style={{ color: T.text }}>Storage Sync in Progress</h3>
                      <p className="text-sm mt-1" style={{ color: T.textSub }}>Streaming cloud-to-cloud. Keep this tab open.</p>
                    </div>

                    <div className="w-full max-w-md">
                      <div className="flex justify-between text-xs font-medium mb-2">
                        <span style={{ color: T.textSub }}>{progress?.current ?? 0} / {progress?.total ?? 0} files</span>
                        <span className="text-indigo-600 font-bold">{pct(progress)}%</span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#e0e7ff' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct(progress)}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', boxShadow: '0 0 8px rgba(99,102,241,0.4)' }}
                        />
                      </div>
                      <p className="text-[10px] mt-1.5 truncate" style={{ color: T.textMuted }}>
                        Current: {progress?.currentItem || 'Waiting…'}
                      </p>
                    </div>

                    {progress?.errors?.length > 0 && (
                      <div className="w-full max-w-md space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-600">
                          <Warning size={14} weight="fill" />
                          {progress.errors.length} error(s)
                        </div>
                        {progress.errors.slice(-3).map((err, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl text-[10px]"
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                            <XCircle size={13} weight="fill" className="flex-shrink-0 mt-0.5" />
                            <span><strong>{err.item}:</strong> {err.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StorageManagement
