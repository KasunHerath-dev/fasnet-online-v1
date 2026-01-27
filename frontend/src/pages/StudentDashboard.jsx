import { useState, useEffect } from 'react'
import { authService, academicService } from '../services/authService'
import { MODULE_DATA } from '../data/moduleList'
import { CheckCircle, TrendingUp, Award, Target, BookOpen, Calendar, Bell, Sparkles, Info, Zap } from 'lucide-react'

export default function StudentDashboard() {
    const [user, setUser] = useState(null)
    const [greeting, setGreeting] = useState('')
    const [greetingEmoji, setGreetingEmoji] = useState('')

    // Combination State
    const [combination, setCombination] = useState('')
    const [isLocked, setIsLocked] = useState(false)
    const [loadingComb, setLoadingComb] = useState(false)
    const [fetchingProfile, setFetchingProfile] = useState(true)
    const [modules, setModules] = useState([])
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        const currentUser = authService.getUser()
        setUser(currentUser)

        // Set time-based greeting
        const hour = new Date().getHours()
        if (hour < 12) {
            setGreeting('Good Morning')
            setGreetingEmoji('🌅')
        } else if (hour < 17) {
            setGreeting('Good Afternoon')
            setGreetingEmoji('☀️')
        } else {
            setGreeting('Good Evening')
            setGreetingEmoji('🌙')
        }

        if (currentUser?.studentRef?._id) {
            fetchProfile(currentUser.studentRef._id)
        } else {
            setFetchingProfile(false)
        }
    }, [])

    const fetchProfile = async (studentId) => {
        try {
            const res = await academicService.getStudentProfile(studentId)
            const details = res.data.studentDetails
            if (details) {
                setCombination(details.combination || '')
                setIsLocked(!!details.isCombinationLocked)

                // Fetch enrolled/combination modules
                const modulesRes = await academicService.getMyEnrollments()
                setModules(modulesRes || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setFetchingProfile(false)
        }
    }

    // Logic to save combination
    const handleSaveCombination = async () => {
        if (!combination) return alert('Please select a combination')
        if (!window.confirm('Are you sure? Once saved, you cannot change this without Admin permission.')) return

        setLoadingComb(true)
        try {
            await authService.setCombination({ combination })
            setIsLocked(true)
            alert('Combination saved and locked successfully!')
            //Ideally refresh profile 
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save combination')
        } finally {
            setLoadingComb(false)
        }
    }

    const specialDates = [
        { date: '2026-01-19', event: 'Study Leave Begins', type: 'academic' },
        { date: '2026-02-02', event: 'Semester I Exams Begin', type: 'exam' },
        { date: '2026-03-02', event: 'Semester Break', type: 'holiday' },
        { date: '2026-03-09', event: 'Semester II Begins', type: 'academic' }, // Assumed start after 1 week break
    ]

    const getEventIcon = (type) => {
        switch (type) {
            case 'exam': return '📝'
            case 'holiday': return '🏖️'
            case 'academic': return '📚'
            default: return '📅'
        }
    }

    const getEventColor = (type) => {
        switch (type) {
            case 'exam': return 'border-red-200 bg-red-50'
            case 'holiday': return 'border-green-200 bg-green-50'
            case 'academic': return 'border-blue-200 bg-blue-50'
            default: return 'border-gray-200 bg-gray-50'
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-display text-slate-900 dark:text-white transition-colors duration-500">

            {/* Enhanced Hero Section - Command Center Style */}
            <div className="relative w-full overflow-hidden pb-32 sm:pb-20 lg:pb-24">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                </div>

                {/* Floating orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-700 opacity-10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-slate-600 opacity-5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">

                        {/* Left side - Title & Description */}
                        <div className="flex-1 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg w-fit">
                                <Zap className="w-4 h-4 text-blue-300" />
                                <span className="text-white text-xs font-bold tracking-wide uppercase">Dashboard</span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight flex items-center gap-3">
                                    <span className="text-4xl sm:text-5xl">{greetingEmoji}</span>
                                    {greeting}!
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                                    {(user?.studentRef?.firstName && user?.studentRef?.lastName) ? `${user.studentRef.firstName} ${user.studentRef.lastName}` : (user?.studentRef?.fullName || 'Student')}
                                </p>
                            </div>

                            {/* Quick stats badges */}
                            <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-white text-xs sm:text-sm font-bold">Live System</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="text-white text-xs sm:text-sm font-bold">📋 {user?.studentRef?.registrationNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="text-white text-xs sm:text-sm font-bold">🎓 Level {user?.studentRef?.level}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="text-white text-xs sm:text-sm font-bold">📅 {user?.studentRef?.batchYear}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 pb-12 sm:pb-20 space-y-6 sm:space-y-8">

                {/* QUICK STATS GRID - 4 Columns - Enhanced */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Academic Status */}
                    <div className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {user?.studentRef?.academicStatus || 'Regular'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Academic Status
                        </p>
                    </div>

                    {/* Cumulative GPA */}
                    <div className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {user?.studentRef?.cumulativeGPA > 0
                                ? user.studentRef.cumulativeGPA.toFixed(2)
                                : <span className="text-slate-400 dark:text-slate-500 text-lg">Not Calculated</span>}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Cumulative GPA
                        </p>
                    </div>

                    {/* Credits Earned */}
                    <div className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {user?.studentRef?.totalCreditsEarned || 0}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Credits Earned
                        </p>
                    </div>

                    {/* Current Level */}
                    <div className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">
                            Level {user?.studentRef?.level || 1}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Current Level
                        </p>
                    </div>
                </div>

                {/* SUBJECT COMBINATION - Interactive Accordion */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Subject Combination</h2>
                    </div>

                    {!fetchingProfile ? (
                        <div className="w-full max-w-2xl mx-auto">
                            {/* Combination Card - Clickable Trigger */}
                            <div
                                onClick={combination ? () => setIsExpanded(!isExpanded) : null}
                                className={`
                                relative p-8 rounded-2xl text-center transition-all duration-300 transform
                                ${combination
                                        ? 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg hover:scale-[1.01]'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700'}
                            `}
                            >
                                {combination ? (
                                    <>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase mb-3 tracking-widest">Your Assigned Combination</p>
                                        <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">{combination}</p>

                                        <div className="flex items-center justify-center gap-3">
                                            {isLocked && (
                                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                                                    <span className="text-slate-600 dark:text-slate-300 text-xs">🔒 Locked</span>
                                                </div>
                                            )}
                                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors ${isExpanded ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
                                                <span className="text-sm font-bold">{isExpanded ? 'Hide Subjects' : 'View Subjects'}</span>
                                                <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-4">
                                        <div className="text-5xl mb-3">🎓</div>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No combination assigned yet</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Contact administration for assignment</p>
                                    </div>
                                )}
                            </div>

                            {/* Expandable Subjects List */}
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'}`}>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <span>📖</span> Level {user?.studentRef?.level || '-'} Subjects
                                </h3>

                                {[1, 2].map(semester => {
                                    const semesterModules = MODULE_DATA.filter(m => {
                                        // 1. Level Check
                                        if (m.level !== (user?.studentRef?.level || 1)) return false;
                                        if (m.semester !== semester) return false;

                                        // 2. Combination Check
                                        // If no combination is assigned, show all (or maybe none? Showing all is safer for now)
                                        if (!combination) return true;

                                        // Normalize strings
                                        const comb = combination.toUpperCase();
                                        const dept = m.department; // 'CMIS', 'ELTN', 'MATH', 'IMGT', 'STAT'

                                        // WUSL Combination Definitions
                                        const COMB_1 = ['CMIS', 'ELTN', 'MATH', 'STAT'];
                                        const COMB_2 = ['ELTN', 'IMGT', 'MATH', 'STAT'];
                                        const COMB_3 = ['IMGT', 'CMIS', 'MATH', 'STAT'];

                                        // Exact Combination Match
                                        if (comb.includes('COMB 1') || comb.includes('COMB1')) {
                                            return COMB_1.includes(dept);
                                        }
                                        if (comb.includes('COMB 2') || comb.includes('COMB2')) {
                                            return COMB_2.includes(dept);
                                        }
                                        if (comb.includes('COMB 3') || comb.includes('COMB3')) {
                                            return COMB_3.includes(dept);
                                        }

                                        // Keyword Logic (Fallback for non-standard names)
                                        const combLower = combination.toLowerCase();
                                        const isComputing = combLower.includes('computer') || combLower.includes('cmis');
                                        const isElectronics = combLower.includes('electronic') || combLower.includes('eltn');
                                        const isMath = combLower.includes('math') || combLower.includes('mathematics');
                                        const isManagement = combLower.includes('management') || combLower.includes('imgt') || combLower.includes('industrial');
                                        const isStats = combLower.includes('statistic') || combLower.includes('stat');

                                        if (isComputing || isElectronics || isMath || isManagement || isStats) {
                                            if (dept === 'CMIS' && isComputing) return true;
                                            if (dept === 'ELTN' && isElectronics) return true;
                                            if (dept === 'MATH' && isMath) return true;
                                            if (dept === 'IMGT' && isManagement) return true;
                                            if (dept === 'STAT' && isStats) return true;
                                            return false;
                                        }

                                        // Unknown code? Show all.
                                        return true;
                                    });

                                    if (semesterModules.length === 0) return null;

                                    return (
                                        <div key={semester} className="mb-8 last:mb-0">
                                            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rounded-full"></span>
                                                Semester {semester}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {semesterModules.map((sub, idx) => {
                                                    let colorClass = 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
                                                    let icon = '📘';

                                                    if (sub.department === 'MATH') { colorClass = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'; icon = '📐'; }
                                                    else if (sub.department === 'CMIS') { colorClass = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'; icon = '💻'; }
                                                    else if (sub.department === 'ELTN') { colorClass = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'; icon = '⚡'; }
                                                    else if (sub.department === 'IMGT') { colorClass = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'; icon = '💼'; }

                                                    return (
                                                        <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border-l-4 border-y border-r border-l-slate-400 dark:border-l-slate-500 ${colorClass} hover:shadow-md transition-all cursor-default h-full`}>
                                                            <span className="text-2xl grayscale opacity-80">{icon}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-base truncate" title={sub.title}>{sub.code} - {sub.title}</p>
                                                                <p className="text-xs opacity-75 font-semibold mt-0.5">{sub.credits} Credits • {sub.department}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-pulse w-full max-w-2xl mx-auto">
                            <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-2xl mb-8"></div>
                        </div>
                    )}
                </div>

                {/* NEW: Notices / Recent Updates Section & Calendar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Academic Calendar */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Academic Calendar</h2>
                        </div>

                        <div className="space-y-4">
                            {specialDates.slice(0, 3).map((item, idx) => {
                                let itemColor = getEventColor(item.type);
                                // Adjust for dark mode manually as function returns string
                                // Adjust for dark mode manually as function returns string
                                if (item.type === 'exam') itemColor = "border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-200 border-l-slate-400";
                                else if (item.type === 'holiday') itemColor = "border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-200 border-l-slate-400";
                                else if (item.type === 'academic') itemColor = "border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-200 border-l-slate-400";
                                else itemColor = "border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-200 border-l-slate-400";

                                return (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl border-l-4 ${itemColor} hover:shadow-sm transition-all`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{item.event}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(item.date).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <span className="text-xl">{getEventIcon(item.type)}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Notice Board</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-slate-400 dark:border-slate-600">
                                <h4 className="font-bold text-slate-900 dark:text-slate-200">📝 Exam Registration Open</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Registrations for End Semester Exams close on Dec 20.</p>
                                <span className="text-xs text-slate-500 dark:text-slate-500 font-medium mt-2 block">2 hours ago</span>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-slate-400 dark:border-slate-600">
                                <h4 className="font-bold text-slate-900 dark:text-slate-200">🎓 Special Degree Selection</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Applications for Level 3 Special Degree selection are now open.</p>
                                <span className="text-xs text-slate-500 dark:text-slate-500 font-medium mt-2 block">Yesterday</span>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-slate-400 dark:border-slate-600">
                                <h4 className="font-bold text-slate-900 dark:text-white">ℹ️ System Maintenance</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">System will be down for upgrades on Sunday 10 PM.</p>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 block">2 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6">Quick Access</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a
                            href="/profile"
                            className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100">👤</div>
                            <p className="font-bold text-slate-900 dark:text-white">My Profile</p>
                        </a>
                        <a
                            href="/exams"
                            className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100">🗓️</div>
                            <p className="font-bold text-slate-900 dark:text-white">Exam Table</p>
                        </a>
                        <a
                            href="/academic"
                            className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100">📊</div>
                            <p className="font-bold text-slate-900 dark:text-white">Academic</p>
                        </a>
                        <a
                            href="/academic"
                            className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100">📈</div>
                            <p className="font-bold text-slate-900 dark:text-white">Results</p>
                        </a>
                        <a
                            href="/help"
                            className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100">❓</div>
                            <p className="font-bold text-slate-900 dark:text-white">Help</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
