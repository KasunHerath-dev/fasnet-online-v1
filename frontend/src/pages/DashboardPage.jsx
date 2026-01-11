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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">

                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <div className="hidden md:block absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                    <div className="hidden md:block absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -ml-40 -mb-40"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-2">Dashboard</h1>
                                <p className="text-blue-200 text-sm md:text-lg font-medium">Welcome to your student management system</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-2xl border border-white/20 self-start md:self-auto">
                                <div className={`w-3 h-3 rounded-full ${stats.status === 'Healthy' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                                <span className="text-white font-semibold text-sm md:text-base">{stats.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Students */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-xl transition-shadow cursor-pointer"
                        onClick={() => navigate('/students')}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Students</p>
                        <p className="text-4xl font-black text-gray-900 mt-1">{stats.students.total}</p>
                    </div>

                    {/* Boys */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-cyan-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Boys</p>
                        <p className="text-4xl font-black text-gray-900 mt-1">{stats.students.male}</p>
                    </div>

                    {/* Girls */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Girls</p>
                        <p className="text-4xl font-black text-gray-900 mt-1">{stats.students.female}</p>
                    </div>

                    {/* Upcoming Birthdays */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow cursor-pointer"
                        onClick={() => navigate('/birthdays')}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Cake className="w-7 h-7 text-white" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Birthdays (30 Days)</p>
                        <p className="text-4xl font-black text-gray-900 mt-1">{stats.students.birthdays}</p>
                    </div>
                </div>

                {/* System Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* System Status */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center gap-4">
                            <CheckCircle className="w-8 h-8" />
                            <div>
                                <p className="text-sm font-medium text-emerald-100">System Status</p>
                                <p className="text-2xl font-black">{stats.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Online Users */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg text-white cursor-pointer"
                        onClick={() => setIsOnlineModalOpen(true)}>
                        <div className="flex items-center gap-4">
                            <Globe className="w-8 h-8" />
                            <div>
                                <p className="text-sm font-medium text-blue-100">Online Users</p>
                                <p className="text-2xl font-black">{onlineUsers.count} <span className="text-sm font-normal">Live</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Database Size */}
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center gap-4">
                            <HardDrive className="w-8 h-8" />
                            <div>
                                <p className="text-sm font-medium text-purple-100">Database Size</p>
                                <p className="text-2xl font-black">{stats.dbSize}</p>
                            </div>
                        </div>
                    </div>

                    {/* Uptime */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center gap-4">
                            <Activity className="w-8 h-8" />
                            <div>
                                <p className="text-sm font-medium text-orange-100">System Uptime</p>
                                <p className="text-2xl font-black">{stats.uptime}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900">Quick Actions</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, idx) => (
                            <Link
                                key={idx}
                                to={action.path}
                                className="group relative bg-gradient-to-br from-gray-50 to-white p-5 md:p-6 rounded-2xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <action.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{action.label}</h3>
                                <p className="text-sm text-gray-600">{action.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Getting Started Guide */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-200">
                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <FileText className="w-7 h-7 text-blue-600" />
                        Getting Started
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-xl border border-blue-200">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl mb-3">
                                1
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Add Students</h4>
                            <p className="text-sm text-gray-600">Add students one by one or import from Excel</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-blue-200">
                            <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-xl mb-3">
                                2
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Manage Data</h4>
                            <p className="text-sm text-gray-600">Edit, update, or delete student records as needed</p>
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
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    )
}
