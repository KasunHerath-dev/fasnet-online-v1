import { useState, useEffect } from 'react'
import { academicService, authService } from '../services/authService'
import Loader from '../components/Loader'
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

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
            <div className="p-8 max-w-2xl mx-auto">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                    <span className="text-6xl mb-4 block">❌</span>
                    <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-600">{error}</p>
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
            performance: (data.total / data.count).toFixed(2),
            fullMark: 4.0
        }))
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

    const subjectPerformance = getSubjectPerformance()
    const levelPerformance = getLevelPerformance()
    const hasData = semesterResults.length > 0 || (profile?.results && profile.results.length > 0)

    return (
        <div className="p-4 md:p-8 animate-fadeIn max-w-[1400px] mx-auto space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-5xl">📊</span>
                        <h1 className="text-3xl md:text-4xl font-bold">Academic Analytics</h1>
                    </div>
                    <p className="text-xl md:text-2xl font-medium opacity-90 mb-4">
                        {student?.fullName}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            📋 {student?.registrationNumber}
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            🎓 Level {student?.level}
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            📅 {student?.batchYear}
                        </span>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border-2 border-indigo-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Current Level</p>
                        <span className="text-3xl">📚</span>
                    </div>
                    <p className="text-4xl font-bold text-indigo-600">{student?.level || 1}</p>
                    <p className="text-xs text-gray-500 mt-1">Academic Year {student?.batchYear}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border-2 border-purple-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Overall GPA</p>
                        <span className="text-3xl">🎯</span>
                    </div>
                    <p className="text-4xl font-bold text-purple-600">
                        {profile?.gpa?.overall > 0 ? profile.gpa.overall.toFixed(2) : student?.cumulativeGPA?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {profile?.honours || 'Building your record'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border-2 border-green-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Credits</p>
                        <span className="text-3xl">⭐</span>
                    </div>
                    <p className="text-4xl font-bold text-green-600">
                        {profile?.credits?.total || student?.totalCreditsEarned || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Out of 120 required</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border-2 border-amber-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Academic Status</p>
                        <span className="text-3xl">
                            {student?.academicStatus === 'Regular' ? '✅' :
                                student?.academicStatus === 'Probation' ? '⚠️' : '📌'}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">
                        {student?.academicStatus || 'Regular'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Current standing</p>
                </div>
            </div>

            {hasData ? (
                <>
                    {/* GPA Progression Chart */}
                    {semesterResults.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">📈</span>
                                <h2 className="text-2xl font-bold text-gray-900">GPA Progression</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={semesterResults}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="semester"
                                        stroke="#6B7280"
                                        style={{ fontSize: '14px', fontWeight: 500 }}
                                    />
                                    <YAxis
                                        domain={[0, 4.0]}
                                        stroke="#6B7280"
                                        style={{ fontSize: '14px', fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '12px',
                                            border: '1px solid #E5E7EB',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="gpa"
                                        stroke="#8B5CF6"
                                        strokeWidth={3}
                                        name="GPA"
                                        dot={{ fill: '#8B5CF6', r: 6 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Subject Performance Radar */}
                        {subjectPerformance.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-3xl">🎨</span>
                                    <h2 className="text-2xl font-bold text-gray-900">Subject Strengths</h2>
                                </div>
                                <ResponsiveContainer width="100%" height={350}>
                                    <RadarChart data={subjectPerformance}>
                                        <PolarGrid stroke="#E5E7EB" />
                                        <PolarAngleAxis
                                            dataKey="subject"
                                            style={{ fontSize: '12px', fontWeight: 600 }}
                                        />
                                        <PolarRadiusAxis angle={90} domain={[0, 4]} />
                                        <Radar
                                            name="Performance"
                                            dataKey="performance"
                                            stroke="#8B5CF6"
                                            fill="#8B5CF6"
                                            fillOpacity={0.6}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: '12px',
                                                border: '1px solid #E5E7EB'
                                            }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Level-wise Performance */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">📊</span>
                                <h2 className="text-2xl font-bold text-gray-900">Level Performance</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={levelPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="level"
                                        stroke="#6B7280"
                                        style={{ fontSize: '14px', fontWeight: 500 }}
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        style={{ fontSize: '14px', fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '12px',
                                            border: '1px solid #E5E7EB'
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 600 }} />
                                    <Bar dataKey="gpa" fill="#8B5CF6" name="GPA" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="credits" fill="#10B981" name="Credits" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-4xl">🌟</span>
                                <h3 className="text-lg font-bold text-green-900">Strengths</h3>
                            </div>
                            <p className="text-sm text-green-800">
                                {subjectPerformance.length > 0 && subjectPerformance[0]?.performance > 3.5
                                    ? `Excellent performance in ${subjectPerformance[0]?.subject}`
                                    : 'Keep up the consistent effort!'}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-4xl">🎯</span>
                                <h3 className="text-lg font-bold text-blue-900">Goal Tracking</h3>
                            </div>
                            <p className="text-sm text-blue-800">
                                {(profile?.credits?.total || 0) >= 90
                                    ? 'On track for graduation!'
                                    : `${120 - (profile?.credits?.total || 0)} credits to go`}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-4xl">💡</span>
                                <h3 className="text-lg font-bold text-purple-900">Recommendation</h3>
                            </div>
                            <p className="text-sm text-purple-800">
                                {(profile?.gpa?.overall || student?.cumulativeGPA || 0) >= 3.7
                                    ? 'Excellent! Aim for First Class Honours!'
                                    : 'Focus on improving consistency'}
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                /* Empty State */
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="text-gray-300 text-8xl mb-6">📊</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">No Analytics Available Yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Your academic analytics will appear here once you complete your first semester and results are processed by the administration.
                    </p>
                </div>
            )}
        </div>
    )
}
