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
    LayoutDashboard,
    Bell,
    MessageSquare,
    User
} from 'lucide-react'
import { authService, academicService } from '../services/authService'
import { MODULE_DATA } from '../data/moduleList'

// Sub-page Imports
import StudentProfile from './StudentProfile'
import StudentAcademic from './StudentAcademic'
import StudentResources from './StudentResources'
import StudentAnalytics from './StudentAnalytics'

// --- Reusable Dashboard Components (Pro Dark Theme) ---

const Card = ({ children, className = "" }) => (
    <div className={`bg-[#0F0F0F] rounded-[2rem] shadow-2xl shadow-black/50 border border-[#1f1f1f] p-6 transition-all ${className}`}>
        {children}
    </div>
)

const SectionTitle = ({ title, action, className = "" }) => (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
        <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
        {action}
    </div>
)

const Badge = ({ label, color = "gray" }) => {
    const colors = {
        blue: "bg-[#1e3a8a]/30 text-blue-400 border border-blue-500/30",
        purple: "bg-[#581c87]/30 text-purple-400 border border-purple-500/30",
        red: "bg-[#7f1d1d]/30 text-red-400 border border-red-500/30",
        orange: "bg-[#7c2d12]/30 text-orange-400 border border-orange-500/30",
        gray: "bg-[#27272a] text-gray-300 border border-gray-700",
    }
    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${colors[color] || colors.gray}`}>
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
    const todayIndex = 0; // Simplified for demo, ideally match actual date

    return (
        <Card className="flex justify-between items-center py-5 px-8">
            {dates.map((date, index) => {
                const isSelected = index === todayIndex;
                return (
                    <div key={index} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${isSelected ? 'bg-[#ff0033] text-white shadow-[0_0_15px_rgba(255,0,51,0.5)]' : 'bg-[#1a1a1a] text-gray-400 group-hover:bg-[#252525]'}`}>
                            {date.getDate()}
                        </div>
                        <span className={`text-xs font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                    </div>
                )
            })}
        </Card>
    )
}

const TimelineItem = ({ time, title, subtitle, color, isLast }) => (
    <div className="flex items-start gap-4 mb-6 last:mb-0 group">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 bg-[#1a1a1a] text-${color}-400 border border-[#2a2a2a]`}>
            <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-white text-base group-hover:text-[#ff0033] transition-colors">{title}</h4>
            <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>
        </div>
        <span className="text-xs font-bold bg-[#1a1a1a] text-gray-400 px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
            {time}
        </span>
    </div>
)

const ArrowRight = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
)

// --- WUSL Academic Logic Helpers ---

const getHonoursClass = (gpa) => {
    const numGpa = parseFloat(gpa);
    if (!numGpa && numGpa !== 0) return "Not Classified";
    if (numGpa >= 3.70) return "First Class";
    if (numGpa >= 3.30) return "Second Upper";
    if (numGpa >= 3.00) return "Second Lower";
    if (numGpa >= 2.00) return "Pass";
    return "Pending";
}

const isDeansListEligible = (gpa, annualCredits) => {
    // WUSL Rule: GPA >= 3.70 AND >= 30 Credits/Year
    // Assuming annualCredits check is passed for this visualization if gpa is high enough
    return parseFloat(gpa) >= 3.70;
}

const getCreditTarget = (level, degreeType = 'special') => {
    // General: 90, Special/Joint: 120
    return degreeType === 'general' ? 90 : 120;
}

// --- Overview Component ---

