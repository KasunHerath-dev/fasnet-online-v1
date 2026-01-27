import { useState, useEffect } from 'react'
import { academicService, authService } from '../services/authService'
import Loader from '../components/Loader'
import {
    LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts'
import {
    TrendingUp, TrendingDown, Award, Target, Zap, Trophy,
    AlertCircle, CheckCircle, Sparkles, ArrowUp, ArrowDown,
    BookOpen, Activity, Star, ChevronRight
} from 'lucide-react'

// Performance Highlight Component
const PerformanceHighlight = ({ icon: Icon, title, value, subtitle, color, trend }) => {
    const colorClasses = {
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100',
        amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
    };

    const iconColors = {
        emerald: 'text-emerald-600 dark:text-emerald-400',
        blue: 'text-blue-600 dark:text-blue-400',
        purple: 'text-purple-600 dark:text-purple-400',
        amber: 'text-amber-600 dark:text-amber-400',
    };

    return (
        <div className={`rounded-2xl border-2 p-6 ${colorClasses[color]}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${iconColors[color]}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trend > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                        {trend > 0 ? (
                            <ArrowUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-xs font-bold ${trend > 0 ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'
                            }`}>
                            {Math.abs(trend).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-2 opacity-75">{title}</h3>
            <p className="text-3xl font-black mb-1">{value}</p>
            {subtitle && <p className="text-sm font-bold opacity-75">{subtitle}</p>}
        </div>
    );
};

// Insight Card Component
const InsightCard = ({ type, title, message, icon }) => {
    const typeStyles = {
        strength: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
        warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    };

    return (
        <div className={`rounded-2xl border-2 p-5 ${typeStyles[type]}`}>
            <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{icon}</span>
                <div>
                    <h4 className="font-black text-slate-900 dark:text-white mb-1">{title}</h4>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{message}</p>
                </div>
            </div>
        </div>
    );
};

// Achievement Badge Component
const AchievementBadge = ({ icon, title, unlocked, description }) => {
    return (
        <div className={`rounded-xl border-2 p-4 transition-all ${unlocked
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-50'
            }`}>
            <div className="text-center">
                <div className={`text-4xl mb-2 ${unlocked ? '' : 'grayscale'}`}>{icon}</div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1">{title}</h4>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{description}</p>
            </div>
        </div>
    );
};

export default function StudentAnalytics() {
    const [student, setStudent] = useState(null)
    const [profile, setProfile] = useState(null)
    const [semesterResults, setSemesterResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchStudentAnalytics()
    }, [])

    const fetchStudentAnalytics = async () => {
        try {
            const user = authService.getUser()
            if (!user || !user.studentRef) {
                setError('Student profile not found')
                setLoading(false)
                return
            }

            setStudent(user.studentRef)

            // Fetch comprehensive academic profile
            try {
                const profileRes = await academicService.getStudentProfile(user.studentRef._id)
                setProfile(profileRes.data)
            } catch (err) {
                console.warn('Could not fetch full profile:', err)
            }

            // Fetch semester results for progression charts
            try {
                const resultsRes = await academicService.getStudentHistory(user.studentRef._id)
                const historyData = resultsRes.data.map(result => ({
                    semester: `L${result.level}S${result.semester}`,
                    level: result.level,
                    gpa: result.gpa,
                    credits: result.earnedCredits || result.totalCredits,
                    status: result.status
                }))
                setSemesterResults(historyData)
            } catch (apiErr) {
                console.warn('No semester history available yet')
                setSemesterResults([])
            }

            setLoading(false)
        } catch (err) {
            console.error('Failed to fetch analytics:', err)
            setError('Failed to load your academic analytics')
            setLoading(false)
        }
    }

    if (loading) {
        return <Loader />
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-8">
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center max-w-2xl">
                    <span className="text-6xl mb-4 block">❌</span>
                    <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Error</h2>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        )
    }

    // Calculate subject performance for radar chart
    const getSubjectPerformance = () => {
        if (!profile?.results || profile.results.length === 0) return []

        const subjectMap = {}
        profile.results.forEach(result => {
            const subject = result.module.code.match(/^[A-Z]+/)?.[0] || 'OTHER'
            if (!subjectMap[subject]) {
                subjectMap[subject] = { total: 0, count: 0 }
            }
            subjectMap[subject].total += result.gradePoint
            subjectMap[subject].count += 1
        })

        return Object.entries(subjectMap).map(([subject, data]) => ({
            subject,
            performance: parseFloat((data.total / data.count).toFixed(2)),
            fullMark: 4.0
        })).sort((a, b) => b.performance - a.performance)
    }

    // Calculate level-wise performance
    const getLevelPerformance = () => {
        const levels = [1, 2, 3, 4]
        return levels.map(level => ({
            level: `Level ${level}`,
            gpa: profile?.gpa?.[`level${level}`] || 0,
            credits: profile?.credits?.[`level${level}`] || 0
        }))
    }

    // Calculate grade distribution
    const getGradeDistribution = () => {
        if (!profile?.results || profile.results.length === 0) return []

        const gradeMap = {}
        profile.results.forEach(result => {
            const grade = result.grade
            gradeMap[grade] = (gradeMap[grade] || 0) + 1
        })

        const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
        return gradeOrder
            .filter(grade => gradeMap[grade])
            .map(grade => ({
                grade,
                count: gradeMap[grade]
            }))
    }

    const subjectPerformance = getSubjectPerformance()
    const levelPerformance = getLevelPerformance()
    const gradeDistribution = getGradeDistribution()
    const hasData = semesterResults.length > 0 || (profile?.results && profile.results.length > 0)

    // Calculate insights
    const currentGPA = profile?.gpa?.overall || student?.cumulativeGPA || 0
    const creditsEarned = profile?.credits?.total || student?.totalCreditsEarned || 0
    const creditsRequired = 120
    const progressPercentage = (creditsEarned / creditsRequired) * 100
    const isDeansList = currentGPA >= 3.5
    const bestSubject = subjectPerformance[0]
    const weakestSubject = subjectPerformance[subjectPerformance.length - 1]

    // Calculate trend (comparing last two semesters if available)
    const trend = semesterResults.length >= 2
        ? ((semesterResults[semesterResults.length - 1].gpa - semesterResults[semesterResults.length - 2].gpa) / semesterResults[semesterResults.length - 2].gpa) * 100
        : 0

    // Grade distribution colors
    const GRADE_COLORS = {
        'A+': '#059669', 'A': '#10b981', 'A-': '#34d399',
        'B+': '#3b82f6', 'B': '#60a5fa', 'B-': '#93c5fd',
        'C+': '#f59e0b', 'C': '#fbbf24', 'C-': '#fcd34d',
        'D': '#ef4444', 'F': '#dc2626'
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-display transition-colors duration-500">

            {/* Command Center Hero Section */}
            <div className="relative w-full overflow-hidden pb-12 sm:pb-16 lg:pb-20">
                <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                </div>

                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-700 opacity-10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
                        <div className="flex-1 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg w-fit">
                                <Activity className="w-4 h-4 text-purple-300" />
                                <span className="text-white text-xs font-bold tracking-wide uppercase">Analytics</span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight flex items-center gap-3">
                                    <span className="text-4xl sm:text-5xl">📊</span>
                                    Academic Analytics
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                                    {student?.fullName}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="text-white text-xs sm:text-sm font-bold">📋 {student?.registrationNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="text-white text-xs sm:text-sm font-bold">🎓 Level {student?.level}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="text-white text-xs sm:text-sm font-bold">📅 {student?.batchYear}</span>
                                </div>
                                {isDeansList && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30">
                                        <Trophy className="w-4 h-4 text-emerald-300" />
                                        <span className="text-emerald-100 text-xs sm:text-sm font-bold">Dean's List</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-12 sm:pb-20">

                {hasData ? (
                    <div className="space-y-8">

                        {/* Key Performance Indicators */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <PerformanceHighlight
                                icon={Award}
                                title="Overall GPA"
                                value={currentGPA.toFixed(2)}
                                subtitle={profile?.honours || 'Keep improving'}
                                color="purple"
                                trend={trend}
                            />
                            <PerformanceHighlight
                                icon={Target}
                                title="Credits Earned"
                                value={creditsEarned}
                                subtitle={`${creditsRequired - creditsEarned} to graduate`}
                                color="blue"
                            />
                            <PerformanceHighlight
                                icon={BookOpen}
                                title="Current Level"
                                value={`Level ${student?.level || 1}`}
                                subtitle={student?.academicStatus || 'Regular'}
                                color="emerald"
                            />
                            <PerformanceHighlight
                                icon={Sparkles}
                                title="Progress"
                                value={`${progressPercentage.toFixed(0)}%`}
                                subtitle="Toward graduation"
                                color="amber"
                            />
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column - Main Charts */}
                            <div className="lg:col-span-2 space-y-8">

                                {/* GPA Progression Chart */}
                                {semesterResults.length > 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">GPA Progression</h2>
                                        </div>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <LineChart data={semesterResults}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-20" />
                                                <XAxis
                                                    dataKey="semester"
                                                    stroke="#6B7280"
                                                    style={{ fontSize: '14px', fontWeight: 600 }}
                                                />
                                                <YAxis
                                                    domain={[0, 4.0]}
                                                    stroke="#6B7280"
                                                    style={{ fontSize: '14px', fontWeight: 600 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#FFFFFF',
                                                        borderRadius: '12px',
                                                        border: '1px solid #E5E7EB',
                                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                                <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 700 }} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="gpa"
                                                    stroke="#8B5CF6"
                                                    strokeWidth={4}
                                                    name="GPA"
                                                    dot={{ fill: '#8B5CF6', r: 8, strokeWidth: 2, stroke: '#fff' }}
                                                    activeDot={{ r: 10 }}
                                                />
                                                {/* Target line */}
                                                <Line
                                                    type="monotone"
                                                    dataKey={() => 3.5}
                                                    stroke="#10B981"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                    name="Dean's List (3.5)"
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Charts Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Subject Performance Radar */}
                                    {subjectPerformance.length > 0 && (
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                                    <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Subject Strengths</h2>
                                            </div>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <RadarChart data={subjectPerformance}>
                                                    <PolarGrid stroke="#E5E7EB" className="dark:opacity-20" />
                                                    <PolarAngleAxis
                                                        dataKey="subject"
                                                        style={{ fontSize: '12px', fontWeight: 700 }}
                                                    />
                                                    <PolarRadiusAxis angle={90} domain={[0, 4]} />
                                                    <Radar
                                                        name="Performance"
                                                        dataKey="performance"
                                                        stroke="#3B82F6"
                                                        fill="#3B82F6"
                                                        fillOpacity={0.6}
                                                        strokeWidth={2}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#FFFFFF',
                                                            borderRadius: '12px',
                                                            border: '1px solid #E5E7EB',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}

                                    {/* Grade Distribution */}
                                    {gradeDistribution.length > 0 && (
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                                    <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Grade Distribution</h2>
                                            </div>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={gradeDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ grade, count }) => `${grade} (${count})`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="count"
                                                    >
                                                        {gradeDistribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade] || '#94a3b8'} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#FFFFFF',
                                                            borderRadius: '12px',
                                                            border: '1px solid #E5E7EB',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* Level Performance Bar Chart */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                            <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Level Performance</h2>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={levelPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-20" />
                                            <XAxis
                                                dataKey="level"
                                                stroke="#6B7280"
                                                style={{ fontSize: '14px', fontWeight: 600 }}
                                            />
                                            <YAxis
                                                stroke="#6B7280"
                                                style={{ fontSize: '14px', fontWeight: 600 }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#FFFFFF',
                                                    borderRadius: '12px',
                                                    border: '1px solid #E5E7EB',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 700 }} />
                                            <Bar dataKey="gpa" fill="#8B5CF6" name="GPA" radius={[8, 8, 0, 0]} />
                                            <Bar dataKey="credits" fill="#10B981" name="Credits" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Right Column - Insights & Highlights */}
                            <div className="space-y-8">

                                {/* Achievements */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                            <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Achievements</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <AchievementBadge
                                            icon="🏆"
                                            title="Dean's List"
                                            unlocked={isDeansList}
                                            description="GPA ≥ 3.5"
                                        />
                                        <AchievementBadge
                                            icon="🎯"
                                            title="First Class"
                                            unlocked={currentGPA >= 3.7}
                                            description="GPA ≥ 3.7"
                                        />
                                        <AchievementBadge
                                            icon="⭐"
                                            title="Half Way"
                                            unlocked={creditsEarned >= 60}
                                            description="60+ Credits"
                                        />
                                        <AchievementBadge
                                            icon="🚀"
                                            title="Final Stretch"
                                            unlocked={creditsEarned >= 90}
                                            description="90+ Credits"
                                        />
                                    </div>
                                </div>

                                {/* Performance Insights */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Insights</h2>
                                    </div>
                                    <div className="space-y-4">
                                        {bestSubject && (
                                            <InsightCard
                                                type="strength"
                                                icon="🌟"
                                                title="Best Performance"
                                                message={`Excellent in ${bestSubject.subject} (${bestSubject.performance.toFixed(2)} GPA)`}
                                            />
                                        )}

                                        {weakestSubject && weakestSubject.performance < 3.0 && (
                                            <InsightCard
                                                type="warning"
                                                icon="⚠️"
                                                title="Needs Attention"
                                                message={`Focus more on ${weakestSubject.subject} subjects`}
                                            />
                                        )}

                                        <InsightCard
                                            type="info"
                                            icon="💡"
                                            title={currentGPA >= 3.7 ? "Excellent Progress!" : "Keep Improving"}
                                            message={
                                                currentGPA >= 3.7
                                                    ? "You're on track for First Class Honours!"
                                                    : `${(3.7 - currentGPA).toFixed(2)} GPA points to First Class`
                                            }
                                        />

                                        <InsightCard
                                            type="info"
                                            icon="🎯"
                                            title="Graduation Progress"
                                            message={`${creditsRequired - creditsEarned} credits remaining to graduate`}
                                        />
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Quick Stats</h2>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Total Modules</span>
                                            <span className="text-xl font-black text-slate-900 dark:text-white">{profile?.results?.length || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Average Credits/Semester</span>
                                            <span className="text-xl font-black text-slate-900 dark:text-white">
                                                {semesterResults.length > 0
                                                    ? (creditsEarned / semesterResults.length).toFixed(0)
                                                    : '0'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Semesters Completed</span>
                                            <span className="text-xl font-black text-slate-900 dark:text-white">{semesterResults.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                        <div className="text-slate-300 dark:text-slate-700 text-8xl mb-6">📊</div>
                        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">No Analytics Available Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            Your academic analytics will appear here once you complete your first semester and results are processed by the administration.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
