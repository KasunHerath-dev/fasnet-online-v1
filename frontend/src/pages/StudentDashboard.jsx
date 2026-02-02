import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, academicService } from '../services/authService'
import { MODULE_DATA } from '../data/moduleList'
import {
    Home,
    Calendar,
    TrendingUp,
    BookOpen,
    Award,
    Target,
    Clock,
    ChevronRight,
    Zap,
    FileText,
    Video,
    Download,
    Star,
    Trophy,
    Activity
} from 'lucide-react'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'

// Tab Navigation Component
const TabButton = ({ active, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all
            ${active
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
        `}
    >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
    </button>
)

// Quick Stat Card
const StatCard = ({ icon: Icon, value, label, color = 'blue', trend }) => {
    const colors = {
        blue: 'from-blue-500 to-indigo-500',
        green: 'from-emerald-500 to-teal-500',
        purple: 'from-purple-500 to-pink-500',
        orange: 'from-orange-500 to-red-500'
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</div>
        </div>
    )
}

// Event Card
const EventCard = ({ title, date, time, type, icon }) => (
    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group cursor-pointer">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-rose-500 transition-colors">{title}</h4>
            <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{date} • {time}</span>
            </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
    </div>
)

// Resource Card
const ResourceCard = ({ title, type, icon, count }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20 transition-colors">
                {icon}
            </div>
            <span className="text-xs font-bold text-slate-400">{count}</span>
        </div>
        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 truncate">{title}</h4>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{type}</span>
    </div>
)

export default function StudentDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [user, setUser] = useState(null)
    const [modules, setModules] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const currentUser = authService.getUser()
        setUser(currentUser)

        if (currentUser?.studentRef) {
            fetchData(currentUser.studentRef)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchData = async (studentRef) => {
        try {
            const currentLevel = studentRef.level || 1
            const myModules = MODULE_DATA.filter(m => m.level === currentLevel).slice(0, 8)
            setModules(myModules)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Sample data for charts
    const gpaData = [
        { month: 'Jan', gpa: 2.8 },
        { month: 'Feb', gpa: 3.0 },
        { month: 'Mar', gpa: 3.2 },
        { month: 'Apr', gpa: 3.1 },
        { month: 'May', gpa: 3.4 },
        { month: 'Jun', gpa: 3.5 }
    ]

    const gradeDistribution = [
        { grade: 'A', count: 5 },
        { grade: 'B', count: 8 },
        { grade: 'C', count: 3 },
        { grade: 'D', count: 1 }
    ]

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

    const upcomingEvents = [
        { title: 'Mathematical Analysis Exam', date: 'Feb 15', time: '9:00 AM', type: 'exam', icon: '📝' },
        { title: 'Project Submission', date: 'Feb 18', time: '11:59 PM', type: 'deadline', icon: '📋' },
        { title: 'Guest Lecture', date: 'Feb 20', time: '2:00 PM', type: 'event', icon: '🎓' }
    ]

    const gpa = user?.studentRef?.cumulativeGPA || 0
    const credits = user?.studentRef?.totalCreditsEarned || 0
    const level = user?.studentRef?.level || 1

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            Welcome back, {user?.studentRef?.firstName || user?.username || 'Student'}! 👋
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Here's what's happening with your studies
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                    >
                        View Profile
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    <TabButton active={activeTab === 'overview'} icon={Home} label="Overview" onClick={() => setActiveTab('overview')} />
                    <TabButton active={activeTab === 'schedule'} icon={Calendar} label="Schedule" onClick={() => setActiveTab('schedule')} />
                    <TabButton active={activeTab === 'performance'} icon={TrendingUp} label="Performance" onClick={() => setActiveTab('performance')} />
                    <TabButton active={activeTab === 'resources'} icon={BookOpen} label="Resources" onClick={() => setActiveTab('resources')} />
                </div>

                {/* Tab Content */}
                <div className="animate-fadeIn">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard icon={Award} value={gpa > 0 ? gpa.toFixed(2) : 'N/A'} label="Current GPA" color="blue" trend="+0.2" />
                                <StatCard icon={Target} value={credits} label="Credits Earned" color="green" />
                                <StatCard icon={Trophy} value={`Level ${level}`} label="Current Level" color="purple" />
                                <StatCard icon={Activity} value="Regular" label="Status" color="orange" />
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid lg:grid-cols-3 gap-6">

                                {/* Upcoming Events */}
                                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Upcoming</h2>
                                        <button className="text-xs font-bold text-rose-500 hover:text-rose-600">View All</button>
                                    </div>
                                    <div className="space-y-3">
                                        {upcomingEvents.map((event, idx) => (
                                            <EventCard key={idx} {...event} />
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl p-6 text-white">
                                        <Zap className="w-8 h-8 mb-4" />
                                        <h3 className="text-lg font-black mb-2">Quick Actions</h3>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => navigate('/academic')}
                                                className="w-full text-left px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors font-bold text-sm"
                                            >
                                                📊 View Results
                                            </button>
                                            <button
                                                onClick={() => navigate('/resources')}
                                                className="w-full text-left px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors font-bold text-sm"
                                            >
                                                📚 Study Materials
                                            </button>
                                            <button
                                                onClick={() => navigate('/analytics')}
                                                className="w-full text-left px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors font-bold text-sm"
                                            >
                                                📈 Analytics
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Widget */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Degree Progress</h3>
                                        <div className="text-center mb-4">
                                            <div className="text-4xl font-black text-slate-900 dark:text-white">{Math.round((credits / 120) * 100)}%</div>
                                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{credits} / 120 Credits</div>
                                        </div>
                                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                                style={{ width: `${(credits / 120) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SCHEDULE TAB */}
                    {activeTab === 'schedule' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">This Week</h2>

                                {/* Week Days */}
                                <div className="grid grid-cols-7 gap-2 mb-6">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                                        <div
                                            key={day}
                                            className={`text-center p-4 rounded-xl transition-all cursor-pointer ${idx === 2
                                                    ? 'bg-rose-500 text-white shadow-lg'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <div className="text-xs font-bold mb-1">{day}</div>
                                            <div className="text-2xl font-black">{19 + idx}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Timeline */}
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="text-sm font-bold text-slate-400 w-20">9:00 AM</div>
                                        <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-xl p-4">
                                            <h4 className="font-bold text-slate-900 dark:text-white">Mathematical Analysis</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Main Hall • Dr. Smith</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-sm font-bold text-slate-400 w-20">11:00 AM</div>
                                        <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-xl p-4">
                                            <h4 className="font-bold text-slate-900 dark:text-white">Data Structures</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lab 3 • Prof. Johnson</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-sm font-bold text-slate-400 w-20">2:00 PM</div>
                                        <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-xl p-4">
                                            <h4 className="font-bold text-slate-900 dark:text-white">Database Systems</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Room 205 • Dr. Williams</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PERFORMANCE TAB */}
                    {activeTab === 'performance' && (
                        <div className="space-y-6">
                            <div className="grid lg:grid-cols-2 gap-6">

                                {/* GPA Trend */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">GPA Trend</h2>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={gpaData}>
                                            <defs>
                                                <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} domain={[0, 4]} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            <Area type="monotone" dataKey="gpa" stroke="#f43f5e" strokeWidth={3} fill="url(#gpaGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Grade Distribution */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Grade Distribution</h2>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={gradeDistribution}>
                                            <XAxis dataKey="grade" stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                                {gradeDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Achievements</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                                        <div className="text-4xl mb-2">🏆</div>
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400">Dean's List</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                                        <div className="text-4xl mb-2">⭐</div>
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400">Perfect Attendance</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                        <div className="text-4xl mb-2">📚</div>
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400">Top Performer</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                                        <div className="text-4xl mb-2">🎯</div>
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400">All Tasks Done</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RESOURCES TAB */}
                    {activeTab === 'resources' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">My Subjects</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {modules.slice(0, 8).map((module, idx) => (
                                        <ResourceCard
                                            key={idx}
                                            title={module.title}
                                            type={module.department}
                                            icon={<FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                                            count={`${module.credits} Credits`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Resource Types */}
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform">
                                    <Video className="w-8 h-8 mb-3" />
                                    <h3 className="text-2xl font-black mb-1">24</h3>
                                    <p className="text-sm font-bold text-blue-100">Video Lectures</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform">
                                    <FileText className="w-8 h-8 mb-3" />
                                    <h3 className="text-2xl font-black mb-1">48</h3>
                                    <p className="text-sm font-bold text-purple-100">Documents</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform">
                                    <Download className="w-8 h-8 mb-3" />
                                    <h3 className="text-2xl font-black mb-1">12</h3>
                                    <p className="text-sm font-bold text-emerald-100">Assignments</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
