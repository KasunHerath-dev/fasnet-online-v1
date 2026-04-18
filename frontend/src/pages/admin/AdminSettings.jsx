import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, studentService, systemService, batchYearService } from '../../services/authService'
import resourceService from '../../services/resourceService'
import { noticeService } from '../../services/noticeService'
import BatchYearManagement from '../../components/admin/BatchYearManagement'
import AssessmentManagement from '../../components/admin/AssessmentManagement'
import ResourceManagement from '../../components/admin/ResourceManagement'
import { toast } from 'react-hot-toast'
import {
  Settings,
  Users,
  GraduationCap,
  Database,
  Shield,
  AlertTriangle,
  RefreshCw,
  UserPlus,
  CheckCircle,
  Activity,
  Lock,
  Plus,
  ArrowRight,
  FileText,
  Key,
  BarChart3,
  Clock,
  TrendingUp,
  Zap,
  Sparkles,
  ChevronRight,
  Download,
  Upload,
  Eye,
  Bell,
  Calendar,
  Cloud,
  Trash2,
  ShieldAlert,
  Brain,
  Send,
  Globe
} from 'lucide-react'
import SecurityConfirmationModal from '../../components/admin/SecurityConfirmationModal'

const WUSL_COMBINATIONS = [
  {
    group: "Level 1 & 2 Core Combinations",
    options: [
      { id: "COMB1", label: "COMB 1: MATH & STAT + CMIS + ELTN" },
      { id: "COMB2", label: "COMB 2: MATH & STAT + ELTN + IMGT" },
      { id: "COMB3", label: "COMB 3: MATH & STAT + IMGT + CMIS" }
    ]
  },
  {
    group: "Level 3 General Sub-Combinations",
    options: [
      { id: "COMB1A", label: "COMB 1A (MATH + CMIS + ELTN)" },
      { id: "COMB1B", label: "COMB 1B (STAT + CMIS + ELTN)" },
      { id: "COMB1C", label: "COMB 1C (MATH + STAT + CMIS)" },
      { id: "COMB2A", label: "COMB 2A (MATH + ELTN + IMGT)" },
      { id: "COMB2B", label: "COMB 2B (STAT + ELTN + IMGT)" },
      { id: "COMB2C", label: "COMB 2C (MATH + STAT + IMGT)" },
      { id: "COMB3A", label: "COMB 3A (MATH + IMGT + CMIS)" },
      { id: "COMB3B", label: "COMB 3B (STAT + IMGT + CMIS)" },
      { id: "COMB3C", label: "COMB 3C (MATH + STAT + IMGT)" }
    ]
  },
  {
    group: "B.Sc. Joint Major Degrees",
    options: [
      { id: "JM-1A", label: "1A: CMIS (Major) + ELTN (Major)" },
      { id: "JM-1B", label: "1B: CMIS (Major) + MMST (Major)" },
      { id: "JM-2A", label: "2A: ELTN (Major) + CMIS (Major)" },
      { id: "JM-2B", label: "2B: ELTN (Major) + MMST (Major)" },
      { id: "JM-3A", label: "3A: IMGT (Major) + ELTN (Major)" },
      { id: "JM-3B", label: "3B: IMGT (Major) + MMST (Major)" }
    ]
  },
  {
    group: "B.Sc. Special (Honours) Degrees",
    options: [
      { id: "SP-CS", label: "Special in Computer Science" },
      { id: "SP-AE", label: "Special in Applied Electronics" },
      { id: "SP-IM", label: "Special in Industrial Management" },
      { id: "SP-MATH", label: "Special in Mathematics with Statistics" }
    ]
  }
];

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  const [stats, setStats] = useState({
    usersCount: 0,
    status: 'Unknown'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  

  
  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
    loading: false
  })

  const [lockStatus, setLockStatus] = useState({
    show: false,
    count: 0
  })

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState({
    apiKey: '',
    maskedKey: '',
    hasKey: false,
    updatedAt: null,
    isTesting: false,
    testResult: null,
    isSaving: false,
    countdown: 0
  })

  // Timer Ref for countdown
  const timerRef = useRef(null)

  // Scraper State
  const [isScraping, setIsScraping] = useState(false)
  const [scraperConfig, setScraperConfig] = useState({
    targetUrl: 'https://fas.wyb.ac.lk/notices/',
    cronSchedule: '*/15 * * * *',
    autoPublish: true,
    aiModel: 'gemini'
  })
  const [scraperStatus, setScraperStatus] = useState({
    status: 'idle',
    message: 'Awaiting sync...',
    lastRun: null,
    nextRun: null,
    schedule: '*/15 * * * *'
  })

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startCountdown = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setAiConfig(prev => ({ ...prev, countdown: seconds }))
    
    timerRef.current = setInterval(() => {
      setAiConfig(prev => {
        if (prev.countdown <= 1) {
          clearInterval(timerRef.current)
          return { ...prev, countdown: 0 }
        }
        return { ...prev, countdown: prev.countdown - 1 }
      })
    }, 1000)
  }

  useEffect(() => {
    setUser(authService.getUser())
    fetchStats()
    fetchAiConfig()
    fetchScraperData()
  }, [])

  const fetchScraperData = async () => {
    try {
      const res = await noticeService.getSettings()
      if (res.data) setScraperConfig(prev => ({ ...prev, ...res.data }))
      if (res.status) setScraperStatus(prev => ({ ...prev, ...res.status }))
    } catch (err) {
      console.warn('[scraper] Failed to fetch settings')
    }
  }

  const handleTriggerScrape = async () => {
    try {
      setIsScraping(true)
      await noticeService.triggerScrape()
      toast.success('Scraper triggered successfully!')
      // Refresh status after a short delay
      setTimeout(fetchScraperData, 2000)
    } catch (err) {
      toast.error('Failed to trigger scraper')
    } finally {
      setIsScraping(false)
    }
  }



  const fetchAiConfig = async () => {
    try {
      const res = await systemService.getGeminiConfig()
      setAiConfig(prev => ({ ...prev, ...res.data }))
    } catch (err) {
      console.warn('[settings] Failed to load AI config')
    }
  }

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const res = await systemService.getStats()
      setStats({ usersCount: res.data.usersCount, status: res.data.status })
    } catch (err) {
      console.error(err)
      setStats(prev => ({ ...prev, status: 'Error' }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Nuclear Reset',
      message: 'This will PERMANENTLY DELETE all student records from the database. This action is terminal and cannot be reversed.',
      confirmText: 'DELETE ALL',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }))
          await studentService.deleteAll()
          toast.success('All student data has been purged successfully.')
          fetchStats()
        } catch (err) {
          toast.error(err.response?.data?.error?.message || 'Purge failed')
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }))
        }
      }
    })
  }

  const handleMassAccountReset = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Security Lockdown',
      message: 'This will LOCK all student accounts and INVALIDATE their passwords. Every student must re-verify their identity to gain access.',
      confirmText: 'RESET ALL',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }))
          const res = await authService.lockAllUsers()
          setLockStatus({ show: true, count: res.data.count })
          fetchStats()
        } catch (err) {
          toast.error(err.response?.data?.error?.message || 'Reset failed')
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }))
        }
      }
    })
  }

  const handleSyncUsers = () => {
    setConfirmModal({
      ...confirmModal,
      isOpen: true,
      title: 'Sync Accounts',
      message: 'This will automatically create user accounts for all students who do not already have one. This helps students who are not yet in the system.',
      confirmText: 'SYNC',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }))
          const res = await studentService.createMissingUsers()
          toast.success(res.data.message)
          fetchStats()
        } catch (err) {
          toast.error(err.response?.data?.error?.message || 'Sync failed')
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }))
        }
      }
    })
  }

  const handleChangePassword = async () => {
    const currentPassword = window.prompt('Enter your current password:')
    if (!currentPassword) return

    const newPassword = window.prompt('Enter your new password:')
    if (!newPassword) return

    try {
      await authService.changePassword(currentPassword, newPassword)
      alert('Password changed successfully!')
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error?.message || err.message))
    }
  }

  const tabs = [
    { id: 'general', label: 'Overview', icon: BarChart3 },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'resources', label: 'Resources', icon: Database },
    { id: 'lms', label: 'LMS Center', icon: Activity },
    { id: 'scraper', label: 'Scraper', icon: Zap },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'ai', label: 'AI Config', icon: Sparkles },
    { id: 'system', label: 'System', icon: Settings }
  ]

  const currentTab = tabs.find(t => t.id === activeTab)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c14] font-display text-slate-900 dark:text-white transition-colors duration-300">

      {/* Hero Section - Violet/Blue Admin Theme */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-violet-900 to-blue-900"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='white' stroke-opacity='.12' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}></div>

        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', opacity: 0.15 }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', opacity: 0.1, animationDelay: '1s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-10">

            {/* Left side - Title & Description */}
            <div className="flex-1 space-y-3 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
                <span className="text-white text-[10px] sm:text-xs font-bold tracking-wide uppercase">Admin Control Center</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-none tracking-tight">
                  Command
                  <span className="block mt-1 text-slate-500">
                    Center
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                  Complete system management and analytics
                </p>
              </div>

              {/* Quick stats badges - Ash */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-white text-xs sm:text-sm font-bold">System Online</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white text-xs sm:text-sm font-bold">{stats.usersCount} Users</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-white text-xs sm:text-sm font-bold">Last sync: 2m ago</span>
                </div>
              </div>
            </div>

            {/* Right side - System Health card - Ash */}
            <div className="w-full lg:w-80 xl:w-96">
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/8 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">System Health</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs">Real-time monitoring</p>
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">Database</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">API</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">Storage</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">68% Free</span>
                    </div>
                  </div>

                  {/* Health Score - violet progress bar */}
                  <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">Overall Health</span>
                      <span className="text-slate-900 dark:text-white font-black text-sm sm:text-base">Excellent</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: '92%', background: 'linear-gradient(90deg, #7c3aed, #2563eb)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 lg:-mt-8 pb-12 sm:pb-16 lg:pb-20">

        {/* Tab Navigation - Ash */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/8 rounded-xl sm:rounded-2xl p-1.5 sm:p-2">
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative group transition-all duration-200 ${isActive ? '' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <div
                      className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 transition-all duration-200 ${isActive ? '' : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/8'}`}
                      style={isActive ? { background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' } : {}}
                    >
                      <div className="flex flex-col items-center gap-1.5 sm:gap-2 relative z-10">
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                        <span className={`text-[10px] sm:text-xs lg:text-sm font-bold transition-all duration-200 text-center leading-tight ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                          {tab.label}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content with Smooth Transitions */}
        <div className="animate-fadeIn">

          {/* General/Overview Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6 sm:space-y-8">

              {/* Quick Actions Grid - Monochrome */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">Quick Actions</h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Frequently used operations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {/* Change Password - Ash */}
                  <button
                    onClick={handleChangePassword}
                    className="group relative overflow-hidden bg-white dark:bg-black rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-300 dark:border-white/10 hover:border-slate-900 dark:hover:border-white transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-4">
                        <Key className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900 dark:text-white" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">Change Password</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">Update your security credentials</p>

                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                        <span>Update now</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Add Student - Ash */}
                  <button
                    onClick={() => navigate('/students/new')}
                    className="group relative overflow-hidden bg-white dark:bg-black rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-300 dark:border-white/10 hover:border-slate-900 dark:hover:border-white transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900 dark:text-white" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">Add Student</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">Register new student manually</p>

                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                        <span>Create profile</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Profile Requests - Ash */}
                  <button
                    onClick={() => navigate('/profile-requests')}
                    className="group relative overflow-hidden bg-white dark:bg-black rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-300 dark:border-white/10 hover:border-slate-900 dark:hover:border-white transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900 dark:text-white" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">Profile Requests</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">Review pending changes</p>

                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                        <span>View requests</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Bulk Import - Ash */}
                  <button
                    onClick={() => navigate('/students/upload')}
                    className="group relative overflow-hidden bg-white dark:bg-black rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-300 dark:border-white/10 hover:border-slate-900 dark:hover:border-white transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900 dark:text-white" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">Bulk Import</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">Upload CSV/Excel files</p>

                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                        <span>Import data</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* System Analytics - Ash */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">System Analytics</h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Real-time system metrics</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Database Status Card - Ash */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <Database className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900 dark:text-white" />
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>

                      <div>
                        <p className="text-slate-900 dark:text-white text-4xl sm:text-5xl font-black mb-2">Online</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Database</p>
                      </div>
                    </div>
                  </div>
                  {/* Users Count Card - Ash */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900 dark:text-white" />
                        <TrendingUp className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                      </div>
                      <p className="text-slate-900 dark:text-white text-4xl sm:text-5xl font-black mb-2">{stats.usersCount}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Users</p>
                    </div>
                  </div>

                   {/* API Response Card - Ash */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900 dark:text-white" />
                        <CheckCircle className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                      </div>
                      <p className="text-slate-900 dark:text-white text-4xl sm:text-5xl font-black mb-2">45ms</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">API Response</p>
                    </div>
                  </div>


                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-black border border-slate-300 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">System Status</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">All systems operational</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { label: 'Database', value: 'Online', status: 'success' },
                      { label: 'API', value: 'Responsive', status: 'success' },
                      { label: 'Storage', value: '45% Used', status: 'warning' },
                      { label: 'Version', value: '1.0.0', status: 'info' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/5">
                        <span className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base">{item.label}</span>
                        <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 flex items-center justify-center">
                      <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">Recent Activity</h3>
                      <p className="text-xs sm:text-sm text-slate-600">Latest system events</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { action: 'User login', time: '2 minutes ago', icon: Users },
                      { action: 'Data backup', time: '1 hour ago', icon: Database },
                      { action: 'System update', time: '3 hours ago', icon: RefreshCw },
                      { action: 'New student added', time: '5 hours ago', icon: UserPlus }
                    ].map((activity, idx) => {
                      const Icon = activity.icon
                      return (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-slate-900" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{activity.action}</p>
                            <p className="text-xs text-slate-600">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LMS Monitor Tab - NEW REARRANGED */}
          {activeTab === 'lms' && (
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3 font-['Kodchasan']">
                   <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">LMS Ecosystem Hub</h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Automated synchronization & student academic mirror</p>
                  </div>
                </div>
                
                {/* Mode Selector - Sub Navigation */}
                <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {[
                    { id: 'fleet', label: 'Fleet Management', icon: Users },
                    { id: 'requests', label: 'Connection Requests', icon: Send },
                    { id: 'deadlines', label: 'Global Deadlines', icon: Calendar },
                    { id: 'preview', label: 'Student Mirror', icon: Eye }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setLmsSubTab(m.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${lmsSubTab === m.id ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <m.icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Banner - Real-time Progress */}
              {lmsStatus.isScanning && (
                <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] border border-white/5 shadow-2xl animate-in slide-in-from-top-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sync in Progress...</span>
                      </div>
                      <p className="text-lg font-black">{lmsStatus.currentAccount || 'Initializing engine...'}</p>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${lmsStatus.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-center">
                         <p className="text-2xl font-black">{lmsStatus.progress}%</p>
                         <p className="text-[9px] font-bold opacity-40 uppercase">Completion</p>
                      </div>
                      <div className="text-center">
                         <p className="text-2xl font-black text-emerald-500">{lmsStatus.success}</p>
                         <p className="text-[9px] font-bold opacity-40 uppercase">Linked</p>
                      </div>
                      <div className="text-center">
                         <p className="text-2xl font-black text-rose-500">{lmsStatus.errors}</p>
                         <p className="text-[9px] font-bold opacity-40 uppercase">Breaks</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Mode Content */}
              <div className="animate-fadeIn">
                {lmsSubTab === 'fleet' && (
                  <LmsFleetManagement 
                    accounts={lmsAccounts}
                    filteredAccounts={lmsAccounts.filter(a => a.label.toLowerCase().includes(searchTerm.toLowerCase()))}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleResend={handleResend}
                    handleDelete={handleDeleteAccount}
                    handleUniversalSync={handleTriggerLmsSync}
                    isUniversalSyncing={lmsStatus.isScanning}
                    isDeepSyncing={false} 
                    fetchAccounts={fetchAllLmsData}
                    fetchStats={fetchStats}
                    fetchDeadlines={fetchLmsRecent}
                    fetchAiCoverage={() => {}}
                    toast={toast}
                  />
                )}

                {lmsSubTab === 'requests' && (
                  <LmsRequestManagement 
                    requests={lmsRequests}
                    studentSearch={studentSearch}
                    setStudentSearch={setStudentSearch}
                    combinationFilter={combinationFilter}
                    setCombinationFilter={setCombinationFilter}
                    batchFilter={batchFilter}
                    setBatchFilter={setBatchFilter}
                    batches={batches}
                    WUSL_COMBINATIONS={WUSL_COMBINATIONS}
                    searchResults={searchResults}
                    searchingStudents={searchingStudents}
                    suggestedFleet={suggestedFleet}
                    handleSuggestFleet={handleSuggestFleet}
                    handleSendRequest={handleSendRequest}
                    isSendingId={isSendingId}
                    sentIds={sentIds}
                    handleApprove={handleApprove}
                    approvingId={approvingId}
                    handleDeleteRequest={handleDeleteRequest}
                    isSuggesting={isSuggesting}
                  />
                )}

                {lmsSubTab === 'deadlines' && (
                  <LmsDeadlineManagement 
                    deadlines={lmsDeadlines}
                    filteredDeadlines={lmsDeadlines.filter(dl => dl.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    moduleFilter={moduleFilter}
                    setModuleFilter={setModuleFilter}
                    getUniqueModules={() => {
                       const mods = new Set();
                       lmsDeadlines.forEach(d => d.moduleCode && mods.add(d.moduleCode));
                       return Array.from(mods).sort();
                    }}
                    showPastDeadlines={showPastDeadlines}
                    setShowPastDeadlines={setShowPastDeadlines}
                    handleNotifyStudent={handleNotifyStudent}
                    notifyingId={notifyingId}
                    handleDeleteDeadline={handleDeleteDeadline}
                    handleClearDeadlineNotifications={handleClearDeadlineNotifications}
                    fetchDeadlines={fetchAllLmsData}
                    deadlinesLoading={deadlinesLoading}
                    onUploadIcs={handleUploadIcs}
                    isUploadingIcs={isUploadingIcs}
                  />
                )}

                {lmsSubTab === 'preview' && (
                  <LmsDashboardPreview accounts={lmsAccounts} />
                )}
              </div>
            </div>
          )}

          {/* Academic Tab - Ash */}
          {activeTab === 'academic' && (
            <div className="space-y-6 sm:space-y-8">

              {/* Academic Management Header */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-200 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Academic Management</h2>
                    <p className="text-xs sm:text-sm text-slate-600">Configure student assessments and batches</p>
                  </div>
                </div>

                {/* Assessment & Batch Grid - Ash */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Assessments Card */}
                  <div className="bg-slate-50 border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 flex items-center justify-center">
                          <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
                        </div>
                        <div className="px-3 py-1 bg-slate-200 rounded-full border border-slate-300">
                          <span className="text-xs font-bold text-slate-900">Active</span>
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-2 text-slate-900">Assessments</h3>
                      <p className="text-slate-600 text-sm mb-4">Configure grading criteria and exam settings</p>
                    </div>
                  </div>

                  {/* Batch Years Card */}
                  <div className="bg-slate-50 border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 flex items-center justify-center">
                          <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-200 rounded-full border border-slate-300">
                          <Lock className="w-3 h-3 text-slate-900" />
                          <span className="text-xs font-bold text-slate-900">Admin</span>
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-2 text-slate-900">Batch Years</h3>
                      <p className="text-slate-600 text-sm mb-4">Manage student cohorts and academic years</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Management Section - Ash */}
              <div className="bg-white border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">Assessment Configuration</h3>
                    <p className="text-xs text-slate-600">Define grading scales and exam types</p>
                  </div>
                </div>
                <AssessmentManagement />
              </div>

              {/* Batch Year Management Section - Ash */}
              <div className="bg-white border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">Academic Batch Management</h3>
                      <p className="text-xs text-slate-600">Create and organize student batches</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-900 rounded-lg text-xs font-bold border border-slate-300">
                    <Lock className="w-3.5 h-3.5" />
                    Super Admin
                  </div>
                </div>
                <BatchYearManagement />
              </div>

              {/* Bulk Combination Tool - Ash */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-200 flex items-center justify-center">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Bulk Operations</h2>
                    <p className="text-xs sm:text-sm text-slate-600">Mass student data management</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admin/bulk-combination')}
                  className="group w-full bg-slate-50 border border-slate-300 hover:border-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 sm:gap-6 relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 flex items-center justify-center">
                      <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Bulk Combination Assignment</h3>
                      <p className="text-slate-600 text-sm sm:text-base">Upload Excel files to assign subject combinations to multiple students</p>
                    </div>
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Resources Tab - Ash */}
          {activeTab === 'resources' && (
            <div className="space-y-6 sm:space-y-8">

              {/* Resource Overview Header */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-200 flex items-center justify-center">
                    <Database className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Resource Center</h2>
                    <p className="text-xs sm:text-sm text-slate-600">Manage academic materials and system files</p>
                  </div>
                </div>

                {/* Resource Stats Cards - Ash */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {/* Study Materials Card */}
                  <div className="bg-slate-50 border border-slate-300 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <FileText className="w-8 h-8 text-slate-900" />
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-1 text-slate-900">Materials</h3>
                      <p className="text-slate-600 text-xs">Study resources</p>
                    </div>
                  </div>

                  {/* Documents Card - Ash */}
                  <div className="bg-slate-50 border border-slate-300 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <Database className="w-8 h-8 text-slate-900" />
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-1 text-slate-900">Documents</h3>
                      <p className="text-slate-600 text-xs">System files</p>
                    </div>
                  </div>

                  {/* Media Card - Ash */}
                  <div className="bg-slate-50 border border-slate-300 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <Upload className="w-8 h-8 text-slate-900" />
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-1 text-slate-900">Media</h3>
                      <p className="text-slate-600 text-xs">Images & videos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Management Interface - Ash */}
              <div className="bg-white border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                    <Database className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">Resource Database</h3>
                    <p className="text-xs text-slate-600">Upload, organize, and manage all resources</p>
                  </div>
                </div>
                <ResourceManagement />
              </div>

              {/* Cloud Storage Management Redirect */}
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200 rounded-3xl p-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Cloud Storage & Visual Explorer</h3>
                  <p className="text-sm text-slate-600 max-w-lg">
                    Manage active storage platforms (Mega / Google Drive), configure Secure Service Accounts, and visually explore your cloud architecture via the interactive Grid Editor.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/admin/storage')}
                  className="relative z-10 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Database className="w-5 h-5" /> Launch Storage Coordinator
                </button>
                <Cloud className="absolute -right-8 -bottom-8 w-48 h-48 text-blue-100 opacity-50 z-0 pointer-events-none" />
              </div>

              {/* Quick Resource Actions - Ash */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-200 flex items-center justify-center">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Quick Actions</h2>
                    <p className="text-xs sm:text-sm text-slate-600">Common resource operations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Upload Resources */}
                  {/* Upload Resources - Ash */}
                  <button
                    onClick={() => document.getElementById('resource-input')?.click()}
                    className="group relative overflow-hidden bg-slate-50 border border-slate-300 hover:border-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-2">Upload Resource</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mb-4">Add new study materials or files</p>

                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm group-hover:gap-3 transition-all">
                        <span>Browse files</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Organize Resources - Ash */}
                  <button
                    onClick={() => navigate('/admin/resources')}
                    className="group relative overflow-hidden bg-slate-50 border border-slate-300 hover:border-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Database className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-2">Organize Files</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mb-4">Categorize and structure resources</p>

                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm group-hover:gap-3 transition-all">
                        <span>Manage</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab - Ash */}
          {activeTab === 'users' && (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Manage Users Card - Ash */}
                <button
                  onClick={() => navigate('/admin/users')}
                  className="group relative overflow-hidden bg-slate-50 border border-slate-300 hover:border-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 flex items-center justify-center">
                        <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-900" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Manage Users</h3>
                    <p className="text-slate-600 text-sm sm:text-base mb-6">Control access levels and user roles</p>
                    <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl border border-slate-300">
                      <span className="text-slate-700 text-sm font-medium">Total Users</span>
                      <span className="text-2xl font-black text-slate-900">{stats.usersCount}</span>
                    </div>
                  </div>
                </button>

                {/* Sync Accounts Card - Ash */}
                <button
                  onClick={handleSyncUsers}
                  className="group relative overflow-hidden bg-slate-50 border border-slate-300 hover:border-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 flex items-center justify-center">
                        <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-900" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Sync Accounts</h3>
                    <p className="text-slate-600 text-sm sm:text-base mb-6">Auto-create user accounts for students</p>
                    <div className="p-4 bg-slate-100 rounded-xl border border-slate-300">
                      <p className="text-xs text-slate-700 italic">Automatically generates login credentials for students without accounts</p>
                    </div>
                  </div>
                </button>

                {/* Mass Account Reset Card - Red/Danger - Ash */}
                <button
                  onClick={handleMassAccountReset}
                  className="group relative overflow-hidden bg-red-50 border-2 border-red-200 hover:border-red-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertTriangle className="w-24 h-24 text-red-600" />
                  </div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-200">
                        <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-red-600 mb-3 uppercase tracking-tight">Security Reset</h3>
                    <p className="text-red-700 font-bold text-sm sm:text-base mb-6">Mass Lock & Password Invalidation</p>
                    <div className="p-4 bg-white/60 rounded-xl border border-red-200 backdrop-blur-sm">
                      <p className="text-xs text-red-900 font-black flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        FORCED RE-VERIFICATION REQUIRED
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Missing Students - Ash */}
              <button
                onClick={() => navigate('/missing-students')}
                className="group w-full bg-slate-50 border border-slate-300 hover:border-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Missing Students Report</h3>
                    <p className="text-slate-600 text-sm sm:text-base">Identify and resolve data inconsistencies</p>
                  </div>
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
                </div>
              </button>

              {/* Permission Levels - Ash */}
              <div className="bg-white border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 flex items-center justify-center">
                    <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Permission Levels</h3>
                    <p className="text-xs sm:text-sm text-slate-600">System access hierarchy</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border-2 border-slate-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 text-slate-900 rounded-2xl flex items-center justify-center mb-4 font-black text-xl sm:text-2xl">
                      S
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Superadmin</h4>
                    <p className="text-xs sm:text-sm text-slate-700">Complete system control and configuration access</p>
                  </div>

                  <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border-2 border-slate-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 text-slate-900 rounded-2xl flex items-center justify-center mb-4 font-black text-xl sm:text-2xl">
                      A
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Admin</h4>
                    <p className="text-xs sm:text-sm text-slate-700">Manage students, data, and daily operations</p>
                  </div>

                  <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border-2 border-slate-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 text-slate-900 rounded-2xl flex items-center justify-center mb-4 font-black text-xl sm:text-2xl">
                      U
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">User</h4>
                    <p className="text-xs sm:text-sm text-slate-700">View and manage personal data only</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Tab - Ash */}
          {activeTab === 'system' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Danger Zone - Ash */}
              <div className="relative overflow-hidden bg-slate-50 border-2 border-slate-400 rounded-2xl sm:rounded-3xl p-6 sm:p-10">
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-200 rounded-2xl flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Danger Zone</h3>
                      <p className="text-slate-700 text-sm sm:text-base font-medium">Irreversible destructive actions</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-3">Reset All Student Data</h4>
                    <p className="text-slate-700 text-sm sm:text-base mb-6">
                      ⚠️ This will <span className="font-bold">permanently delete</span> all student records from the database. This action <span className="font-bold">cannot be undone</span>.
                    </p>
                    <button
                      onClick={handleResetData}
                      className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-base sm:text-lg group"
                    >
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                      Delete All Student Data
                    </button>
                  </div>
                </div>
              </div>

              {/* System Maintenance - Ash */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 flex items-center justify-center">
                      <Database className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">Database Tools</h3>
                      <p className="text-xs sm:text-sm text-slate-600">Maintenance and optimization</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <button
                      onClick={() => alert('Database backup feature coming soon! This will create a complete backup of your database.')}
                      className="w-full py-3 sm:py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Backup Database
                    </button>
                    <button
                      onClick={() => alert('Table optimization feature coming soon! This will optimize database performance.')}
                      className="w-full py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl border-2 border-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      Optimize Tables
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 flex items-center justify-center">
                      <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">System Logs</h3>
                      <p className="text-xs sm:text-sm text-slate-600">Activity monitoring</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <button
                      onClick={() => alert('Activity logs viewer coming soon! Monitor all system activities.')}
                      className="w-full py-3 sm:py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      View Activity Logs
                    </button>
                    <button
                      onClick={() => alert('Log export feature coming soon! Download system logs for analysis.')}
                      className="w-full py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl border-2 border-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Export Logs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Configuration Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">AI Configuration</h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Manage Gemini AI Studio credentials</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Gemini Setup Card */}
                <div className="bg-white dark:bg-black border border-slate-300 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Google Gemini AI</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Used for LMS analysis & resource summaries</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                        Gemini API Key
                      </label>
                      <div className="relative group">
                        <input
                          type="password"
                          value={aiConfig.apiKey}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                          placeholder={aiConfig.hasKey ? `Current: ${aiConfig.maskedKey}` : "Enter Gemini API Key..."}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white transition-all pr-12"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] sm:text-xs text-slate-500 italic flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Key is stored securely and masked in the UI.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={async () => {
                          try {
                            // If the key is already masked, we don't need to save
                            if (aiConfig.apiKey.includes('...') && aiConfig.apiKey.length < 25) {
                                toast.info('Key is already saved.')
                                setAiConfig(prev => ({ ...prev, apiKey: '' }))
                                return
                            }

                            setAiConfig(prev => ({ ...prev, isSaving: true }))
                            const res = await systemService.updateGeminiConfig(aiConfig.apiKey)
                            
                            if (res.data.skipped) {
                                toast.info(res.data.message)
                            } else {
                                toast.success('Gemini API Key updated successfully!')
                            }

                            setAiConfig(prev => ({ ...prev, apiKey: '', hasKey: true }))
                            // Refresh config to get new masked key and timestamp
                            const newConfig = await systemService.getGeminiConfig()
                            setAiConfig(prev => ({ ...prev, ...newConfig.data }))
                          } catch (err) {
                            toast.error(err.response?.data?.error?.message || 'Update failed')
                          } finally {
                            setAiConfig(prev => ({ ...prev, isSaving: false }))
                          }
                        }}
                        disabled={!aiConfig.apiKey || aiConfig.isSaving || (aiConfig.apiKey.includes('...') && aiConfig.apiKey.length < 25)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${!aiConfig.apiKey || aiConfig.isSaving || (aiConfig.apiKey.includes('...') && aiConfig.apiKey.length < 25) ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-lg'}`}
                      >
                        {aiConfig.isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Save Settings
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            setAiConfig(prev => ({ ...prev, isTesting: true, testResult: null }))
                            const res = await systemService.testGeminiConfig(aiConfig.apiKey)
                            setAiConfig(prev => ({ ...prev, testResult: { success: true, message: res.data.message } }))
                            toast.success(res.data.message)
                          } catch (err) {
                            const errorData = err.response?.data?.error;
                            const msg = errorData?.message || err.response?.data?.message || 'Connection failed';
                            
                            // Check for 429 specifically and extract retry time
                            if (err.response?.status === 429) {
                                const retryMatch = msg.match(/retry in ([\d\.]+)s/);
                                if (retryMatch) {
                                    startCountdown(Math.ceil(parseFloat(retryMatch[1])));
                                }
                            }

                            setAiConfig(prev => ({ ...prev, testResult: { success: false, message: msg } }))
                            toast.error(msg)
                          } finally {
                            setAiConfig(prev => ({ ...prev, isTesting: false }))
                          }
                        }}
                        disabled={aiConfig.isTesting || aiConfig.countdown > 0}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-white/10 font-bold text-sm transition-all ${aiConfig.countdown > 0 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        {aiConfig.isTesting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : aiConfig.countdown > 0 ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                        {aiConfig.countdown > 0 ? `Retry in ${aiConfig.countdown}s` : 'Test Connection'}
                      </button>
                    </div>

                    {aiConfig.testResult && (
                      <div className={`p-4 rounded-xl border ${aiConfig.testResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} text-xs font-medium animate-fadeIn flex items-center gap-3`}>
                        {aiConfig.testResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {aiConfig.testResult.message}
                      </div>
                    )}

                    {aiConfig.updatedAt && (
                      <div className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1.5 opacity-60">
                        <Clock className="w-3.5 h-3.5" />
                        Last modified: {new Date(aiConfig.updatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Card */}
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                    <h3 className="text-slate-900 dark:text-white font-bold text-base mb-4 flex items-center gap-2">
                       <ShieldAlert className="w-5 h-5 text-violet-500" />
                       Why is this required?
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-4">
                      The academic monitoring system uses **Gemini 1.5/2.0 Flash** to perform deep analysis of your Moodle data. 
                      This automated enrichment helps extract module codes, verify instructions, and categorize assignments 
                      without manual data entry. You can get an API key for free from the [Google AI Studio](https://aistudio.google.com/app/apikey).
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {[
                        'Summarize complex assignment instructions',
                        'Auto-detect Academic Module Codes',
                        'Assign priority levels to deadlines',
                        'Verify student login attempts via Vision AI'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl transition-all group"
                  >
                    <div>
                      <span className="block font-bold text-sm">Need a key?</span>
                      <span className="text-[11px] opacity-80">Generate one at Google AI Studio</span>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Notice Scraper Tab */}
          {activeTab === 'scraper' && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">Notice Scraper</h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Automated faculty notice aggregation</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <button
                    onClick={handleTriggerScrape}
                    disabled={isScraping || scraperStatus.status === 'running'}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${isScraping || scraperStatus.status === 'running' ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-lg'}`}
                  >
                    {isScraping || scraperStatus.status === 'running' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Sync Now
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`relative overflow-hidden p-6 sm:p-8 rounded-[2rem] border transition-all ${scraperStatus.status === 'running' ? 'bg-blue-600 border-blue-500 shadow-blue-200/50' : scraperStatus.status === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-slate-900 border-white/5'} shadow-2xl`}>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${scraperStatus.status === 'running' ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">System Engine Status</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter">
                      {scraperStatus.status === 'running' ? 'SYNCHRONIZING...' : scraperStatus.status === 'error' ? 'SYSTEM INTERRUPTED' : 'ENGINE READY'}
                    </h3>
                    <p className="text-white/70 font-medium max-w-md leading-relaxed">
                      {scraperStatus.message || 'The automated notice harvester is standing by for the next scheduled deployment.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-12 py-6 lg:py-0 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-12">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Last Run</p>
                      <p className="text-white font-black text-lg">{scraperStatus.lastRun ? new Date(scraperStatus.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Next Run</p>
                      <p className="text-white font-black text-lg">{scraperStatus.nextRun ? new Date(scraperStatus.nextRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Schedule</p>
                      <p className="text-white font-black text-lg">{scraperStatus.schedule || '*/15 * * * *'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Configuration Card */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-black border border-slate-300 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                       <Settings className="w-5 h-5 text-slate-400" />
                       Engine Configuration
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Notice URL</label>
                          <input 
                            type="text" 
                            value={scraperConfig.targetUrl}
                            onChange={(e) => setScraperConfig(prev => ({ ...prev, targetUrl: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cron Schedule</label>
                          <input 
                            type="text" 
                            value={scraperConfig.cronSchedule}
                            onChange={(e) => setScraperConfig(prev => ({ ...prev, cronSchedule: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scraperConfig.autoPublish ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                            <Globe className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Auto-Publish Notices</p>
                            <p className="text-[10px] text-slate-500">Automatically make new notices visible to students</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setScraperConfig(prev => ({ ...prev, autoPublish: !prev.autoPublish }))}
                          className={`w-12 h-6 rounded-full transition-all relative ${scraperConfig.autoPublish ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${scraperConfig.autoPublish ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>

                       <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                        <button
                          onClick={async () => {
                            try {
                              setScraperConfig(prev => ({ ...prev, isSaving: true }))
                              await noticeService.updateSettings(scraperConfig)
                              toast.success('Configuration saved successfully!')
                            } catch (err) {
                              toast.error('Failed to save settings')
                            } finally {
                              setScraperConfig(prev => ({ ...prev, isSaving: false }))
                            }
                          }}
                          disabled={scraperConfig.isSaving}
                          className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm hover:shadow-lg transition-all"
                        >
                          {scraperConfig.isSaving ? 'Saving...' : 'Save Configuration'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-8">
                    <h3 className="text-slate-900 dark:text-white font-black text-xl mb-4 italic tracking-tight uppercase">System Logic</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Harvester visits the faculty URL defined and identifies new articles via DOM selectors.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Each new entry is analyzed by **Vision AI** to perform content rewriting and sentiment tagging.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Metadata and local download links are securely mirrored for high-speed student access.</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/admin/notices')}
                      className="w-full mt-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:border-slate-900 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View Notice Database
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* High-Fidelity Themed Confirmation Modal */}
      <SecurityConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        loading={confirmModal.loading}
      />

      {/* Security Lockdown Success Overlay */}
      {lockStatus.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-['Kodchasan'] tracking-wide">
          <div className="absolute inset-0 bg-[#151313]/98 backdrop-blur-3xl animate-in fade-in duration-700"></div>
          
          <div className="relative w-full max-w-lg text-center animate-in zoom-in-95 duration-500 delay-100">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/20 rounded-3xl mb-8 relative">
              <CheckCircle size={48} className="text-emerald-500" />
              <div className="absolute inset-0 bg-emerald-500 animate-ping rounded-3xl opacity-20"></div>
            </div>
            
            <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Verification Active</h2>
            <h3 className="text-4xl sm:text-5xl font-black text-white mb-6 uppercase leading-tight">
              Security<br />Lockdown
            </h3>
            
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md mb-10">
              <p className="text-slate-400 font-bold mb-2">Systems successfully updated for:</p>
              <p className="text-5xl font-black text-white tabular-nums tracking-tighter">
                {lockStatus.count} <span className="text-lg text-slate-500">Accounts</span>
              </p>
            </div>

            <button
              onClick={() => setLockStatus({ show: false, count: 0 })}
              className="px-10 h-16 bg-white text-[#151313] rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Acknowledged
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>
  )
}

