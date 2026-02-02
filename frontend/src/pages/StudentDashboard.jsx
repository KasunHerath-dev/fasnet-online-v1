import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
    Calendar as CalendarIcon,
    Clock,
    BookOpen,
    GraduationCap,
    TrendingUp,
    ArrowRight,
    Search,
    Edit,
    FileText,
    Users,
    CheckCircle,
    Award,
    Target,
    Layers,
    LayoutDashboard
} from 'lucide-react'
import { authService, academicService } from '../services/authService'
import { MODULE_DATA } from '../data/moduleList'

// Sub-page Imports
import StudentProfile from './StudentProfile'
import StudentAcademic from './StudentAcademic'
import StudentResources from './StudentResources'
import StudentAnalytics from './StudentAnalytics'

// --- Reusable Dashboard Components ---

const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-[#1e1e1e] rounded-[2rem] shadow-sm border border-gray-100 dark:border-[#303030] p-6 transition-all ${className}`}>
        {children}
    </div>
)

const SectionTitle = ({ title, action }) => (
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">{title}</h2>
        {action}
    </div>
)

const Tag = ({ label, color = "blue" }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    }
    return (
        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${colors[color] || colors.blue}`}>
            {label}
        </span>
    )
}

const DateStrip = () => {
    // Generate dates for current week
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 5; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
    }

    return (
        <div className="bg-[#1e1e1e] text-white rounded-[2rem] p-4 flex justify-between items-center shadow-lg shadow-gray-200 dark:shadow-none mb-6">
            {dates.map((date, index) => {
                const isSelected = index === 0;
                return (
                    <div key={index} className={`flex flex-col items-center px-4 py-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-[#f3184c] shadow-lg shadow-[#f3184c]/20' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                        <span className="text-xs font-medium mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-xl font-black">{date.getDate()}</span>
                    </div>
                )
            })}
        </div>
    )
}

