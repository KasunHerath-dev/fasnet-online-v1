import { useState, useEffect } from 'react'
import { authService, academicService } from '../services/authService'
import { MODULE_DATA } from '../data/moduleList'

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
        { date: '2025-01-15', event: 'Semester 1 Begins', type: 'academic' },
        { date: '2025-03-20', event: 'Mid-term Exams', type: 'exam' },
        { date: '2025-05-10', event: 'End-term Exams', type: 'exam' },
        { date: '2025-06-01', event: 'Semester Break', type: 'holiday' },
        { date: '2025-07-15', event: 'Semester 2 Begins', type: 'academic' },
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
        <div className="p-4 md:p-8 animate-fadeIn max-w-[1400px] mx-auto space-y-8">
            {/* Greeting Card */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-5xl">{greetingEmoji}</span>
                        <h1 className="text-3xl md:text-4xl font-bold">{greeting}!</h1>
                    </div>
                    <p className="text-xl md:text-2xl font-medium opacity-90 mb-4">
                        {(user?.studentRef?.firstName && user?.studentRef?.lastName) ? `${user.studentRef.firstName} ${user.studentRef.lastName}` : (user?.studentRef?.fullName || 'Student')}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            📋 {user?.studentRef?.registrationNumber}
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            🎓 Level {user?.studentRef?.level}
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            📅 {user?.studentRef?.batchYear}
                        </span>
                    </div>
                </div>
            </div>

            {/* QUICK STATS GRID - 4 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Academic Status */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Academic Status</p>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-xl">
                            ✅
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user?.studentRef?.academicStatus || 'Regular'}
                    </p>
                </div>

                {/* Cumulative GPA */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cumulative GPA</p>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-xl">
                            🎯
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user?.studentRef?.cumulativeGPA > 0
                            ? user.studentRef.cumulativeGPA.toFixed(2)
                            : <span className="text-gray-400 dark:text-gray-500 text-lg">Not Calculated</span>}
                    </p>
                </div>

                {/* Credits Earned */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Credits Earned</p>
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-xl">
                            ⭐
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user?.studentRef?.totalCreditsEarned || 0}
                    </p>
                </div>

                {/* Current Level */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Level</p>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-xl">
                            📚
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        Level {user?.studentRef?.level || 1}
                    </p>
                </div>
            </div>

            {/* SUBJECT COMBINATION - Interactive Accordion */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">🧩</span>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subject Combination</h2>
                </div>

                {!fetchingProfile ? (
                    <div className="w-full max-w-2xl mx-auto">
                        {/* Combination Card - Clickable Trigger */}
                        <div
                            onClick={combination ? () => setIsExpanded(!isExpanded) : null}
                            className={`
                                relative p-8 rounded-2xl text-center transition-all duration-300 transform
                                ${combination
                                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-200 dark:border-indigo-800 cursor-pointer hover:shadow-lg hover:scale-[1.01]'
                                    : 'bg-gray-50 dark:bg-slate-700/50 border-2 border-gray-200 dark:border-slate-600'}
                            `}
                        >
                            {combination ? (
                                <>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-300 font-bold uppercase mb-3 tracking-widest">Your Assigned Combination</p>
                                    <p className="text-4xl md:text-5xl font-black text-indigo-900 dark:text-indigo-100 mb-4">{combination}</p>

                                    <div className="flex items-center justify-center gap-3">
                                        {isLocked && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                                                <span className="text-indigo-600 dark:text-indigo-300 text-xs">🔒 Locked</span>
                                            </div>
                                        )}
                                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200'}`}>
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
                                const semesterModules = MODULE_DATA.filter(m =>
                                    m.level === (user?.studentRef?.level || 1) &&
                                    m.semester === semester
                                );

                                if (semesterModules.length === 0) return null;

                                return (
                                    <div key={semester} className="mb-8 last:mb-0">
                                        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                            Semester {semester}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {semesterModules.map((sub, idx) => {
                                                let colorClass = 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
                                                let icon = '📘';

                                                if (sub.department === 'MATH') { colorClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800'; icon = '📐'; }
                                                else if (sub.department === 'CMIS') { colorClass = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-800'; icon = '💻'; }
                                                else if (sub.department === 'ELTN') { colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800'; icon = '⚡'; }
                                                else if (sub.department === 'IMGT') { colorClass = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800'; icon = '💼'; }

                                                return (
                                                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border-l-4 border-y border-r ${colorClass} hover:shadow-md transition-all cursor-default`}>
                                                        <span className="text-2xl">{icon}</span>
                                                        <div>
                                                            <p className="font-bold text-base">{sub.code} - {sub.title}</p>
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
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">📅</span>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Calendar</h2>
                    </div>

                    <div className="space-y-4">
                        {specialDates.slice(0, 3).map((item, idx) => {
                            let itemColor = getEventColor(item.type);
                            // Adjust for dark mode manually as function returns string
                            if (item.type === 'exam') itemColor = "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200";
                            else if (item.type === 'holiday') itemColor = "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200";
                            else if (item.type === 'academic') itemColor = "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200";
                            else itemColor = "border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300";

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
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">📢</span>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notice Board</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-l-4 border-orange-400 dark:border-orange-600">
                            <h4 className="font-bold text-orange-900 dark:text-orange-200">📝 Exam Registration Open</h4>
                            <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">Registrations for End Semester Exams close on Dec 20.</p>
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-2 block">2 hours ago</span>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-400 dark:border-blue-600">
                            <h4 className="font-bold text-blue-900 dark:text-blue-200">🎓 Special Degree Selection</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">Applications for Level 3 Special Degree selection are now open.</p>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2 block">Yesterday</span>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border-l-4 border-gray-400 dark:border-slate-500">
                            <h4 className="font-bold text-gray-900 dark:text-white">ℹ️ System Maintenance</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">System will be down for upgrades on Sunday 10 PM.</p>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 block">2 days ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Access</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a
                        href="/profile"
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800 hover:shadow-lg transition-all group text-center"
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👤</div>
                        <p className="font-bold text-gray-900 dark:text-white">My Profile</p>
                    </a>
                    <a
                        href="/academic"
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 hover:shadow-lg transition-all group text-center"
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
                        <p className="font-bold text-gray-900 dark:text-white">Academic</p>
                    </a>
                    <a
                        href="/academic"
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800 hover:shadow-lg transition-all group text-center"
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📈</div>
                        <p className="font-bold text-gray-900 dark:text-white">Results</p>
                    </a>
                    <a
                        href="/help"
                        className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800 hover:shadow-lg transition-all group text-center"
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">❓</div>
                        <p className="font-bold text-gray-900 dark:text-white">Help</p>
                    </a>
                </div>
            </div>
        </div>
    )
}
