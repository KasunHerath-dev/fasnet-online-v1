import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, studentService, systemService } from '../services/authService'
import BatchYearManagement from '../components/BatchYearManagement'
import AssessmentManagement from '../components/AssessmentManagement'
import ResourceManagement from '../components/ResourceManagement'
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
  Calendar
} from 'lucide-react'

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  const [stats, setStats] = useState({
    usersCount: 0,
    status: 'Unknown'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

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

  const handleResetData = async () => {
    if (window.confirm('⚠️ DANGER: Are you sure you want to DELETE ALL STUDENTS? This action cannot be undone!')) {
      if (window.confirm('⚠️ DOUBLE CHECK: This will wipe the entire student database. Confirm?')) {
        try {
          await studentService.deleteAll()
          alert('✅ All student data has been reset.')
        } catch (err) {
          alert('❌ ' + (err.response?.data?.error?.message || 'Reset failed'))
        }
      }
    }
  }

  const handleSyncUsers = async () => {
    if (!window.confirm('This will create user accounts for all students who do not have one. Continue?')) return;
    try {
      const res = await studentService.createMissingUsers();
      alert(res.data.message);
      fetchStats();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error?.message || err.message));
    }
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
    { id: 'users', label: 'Users', icon: Users },
    { id: 'system', label: 'System', icon: Settings }
  ]

  const currentTab = tabs.find(t => t.id === activeTab)

  return (
    <div className="min-h-screen bg-white dark:bg-black font-display text-slate-900 dark:text-white transition-colors duration-300">

      {/* Hero Section - Monochrome */}
      <div className="relative w-full overflow-hidden border-b border-gray-200">
        <div className="absolute inset-0 bg-white"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-10">

            {/* Left side - Title & Description */}
            <div className="flex-1 space-y-3 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-gray-100 border border-gray-300">
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                <span className="text-black text-[10px] sm:text-xs font-bold tracking-wide uppercase">Admin Control Center</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-black leading-none tracking-tight">
                  Command
                  <span className="block mt-1 text-gray-600">
                    Center
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium max-w-xl leading-relaxed">
                  Complete system management and analytics
                </p>
              </div>

              {/* Quick stats badges - Monochrome */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 border border-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-black text-xs sm:text-sm font-bold">System Online</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-100 border border-gray-300">
                  <Users className="w-4 h-4 text-black" />
                  <span className="text-black text-xs sm:text-sm font-bold">{stats.usersCount} Users</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-100 border border-gray-300">
                  <Clock className="w-4 h-4 text-black" />
                  <span className="text-black text-xs sm:text-sm font-bold">Last sync: 2m ago</span>
                </div>
              </div>
            </div>

            {/* Right side - System Health card - Monochrome */}
            <div className="w-full lg:w-80 xl:w-96">
              <div className="bg-gray-50 border border-gray-300 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-black font-bold text-sm sm:text-base">System Health</h3>
                    <p className="text-gray-600 text-[10px] sm:text-xs">Real-time monitoring</p>
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs sm:text-sm font-medium">Database</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-black font-bold text-xs sm:text-sm">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs sm:text-sm font-medium">API</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-black font-bold text-xs sm:text-sm">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs sm:text-sm font-medium">Storage</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-black font-bold text-xs sm:text-sm">68% Free</span>
                    </div>
                  </div>

                  {/* Health Score */}
                  <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 text-xs sm:text-sm font-medium">Overall Health</span>
                      <span className="text-black font-black text-sm sm:text-base">Excellent</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: '92%' }}></div>
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

        {/* Tab Navigation - Monochrome */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-gray-50 border border-gray-300 rounded-xl sm:rounded-2xl p-1.5 sm:p-2">
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative group transition-all duration-200  ${isActive ? '' : 'hover:bg-gray-200'
                      }`}
                  >
                    <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 transition-all duration-200 ${isActive
                      ? 'bg-black'
                      : 'bg-white border border-gray-300'
                      }`}>
                      <div className="flex flex-col items-center gap-1.5 sm:gap-2 relative z-10">
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-all duration-200 ${isActive
                          ? 'text-white'
                          : 'text-gray-600'
                          }`} />
                        <span className={`text-[10px] sm:text-xs lg:text-sm font-bold transition-all duration-200 text-center leading-tight ${isActive
                          ? 'text-white'
                          : 'text-gray-600'
                          }`}>
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
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-200 flex items-center justify-center">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black">Quick Actions</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Frequently used operations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {/* Change Password - Monochrome */}
                  <button
                    onClick={handleChangePassword}
                    className="group relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-300 hover:border-black transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-4">
                        <Key className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-black mb-2">Change Password</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4">Update your security credentials</p>

                      <div className="flex items-center gap-2 text-black font-bold text-xs sm:text-sm">
                        <span>Update now</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Add Student - Monochrome */}
                  <button
                    onClick={() => navigate('/students/new')}
                    className="group relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-300 hover:border-black transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-black mb-2">Add Student</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4">Register new student manually</p>

                      <div className="flex items-center gap-2 text-black font-bold text-xs sm:text-sm">
                        <span>Create profile</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Profile Requests - Monochrome */}
                  <button
                    onClick={() => navigate('/profile-requests')}
                    className="group relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-300 hover:border-black transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-black mb-2">Profile Requests</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4">Review pending changes</p>

                      <div className="flex items-center gap-2 text-black font-bold text-xs sm:text-sm">
                        <span>View requests</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Bulk Import - Monochrome */}
                  <button
                    onClick={() => navigate('/students/upload')}
                    className="group relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-300 hover:border-black transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-black mb-2">Bulk Import</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4">Upload CSV/Excel files</p>

                      <div className="flex items-center gap-2 text-black font-bold text-xs sm:text-sm">
                        <span>Import data</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* System Analytics - Monochrome */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-200 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black">System Analytics</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Real-time system metrics</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Database Status Card - Monochrome */}
                  <div className="bg-gray-50 border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <Database className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>

                      <div>
                        <p className="text-black text-4xl sm:text-5xl font-black mb-2">Online</p>
                        <p className="text-gray-600 text-sm font-medium">Database</p>
                      </div>
                    </div>
                  </div>
                  {/* Users Count Card - Monochrome */}
                  <div className="bg-gray-50 border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                        <TrendingUp className="w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-black text-4xl sm:text-5xl font-black mb-2">{stats.usersCount}</p>
                      <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    </div>
                  </div>

                  {/* API Response Card - Monochrome */}
                  <div className="bg-gray-50 border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                        <CheckCircle className="w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-black text-4xl sm:text-5xl font-black mb-2">45ms</p>
                      <p className="text-gray-600 text-sm font-medium">API Response</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-black">System Status</h3>
                      <p className="text-xs sm:text-sm text-gray-600">All systems operational</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { label: 'Database', value: 'Online', status: 'success' },
                      { label: 'API', value: 'Responsive', status: 'success' },
                      { label: 'Storage', value: '45% Used', status: 'warning' },
                      { label: 'Version', value: '1.0.0', status: 'info' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200">
                        <span className="text-gray-600 font-medium text-sm sm:text-base">{item.label}</span>
                        <span className="font-bold text-sm sm:text-base text-black">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
                      <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-black">Recent Activity</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Latest system events</p>
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
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-black" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-black truncate">{activity.action}</p>
                            <p className="text-xs text-gray-600">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Tab - Monochrome */}
          {activeTab === 'academic' && (
            <div className="space-y-6 sm:space-y-8">

              {/* Academic Management Header */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-200 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black">Academic Management</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Configure student assessments and batches</p>
                  </div>
                </div>

                {/* Assessment & Batch Grid - Monochrome */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Assessments Card */}
                  <div className="bg-gray-50 border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                          <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                        </div>
                        <div className="px-3 py-1 bg-gray-200 rounded-full border border-gray-300">
                          <span className="text-xs font-bold text-black">Active</span>
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-2 text-black">Assessments</h3>
                      <p className="text-gray-600 text-sm mb-4">Configure grading criteria and exam settings</p>
                    </div>
                  </div>

                  {/* Batch Years Card */}
                  <div className="bg-gray-50 border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                          <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-200 rounded-full border border-gray-300">
                          <Lock className="w-3 h-3 text-black" />
                          <span className="text-xs font-bold text-black">Admin</span>
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-2 text-black">Batch Years</h3>
                      <p className="text-gray-600 text-sm mb-4">Manage student cohorts and academic years</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Management Section - Monochrome */}
              <div className="bg-white border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-black">Assessment Configuration</h3>
                    <p className="text-xs text-gray-600">Define grading scales and exam types</p>
                  </div>
                </div>
                <AssessmentManagement />
              </div>

              {/* Batch Year Management Section - Monochrome */}
              <div className="bg-white border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-black">Academic Batch Management</h3>
                      <p className="text-xs text-gray-600">Create and organize student batches</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-black rounded-lg text-xs font-bold border border-gray-300">
                    <Lock className="w-3.5 h-3.5" />
                    Super Admin
                  </div>
                </div>
                <BatchYearManagement />
              </div>

              {/* Bulk Combination Tool - Monochrome */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-200 flex items-center justify-center">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black">Bulk Operations</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Mass student data management</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admin/bulk-combination')}
                  className="group w-full bg-gray-50 border border-gray-300 hover:border-black rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 sm:gap-6 relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                      <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">Bulk Combination Assignment</h3>
                      <p className="text-gray-600 text-sm sm:text-base">Upload Excel files to assign subject combinations to multiple students</p>
                    </div>
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Resources Tab - Monochrome */}
          {activeTab === 'resources' && (
            <div className="space-y-6 sm:space-y-8">

              {/* Resource Overview Header */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-200 flex items-center justify-center">
                    <Database className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black">Resource Center</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Manage academic materials and system files</p>
                  </div>
                </div>

                {/* Resource Stats Cards - Monochrome */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {/* Study Materials Card */}
                  <div className="bg-gray-50 border border-gray-300 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <FileText className="w-8 h-8 text-black" />
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-1 text-black">Materials</h3>
                      <p className="text-gray-600 text-xs">Study resources</p>
                    </div>
                  </div>

                  {/* Documents Card - Monochrome */}
                  <div className="bg-gray-50 border border-gray-300 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <Database className="w-8 h-8 text-black" />
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-1 text-black">Documents</h3>
                      <p className="text-gray-600 text-xs">System files</p>
                    </div>
                  </div>

                  {/* Media Card - Monochrome */}
                  <div className="bg-gray-50 border border-gray-300 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <Upload className="w-8 h-8 text-black" />
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black mb-1 text-black">Media</h3>
                      <p className="text-gray-600 text-xs">Images & videos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Management Interface - Monochrome */}
              <div className="bg-white border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                    <Database className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-black">Resource Database</h3>
                    <p className="text-xs text-gray-600">Upload, organize, and manage all resources</p>
                  </div>
                </div>
                <ResourceManagement />
              </div>

              {/* Quick Resource Actions - Monochrome */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-200 flex items-center justify-center">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black">Quick Actions</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Common resource operations</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Upload Resources */}
                  <button
                    onClick={() => navigate('/admin/resources')}
                    className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                        <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">Upload Resource</h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">Add new study materials or files</p>

                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm group-hover:gap-3 transition-all">
                        <span>Browse files</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Organize Resources */}
                  <button
                    onClick={() => navigate('/admin/resources')}
                    className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                        <Database className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">Organize Files</h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">Categorize and structure resources</p>

                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm group-hover:gap-3 transition-all">
                        <span>Manage</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab - Monochrome */}
          {activeTab === 'users' && (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Manage Users Card - Monochrome */}
                <button
                  onClick={() => navigate('/admin/users')}
                  className="group relative overflow-hidden bg-gray-50 border border-gray-300 hover:border-black rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                        <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-black mb-3">Manage Users</h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-6">Control access levels and user roles</p>
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl border border-gray-300">
                      <span className="text-gray-700 text-sm font-medium">Total Users</span>
                      <span className="text-2xl font-black text-black">{stats.usersCount}</span>
                    </div>
                  </div>
                </button>

                {/* Sync Accounts Card - Monochrome */}
                <button
                  onClick={handleSyncUsers}
                  className="group relative overflow-hidden bg-gray-50 border border-gray-300 hover:border-black rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                        <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-black mb-3">Sync Accounts</h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-6">Auto-create user accounts for students</p>
                    <div className="p-4 bg-gray-100 rounded-xl border border-gray-300">
                      <p className="text-xs text-gray-700 italic">Automatically generates login credentials for students without accounts</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Missing Students - Monochrome */}
              <button
                onClick={() => navigate('/missing-students')}
                className="group w-full bg-gray-50 border border-gray-300 hover:border-black rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">Missing Students Report</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Identify and resolve data inconsistencies</p>
                  </div>
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                </div>
              </button>

              {/* Permission Levels - Monochrome */}
              <div className="bg-white border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
                    <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-black">Permission Levels</h3>
                    <p className="text-xs sm:text-sm text-gray-600">System access hierarchy</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border-2 border-gray-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 text-black rounded-2xl flex items-center justify-center mb-4 font-black text-xl sm:text-2xl">
                      S
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-black mb-2">Superadmin</h4>
                    <p className="text-xs sm:text-sm text-gray-700">Complete system control and configuration access</p>
                  </div>

                  <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border-2 border-gray-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 text-black rounded-2xl flex items-center justify-center mb-4 font-black text-xl sm:text-2xl">
                      A
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-black mb-2">Admin</h4>
                    <p className="text-xs sm:text-sm text-gray-700">Manage students, data, and daily operations</p>
                  </div>

                  <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border-2 border-gray-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 text-black rounded-2xl flex items-center justify-center mb-4 font-black text-xl sm:text-2xl">
                      U
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-black mb-2">User</h4>
                    <p className="text-xs sm:text-sm text-gray-700">View and manage personal data only</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Tab - Monochrome */}
          {activeTab === 'system' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Danger Zone - Monochrome */}
              <div className="relative overflow-hidden bg-gray-50 border-2 border-gray-400 rounded-2xl sm:rounded-3xl p-6 sm:p-10">
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-black">Danger Zone</h3>
                      <p className="text-gray-700 text-sm sm:text-base font-medium">Irreversible destructive actions</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-300 rounded-2xl p-6 sm:p-8">
                    <h4 className="text-xl font-bold text-black mb-3">Reset All Student Data</h4>
                    <p className="text-gray-700 text-sm sm:text-base mb-6">
                      ⚠️ This will <span className="font-bold">permanently delete</span> all student records from the database. This action <span className="font-bold">cannot be undone</span>.
                    </p>
                    <button
                      onClick={handleResetData}
                      className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-base sm:text-lg group"
                    >
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                      Delete All Student Data
                    </button>
                  </div>
                </div>
              </div>

              {/* System Maintenance - Monochrome */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
                      <Database className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-black">Database Tools</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Maintenance and optimization</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <button
                      onClick={() => alert('Database backup feature coming soon! This will create a complete backup of your database.')}
                      className="w-full py-3 sm:py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Backup Database
                    </button>
                    <button
                      onClick={() => alert('Table optimization feature coming soon! This will optimize database performance.')}
                      className="w-full py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-xl border-2 border-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      Optimize Tables
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
                      <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-black">System Logs</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Activity monitoring</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <button
                      onClick={() => alert('Activity logs viewer coming soon! Monitor all system activities.')}
                      className="w-full py-3 sm:py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      View Activity Logs
                    </button>
                    <button
                      onClick={() => alert('Log export feature coming soon! Download system logs for analysis.')}
                      className="w-full py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-xl border-2 border-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Export Logs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
