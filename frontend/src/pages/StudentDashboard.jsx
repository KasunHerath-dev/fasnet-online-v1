import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, academicService } from '../services/authService'
import { MODULE_DATA } from '../data/moduleList'
import {
    BookOpen,
    Clock,
    ChevronRight,
    TrendingUp,
    Calendar,
    Edit,
    FileText,
    Users,
    CheckCircle,
    Search,
    Award,
    Target,
    Layers,
    X,
    Filter
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

// --- Styled Components ---

const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-[#303030] ${className}`}>
        {children}
    </div>
)

const SectionTitle = ({ children, action }) => (
    <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{children}</h2>
        {action && (
            <button className="text-sm font-bold text-gray-400 hover:text-[#f3184c] transition-colors">
                {action}
            </button>
        )}
    </div>
)

const Tag = ({ label, onRemove }) => (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-300">
        {label}
        {onRemove && <button className="hover:text-red-500"><X className="w-3 h-3" /></button>}
    </div>
)

const DateStrip = () => {
    const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    // Mock dates for visual match
    const dates = [5, 5, 6, 7, 8, 9, 9]
    const activeIndex = 3 // Tuesday

    return (
        <div className="bg-[#1a1a1a] rounded-[2rem] p-6 text-white flex items-center justify-between">
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 rotate-180" /></button>
            <div className="flex-1 flex justify-between px-4 sm:px-8 overflow-x-auto scrollbar-hide gap-2">
                {days.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 min-w-[3rem]">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold ${i === activeIndex ? 'bg-[#f3184c] shadow-lg shadow-[#f3184c]/40' : 'bg-[#2a2a2a] text-gray-400'
                            }`}>
                            {dates[i]}
                        </div>
                        <span className={`text-xs font-medium ${i === activeIndex ? 'text-white' : 'text-gray-500'}`}>
                            {day}
                        </span>
                    </div>
                ))}
            </div>
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
    )
}

const TimelineItem = ({ time, title, type, active, icon: Icon, users }) => (
    <div className="relative pl-8 pb-8 last:pb-0">
        {/* Timeline Line */}
        <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-gray-100 dark:bg-[#303030]" />

        {/* Status Dot/Time */}
        <div className={`absolute left-0 top-0 px-3 py-1 rounded-full text-[10px] font-bold ${active ? 'bg-[#f3184c] text-white shadow-md shadow-[#f3184c]/30' : 'text-gray-400 bg-gray-100 dark:bg-[#2a2a2a]'
            }`}>
            {time}
        </div>

        {/* Content Card */}
        <div className={`ml-8 p-5 rounded-3xl transition-all ${active
            ? 'bg-[#1a1a1a] text-white shadow-xl'
            : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a] group'
            }`}>
            <div className="flex items-start gap-4">
                {active && users && (
                    <div className="flex -space-x-2">
                        {[1, 2].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-500 border-2 border-[#1a1a1a]" />
                        ))}
                    </div>
                )}
                <div>
                    <h4 className={`font-bold mb-1 ${active ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{title}</h4>
                    <span className={`text-xs ${active ? 'text-gray-400' : 'text-gray-500'}`}>{type}</span>
                </div>
            </div>
        </div>
    </div>
)

export default function StudentDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [stats, setStats] = useState({ gpa: 0, credits: 0 })

    // Initial Data Fetch
    useEffect(() => {
        const currentUser = authService.getUser()
        setUser(currentUser)
        if (currentUser?.studentRef) {
            setStats({
                gpa: currentUser.studentRef.cumulativeGPA || 0,
                credits: currentUser.studentRef.totalCreditsEarned || 0,
                level: currentUser.studentRef.level || 1
            })
        }
    }, [])

    const firstName = user?.studentRef?.firstName || user?.username || 'Student'
    const mockChartData = [
        { val: 2.5 }, { val: 2.8 }, { val: 3.2 }, { val: 3.0 }, { val: 3.5 }, { val: 3.8 }, { val: 3.9 }
    ]

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-black p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-[1600px] mx-auto space-y-6">

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">

                    {/* LEFT COLUMN (Wide) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Profile Section */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Profile Card */}
                            <Card className="flex flex-row items-center gap-6">
                                <div className="w-24 h-24 rounded-3xl bg-gray-200 overflow-hidden flex-shrink-0">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white">{firstName} {user?.studentRef?.lastName}</h2>
                                        <span className="bg-[#f3184c] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                            Student (L{stats.level})
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        <p>Credits: {stats.credits}</p>
                                        <p>GPA: {stats.gpa.toFixed(2)}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="mt-3 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#f3184c] transition-colors"
                                    >
                                        <Edit className="w-3 h-3" /> Edit info
                                    </button>
                                </div>
                            </Card>

                            {/* Date Strip */}
                            <div className="flex flex-col justify-center">
                                <DateStrip />
                            </div>
                        </div>

                        {/* Timetable Section */}
                        <Card>
                            <SectionTitle action="Add New">Timetable of classes</SectionTitle>
                            <div className="grid grid-cols-[auto_1fr] gap-x-8 px-4">
                                {/* Time Column Header */}
                                <div className="flex justify-between w-full max-w-md mb-8 text-xs font-bold text-gray-400 border-b border-gray-100 dark:border-[#303030] pb-2 pl-12 gap-12">
                                    <span>Today</span>
                                    <span>Tomorrow</span>
                                    <span>Next Week</span>
                                </div>
                                <div /> {/* spacer */}

                                {/* Timeline */}
                                <div className="col-span-2 mt-4 space-y-2">
                                    <TimelineItem
                                        time="10 am"
                                        title="Practical group work"
                                        type="Mathematical Analysis"
                                        active={true}
                                        users={true}
                                    />
                                    <TimelineItem
                                        time="1 pm"
                                        title="Lecture: Investing in unicorn companies"
                                        type="Finance & Equity"
                                    />
                                    <TimelineItem
                                        time="3 pm"
                                        title="Meet with Academic Advisor"
                                        type="Personal Development"
                                        users={true}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN (Narrow) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Search / Tags */}
                        <Card>
                            <SectionTitle action="View all">Profiling subjects</SectionTitle>
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Find subjects..."
                                    className="w-full bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl pl-10 pr-4 py-3 text-sm font-bold placeholder:text-gray-400 outline-none"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Tag label="Analysis" onRemove={() => { }} />
                                <Tag label="Geometry" onRemove={() => { }} />
                                <Tag label="Python" onRemove={() => { }} />
                                <Tag label="Management" onRemove={() => { }} />
                            </div>
                        </Card>

                        {/* Premium / Degree Progress */}
                        <div className="bg-[#1a1a1a] rounded-[2rem] p-8 text-center text-white relative overflow-hidden group hover:shadow-2xl transition-all cursor-pointer" onClick={() => navigate('/academic')}>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                                    <Award className="w-8 h-8 text-[#1a1a1a]" />
                                </div>
                                <h3 className="text-xl font-black mb-2">Academic Progress</h3>
                                <p className="text-sm text-gray-400 mb-6">Track your degree completion and future milestones</p>
                                <button className="bg-white text-black font-bold px-6 py-3 rounded-xl w-full hover:bg-gray-200 transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>

                        {/* Statistic Info */}
                        <Card>
                            <SectionTitle action="View all">Statistic info</SectionTitle>
                            <div className="flex gap-4 mb-6">
                                <div className="bg-[#1a1a1a] rounded-3xl p-5 text-white flex-1">
                                    <p className="text-xs font-medium text-gray-400 mb-1">Total Credits</p>
                                    <h3 className="text-3xl font-black">{stats.credits}</h3>
                                    <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-gray-400">
                                        details <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-3xl p-5 flex-1">
                                    <p className="text-xs font-medium text-gray-500">Current GPA</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.gpa.toFixed(2)}</h3>
                                    <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-gray-400">
                                        details <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>

                            {/* Simple Chart */}
                            <div className="h-40 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockChartData}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f3184c" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#f3184c" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip cursor={false} content={<></>} />
                                        <Area type="monotone" dataKey="val" stroke="#f3184c" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                    </div>
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

function ArrowRight({ className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
