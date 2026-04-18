import React, { useState, useEffect } from 'react'
import {
  Robot, Key, Globe, Target, FloppyDisk, 
  ArrowClockwise, CheckCircle, WarningCircle,
  Gear, Code, Play, Spinner, Info, Clock
} from '@phosphor-icons/react'
import api from '../../services/api'

const T = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  text: '#0f172a',
  textMid: '#334155',
  textSub: '#64748b',
  textMuted: '#94a3b8',
}

const NoticeScraperConfig = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  const [config, setConfig] = useState({
    aiModel: 'gemini',
    apiKey: '',
    targetUrl: 'https://fas.wyb.ac.lk/notices/',
    selectors: {
      item: 'article.elementor-post',
      title: 'h3.elementor-post__title a',
      excerpt: 'div.elementor-post__excerpt',
      date: 'span.elementor-post-date',
      deep: {
        title: 'h1.elementor-heading-title',
        body: '.elementor-widget-theme-post-content .elementor-widget-container',
        attachments: 'a.elementor-button-link'
      }
    },
    autoPublish: false,
    cronSchedule: '*/30 * * * *'
  })

  const [scraperStatus, setScraperStatus] = useState({ status: 'idle', message: 'Ready', nextRun: null })
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    fetchConfig()
    // Poll for status every 10 seconds (or 3 seconds if running)
    const statusInterval = setInterval(fetchConfig, scraperStatus.status === 'running' ? 3000 : 10000)
    return () => clearInterval(statusInterval)
  }, [scraperStatus.status])

  useEffect(() => {
    if (!scraperStatus.nextRun) return
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const next = new Date(scraperStatus.nextRun).getTime()
      const diff = next - now
      
      if (diff <= 0) {
        setTimeLeft('Starting soon...')
      } else {
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${mins}m ${secs}s`)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [scraperStatus.nextRun])

  const fetchConfig = async () => {
    try {
      const res = await api.get('/notices/settings')
      if (res.data.success) {
        setConfig(prev => ({ ...prev, ...res.data.data }))
        if (res.data.status) {
          setScraperStatus(res.data.status)
        }
      }
    } catch (err) {
      console.error('Failed to fetch config', err)
      setError('Could not load configuration.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await api.put('/notices/settings', config)
      if (res.data.success) {
        setSuccess('Configuration saved successfully!')
        // Fetch again to update the nextRun if the schedule changed
        fetchConfig()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save configuration.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <Spinner size={32} className="animate-spin text-indigo-500" />
    </div>
  )

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Robot size={20} weight="duotone" className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Scraper Control Panel</h3>
            <p className="text-[10px] text-slate-500 font-medium">Fully automated notice processing engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Countdown Display */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Run In</span>
            <span className="text-sm font-mono font-black text-indigo-600 leading-none">{timeLeft || '--:--'}</span>
          </div>

          <div className="w-px h-8 bg-slate-200" />

          <button
            onClick={fetchConfig}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
            title="Refresh Status"
          >
            <ArrowClockwise size={16} />
          </button>
        </div>
      </div>

      {/* Real-time Status Card */}
      <div className={`mx-6 mt-6 p-4 rounded-2xl border transition-all duration-500 flex items-center justify-between ${
        scraperStatus.status === 'running' 
          ? 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100' 
          : 'bg-slate-50 border-slate-100 opacity-80'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            scraperStatus.status === 'running' ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-200 text-slate-500'
          }`}>
            {scraperStatus.status === 'running' ? <Spinner size={24} className="animate-spin" /> : <Clock size={24} weight="duotone" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
               <p className={`text-xs font-black uppercase tracking-wider ${scraperStatus.status === 'running' ? 'text-indigo-700' : 'text-slate-500'}`}>
                {scraperStatus.status === 'running' ? 'Active Processing' : 'System Engine Idle'}
              </p>
              {scraperStatus.status === 'running' && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-slate-600 mt-1 line-clamp-1 italic">
              {scraperStatus.message || 'Waiting for scheduled window...'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Updated</p>
          <p className="text-[10px] font-bold text-slate-500 mt-1">
            {scraperStatus.lastUpdate ? new Date(scraperStatus.lastUpdate).toLocaleTimeString() : 'Never'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-2 mt-4 bg-slate-50/30">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'general' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Gear size={16} weight={activeTab === 'general' ? 'fill' : 'bold'} />
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('selectors')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'selectors' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Code size={16} weight={activeTab === 'selectors' ? 'fill' : 'bold'} />
          CSS Selectors
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl">
            <WarningCircle size={18} weight="fill" className="text-red-500 flex-shrink-0" />
            <p className="text-xs font-medium text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
            <CheckCircle size={18} weight="fill" className="text-emerald-500 flex-shrink-0" />
            <p className="text-xs font-medium text-emerald-700">{success}</p>
          </div>
        )}

        {activeTab === 'general' ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* AI Model Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">AI Provider</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setConfig({ ...config, aiModel: 'gemini' })}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    config.aiModel === 'gemini' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200/50' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.aiModel === 'gemini' ? 'bg-blue-100' : 'bg-slate-50'}`}>
                    <span className="font-black text-blue-600 text-sm">G</span>
                  </div>
                  <span className={`text-[11px] font-bold ${config.aiModel === 'gemini' ? 'text-blue-900' : 'text-slate-600'}`}>Google Gemini</span>
                </button>
                <button
                  onClick={() => setConfig({ ...config, aiModel: 'anthropic' })}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    config.aiModel === 'anthropic' ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-200/50' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.aiModel === 'anthropic' ? 'bg-orange-100' : 'bg-slate-50'}`}>
                    <span className="font-black text-orange-600">A</span>
                  </div>
                  <span className={`text-[11px] font-bold ${config.aiModel === 'anthropic' ? 'text-orange-900' : 'text-slate-600'}`}>Anthropic Claude</span>
                </button>
                <button
                  onClick={() => setConfig({ ...config, aiModel: 'openai' })}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    config.aiModel === 'openai' ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-200/50' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.aiModel === 'openai' ? 'bg-emerald-100' : 'bg-slate-50'}`}>
                    <span className="font-black text-emerald-600">O</span>
                  </div>
                  <span className={`text-[11px] font-bold ${config.aiModel === 'openai' ? 'text-emerald-900' : 'text-slate-600'}`}>OpenAI GPT-4</span>
                </button>
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1">
                <Key size={12} weight="fill" /> API Key
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                placeholder={config.aiModel === 'gemini' ? 'AIzaSy...' : config.aiModel === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-indigo-400 outline-none transition-all shadow-inner"
              />
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1">
                <Globe size={12} weight="fill" /> Target Website URL
              </label>
              <input
                type="url"
                value={config.targetUrl}
                onChange={e => setConfig({ ...config, targetUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-400 outline-none transition-all shadow-inner"
              />
            </div>

            {/* Scraper Schedule */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1">
                <Clock size={12} weight="fill" /> Scraper Schedule
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={['*/15 * * * *', '*/30 * * * *', '0 * * * *', '0 */6 * * *', '0 0 * * *'].includes(config.cronSchedule) ? config.cronSchedule : 'custom'}
                  onChange={e => {
                    if (e.target.value !== 'custom') {
                      setConfig({ ...config, cronSchedule: e.target.value })
                    }
                  }}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-400 outline-none transition-all"
                >
                  <option value="*/15 * * * *">Every 15 Minutes</option>
                  <option value="*/30 * * * *">Every 30 Minutes</option>
                  <option value="0 * * * *">Every Hour</option>
                  <option value="0 */6 * * *">Every 6 Hours</option>
                  <option value="0 0 * * *">Daily (Midnight)</option>
                  <option value="custom">-- Custom Cron Expression --</option>
                </select>
                <input
                  type="text"
                  value={config.cronSchedule}
                  onChange={e => setConfig({ ...config, cronSchedule: e.target.value })}
                  placeholder="*/30 * * * *"
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-indigo-400 outline-none transition-all shadow-inner"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 px-1 italic">
                Format: minute hour day month day-of-week. Updates will hot-reload without restart.
              </p>
            </div>

            {/* Auto Publish Toggle */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Play size={16} weight="fill" className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Auto-Publish Notices</p>
                  <p className="text-[10px] text-slate-500 italic">Bypass human review and notify students immediately</p>
                </div>
              </div>
              <button
                onClick={() => setConfig({ ...config, autoPublish: !config.autoPublish })}
                className={`w-10 h-5 rounded-full transition-all relative ${config.autoPublish ? 'bg-indigo-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config.autoPublish ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
              <Info size={16} weight="fill" className="text-amber-500 mt-0.5" />
              <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                Precise CSS selectors are required for multi-tier scraping. 
                The deep scraping phase will automatically follow notice links.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Notice Container</label>
                <input
                  type="text"
                  value={config.selectors.item}
                  onChange={e => setConfig({ ...config, selectors: { ...config.selectors, item: e.target.value }})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono focus:bg-white focus:border-indigo-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Notice Title (List)</label>
                <input
                  type="text"
                  value={config.selectors.title}
                  onChange={e => setConfig({ ...config, selectors: { ...config.selectors, title: e.target.value }})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono focus:bg-white focus:border-indigo-400 outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deep Scraping (Full Post Page)</p>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Body/Content Selector</label>
                <input
                  type="text"
                  value={config.selectors.deep.body}
                  onChange={e => setConfig({ ...config, selectors: { ...config.selectors, deep: { ...config.selectors.deep, body: e.target.value }}})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono focus:bg-white border-slate-200 outline-none transition-all focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Attachment Link Selector</label>
                <input
                  type="text"
                  value={config.selectors.deep.attachments}
                  onChange={e => setConfig({ ...config, selectors: { ...config.selectors, deep: { ...config.selectors.deep, attachments: e.target.value }}})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono focus:bg-white border-slate-200 outline-none transition-all focus:border-indigo-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95"
          >
            {saving ? <Spinner size={16} className="animate-spin" /> : <FloppyDisk size={18} weight="fill" />}
            UPDATE AUTOMATION ENGINE
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoticeScraperConfig
