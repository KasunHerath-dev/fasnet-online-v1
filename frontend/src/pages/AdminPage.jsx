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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-2 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black text-white">Admin Settings</h1>
                <p className="text-xs md:text-base text-gray-300 font-medium">System configuration and management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Interface */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b-2 border-gray-100 bg-gray-50">
            <div className="flex overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 font-bold text-xs md:text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                      ? 'text-indigo-600 border-b-3 md:border-b-4 border-indigo-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-8">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6 md:space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">General Settings</h2>
                  <p className="text-sm md:text-base text-gray-600">Configure basic system settings and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      Quick Actions
                    </h3>

                    <div
                      onClick={handleChangePassword}
                      className="group p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 cursor-pointer transition-all hover:shadow-lg mb-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-indigo-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                          <Shield className="w-6 h-6" />
                        </div>
                        <Key className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg">Change My Password</h4>
                      <p className="text-sm text-gray-600 mt-1">Update your own account security</p>
                    </div>

                    <div
                      onClick={() => navigate('/students/new')}
                      className="group p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 hover:border-blue-300 cursor-pointer transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg">Add New Student</h4>
                      <p className="text-sm text-gray-600 mt-1">Register a new student manually</p>
                    </div>

                    <div
                      onClick={() => navigate('/profile-requests')}
                      className="group p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 hover:border-purple-300 cursor-pointer transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-purple-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg">Profile Requests</h4>
                      <p className="text-sm text-gray-600 mt-1">Review pending profile changes</p>
                    </div>

                    <div
                      onClick={() => navigate('/register-students')}
                      className="group p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 hover:border-purple-300 cursor-pointer transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Database className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Bulk Import</h4>
                          <p className="text-sm text-gray-600">Upload CSV/Excel student data</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      System Information
                    </h3>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-100">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Database Status</span>
                          <span className="flex items-center gap-2 text-emerald-600 font-bold">
                            <CheckCircle className="w-4 h-4" />
                            Online
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">API Status</span>
                          <span className="flex items-center gap-2 text-emerald-600 font-bold">
                            <CheckCircle className="w-4 h-4" />
                            Responsive
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">System Status</span>
                          <span className="text-gray-900 font-bold">{stats.status}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Version</span>
                          <span className="text-gray-900 font-bold">1.0.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Tab */}
            {activeTab === 'academic' && (
              <div className="space-y-6 md:space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Academic Configuration</h2>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 md:p-6 border-2 border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Assessments</h3>
                    </div>
                    <AssessmentManagement />
                  </div>

                  {/* Batch Year Management */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6 border-2 border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">Batch Years</h3>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                        <Lock className="w-3 h-3" />
                        Super Admin Only
                      </div>
                    </div>
                    <BatchYearManagement />
                  </div>



                  {/* Bulk Combination Update */}
                  <div
                    onClick={() => navigate('/admin/bulk-combination')}
                    className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-100 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Bulk Combination Update</h3>
                        <p className="text-gray-600">Assign subject combinations to students via Excel upload</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-emerald-700 font-bold bg-white px-4 py-2 rounded-lg shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          Open Tool
                        </span>
                      </div>
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
              <div className="space-y-6 md:space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Users & Access Control</h2>
                  <p className="text-sm md:text-base text-gray-600">Manage user accounts, roles, and permissions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div
                    onClick={() => navigate('/admin/users')}
                    className="group p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-100 hover:border-pink-300 cursor-pointer transition-all hover:shadow-xl"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Manage Users</h3>
                        <p className="text-sm text-gray-600">Control access and roles</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Users</span>
                      <span className="font-bold text-gray-900 text-lg">{stats.usersCount}</span>
                    </div>
                  </div>

                  <div
                    onClick={handleSyncUsers}
                    className="group p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 cursor-pointer transition-all hover:shadow-xl"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <RefreshCw className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Sync Accounts</h3>
                        <p className="text-sm text-gray-600">Auto-create missing user accounts</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Creates user accounts for students who don't have one
                    </p>
                  </div>
                </div>

                {/* Missing Students */}
                <div
                  onClick={() => navigate('/missing-students')}
                  className="group bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-100 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Missing Students</h3>
                      <p className="text-gray-600">Identify students with missing data or registration issues which block access</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-orange-700 font-bold bg-white px-4 py-2 rounded-lg shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        Check Now
                      </span>
                    </div>
                  </div>
                </div>

                {/* Permissions Info */}
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-700" />
                    Permission Levels
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2 font-bold">
                        S
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">Superadmin</h4>
                      <p className="text-xs text-gray-600">Full system access</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-2 font-bold">
                        A
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">Admin</h4>
                      <p className="text-xs text-gray-600">Manage students & data</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-2 font-bold">
                        U
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">User</h4>
                      <p className="text-xs text-gray-600">View own data only</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6 md:space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">System Management</h2>
                  <p className="text-sm md:text-base text-gray-600">Advanced system configuration and maintenance</p>
                </div>

                {/* Danger Zone */}
                <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-200">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full opacity-20 -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-red-900">Danger Zone</h3>
                        <p className="text-red-700 font-medium">Irreversible actions - Use with extreme caution</p>
                      </div>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border-2 border-red-200">
                      <h4 className="font-bold text-gray-900 mb-2">Reset All Student Data</h4>
                      <p className="text-sm text-gray-700 mb-4">
                        This will permanently delete all student records from the database. This action cannot be undone.
                      </p>
                      <button
                        onClick={handleResetData}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-5 h-5" />
                        Reset All Data
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Maintenance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      Database Maintenance
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => alert('Database backup feature coming soon! This will create a backup of your entire database.')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                      >
                        Backup Database
                      </button>
                      <button
                        onClick={() => alert('Table optimization feature coming soon! This will optimize database tables for better performance.')}
                        className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 transition-all"
                      >
                        Optimize Tables
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      System Logs
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => alert('Activity logs viewer coming soon! This will display system activity and user actions.')}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
                      >
                        View Activity Logs
                      </button>
                      <button
                        onClick={() => alert('Log export feature coming soon! This will export system logs to a file.')}
                        className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 transition-all"
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
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
