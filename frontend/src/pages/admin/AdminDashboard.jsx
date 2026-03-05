import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentService, authService, systemService } from '../../services/authService'
import { socketService } from '../../services/socketService'
import OnlineUsersModal from '../../components/admin/OnlineUsersModal'
import Loader from '../../components/Loader'
import {
    Users,
    UserPlus,
    Upload,
    Cake,
    List,
    Database,
    Activity,
    ArrowUpRight,
    HardDrive,
    GraduationCap,
    Shield,
    FileText,
    Globe,
    Sparkles,
    Zap,
    TrendingUp,
    Clock,
    CheckCircle
} from 'lucide-react'

export default function DashboardPage() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        usersCount: 0,
        status: 'Loading...',
        dbSize: '0 MB',
        uptime: '0m',
        students: {
            total: 0,
            male: 0,
            female: 0,
            birthdays: 0
        }
    })
    const [onlineUsers, setOnlineUsers] = useState({ count: 0, users: [] })
    const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
        fetchOnlineUsers()

        // Refresh stats every 30 seconds
        const interval = setInterval(() => {
            fetchStats()
            fetchOnlineUsers()
        }, 30000)

        // Socket listeners for online users
        socketService.on('user:online', fetchOnlineUsers)
        socketService.on('user:offline', fetchOnlineUsers)

        return () => {
            clearInterval(interval)
            socketService.off('user:online', fetchOnlineUsers)
            socketService.off('user:offline', fetchOnlineUsers)
        }
    }, [])

    const fetchOnlineUsers = async () => {
        try {
            const response = await authService.getOnlineUsers()
            if (response.data) {
                setOnlineUsers(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch online users', error)
        }
    }

    const fetchStats = async () => {
        try {
            const res = await systemService.getStats()
            setStats(res.data)
            setLoading(false)
        } catch (err) {
            console.error('Failed to fetch stats:', err)
            setStats(prev => ({ ...prev, status: 'Error' }))
            setLoading(false)
        }
    }

    if (loading) {
        return <Loader />
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c14] font-display text-slate-900 dark:text-white transition-colors duration-300">

            {/* Hero Section - Violet/Blue Admin Theme */}
            <div className="relative w-full overflow-hidden bg-gradient-to-br from-violet-950 via-violet-900 to-blue-900">
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='white' stroke-opacity='.12' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}></div>

                {/* Floating orbs */}
                <div className="absolute top-0 right-0 w-80 h-80 lg:w-96 lg:h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', opacity: 0.15 }}></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 lg:w-80 lg:h-80 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', opacity: 0.1, animationDelay: '1s' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                        {/* Left - Title & Status */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
                                    <span className={`w-2 h-2 rounded-full ${stats.status === 'Healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                    <span className="text-white text-xs sm:text-sm font-bold">{stats.status}</span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
                                    <Users className="w-3.5 h-3.5 text-white" />
                                    <span className="text-white text-xs sm:text-sm font-bold">{stats.usersCount} Users</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-none tracking-tight">
                                    Dashboard
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg text-white/70 font-medium max-w-2xl leading-relaxed">
                                    Complete student management and system analytics
                                </p>
                            </div>
                        </div>

                        {/* Right - Quick Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
                            <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    <span className="text-white/70 text-xs font-medium">Students</span>
                                </div>
                                <p className="text-2xl sm:text-3xl font-black text-white">{stats.students.total}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    <span className="text-white/70 text-xs font-medium">Online</span>
                                </div>
                                <p className="text-2xl sm:text-3xl font-black text-white">{onlineUsers.count}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 shadow-xl col-span-2 sm:col-span-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    <span className="text-white/70 text-xs font-medium">Birthdays</span>
                                </div>
                                <p className="text-2xl sm:text-3xl font-black text-white">{stats.students.birthdays}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Student Statistics - Ash Theme */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">Student Overview</h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Live student statistics</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* Total Students */}
                        <div onClick={() => navigate('/students')} className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 dark:hover:border-white/30">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 dark:bg-white/5 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900 dark:text-white" />
                                    <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3" /> Live
                                    </span>
                                </div>
                                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">{stats.students.total}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Total Students</p>
                            </div>
                        </div>

                        {/* Boys */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 dark:hover:border-white/30">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 dark:bg-white/5 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900 dark:text-white" />
                                </div>
                                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">{stats.students.male}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Boys</p>
                            </div>
                        </div>

                        {/* Girls */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 dark:hover:border-white/30">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 dark:bg-white/5 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900 dark:text-white" />
                                </div>
                                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">{stats.students.female}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Girls</p>
                            </div>
                        </div>

                        {/* Birthdays */}
                        <div onClick={() => navigate('/birthdays')} className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 dark:hover:border-white/30">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 dark:bg-white/5 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <Cake className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900 dark:text-white" />
                                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">30 Days</span>
                                </div>
                                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">{stats.students.birthdays}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Upcoming</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">System Health</h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Real-time monitoring</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* System Status */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className={`w-5 h-5 ${stats.status === 'Healthy' ? 'text-green-500' : 'text-red-500'}`} />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.status}</p>
                        </div>

                        {/* Online Users */}
                        <div onClick={() => setIsOnlineModalOpen(true)} className="cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:border-slate-400 dark:hover:border-white/30 transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="flex items-center gap-2 mb-3">
                                <Globe className="w-5 h-5 text-slate-600 dark:text-white" />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Online Now</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{onlineUsers.count}</p>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                            </div>
                        </div>

                        {/* Database Size */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Database className="w-5 h-5 text-slate-600 dark:text-white" />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Database</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.dbSize}</p>
                        </div>

                        {/* Uptime */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-5 h-5 text-slate-600 dark:text-white" />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Uptime</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.uptime}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">Quick Actions</h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Common operations</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* Add Student */}
                        <button onClick={() => navigate('/students/new')} className="group relative overflow-hidden bg-white dark:bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-white/8 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left">
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent)' }}></div>
                            <div className="relative">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                                    <UserPlus className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">Add Student</h3>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">Register single student</p>
                                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm group-hover:gap-3 transition-all" style={{ color: '#7c3aed' }}>
                                    <span>Create</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </button>

                        {/* Bulk Register */}
                        <button onClick={() => navigate('/register-students')} className="group relative overflow-hidden bg-white dark:bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-white/8 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left">
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent)' }}></div>
                            <div className="relative">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">Bulk Register</h3>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">Upload Excel/CSV file</p>
                                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm group-hover:gap-3 transition-all" style={{ color: '#7c3aed' }}>
                                    <span>Import</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </button>

                        {/* All Students */}
                        <button onClick={() => navigate('/students')} className="group relative overflow-hidden bg-white dark:bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-white/8 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left">
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent)' }}></div>
                            <div className="relative">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                                    <List className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">All Students</h3>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">View & manage records</p>
                                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm group-hover:gap-3 transition-all" style={{ color: '#7c3aed' }}>
                                    <span>Browse</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </button>

                        {/* Birthdays */}
                        <button onClick={() => navigate('/birthdays')} className="group relative overflow-hidden bg-white dark:bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-white/8 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left">
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent)' }}></div>
                            <div className="relative">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                                    <Cake className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">Birthdays</h3>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">Upcoming celebrations</p>
                                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm group-hover:gap-3 transition-all" style={{ color: '#7c3aed' }}>
                                    <span>View</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Getting Started */}
                <div className="pb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">Getting Started</h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Quick guide to common tasks</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <UserPlus className="w-6 h-6 text-slate-900 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Adding Students</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Register students individually or import bulk data via Excel/CSV files</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-6 h-6 text-slate-900 dark:text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Managing Data</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Keep your database clean, organized, and up-to-date with powerful tools</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <OnlineUsersModal
                isOpen={isOnlineModalOpen}
                onClose={() => setIsOnlineModalOpen(false)}
                users={onlineUsers.users}
            />
        </div>
    )
}

