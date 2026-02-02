import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, academicService } from '../services/authService'
import { MODULE_DATA } from '../data/moduleList'
import {
    Home,
    BookOpen,
    Award,
    Target,
    Clock,
    ChevronRight,
    TrendingUp,
    Calendar,
    Edit,
    ArrowRight,
    Layers
} from 'lucide-react'

// Tab Button Component
const TabButton = ({ active, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all
            ${active
                ? 'bg-[#f3184c] text-white shadow-lg shadow-[#f3184c]/30'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#303030]'
            }
        `}
    >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
    </button>
)

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, color = '#f3184c' }) => (
    <div className="bg-white dark:bg-[#303030] rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-[#303030] hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
            </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</div>
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</div>
    </div>
)

// Event Card Component
const EventCard = ({ title, date, time, type }) => (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-[#1e1e1e] rounded-xl hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors group cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-[#303030]">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#f3184c] flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">{title}</h4>
            <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{date} • {time}</span>
            </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#f3184c] transition-colors flex-shrink-0" />
    </div>
)

// Subject Card Component
const SubjectCard = ({ title, code, credits, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white dark:bg-[#303030] rounded-xl p-4 border border-gray-100 dark:border-[#303030] hover:border-[#f3184c] hover:shadow-md transition-all cursor-pointer group"
    >
        <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-lg group-hover:bg-[#f3184c]/10 transition-colors">
                <BookOpen className="w-5 h-5 text-[#f3184c]" />
            </div>
            <span className="text-xs font-bold text-gray-400">{credits} Credits</span>
        </div>
        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{title}</h4>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{code}</span>
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
            const combination = studentRef.combination || 'CS'

            // Get modules for student's level and combination
            const myModules = MODULE_DATA.filter(m =>
                m.level === currentLevel &&
                (m.combination === combination || m.combination === 'All')
            )
            setModules(myModules)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Real data from user
    const gpa = user?.studentRef?.cumulativeGPA || 0
    const credits = user?.studentRef?.totalCreditsEarned || 0
    const level = user?.studentRef?.level || 1
    const combination = user?.studentRef?.combination || 'N/A'
    const firstName = user?.studentRef?.firstName || user?.username || 'Student'

    // Sample upcoming events (would come from API in real app)
    const upcomingEvents = [
        { title: 'Mathematical Analysis Exam', date: 'Feb 15', time: '9:00 AM', type: 'exam' },
        { title: 'Project Submission Deadline', date: 'Feb 18', time: '11:59 PM', type: 'deadline' },
        { title: 'Guest Lecture - AI Trends', date: 'Feb 20', time: '2:00 PM', type: 'event' }
    ]

    return (
        <div className="min-h-screen bg-[#f6f6f6] dark:bg-black p-3 sm:p-4 md:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
                            Welcome back, {firstName}! 👋
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                            Here's your academic overview
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="px-4 py-2 bg-[#f3184c] text-white rounded-xl font-bold text-sm hover:bg-[#d01440] transition-colors flex items-center gap-2 justify-center sm:justify-start"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    <TabButton active={activeTab === 'overview'} icon={Home} label="Overview" onClick={() => setActiveTab('overview')} />
                    <TabButton active={activeTab === 'academic'} icon={BookOpen} label="Academic" onClick={() => setActiveTab('academic')} />
                </div>

                {/* Tab Content */}
                <div className="animate-fadeIn">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4 sm:space-y-6">

                            {/* Quick Stats - 4 Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <StatCard
                                    icon={Award}
                                    value={gpa > 0 ? gpa.toFixed(2) : 'N/A'}
                                    label="Current GPA"
                                    color="#f3184c"
                                />
                                <StatCard
                                    icon={Target}
                                    value={credits}
                                    label="Credits Earned"
                                    color="#10b981"
                                />
                                <StatCard
                                    icon={Layers}
                                    value={`Level ${level}`}
                                    label="Current Level"
                                    color="#3b82f6"
                                />
                                <StatCard
                                    icon={BookOpen}
                                    value={modules.length}
                                    label="Active Modules"
                                    color="#f59e0b"
                                />
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">

                                {/* Upcoming Events */}
                                <div className="lg:col-span-2 bg-white dark:bg-[#303030] rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-[#303030]">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">Upcoming Events</h2>
                                        <button className="text-xs font-bold text-[#f3184c] hover:text-[#d01440] transition-colors">
                                            View All
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {upcomingEvents.map((event, idx) => (
                                            <EventCard key={idx} {...event} />
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Quick Actions + Progress */}
                                <div className="space-y-4">

                                    {/* Quick Actions */}
                                    <div className="bg-gradient-to-br from-[#f3184c] to-[#d01440] rounded-2xl p-4 sm:p-6 text-white">
                                        <h3 className="text-base sm:text-lg font-black mb-4">Quick Actions</h3>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => navigate('/academic')}
                                                className="w-full text-left px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors font-bold text-sm flex items-center justify-between group"
                                            >
                                                <span>📊 View Results</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            <button
                                                onClick={() => navigate('/resources')}
                                                className="w-full text-left px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors font-bold text-sm flex items-center justify-between group"
                                            >
                                                <span>📚 Study Materials</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            <button
                                                onClick={() => navigate('/analytics')}
                                                className="w-full text-left px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors font-bold text-sm flex items-center justify-between group"
                                            >
                                                <span>📈 Analytics</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Degree Progress */}
                                    <div className="bg-white dark:bg-[#303030] rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-[#303030]">
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Degree Progress</h3>
                                        <div className="text-center mb-4">
                                            <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                                                {Math.round((credits / 120) * 100)}%
                                            </div>
                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                                                {credits} / 120 Credits
                                            </div>
                                        </div>
                                        <div className="w-full h-3 bg-gray-200 dark:bg-[#1e1e1e] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#f3184c] to-[#d01440] transition-all duration-500"
                                                style={{ width: `${Math.min((credits / 120) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACADEMIC TAB */}
                    {activeTab === 'academic' && (
                        <div className="space-y-4 sm:space-y-6">

                            {/* My Subjects */}
                            <div className="bg-white dark:bg-[#303030] rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-[#303030]">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">My Subjects</h2>
                                    <span className="text-xs font-bold text-gray-400">
                                        Level {level} • {combination}
                                    </span>
                                </div>

                                {modules.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                        {modules.map((module, idx) => (
                                            <SubjectCard
                                                key={idx}
                                                title={module.title}
                                                code={module.code}
                                                credits={module.credits}
                                                onClick={() => navigate('/resources')}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            No subjects found for your level
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Performance Summary */}
                            <div className="bg-white dark:bg-[#303030] rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-[#303030]">
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6">Performance Summary</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                                        <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                                        <div className="text-xs font-bold text-gray-600 dark:text-gray-400">Top Performer</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <div className="text-3xl sm:text-4xl mb-2">⭐</div>
                                        <div className="text-xs font-bold text-gray-600 dark:text-gray-400">Consistent</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                        <div className="text-3xl sm:text-4xl mb-2">📚</div>
                                        <div className="text-xs font-bold text-gray-600 dark:text-gray-400">Active Learner</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                        <div className="text-3xl sm:text-4xl mb-2">🎯</div>
                                        <div className="text-xs font-bold text-gray-600 dark:text-gray-400">Goal Oriented</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}
