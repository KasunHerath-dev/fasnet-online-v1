import React, { useState, useEffect, useCallback } from 'react'
import {
  CloudArrowUp, HardDrive, Folders, Lightning, Spinner,
  XCircle, Play, Stop, Eye, MagnifyingGlass, Check,
  CaretRight, CaretDown, FileText, Database, Swap,
  ArrowClockwise, Warning, Cloud, ShieldCheck, ShieldWarning,
  ArrowRight, ListChecks, ArrowArcLeft, WarningCircle
} from '@phosphor-icons/react'
import api from '../../services/api'
import { toast } from 'react-hot-toast'
import ResourceManagement from '../../components/admin/ResourceManagement'
import StorageExplorer from '../../components/admin/StorageExplorer'
import GoogleDriveConfig from '../../components/admin/GoogleDriveConfig'

/* ─── Design Tokens ─── */
const T = {
  bg: '#f1f5f9',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  textMid: '#334155',
  textSub: '#64748b',
  textMuted: '#94a3b8',
}

const pct = (p) => p?.total ? Math.round((p.current / p.total) * 100) : 0

const CATEGORY_COLORS = {
  Tutorials: '#6366f1', 'Past Papers': '#f59e0b',
  Assignments: '#10b981', 'Marking Schemes': '#06b6d4',
  'Reference Books': '#8b5cf6', 'General Resources': '#64748b',
}

/* ─── Sub-components ─── */
const StepBadge = ({ step, label, desc, current, completed }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl transition-all"
    style={{
      background: current ? '#6366f108' : completed ? '#10b98108' : 'transparent',
      border: current ? '1px solid #6366f130' : completed ? '1px solid #10b98120' : '1px solid transparent',
    }}>
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5"
      style={{
        background: current ? '#6366f1' : completed ? '#10b981' : '#e2e8f0',
        color: current || completed ? '#fff' : T.textMuted,
        boxShadow: current ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
      }}>
      {completed ? <Check size={13} weight="bold" /> : step}
    </div>
    <div>
      <p className="text-sm font-semibold leading-tight" style={{ color: current || completed ? T.text : T.textMuted }}>{label}</p>
      <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>{desc}</p>
    </div>
  </div>
)