const TimelineItem = ({ time, title, subtitle, color, isLast }) => (
    <div className="flex gap-4 relative">
        {/* Timeline Line */}
        {!isLast && <div className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-gray-100 dark:bg-[#303030]"></div>}

        <div className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 ring-4 ring-white dark:ring-[#1e1e1e]`}>
                <Clock className="w-4 h-4" />
            </div>
        </div>
        <div className="flex-1 pb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">{title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">{subtitle}</p>
                </div>
                <span className="text-xs font-bold bg-gray-100 dark:bg-[#303030] text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">
                    {time}
                </span>
            </div>
        </div>
    </div>
)

// --- Overview Component (Original Dashboard Content) ---

const DashboardOverview = ({ user, student, profile, modules }) => {
    const navigate = useNavigate();

    // Mock Timetable Data
    const timetable = [
        { time: "09:00 AM", title: "Advanced Database Systems", subtitle: "Lecture Hall A • Prof. Smith", color: "blue" },
        { time: "11:00 AM", title: "Artificial Intelligence", subtitle: "Lab 3 • Dr. Johnson", color: "purple" },
        { time: "02:00 PM", title: "Software Engineering Project", subtitle: "Meeting Room 2 • Group 5", color: "emerald" },
    ];

    // Mock Enrolled Subjects for Tags
    const subjects = modules.slice(0, 4).map(m => m.code);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            {/* LEFT COLUMN (Wide) */}
            <div className="lg:col-span-8 space-y-6">

                {/* Profile Banner Card */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-gray-100 dark:border-[#303030] relative overflow-hidden group">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent dark:from-blue-900/10 rounded-bl-[100%] transition-transform group-hover:scale-110 duration-500"></div>

                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gray-200 dark:bg-[#303030] overflow-hidden shadow-xl ring-4 ring-white dark:ring-[#1e1e1e]">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.username}&background=0D8ABC&color=fff&size=200`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/dashboard?tab=profile')}
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#f3184c] text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left relative z-10">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                            Hello, {user?.studentRef?.firstName || user?.username}!
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-4 max-w-md">
                            Welcome back to your portal. You have 3 classes today and 2 assignments due this week.
                        </p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                            <Tag label={`Level ${student?.level || 1}`} color="blue" />
                            <Tag label="Semester 1" color="purple" />
                            <Tag label="Computer Science" color="orange" />
                        </div>
                    </div>

                    {/* Quick Stats on Banner */}
                    <div className="hidden xl:flex flex-col gap-3 min-w-[140px] border-l border-gray-100 dark:border-[#303030] pl-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">GPA</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{profile?.gpa?.overall?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Credits</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{profile?.credits?.total || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Date Strip */}
                <DateStrip />

                {/* Timetable Section */}
                <Card>
                    <SectionTitle
                        title="Today's Timetable"
                        action={
                            <button className="text-sm font-bold text-[#f3184c] hover:underline">View Full Schedule</button>
                        }
                    />
                    <div className="mt-6">
                        {timetable.map((event, i) => (
                            <TimelineItem
                                key={i}
                                {...event}
                                isLast={i === timetable.length - 1}
                            />
                        ))}
                    </div>
                </Card>

            </div>

            {/* RIGHT COLUMN (Narrow) */}
            <div className="lg:col-span-4 space-y-6">

                {/* Statistic Info Widget */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="!p-5 bg-gradient-to-br from-purple-500 to-indigo-600 !border-none text-white shadow-lg shadow-purple-500/20">
                        <TrendingUp className="w-8 h-8 text-white/80 mb-6" />
                        <p className="text-3xl font-black mb-1">{profile?.gpa?.overall?.toFixed(2) || '3.42'}</p>
                        <p className="text-xs font-bold text-white/80 uppercase">Current GPA</p>
                    </Card>
                    <Card className="!p-5 bg-[#1e1e1e] !border-none text-white shadow-lg shadow-gray-900/20">
                        <Target className="w-8 h-8 text-emerald-400 mb-6" />
                        <p className="text-3xl font-black mb-1">{profile?.credits?.total || 64}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase">Credits Earned</p>
                    </Card>
                </div>

                {/* Degree Progress */}
                <Card>
                    <SectionTitle title="Degree Progress" />
                    <div className="flex items-center justify-center py-6 relative">
                        {/* Circular Progress Placeholder */}
                        <div className="w-48 h-48 rounded-full border-[12px] border-gray-100 dark:border-[#303030] flex items-center justify-center relative">
                            <div className="absolute inset-0 border-[12px] border-[#f3184c] rounded-full border-l-transparent border-b-transparent rotate-45"></div>
                            <div className="text-center">
                                <span className="text-4xl font-black text-gray-900 dark:text-white">65%</span>
                                <span className="block text-xs font-bold text-gray-400 uppercase mt-1">Completed</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Enrolled Subjects / Tags */}
                <Card>
                    <SectionTitle
                        title="My Subjects"
                        action={<button onClick={() => navigate('/dashboard?tab=academic')}><ArrowRight className="w-5 h-5 text-gray-400 hover:text-[#f3184c]" /></button>}
                    />
                    <div className="flex flex-wrap gap-2">
                        {subjects.length > 0 ? (
                            subjects.map(code => (
                                <span key={code} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-[#303030] dark:hover:bg-[#404040] rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors cursor-default">
                                    {code}
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 font-medium">No enrolled subjects.</p>
                        )}
                        <button className="px-3 py-2 border-2 border-dashed border-gray-200 dark:border-[#303030] rounded-xl text-sm font-bold text-gray-400 hover:text-[#f3184c] hover:border-[#f3184c] transition-colors">
                            + Add New
                        </button>
                    </div>
                </Card>

            </div>
        </div>
    );
};

// --- Main Container Component ---

export default function StudentDashboard() {
    const [user, setUser] = useState(null)
    const [student, setStudent] = useState(null)
    const [profile, setProfile] = useState(null)
    const [modules, setModules] = useState([])
    const [loading, setLoading] = useState(true)

    // Tab Management using URL Params
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = authService.getUser()
                setUser(currentUser)

                if (currentUser && currentUser.studentRef) {
                    // Fetch Profile
                    try {
                        const profileRes = await academicService.getStudentProfile(currentUser.studentRef._id)
                        if (profileRes.data) {
                            setStudent(profileRes.data.studentDetails)
                            setProfile(profileRes.data)
                        }
                    } catch (e) {
                        console.warn("Could not fetch full profile", e)
                    }

                    // Fetch Modules (Static + User specific if needed)
                    // For now using static
                    setModules(MODULE_DATA)
                }
            } catch (error) {
                console.error("Dashboard data fetch error", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f3184c] border-t-transparent"></div>
            </div>
        )
    }

    {/* Tab Header - Visible on Mobile to switch views if specific mobile nav isn't enough */ }
    {/* On Desktop, SideNav handles switching. This area serves as title for sub-pages if needed */ }
    {
        activeTab !== 'overview' && (
            <div className="mb-4">
                <Link to="/dashboard?tab=overview" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#f3184c] transition-colors mb-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>
        )
    }

    {/* Main View Area */ }
    { renderContent() }

            </div >
        </div >
    )
}

const ArrowRight = ({ className }) => {
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
