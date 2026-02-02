import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, academicService } from '../services/authService'
import { MODULE_DATA } from '../data/moduleList'
import {
    Edit,
    Search,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    CheckCircle,
    Clock,
    Calendar,
    ArrowRight,
    Zap,
    BookOpen,
    MoreHorizontal
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

// --- Components ---

const ProfileCard = ({ user, greeting, onEdit, loading }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/10 transition-colors"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">User profile</h2>
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold"
                    >
                        <Edit className="w-4 h-4" />
                        Edit info
                    </button>
                </div>

                <div className="flex items-start gap-5 mt-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg">
                            {/* Placeholder Avatar */}
                            {user?.studentRef?.imageUrl ? (
                                <img src={user.studentRef.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">
                                    {(user?.studentRef?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                                </span>
                            )}
                        </div>
                        {/* Status Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded-lg border-2 border-white dark:border-slate-900 shadow-md">
                            Level {user?.studentRef?.level || 1}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
                            {(user?.studentRef?.firstName && user?.studentRef?.lastName)
                                ? `${user.studentRef.firstName} ${user.studentRef.lastName}`
                                : (user?.username || 'Student')}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold px-3 py-1 rounded-full">
                                Student (Level {user?.studentRef?.level || 1})
                            </span>
                        </div>

                        <div className="mt-4 space-y-1">
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">
                                Registration
                            </p>
                            <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold truncate">
                                {user?.studentRef?.registrationNumber || 'Pending'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">
                    Degree Programme
                </p>
                <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm line-clamp-1">
                    B.Sc. in Management and Information Technology
                </p>
            </div>
        </div>
    )
}

const SubjectTagsCard = ({ modules, loading }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Current Subjects</h2>
                <button className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    View all
                </button>
            </div>

            {/* Faux Search */}
            <div className="relative mb-4 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Find subjects..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-wrap gap-2 content-start">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)
                    ) : modules.length > 0 ? (
                        modules.map((mod, idx) => (
                            <div
                                key={idx}
                                className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-rose-200 dark:hover:border-rose-900/50 hover:shadow-md hover:shadow-rose-100/50 dark:hover:shadow-none transition-all cursor-default"
                            >
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{mod.title}</span>
                                <button className="text-slate-300 hover:text-rose-500 transition-colors">
                                    <span className="sr-only">Remove</span>
                                    <span aria-hidden="true" className="text-xs">×</span>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center py-4">
                            <p className="text-sm font-bold text-slate-400">No subjects assigned</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const PromoCard = () => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full relative overflow-hidden text-center justify-between">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-orange-400"></div>

            <div className="mt-4 flex justify-center">
                {/* Illustration Placeholder - Using Emoji for now but styled properly */}
                <div className="w-24 h-24 relative">
                    <div className="absolute inset-0 bg-yellow-100 dark:bg-yellow-900/20 rounded-full blur-xl opacity-60 animate-pulse"></div>
                    <span className="relative z-10 text-6xl drop-shadow-lg transform hover:scale-110 transition-transform cursor-pointer block">🏃‍♂️</span>
                </div>
            </div>

            <div className="mt-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Exam Season!</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Check your timetable and get ready for the upcoming assessments.
                </p>
            </div>

            <button className="w-full mt-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                View Timetable
            </button>
        </div>
    )
}

const TimelineSection = ({ events }) => {
    const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const [selectedDay, setSelectedDay] = useState('Tue');
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 100;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    }

    return (
        <div className="bg-[#1e1e1e] rounded-3xl p-6 shadow-lg text-white flex flex-col h-full relative overflow-hidden">
            {/* Header / Week Slider */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => scroll('left')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>

                <div className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth" ref={scrollRef}>
                    <div className="flex justify-between min-w-max gap-2 px-2">
                        {days.map((day, idx) => {
                            const num = 18 + idx; // Faking dates for UI demo
                            const isSelected = day === selectedDay;
                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`flex flex-col items-center justify-center w-12 h-16 rounded-2xl transition-all ${isSelected ? 'bg-rose-500 shadow-lg shadow-rose-500/30 scale-110' : 'hover:bg-white/5'}`}
                                >
                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-500'}`}>{num}</span>
                                    <span className={`text-xs font-bold mt-1 ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>{day}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <button onClick={() => scroll('right')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 relative">
                <h3 className="text-xl font-bold mb-6">Timetable of classes</h3>

                <div className="relative pl-4 space-y-8 before:absolute before:left-[59px] before:top-2 before:bottom-0 before:w-0.5 before:bg-white/10 before:border-l before:border-dashed before:border-white/20">
                    {/* Time Marker 1 */}
                    <div className="relative flex items-start group">
                        <div className="w-12 text-right text-xs font-bold text-gray-500 pt-2 mr-6">10 am</div>
                        <div className="absolute left-[55px] top-3 w-2 h-2 rounded-full bg-rose-500 ring-4 ring-[#1e1e1e] z-10"></div>

                        <div className="flex-1 bg-[#252525] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Lecture</span>
                                    </div>
                                    <h4 className="font-bold text-lg mb-1">Mathematical Analysis</h4>
                                    <p className="text-xs text-gray-400">Main Hall • Dr. Smith</p>
                                </div>
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-[#252525]"></div>
                                    <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#252525]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time Marker 2 */}
                    <div className="relative flex items-start group">
                        <div className="w-12 text-right text-xs font-bold text-gray-500 pt-2 mr-6">1 pm</div>

                        <div className="flex-1 p-2 rounded-xl border border-dashed border-white/10 text-center">
                            <span className="text-xs font-bold text-gray-600">Break / Self Study</span>
                        </div>
                    </div>

                    {/* Time Marker 3 */}
                    <div className="relative flex items-start group">
                        <div className="w-12 text-right text-xs font-bold text-gray-500 pt-2 mr-6">2 pm</div>
                        <div className="absolute left-[55px] top-3 w-2 h-2 rounded-full bg-gray-600 ring-4 ring-[#1e1e1e] z-10"></div>

                        <div className="flex-1 bg-[#252525] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Practical</span>
                            </div>
                            <h4 className="font-bold text-lg">Python Programming</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const StatsCard = ({ gpa, credits }) => {
    // Dummy data for the chart
    const data = [
        { name: 'Jan', val: 2.8 },
        { name: 'Feb', val: 3.0 },
        { name: 'Mar', val: 3.2 },
        { name: 'Apr', val: 3.1 },
        { name: 'May', val: 3.4 },
        { name: 'Jun', val: 3.5 },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Statistic info</h2>
                <button className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    View all
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900 dark:bg-black rounded-2xl p-4 text-white">
                    <p className="text-xs font-bold text-slate-400 mb-1">Current GPA</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black">{gpa > 0 ? gpa.toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-emerald-400">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-[10px] font-bold">+0.2 this sem</span>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Credits</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{credits}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-slate-400">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-[10px] font-bold">Earned</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[150px] relative">
                <p className="text-xs font-bold text-slate-500 absolute top-0 left-0">Performance Trend</p>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="val"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorVal)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

// --- Main Page ---

export default function StudentDashboard() {
    const navigate = useNavigate();
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
            // Simulate fetching combination-based modules
            // In a real scenario, this logic might be in a service or use the combination string to filter MODULE_DATA
            const combination = studentRef.combination || '';
            const currentLevel = studentRef.level || 1;

            // Simplified logic to get some modules for display
            const myModules = MODULE_DATA.filter(m =>
                m.level === currentLevel &&
                (combination ? combination.toUpperCase().includes(m.department) || ['CMIS', 'MATH', 'ELTN', 'IMGT'].includes(m.department) : true) // Fallback logic
            ).slice(0, 6);

            setModules(myModules);
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-display p-4 md:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* Header (optional, if TopNav is not sufficient or for dashboard specific title) */}
                <div className="flex items-center justify-between pointer-events-none opacity-0 h-0 overflow-hidden">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">

                    {/* Row 1: Profile (2 cols), Subjects (1 col), Promo (1 col) */}
                    <div className="lg:col-span-2 xl:col-span-2 h-[280px]">
                        <ProfileCard
                            user={user}
                            greeting={greeting()}
                            onEdit={() => navigate('/profile')}
                            loading={loading}
                        />
                    </div>

                    <div className="lg:col-span-1 h-[280px]">
                        <SubjectTagsCard modules={modules} loading={loading} />
                    </div>

                    <div className="lg:col-span-1 md:col-span-2 lg:col-auto h-[280px]">
                        <PromoCard />
                    </div>

                    {/* Row 2: Timeline (2 cols), Stats (1 col), Something else or stretch */}
                    <div className="lg:col-span-2 xl:col-span-2 h-[400px]">
                        <TimelineSection />
                    </div>

                    <div className="lg:col-span-1 xl:col-span-1 h-[400px]">
                        <StatsCard
                            gpa={user?.studentRef?.cumulativeGPA || 0}
                            credits={user?.studentRef?.totalCreditsEarned || 0}
                        />
                    </div>

                    {/* Filler or additional widgets can go here if 4 columns, or stretch the above */}
                    <div className="lg:col-span-3 xl:col-span-1 h-[400px] bg-indigo-600 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between text-white shadow-xl shadow-indigo-500/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black leading-tight mb-2">Unlock Premium Features</h3>
                            <p className="text-indigo-200 text-sm font-medium">Get access to advanced analytics and predictive GPA modeling.</p>
                        </div>
                        <button className="relative z-10 w-full py-4 bg-white text-indigo-600 rounded-xl font-black hover:bg-indigo-50 transition-colors">
                            Upgrade Plan
                        </button>
                    </div>

                </div>

            </div>
        </div>
    )
}