const StatPill = ({ label, value, color }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-xl"
    style={{ background: T.card, border: `1px solid ${T.border}` }}>
    <span className="text-xs font-semibold" style={{ color: T.textSub }}>{label}</span>
    <span className="text-sm font-black" style={{ color }}>{value}</span>
  </div>
)

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
      <button onClick={() => toggleNode(currentPath)}
        className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg my-0.5 text-left transition-colors hover:bg-slate-50">
        <span className="text-slate-400 w-3.5 flex-shrink-0">
          {isExpanded ? <CaretDown size={12} /> : <CaretRight size={12} />}
        </span>
        <Folders size={15} weight="duotone" style={{ color: accentColor, flexShrink: 0 }} />
        <span className="text-sm font-medium truncate flex-1"
          style={{ color: isLevel ? '#4f46e5' : isSemester ? '#7c3aed' : '#92400e' }}>{nodeKey}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
          style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}25` }}>{count}</span>
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

/* ─── Health Card ─── */
const HealthCard = ({ icon: Icon, label, configured, account, isActive, accentColor, onActivate, activating }) => (
  <div className="p-4 rounded-2xl border transition-all"
    style={{
      background: T.card,
      borderColor: isActive ? accentColor : T.border,
      boxShadow: isActive ? `0 0 0 3px ${accentColor}20` : '0 1px 4px rgba(0,0,0,0.05)',
    }}>
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25` }}>
        <Icon size={20} weight="duotone" style={{ color: accentColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-tight" style={{ color: T.textSub }}>{label}</p>
          {isActive && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
              style={{ background: accentColor }}>ACTIVE</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {configured
            ? <ShieldCheck size={13} weight="fill" className="text-emerald-500 flex-shrink-0" />
            : <ShieldWarning size={13} weight="fill" className="text-amber-500 flex-shrink-0" />}
          <p className="text-xs font-semibold truncate" style={{ color: configured ? '#059669' : '#d97706' }}>
            {configured ? (account || 'Configured') : 'Not Configured'}
          </p>
        </div>
      </div>
    </div>
    {!isActive && configured && (
      <button onClick={onActivate} disabled={activating}
        className="mt-3 w-full py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
        style={{ background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}25` }}>
        {activating ? <Spinner size={11} className="animate-spin" /> : <Swap size={11} weight="bold" />}
        {activating ? 'Switching…' : 'Set as Active'}
      </button>
    )}
    {!configured && (
      <p className="mt-2 text-[10px]" style={{ color: T.textMuted }}>Go to Config tab to set up credentials.</p>
    )}
  </div>
)

/* ─── AUDIT TABLE ─── */
const AuditTable = ({ data }) => {
  if (!data) return null
  const { summary, matched, unmatched } = data
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'DB Records', value: summary.totalInDB, color: '#6366f1' },
          { label: 'On Mega', value: summary.totalOnMega, color: '#f59e0b' },
          { label: 'Matched', value: summary.matched, color: '#10b981' },
          { label: 'Unmatched', value: summary.unmatched, color: '#ef4444' },
        ].map(s => <StatPill key={s.label} {...s} />)}
      </div>
      {unmatched.length > 0 && (
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#fecaca' }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#fef2f2' }}>
            <WarningCircle size={15} weight="fill" className="text-red-400" />
            <p className="text-xs font-bold text-red-700">{unmatched.length} unmatched records (will fail during sync)</p>
          </div>
          <div className="divide-y" style={{ divideColor: T.border }}>
            {unmatched.slice(0, 12).map(r => (
              <div key={r.id} className="px-4 py-2 flex items-center gap-3">
                <XCircle size={14} weight="fill" className="text-red-400 flex-shrink-0" />
                <p className="text-xs font-medium flex-1 truncate" style={{ color: T.textMid }}>{r.title}</p>
                <span className="text-[10px] font-mono" style={{ color: T.textMuted }}>{r.module || '—'}</span>
              </div>
            ))}
            {unmatched.length > 12 && (
              <div className="px-4 py-2 text-[10px] text-center" style={{ color: T.textMuted }}>
                …and {unmatched.length - 12} more
              </div>
            )}
          </div>
        </div>
      )}
      {matched.length > 0 && (
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#a7f3d0' }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#ecfdf5' }}>
            <ShieldCheck size={15} weight="fill" className="text-emerald-500" />
            <p className="text-xs font-bold text-emerald-700">{matched.length} records successfully matched</p>
          </div>
          <div className="divide-y max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {matched.slice(0, 20).map(r => (
              <div key={r.id} className="px-4 py-2 flex items-center gap-3">
                <Check size={13} weight="bold" className="text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-medium flex-1 truncate" style={{ color: T.textMid }}>{r.title}</p>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100" style={{ color: T.textSub }}>{r.matchedBy}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════ MAIN PAGE ═══════════════ */
const StorageManagement = () => {
  const [activeTab, setActiveTab] = useState('sync')
  const [health, setHealth] = useState(null)
  const [stats, setStats] = useState(null)
  const [progress, setProgress] = useState(null)
  const [migrationMap, setMigrationMap] = useState(null)
  const [migrationStep, setMigrationStep] = useState(1)
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [scanning, setScanning] = useState(false)
  const [running, setRunning] = useState(false)
  const [activating, setActivating] = useState(null) // 'mega' | 'google_drive'
  const [auditData, setAuditData] = useState(null)
  const [auditing, setAuditing] = useState(false)

  /* ── Data Fetching ── */
  const fetchHealth = useCallback(async () => {
    try {
      const res = await api.get('/settings/storage/health')
      if (res.data.success) setHealth(res.data.health)
    } catch (e) { console.error('Health check failed', e) }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const [sR, pR] = await Promise.all([
        api.get('/settings/migration/stats'),
        api.get('/settings/migration/status'),
      ])
      setStats(sR.data.stats)
      const prog = pR.data.progress
      setProgress(prog)
      if (prog?.active) setMigrationStep(3)
      else if (migrationStep === 3 && !prog?.active && prog?.endTime) setMigrationStep(4)
    } catch (e) { console.error(e) }
  }, [migrationStep])

  useEffect(() => {
    fetchHealth()
    fetchStats()
  }, [fetchHealth, fetchStats])

  useEffect(() => {
    if (migrationStep !== 3) return
    const id = setInterval(fetchStats, 4000)
    return () => clearInterval(id)
  }, [migrationStep, fetchStats])

  /* ── Actions ── */
  const setActiveProvider = async (provider) => {
    setActivating(provider)
    try {
      await api.post('/settings/storage/active', { provider })
      toast.success(`Switched to ${provider === 'google_drive' ? 'Google Drive' : 'Mega'}`)
      await fetchHealth()
      await fetchStats()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Switch failed')
    } finally { setActivating(null) }
  }

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

  const startSync = async () => {
    setRunning(true)
    try {
      await api.post('/settings/migration/start')
      setMigrationStep(3)
      toast.success('Sync engine started!')
      fetchStats()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to start sync')
    } finally { setRunning(false) }
  }

  const stopSync = async () => {
    try {
      await api.post('/settings/migration/stop')
      toast.success('Stop signal sent.')
      fetchStats()
    } catch (e) { toast.error('Stop failed') }
  }

  const runAudit = async () => {
    setAuditing(true)
    try {
      const res = await api.get('/settings/migration/audit')
      setAuditData(res.data)
      toast.success('Audit complete!')
    } catch (e) {
      toast.error('Audit failed: ' + (e.response?.data?.message || e.message))
    } finally { setAuditing(false) }
  }

  const resetSync = () => {
    setMigrationStep(1)
    setMigrationMap(null)
    setAuditData(null)
    fetchStats()
  }

  const toggleNode = (path) => {
    const next = new Set(expandedNodes)
    next.has(path) ? next.delete(path) : next.add(path)
    setExpandedNodes(next)
  }

  /* ── Derived State ── */
  const activeStorage = health?.activeStorage || stats?.activeStorage || 'mega'
  const sourceStorage = activeStorage === 'mega' ? 'google_drive' : 'mega'
  const sourceName = sourceStorage === 'mega' ? 'Mega Cloud' : 'Google Drive'
  const targetName = activeStorage === 'mega' ? 'Mega Cloud' : 'Google Drive'
  const totalFiles = stats ? stats.megaCount + stats.driveCount : 0
  const syncedCount = activeStorage === 'mega' ? (stats?.megaCount ?? 0) : (stats?.driveCount ?? 0)
  const pendingCount = totalFiles - syncedCount

  const tabs = [
    { id: 'sync', label: 'Sync Center', icon: Lightning },
    { id: 'explorer', label: 'Explorer', icon: HardDrive },
    { id: 'config', label: 'Drive Config', icon: CloudArrowUp },
  ]

  return (
    <div className="min-h-screen p-5 lg:p-8" style={{ background: T.bg, fontFamily: "'Inter', sans-serif" }}>
      <div className="flex flex-col lg:flex-row gap-6 max-w-screen-2xl mx-auto">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-5">
          <div>
            <h1 className="text-xl font-black tracking-tight" style={{ color: T.text }}>Storage Command</h1>
            <p className="text-[11px] font-medium uppercase tracking-widest mt-0.5" style={{ color: T.textMuted }}>System Control Center</p>
          </div>

          {/* Provider Health Cards */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: T.textMuted }}>Cloud Providers</p>
            <HealthCard
              icon={Database} label="Mega Cloud" accentColor="#f97316"
              configured={health?.mega?.configured ?? false}
              account={health?.mega?.email}
              isActive={activeStorage === 'mega'}
              onActivate={() => setActiveProvider('mega')}
              activating={activating === 'mega'}
            />
            <HealthCard
              icon={Cloud} label="Google Drive" accentColor="#6366f1"
              configured={health?.googleDrive?.configured ?? false}
              account={health?.googleDrive?.account}
              isActive={activeStorage === 'google_drive'}
              onActivate={() => setActiveProvider('google_drive')}
              activating={activating === 'google_drive'}
            />
          </div>

          <div className="h-px" style={{ background: T.border }} />

          {/* Stats Summary */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: T.textMuted }}>File Counts</p>
            <StatPill label="Mega Cloud" value={stats?.megaCount ?? '—'} color="#f97316" />
            <StatPill label="Google Drive" value={stats?.driveCount ?? '—'} color="#6366f1" />
            <StatPill label="Pending Sync" value={health ? pendingCount : '—'} color={pendingCount > 0 ? '#f59e0b' : '#10b981'} />
          </div>

          <div className="h-px" style={{ background: T.border }} />

          {/* Navigation */}
          <nav className="space-y-1">
            {tabs.map((t) => {
              const active = activeTab === t.id
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                    color: active ? '#fff' : T.textSub,
                    boxShadow: active ? '0 4px 12px rgba(99,102,241,0.25)' : 'none',
                  }}>
                  <t.icon size={17} weight={active ? 'fill' : 'bold'} />
                  {t.label}
                </button>
              )
            })}
          </nav>

          {/* Refresh */}
          <button onClick={() => { fetchHealth(); fetchStats() }}
            className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white"
            style={{ color: T.textSub, border: `1px solid ${T.border}` }}>
            <ArrowClockwise size={13} />
            Refresh Status
          </button>
        </aside>

        {/* ── RIGHT CONTENT ── */}
        <main className="flex-1 min-w-0 space-y-5">

          {/* ══ SYNC CENTER TAB ══ */}
          {activeTab === 'sync' && (
            <div className="space-y-5">

              {/* Sync Direction Banner */}
              <div className="p-4 rounded-2xl flex items-center gap-4 flex-wrap"
                style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="px-3 py-2 rounded-xl flex items-center gap-2"
                      style={{ background: sourceStorage === 'mega' ? '#fff7ed' : '#eef2ff', border: `1px solid ${sourceStorage === 'mega' ? '#fdba74' : '#c7d2fe'}` }}>
                      {sourceStorage === 'mega' ? <Database size={16} weight="duotone" className="text-orange-500" /> : <Cloud size={16} weight="duotone" className="text-indigo-500" />}
                      <span className="text-xs font-bold" style={{ color: sourceStorage === 'mega' ? '#c2410c' : '#4338ca' }}>{sourceName}</span>
                    </div>
                    <ArrowRight size={18} className="text-slate-400 flex-shrink-0" />
                    <div className="px-3 py-2 rounded-xl flex items-center gap-2"
                      style={{ background: activeStorage === 'mega' ? '#fff7ed' : '#eef2ff', border: `2px solid ${activeStorage === 'mega' ? '#f97316' : '#6366f1'}` }}>
                      {activeStorage === 'mega' ? <Database size={16} weight="fill" className="text-orange-500" /> : <Cloud size={16} weight="fill" className="text-indigo-500" />}
                      <span className="text-xs font-bold" style={{ color: activeStorage === 'mega' ? '#c2410c' : '#4338ca' }}>{targetName}</span>
                      <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded-full"
                        style={{ background: activeStorage === 'mega' ? '#f97316' : '#6366f1' }}>TARGET</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {pendingCount > 0
                    ? <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>{pendingCount} files to sync</span>
                    : <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>✓ All synced</span>
                  }
                </div>
              </div>

              {/* Main Sync Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Control Panel */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="rounded-2xl p-4 space-y-2" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>3-Step Workflow</p>
                    <StepBadge step={1} label="Discovery Scan" desc={`Map ${sourceName} → ${targetName}`} current={migrationStep === 1} completed={migrationStep > 1} />
                    <StepBadge step={2} label="Preview Structure" desc="Review placement tree" current={migrationStep === 2} completed={migrationStep > 2} />
                    <StepBadge step={3} label="Execute Sync" desc="Live cloud-to-cloud transfer" current={migrationStep === 3} completed={migrationStep === 4} />

                    <div className="pt-2 space-y-2">
                      {migrationStep === 1 && (
                        <button onClick={startScan} disabled={scanning}
                          className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white disabled:opacity-50 transition-all active:scale-[0.97]"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                          {scanning ? <Spinner size={16} className="animate-spin" /> : <MagnifyingGlass size={16} weight="bold" />}
                          {scanning ? 'Scanning…' : 'Run Discovery Scan'}
                        </button>
                      )}
                      {migrationStep === 2 && (
                        <>
                          <button onClick={startSync} disabled={running}
                            className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white disabled:opacity-50 transition-all active:scale-[0.97]"
                            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                            {running ? <Spinner size={16} className="animate-spin" /> : <Play size={16} weight="fill" />}
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
                        <button onClick={stopSync}
                          className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                          <Stop size={16} weight="fill" /> Stop Sync
                        </button>
                      )}
                      {migrationStep === 4 && (
                        <button onClick={resetSync}
                          className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white transition-all active:scale-[0.97]"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                          <ArrowArcLeft size={16} weight="bold" /> Start New Sync
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audit Tool */}
                  <div className="rounded-2xl p-4 space-y-3" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div className="flex items-center gap-2">
                      <ListChecks size={16} weight="duotone" className="text-amber-500" />
                      <p className="text-sm font-bold" style={{ color: T.text }}>DB Audit Tool</p>
                    </div>
                    <p className="text-[11px]" style={{ color: T.textSub }}>Cross-reference your database records against actual Mega files to identify broken links before syncing.</p>
                    <button onClick={runAudit} disabled={auditing}
                      className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>
                      {auditing ? <Spinner size={13} className="animate-spin" /> : <ListChecks size={13} weight="bold" />}
                      {auditing ? 'Auditing…' : 'Run Audit'}
                    </button>
                  </div>
                </div>

                {/* Right Viewer: Tree / Progress / Done / Audit */}
                <div className="lg:col-span-8">
                  <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: T.card, border: `1px solid ${T.border}`, minHeight: 560, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: '#f8fafc' }}>
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-indigo-500" weight="duotone" />
                        <h3 className="text-sm font-bold" style={{ color: T.text }}>
                          {migrationStep === 1 && 'Awaiting Scan'}
                          {migrationStep === 2 && 'Placement Preview'}
                          {migrationStep === 3 && 'Live Transfer'}
                          {migrationStep === 4 && 'Sync Complete'}
                          {auditData && ' / Audit Results'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {migrationStep === 3 && progress?.active && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] text-emerald-600 font-semibold">LIVE</span>
                          </div>
                        )}
                        <button onClick={() => { fetchStats(); fetchHealth() }} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                          <ArrowClockwise size={14} style={{ color: T.textSub }} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin' }}>

                      {/* Step 1: Idle */}
                      {migrationStep === 1 && !auditData && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center gap-5">
                          <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                            <MagnifyingGlass size={40} weight="duotone" className="text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold" style={{ color: T.text }}>Ready to Sync</h3>
                            <p className="text-sm max-w-xs mt-1 leading-relaxed" style={{ color: T.textSub }}>
                              Run a discovery scan to analyze <strong>{sourceName}</strong> files and
                              preview how they'll be organized in <strong>{targetName}</strong>.
                            </p>
                          </div>
                          <button onClick={startScan} disabled={scanning}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 text-white disabled:opacity-50 transition-all active:scale-[0.97]"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                            {scanning ? <Spinner size={16} className="animate-spin" /> : <MagnifyingGlass size={16} weight="bold" />}
                            {scanning ? 'Scanning…' : 'Start Discovery Scan'}
                          </button>
                        </div>
                      )}

                      {/* Step 2: Tree Preview */}
                      {migrationStep === 2 && migrationMap && (
                        <div>
                          <div className="flex items-center gap-5 mb-4 text-[10px] font-semibold flex-wrap">
                            {[{ c: '#6366f1', l: 'Level' }, { c: '#8b5cf6', l: 'Semester' }, { c: '#f59e0b', l: 'Module' }].map(({ c, l }) => (
                              <div key={l} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: `${c}30`, border: `1.5px solid ${c}` }} />
                                <span style={{ color: c }}>{l}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[11px] italic mb-3" style={{ color: T.textMuted }}>Click any folder to expand. This is where files will be placed on {targetName}.</p>
                          {Object.entries(migrationMap).map(([key, value]) => (
                            <TreeNode key={key} nodeKey={key} value={value} depth={0} expandedNodes={expandedNodes} toggleNode={toggleNode} prefix="" />
                          ))}
                        </div>
                      )}

                      {/* Step 3: Progress */}
                      {migrationStep === 3 && (
                        <div className="flex flex-col items-center justify-center min-h-[380px] gap-6">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full animate-spin"
                              style={{ border: '3px solid #e0e7ff', borderTop: '3px solid #6366f1', boxShadow: '0 0 20px rgba(99,102,241,0.2)' }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lightning size={32} weight="fill" className="text-indigo-500" />
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-bold" style={{ color: T.text }}>Sync in Progress</h3>
                            <p className="text-sm mt-1" style={{ color: T.textSub }}>Streaming cloud-to-cloud. Keep this tab open.</p>
                          </div>
                          <div className="w-full max-w-md">
                            <div className="flex justify-between text-xs font-medium mb-2">
                              <span style={{ color: T.textSub }}>{progress?.current ?? 0} / {progress?.total ?? 0} files</span>
                              <span className="text-indigo-600 font-bold">{pct(progress)}%</span>
                            </div>
                            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#e0e7ff' }}>
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct(progress)}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', boxShadow: '0 0 8px rgba(99,102,241,0.4)' }} />
                            </div>
                            <p className="text-[10px] mt-1.5 truncate" style={{ color: T.textMuted }}>
                              Current: {progress?.currentItem || 'Waiting…'}
                            </p>
                          </div>
                          {progress?.errors?.length > 0 && (
                            <div className="w-full max-w-md space-y-2">
                              <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-600">
                                <Warning size={14} weight="fill" /> {progress.errors.length} error(s)
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

                      {/* Step 4: Done */}
                      {migrationStep === 4 && !auditData && (
                        <div className="flex flex-col items-center justify-center min-h-[380px] gap-5 text-center">
                          <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                            <ShieldCheck size={40} weight="duotone" className="text-emerald-500" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold" style={{ color: T.text }}>Sync Complete!</h3>
                            <p className="text-sm mt-1" style={{ color: T.textSub }}>
                              {progress?.errors?.length > 0
                                ? `Finished with ${progress.errors.length} error(s). Review the control panel.`
                                : 'All files successfully transferred to ' + targetName + '.'}
                            </p>
                          </div>
                          <button onClick={resetSync}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 text-white transition-all active:scale-[0.97]"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                            <ArrowArcLeft size={16} weight="bold" /> Run Another Sync
                          </button>
                        </div>
                      )}

                      {/* Audit Results */}
                      {auditData && <AuditTable data={auditData} />}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ EXPLORER TAB ══ */}
          {activeTab === 'explorer' && <StorageExplorer />}

          {/* ══ CONFIG TAB ══ */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${T.border}`, background: '#f8fafc' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                    <Cloud size={18} weight="duotone" className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: T.text }}>Google Drive Integration</p>
                    <p className="text-[10px]" style={{ color: T.textSub }}>Connect via OAuth2 or Service Account</p>
                  </div>
                </div>
                <div className="p-5">
                  <GoogleDriveConfig />
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${T.border}`, background: '#f8fafc' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                    <Folders size={18} weight="duotone" className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: T.text }}>Resource Management</p>
                    <p className="text-[10px]" style={{ color: T.textSub }}>Manage academic content and modules</p>
                  </div>
                </div>
                <div className="p-5">
                  <ResourceManagement />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default StorageManagement
