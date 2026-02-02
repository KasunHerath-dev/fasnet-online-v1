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
import { EXAM_TIMETABLE, getStudentExams } from '../data/examTimeTable'
import { ACADEMIC_CALENDAR, getKeyDates } from '../data/academicCalendar'
import HeroSection from '../components/HeroSection'

// Sub-page Imports
import StudentProfile from './StudentProfile'
import StudentAcademic from './StudentAcademic'
import StudentResources from './StudentResources'
import StudentAnalytics from './StudentAnalytics'

// --- Reusable Dashboard Components (Pro Dark Theme 2.0) ---

const Card = ({ children, className = "" }) => (
    <div className={`bg-[#121212]/50 backdrop-blur-md rounded-[2rem] border border-white/5 p-6 transition-all duration-300 hover:border-white/10 ${className}`}>
        {children}
    </div>
)

const SectionTitle = ({ title, action, className = "" }) => (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
        <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {title}
        </h2>
        {action}
    </div>
)

const Badge = ({ label, color = "gray" }) => {
    const colors = {
        blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        red: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        orange: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        gray: "bg-white/5 text-gray-400 border border-white/10",
    }
    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${colors[color] || colors.gray}`}>
            {label}
        </span>
    )
}

// --- Quick Actions Component ---
const QuickActions = () => {
    const actions = [
        { label: 'Register', icon: Users, color: 'blue' },
        { label: 'Exams', icon: FileText, color: 'purple' },
        { label: 'Results', icon: Award, color: 'emerald' },
        { label: 'Payments', icon: CheckCircle, color: 'orange' },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {actions.map((action, idx) => (
                <button key={idx} className="group relative overflow-hidden p-4 rounded-2xl bg-[#121212] border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                    <div className={`absolute inset-0 bg-gradient-to-br from-${action.color}-500/0 to-${action.color}-500/5 group-hover:from-${action.color}-500/10 group-hover:to-${action.color}-500/20 transition-all duration-500`}></div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className={`p-3 rounded-xl bg-${action.color}-500/10 text-${action.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">{action.label}</span>
                    </div>
                </button>
            ))}
        </div>
    )
}

const TimelineItem = ({ time, title, subtitle, color, isLast, date }) => (
    <div className="flex items-start gap-4 mb-6 last:mb-0 group">
        <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50 mt-1.5"></div>
            {!isLast && <div className="w-0.5 h-full bg-white/5 my-1"></div>}
        </div>
        <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5 group-hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-white text-sm group-hover:text-rose-400 transition-colors">{title}</h4>
                {date && <span className="text-[10px] font-bold text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">{new Date(date).toLocaleDateString()}</span>}
            </div>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                <LayoutDashboard className="w-3 h-3" />
                {subtitle}
            </p>
            <span className="text-[10px] font-bold bg-black/40 text-gray-400 px-2 py-1 rounded border border-white/5 inline-block mt-2">
                {time}
            </span>
        </div>
    </div>
)

const CalendarEvent = ({ event, date, description, type }) => (
    <div className="flex gap-4 items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border border-white/10 ${type === 'exam' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
            <span className="text-[10px] font-bold uppercase">{new Date(date).toLocaleString('default', { month: 'short' })}</span>
            <span className="text-lg font-black leading-none">{new Date(date).getDate()}</span>
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-white">{event}</h4>
            <p className="text-xs text-gray-500 line-clamp-1">{description}</p>
        </div>
    </div>
)

// ... helpers remain same ...
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
const isDeansListEligible = (gpa) => parseFloat(gpa) >= 3.70;
const getCreditTarget = (level, degreeType = 'special') => degreeType === 'general' ? 90 : 120;


// --- Overview Component ---