const DashboardOverview = ({ user, student, profile, modules }) => {
    const navigate = useNavigate();

    // Data Helpers
    const firstName = user?.studentRef?.firstName || user?.username || 'Student';
    // Use real enrolled modules if avail, else fallback to first few
    const mySubjects = student?.enrolledModules && student.enrolledModules.length > 0
        ? student.enrolledModules
        : modules.slice(0, 4);

    const gpa = profile?.gpa?.overall?.toFixed(2) || '0.00';
    const credits = profile?.credits?.total || 0;

    // WUSL Logic Calculations
    const degreeType = student?.degreeType || 'special'; // Default to special/joint track (4 years)
    const creditTarget = getCreditTarget(student?.level, degreeType);
    const progress = Math.min(Math.round((credits / creditTarget) * 100), 100);
    const honoursClass = getHonoursClass(gpa);
    const showDeansList = isDeansListEligible(gpa);

    // Mock Timetable (Placeholder as no API exists)
    const timetable = [
        { time: "09:00 AM", title: "Advanced Database Systems", subtitle: "Lecture Hall A • Prof. Smith", color: "blue" },
        { time: "11:00 AM", title: "Artificial Intelligence", subtitle: "Lab 3 • Dr. Johnson", color: "purple" },
        { time: "02:00 PM", title: "Software Engineering Project", subtitle: "Meeting Room 2 • Group 5", color: "emerald" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">

            {/* LEFT COLUMN (Main Content) */}
            <div className="lg:col-span-8 space-y-8">

                {/* Hero / Profile Card */}
                <Card className="!bg-[#121212] !p-0 overflow-hidden relative min-h-[220px] flex flex-col justify-between">
                    {/* Decorative Glow */}
                    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#ff0033] opacity-[0.08] blur-[80px] rounded-full pointing-events-none"></div>

                    <div className="p-8 pb-4 flex justify-between items-start relative z-10">
                        <div className="flex gap-6">
                            {/* Big Date Box */}
                            <div className="w-20 h-20 bg-[#0088ff] rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-blue-900/40 relative">
                                <span className="text-3xl font-black">{new Date().getDate()}</span>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#ff0033] rounded-lg flex items-center justify-center shadow-md">
                                    <Edit className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>

                            {/* Greeting */}
                            <div>
                                <h1 className="text-3xl font-black text-white mb-2">Hello, {firstName}!</h1>
                                <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-4">
                                    Welcome back to your portal.
                                    {showDeansList && <span className="text-[#fbbf24] font-bold ml-1 flex items-center gap-1 inline-flex"><Award className="w-3 h-3" /> Dean's List Eligible</span>}
                                </p>
                                <div className="flex gap-2">
                                    <Badge label={`Level ${student?.level || 1}`} color="blue" />
                                    <Badge label={`Sem ${student?.semester || 1}`} color="purple" />
                                    {/* Default Combination Mock if not present */}
                                    <Badge label={student?.combination || "COMB 1"} color="gray" />
                                    <Badge label="Computer Science" color="orange" />
                                </div>
                            </div>
                        </div>

                        {/* Right Stats (Desktop) */}
                        <div className="hidden sm:flex flex-col items-end gap-4 text-right">
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Current Standing</span>
                                <span className="text-xl font-bold text-[#ff0033]">{honoursClass}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Total Credits</span>
                                <span className="text-3xl font-black text-white">{credits} <span className="text-sm text-gray-600">/ {creditTarget}</span></span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Date Strip */}
                <DateStrip />

                {/* Timetable */}
                <Card className="min-h-[280px]">
                    <SectionTitle
                        title="Today's Timetable"
                        action={<button className="text-[11px] font-bold text-[#ff0033] hover:text-[#ff3355] uppercase tracking-wide transition-colors">View Full Schedule</button>}
                    />
                    <div className="mt-6 space-y-2">
                        {timetable.map((event, i) => (
                            <TimelineItem key={i} {...event} isLast={i === timetable.length - 1} />
                        ))}
                    </div>
                </Card>

            </div>

            {/* RIGHT COLUMN (Widgets) */}
            <div className="lg:col-span-4 space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="!bg-gradient-to-br !from-[#6366f1] !to-[#4f46e5] border-none !px-5 !py-6">
                        <TrendingUp className="w-6 h-6 text-white/80 mb-6" />
                        <h3 className="text-3xl font-black text-white mb-1">{gpa}</h3>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">GPA ({honoursClass})</p>
                    </Card>
                    <Card className="bg-[#1a1a1a] border-[#2a2a2a] !px-5 !py-6">
                        <Target className="w-6 h-6 text-[#10b981] mb-6" />
                        <h3 className="text-3xl font-black text-white mb-1">{credits}</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Credits Earned</p>
                    </Card>
                </div>

                {/* Degree Progress */}
                <Card className="bg-[#1a1a1a] border-[#2a2a2a] min-h-[240px] flex flex-col">
                    <SectionTitle title="Degree Progress" />
                    <div className="flex-1 flex items-center justify-center py-4">
                        {/* Simple CSS Chart */}
                        <div className="relative w-40 h-40 rounded-full border-[10px] border-[#252525] flex items-center justify-center">
                            {/* Active segment (approx) */}
                            <div className="absolute inset-[-10px] rounded-full border-[10px] border-[#ff0033] border-l-transparent border-b-transparent rotate-[45deg] opacity-90 shadow-[0_0_20px_rgba(255,0,51,0.3)]"></div>

                            <div className="text-center z-10">
                                <span className="text-4xl font-black text-white">{progress}%</span>
                                <span className="block text-[10px] font-bold text-gray-500 uppercase mt-1">{credits} / {creditTarget} Credits</span>
                            </div>
                        </div>
                    </div>
                    {/* WUSL Level Check */}
                    <div className="text-center border-t border-[#2a2a2a] pt-4 mt-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Annual Target</p>
                        <p className="text-white font-bold text-sm">30 Credits Minimum</p>
                    </div>
                </Card>

                {/* Subjects */}
                <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SectionTitle
                        title="My Subjects"
                        action={<button onClick={() => navigate('/dashboard?tab=academic')}><ArrowRight className="w-4 h-4 text-gray-500 hover:text-white" /></button>}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {mySubjects.length > 0 ? (
                            mySubjects.map((sub, idx) => (
                                <div key={idx} className="bg-[#252525] hover:bg-[#2a2a2a] border border-[#303030] px-3 py-2 rounded-lg text-xs font-bold text-gray-300 transition-colors cursor-default">
                                    {sub.code || sub}
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500 font-medium italic">No subjects enrolled.</p>
                        )}
                    </div>
                </Card>

            </div>
        </div>
    );
};

// --- Main Container Component ---

export default function StudentDashboard() {
    const navigate = useNavigate()
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
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#ff0033] border-t-transparent"></div>
            </div>
        )
    }



    // Render Tab Content
    const renderContent = () => {
        switch (activeTab) {
            case 'academic': return <StudentAcademic />;
            case 'resources': return <StudentResources />;
            case 'analytics': return <StudentAnalytics />;
            case 'profile': return <StudentProfile />;
            case 'overview':
            default: return <DashboardOverview user={user} student={student} profile={profile} modules={modules} />;
        }
    };

    return (
        <div className="min-h-screen bg-black p-4 lg:p-6 font-sans text-gray-200">
            {/* Top Search Header (Local Scope) - Optional if TopNav exists */}
            <div className="w-full max-w-[1700px] mx-auto mb-6 flex items-center justify-between hidden">
                <h1 className="text-2xl font-black text-white">Dashboard</h1>
            </div>

            <div className="w-full max-w-[1700px] mx-auto">
                {/* Back to Dashboard Link (Mobile/Tab View) */}
                {activeTab !== 'overview' && (
                    <div className="mb-6">
                        <Link to="/dashboard?tab=overview" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#ff0033] transition-colors">
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Back to Overview</span>
                        </Link>
                    </div>
                )}

                {renderContent()}
            </div>
        </div>
    )
}
