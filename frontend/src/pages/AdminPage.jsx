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
  Key
} from 'lucide-react'

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  const [stats, setStats] = useState({
    usersCount: 0,
    status: 'Unknown'
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await systemService.getStats()
      setStats({ usersCount: res.data.usersCount, status: res.data.status })
    } catch (err) {
      console.error(err)
      setStats(prev => ({ ...prev, status: 'Error' }))
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
    { id: 'general', label: 'General', icon: Settings },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'resources', label: 'Resources', icon: Database },
    { id: 'users', label: 'Users & Access', icon: Users },
    { id: 'system', label: 'System', icon: Database }
  ]

  return (
    <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
      <div className="relative flex flex-col w-full min-h-screen">

        {/* Hero Section - Dashboard Style */}
        <div className="relative w-full h-[280px] bg-gradient-to-br from-stitch-blue via-[#6b13ec] to-stitch-pink overflow-hidden rounded-b-[2.5rem] shadow-2xl z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-stitch-blue opacity-20 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl"></div>

          <div className="relative flex flex-col justify-end h-full px-6 pb-12 pt-12 z-10 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-sm">Admin Settings</h1>
                <p className="text-white/80 text-sm md:text-base font-medium mt-1">System configuration and management</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 z-20 -mt-8 space-y-8">

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-stitch-card-dark rounded-2xl p-2 shadow-lg border border-slate-100 dark:border-stitch-card-border overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                      ? 'bg-stitch-blue text-white shadow-md shadow-stitch-blue/20'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-fadeIn">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 ml-1">
                      <Activity className="w-5 h-5 text-stitch-blue" />
                      Quick Actions
                    </h3>

                    <div onClick={handleChangePassword}
                      className="group p-5 bg-white dark:bg-stitch-card-dark rounded-2xl border border-slate-100 dark:border-stitch-card-border hover:border-stitch-blue dark:hover:border-stitch-blue transition-all cursor-pointer shadow-md hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-stitch-blue/10 flex items-center justify-center text-stitch-blue group-hover:bg-stitch-blue group-hover:text-white transition-colors">
                          <Key className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Change My Password</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Update account security</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-stitch-blue group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    <div onClick={() => navigate('/students/new')}
                      className="group p-5 bg-white dark:bg-stitch-card-dark rounded-2xl border border-slate-100 dark:border-stitch-card-border hover:border-stitch-blue dark:hover:border-stitch-blue transition-all cursor-pointer shadow-md hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          <Plus className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Add New Student</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Manual registration</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    <div onClick={() => navigate('/profile-requests')}
                      className="group p-5 bg-white dark:bg-stitch-card-dark rounded-2xl border border-slate-100 dark:border-stitch-card-border hover:border-stitch-blue dark:hover:border-stitch-blue transition-all cursor-pointer shadow-md hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Profile Requests</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Review pending changes</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    <div onClick={() => navigate('/register-students')}
                      className="group p-5 bg-white dark:bg-stitch-card-dark rounded-2xl border border-slate-100 dark:border-stitch-card-border hover:border-stitch-blue dark:hover:border-stitch-blue transition-all cursor-pointer shadow-md hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-stitch-pink/10 flex items-center justify-center text-stitch-pink group-hover:bg-stitch-pink group-hover:text-white transition-colors">
                          <Database className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Bulk Import</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Upload CSV/Excel</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-stitch-pink group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 ml-1">
                      <Activity className="w-5 h-5 text-stitch-success" />
                      System Information
                    </h3>

                    <div className="bg-white dark:bg-stitch-card-dark rounded-2xl p-6 border border-slate-100 dark:border-stitch-card-border shadow-lg">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">Database Status</span>
                          <span className="flex items-center gap-2 text-stitch-success font-bold text-sm bg-stitch-success/10 px-3 py-1 rounded-full">
                            <CheckCircle className="w-4 h-4" />
                            Online
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">API Status</span>
                          <span className="flex items-center gap-2 text-stitch-success font-bold text-sm bg-stitch-success/10 px-3 py-1 rounded-full">
                            <CheckCircle className="w-4 h-4" />
                            Responsive
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">System Status</span>
                          <span className="text-slate-900 dark:text-white font-bold text-sm">{stats.status}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">Version</span>
                          <span className="text-slate-900 dark:text-white font-bold text-sm">1.0.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Tab */}
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-stitch-card-dark rounded-2xl p-6 border border-slate-100 dark:border-stitch-card-border shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assessments</h3>
                  </div>
                  <AssessmentManagement />
                </div>

                <div className="bg-white dark:bg-stitch-card-dark rounded-2xl p-6 border border-slate-100 dark:border-stitch-card-border shadow-lg">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Batch Years</h3>
                    </div>
                    <span className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold border border-purple-200 dark:border-purple-800">
                      <Lock className="w-3 h-3" />
                      Super Admin Only
                    </span>
                  </div>
                  <BatchYearManagement />
                </div>

                <div onClick={() => navigate('/admin/bulk-combination')}
                  className="group bg-white dark:bg-stitch-card-dark rounded-2xl p-6 border border-slate-100 dark:border-stitch-card-border hover:border-stitch-success cursor-pointer shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-stitch-success flex items-center justify-center shadow-lg shadow-stitch-success/20 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bulk Combination Update</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Assign combinations via Excel upload</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-white font-bold bg-stitch-success px-4 py-2 rounded-lg text-sm group-hover:bg-emerald-600 transition-colors">
                        Open Tool
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <ResourceManagement />
            )}

            {/* Users & Access Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div onClick={() => navigate('/admin/users')}
                    className="group p-6 bg-white dark:bg-stitch-card-dark rounded-2xl border border-slate-100 dark:border-stitch-card-border hover:border-stitch-pink dark:hover:border-stitch-pink cursor-pointer shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stitch-pink to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Manage Users</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Control access and roles</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                      <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">Total Users</span>
                      <span className="font-bold text-slate-900 dark:text-white text-lg">{stats.usersCount}</span>
                    </div>
                  </div>

                  <div onClick={handleSyncUsers}
                    className="group p-6 bg-white dark:bg-stitch-card-dark rounded-2xl border border-slate-100 dark:border-stitch-card-border hover:border-stitch-blue dark:hover:border-stitch-blue cursor-pointer shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stitch-blue to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <RefreshCw className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sync Accounts</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Auto-create missing accounts</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                      Creates user accounts for students who don't have one
                    </p>
                  </div>
                </div>

                <div onClick={() => navigate('/missing-students')}
                  className="group bg-white dark:bg-stitch-card-dark rounded-2xl p-6 border border-slate-100 dark:border-stitch-card-border hover:border-orange-500 cursor-pointer shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Missing Students</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Identify data issues blocking access</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-white font-bold bg-orange-500 px-4 py-2 rounded-lg text-sm group-hover:bg-orange-600 transition-colors">
                        Check Now
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-stitch-card-dark rounded-2xl p-6 border border-slate-100 dark:border-stitch-card-border shadow-lg">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-slate-400" />
                    Permission Levels
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2 font-bold text-sm">S</div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Superadmin</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Full system access</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-2 font-bold text-sm">A</div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Admin</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Manage students & data</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-2 font-bold text-sm">U</div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">User</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">View own data only</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                {/* Danger Zone */}
                <div className="relative overflow-hidden bg-red-50 dark:bg-red-900/10 rounded-2xl p-8 border border-red-200 dark:border-red-900/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full opacity-5 -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-red-900 dark:text-red-200">Danger Zone</h3>
                        <p className="text-red-700 dark:text-red-400 font-medium text-sm">Irreversible actions - Use with extreme caution</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-red-100 dark:border-red-900/30">
                      <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">Reset All Student Data</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                        This will permanently delete all student records from the database. This action cannot be undone.
                      </p>
                      <button
                        onClick={handleResetData}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-5 h-5" />
                        Reset All Data
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Maintenance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-stitch-card-dark rounded-2xl p-6 border border-slate-100 dark:border-stitch-card-border shadow-lg">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Database className="w-5 h-5 text-stitch-blue" />
                      Database Maintenance
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => alert('Database backup feature coming soon! This will create a backup of your entire database.')}
                        className="w-full py-3 bg-stitch-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md"
                      >
                        Backup Database
                      </button>
                      <button
                        onClick={() => alert('Table optimization feature coming soon! This will optimize database tables for better performance.')}
                        className="w-full py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-white/10 transition-all"
                      >
                        Optimize Tables
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-stitch-card-dark rounded-2xl p-6 border border-slate-100 dark:border-stitch-card-border shadow-lg">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-stitch-pink" />
                      System Logs
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => alert('Activity logs viewer coming soon! This will display system activity and user actions.')}
                        className="w-full py-3 bg-stitch-pink hover:bg-pink-700 text-white font-bold rounded-xl transition-all shadow-md"
                      >
                        View Activity Logs
                      </button>
                      <button
                        onClick={() => alert('Log export feature coming soon! This will export system logs to a file.')}
                        className="w-full py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-white/10 transition-all"
                      >
                        Export Logs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .scrollbar-hide {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
    </div>
  )
}
