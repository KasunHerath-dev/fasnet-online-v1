import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { studentService, authService, systemService } from '../services/authService'
import { socketService } from '../services/socketService'
import OnlineUsersModal from '../components/OnlineUsersModal'
import Loader from '../components/Loader'
import {
    Users,
    UserPlus,
    Upload,
    Cake,
    List,
    Settings,
    Database,
    Activity,
    CheckCircle,
    ArrowUpRight,
    HardDrive,
    GraduationCap,
    Calendar,
    Shield,
    FileText,
    BarChart3,
    Globe
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

    const quickActions = [
        {
            icon: UserPlus,
            label: 'Add New Student',
            desc: 'Register a single student',
            color: 'from-blue-500 to-indigo-600',
            path: '/students/new'
        },
        {
            icon: Upload,
            label: 'Register Bulk',
            desc: 'Upload Excel/CSV file',
            color: 'from-purple-500 to-pink-600',
            path: '/register-students'
        },
        {
            icon: List,
            label: 'All Students',
            desc: 'View & manage students',
            color: 'from-emerald-500 to-teal-600',
            path: '/students'
        },
        {
            icon: Cake,
            label: 'View Birthdays',
            desc: 'Upcoming celebrations',
            color: 'from-orange-500 to-red-600',
            path: '/birthdays'
        }
    ]

    if (loading) {
        return <Loader />
    }

    return (
        <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="relative flex flex-col w-full min-h-screen">

                {/* Hero Section */}
                <div className="relative w-full h-[280px] bg-gradient-to-br from-stitch-blue via-[#6b13ec] to-stitch-pink overflow-hidden rounded-b-[2.5rem] shadow-2xl z-10">
                    {/* Abstract shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-stitch-blue opacity-20 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl"></div>

                    <div className="relative flex flex-col justify-end h-full px-6 pb-12 pt-12 z-10 max-w-7xl mx-auto w-full">
                        <div className="flex items-center justify-between mb-6">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-sm ${stats.status === 'Healthy' ? 'text-white' : 'text-red-200'}`}>
                                <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] ${stats.status === 'Healthy' ? 'bg-stitch-success' : 'bg-red-500'} animate-pulse`}></span>
                                {stats.status}
                            </span>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors backdrop-blur-sm">
                                    <Shield className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight mb-3 drop-shadow-sm">Dashboard</h1>
                        <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed max-w-xl">
                            Welcome to your student management system. System performance is optimal and all services are running smoothly.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto w-full px-4 md:px-6 z-20 -mt-8 space-y-8">

                    {/* Main Statistics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Students */}
                        <div onClick={() => navigate('/students')}
                            className="bg-white dark:bg-stitch-card-dark p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-stitch-card-border group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-stitch-blue/10 flex items-center justify-center text-stitch-blue group-hover:bg-stitch-blue group-hover:text-white transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-stitch-success bg-stitch-success/10 px-2 py-1 rounded-lg flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> Live
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Students</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.students.total}</p>
                            </div>
                        </div>

                        {/* Boys */}
                        <div className="bg-white dark:bg-stitch-card-dark p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-stitch-card-border group hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Boys</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.students.male}</p>
                            </div>
                        </div>

                        {/* Girls */}
                        <div className="bg-white dark:bg-stitch-card-dark p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-stitch-card-border group hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-stitch-pink/10 flex items-center justify-center text-stitch-pink group-hover:bg-stitch-pink group-hover:text-white transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Girls</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.students.female}</p>
                            </div>
                        </div>

                        {/* Birthdays */}
                        <div onClick={() => navigate('/birthdays')}
                            className="bg-white dark:bg-stitch-card-dark p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-stitch-card-border group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                    <Cake className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-lg">
                                    30 Days
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Upcoming Birthdays</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.students.birthdays}</p>
                            </div>
                        </div>
                    </div>

                    {/* System Health Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-stitch-blue" />
                                System Health
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Status Card */}
                            <div className="bg-white dark:bg-stitch-card-dark p-5 rounded-2xl border border-slate-100 dark:border-stitch-card-border relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
                                    <Activity className="w-24 h-24" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">System Status</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    {stats.status}
                                    <span className={`w-3 h-3 rounded-full ${stats.status === 'Healthy' ? 'bg-stitch-success' : 'bg-red-500'}`}></span>
                                </p>
                            </div>

                            {/* Online Users */}
                            <div onClick={() => setIsOnlineModalOpen(true)}
                                className="bg-white dark:bg-stitch-card-dark p-5 rounded-2xl border border-slate-100 dark:border-stitch-card-border relative overflow-hidden group cursor-pointer hover:border-stitch-blue/30 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
                                    <Globe className="w-24 h-24" />
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">Online Users</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{onlineUsers.count} Active</p>
                                    </div>
                                    <div className="animate-pulse">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stitch-blue opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-stitch-blue"></span>
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-stitch-blue w-2/5 rounded-full animate-pulse"></div>
                                </div>
                            </div>

                            {/* DB Size */}
                            <div className="bg-white dark:bg-stitch-card-dark p-5 rounded-2xl border border-slate-100 dark:border-stitch-card-border relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
                                    <Database className="w-24 h-24" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">Database Size</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.dbSize}</p>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-stitch-pink w-3/4 rounded-full"></div>
                                </div>
                            </div>

                            {/* Uptime */}
                            <div className="bg-white dark:bg-stitch-card-dark p-5 rounded-2xl border border-slate-100 dark:border-stitch-card-border relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
                                    <HardDrive className="w-24 h-24" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">System Uptime</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.uptime}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions & Guide Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                        {/* Quick Actions */}
                        <div className="lg:col-span-2">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <List className="w-5 h-5 text-stitch-blue" />
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => navigate('/students/new')}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-stitch-blue text-white shadow-lg shadow-stitch-blue/20 hover:bg-stitch-blue/90 transition-all active:scale-95 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold">Add Student</p>
                                        <p className="text-xs text-white/70">Single registration</p>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>

                                <button onClick={() => navigate('/register-students')}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-stitch-card-dark border border-slate-200 dark:border-stitch-card-border text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group">
                                    <div className="w-10 h-10 rounded-xl bg-stitch-pink/10 text-stitch-pink flex items-center justify-center">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold">Bulk Register</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Import Excel/CSV</p>
                                    </div>
                                </button>

                                <button onClick={() => navigate('/students')}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-stitch-card-dark border border-slate-200 dark:border-stitch-card-border text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold">All Students</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Manage records</p>
                                    </div>
                                </button>

                                <button onClick={() => navigate('/birthdays')}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-stitch-card-dark border border-slate-200 dark:border-stitch-card-border text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                                        <Cake className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold">Birthdays</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Upcoming events</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Getting Started / Info */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-stitch-blue" />
                                Getting Started
                            </h2>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-stitch-card-dark border border-slate-200 dark:border-stitch-card-border items-center hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-full bg-stitch-blue/10 flex items-center justify-center text-stitch-blue shrink-0">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adding Students</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add single or bulk students efficiently.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-stitch-card-dark border border-slate-200 dark:border-stitch-card-border items-center hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-full bg-stitch-pink/10 flex items-center justify-center text-stitch-pink shrink-0">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Managing Data</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Keep your database clean and organized.</p>
                                    </div>
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

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            `}</style>
        </div>
    )
}