const DashboardOverview = ({ user, student, profile, modules }) => {
    const navigate = useNavigate();

    // Data Helpers
    const firstName = user?.studentRef?.firstName || user?.username || 'Student';
    const mySubjects = student?.enrolledModules && student.enrolledModules.length > 0
        ? student.enrolledModules
        : modules.slice(0, 4);

    const gpa = profile?.gpa?.overall?.toFixed(2) || '0.00';
    const credits = profile?.credits?.total || 0;
    const degreeType = student?.degreeType || 'special';
    const creditTarget = getCreditTarget(student?.level, degreeType);
    const progress = Math.min(Math.round((credits / creditTarget) * 100), 100);
    const honoursClass = getHonoursClass(gpa);
    const showDeansList = isDeansListEligible(gpa);

    // Dynamic Data
    const studentLevel = student?.level || 1;
    const upcomingExams = getStudentExams(studentLevel).slice(0, 3);
    const calendarEvents = getKeyDates().slice(0, 3);


    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-2">

            {/* LEFT COLUMN: Hero & Main Content */}
            <div className="xl:col-span-8 space-y-6">

                {/* Hero / Profile Card */}
                <HeroSection
                    firstName={firstName}
                    student={student}
                    gpa={gpa}
                    credits={credits}
                    showDeansList={showDeansList}
                />

                {/* Quick Actions Bar */}
                <QuickActions />

                {/* Academic Timeline & Subjects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="min-h-[300px]">
                        <SectionTitle
                            title="Upcoming Exams"
                            action={<button className="text-xs font-bold text-rose-500 hover:text-rose-400 hover:underline">View Schedule</button>}
                        />
                        <div className="mt-6">
                            {upcomingExams.length > 0 ? upcomingExams.map((exam, i) => (
                                <TimelineItem
                                    key={i}
                                    time={exam.time}
                                    title={exam.title}
                                    subtitle={`${exam.code} • ${exam.venue}`}
                                    color="rose"
                                    date={exam.date}
                                    isLast={i === upcomingExams.length - 1}
                                />
                            )) : (
                                <p className="text-sm text-gray-500 italic">No exams scheduled shortly.</p>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle title="Academic Calendar" action={<button className="text-xs font-bold text-blue-500 hover:text-blue-400 hover:underline">Full Calendar</button>} />
                        <div className="space-y-4">
                            {calendarEvents.map((evt, i) => (
                                <CalendarEvent key={i} {...evt} />
                            ))}
                            {calendarEvents.length === 0 && <p className="text-sm text-gray-500 italic">No upcoming events.</p>}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5">
                            <SectionTitle title="Degree Progress" className="!mb-2 !text-sm !text-gray-400" />
                            <div className="w-full bg-white/5 rounded-full h-3 mb-2 overflow-hidden relative">
                                <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"></div>
                            </div>
                            <div className="flex justify-between w-full text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <span>{credits} Earned</span>
                                <span>{creditTarget} Req.</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* RIGHT COLUMN: Secondary Info */}
            <div className="xl:col-span-4 space-y-6">

                {/* My Subjects (Vertical List) */}
                <Card className="h-full bg-[#0F0F0F]/50">
                    <SectionTitle
                        title="Enrolled Modules"
                        action={<button onClick={() => navigate('/dashboard?tab=academic')}><ArrowRight className="w-5 h-5 text-gray-500 hover:text-white transition-colors" /></button>}
                    />
                    <div className="space-y-3 mt-4">
                        {mySubjects.length > 0 ? (
                            mySubjects.map((sub, idx) => (
                                <div key={idx} className="group p-4 rounded-2xl bg-[#1a1a1a] hover:bg-[#202020] border border-[#2a2a2a] hover:border-rose-500/30 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-1">{sub.code || "CS101"}</span>
                                            <h4 className="text-sm font-bold text-gray-200 group-hover:text-white">{sub.title || sub}</h4>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-gray-600 group-hover:text-rose-500 group-hover:bg-rose-500/10 transition-colors">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No modules enrolled</p>
                            </div>
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
                    try {
                        const profileRes = await academicService.getStudentProfile(currentUser.studentRef._id)
                        if (profileRes.data) {
                            setStudent(profileRes.data.studentDetails)
                            setProfile(profileRes.data)
                        }
                    } catch (e) {
                        console.warn("Could not fetch full profile", e)
                    }
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
            <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent"></div>
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
        <div className="min-h-full font-sans text-gray-200">
            {/* Note: bg-black removed to inherit Global App bg */}
            <div className="w-full max-w-[1920px] mx-auto p-4 lg:p-8">
                {/* Breadcrumb / Back Link */}
                {activeTab !== 'overview' && (
                    <div className="mb-6">
                        <Link to="/dashboard?tab=overview" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-rose-500 transition-colors">
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
