import { useState, useEffect } from 'react'
import { authService, academicService } from '../services/authService'

export default function StudentAcademic() {
    const [user, setUser] = useState(null)
    const [student, setStudent] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedLevel, setSelectedLevel] = useState('all')

    useEffect(() => {
        const currentUser = authService.getUser()
        setUser(currentUser)
        if (currentUser?.studentRef) {
            setStudent(currentUser.studentRef)
            fetchAcademicData(currentUser.studentRef._id)
        } else {
            setLoading(false)
        }
    }, [])

    const fetchAcademicData = async (studentId) => {
        try {
            const res = await academicService.getStudentProfile(studentId)
            setProfile(res.data)
        } catch (err) {
            console.error('Error fetching academic data:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-4 text-lg text-gray-600 font-medium">Loading academic data...</p>
                </div>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                    <span className="text-6xl mb-4 block">❌</span>
                    <h2 className="text-2xl font-bold text-red-800">Student record not found</h2>
                </div>
            </div>
        )
    }

    // Filter results based on selected level
    const filteredResults = selectedLevel === 'all'
        ? profile?.results || []
        : (profile?.results || []).filter(r => r.module.level === parseInt(selectedLevel))

    return (
        <div className="p-4 md:p-8 animate-fadeIn max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-5xl">🎓</span>
                        <h1 className="text-3xl md:text-4xl font-bold">Academic Records</h1>
                    </div>
                    <p className="text-xl md:text-2xl font-medium opacity-90 mb-4">
                        {student.fullName}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            📋 {student.registrationNumber}
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            📅 {student.batchYear}
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            🎓 Level {student.level}
                        </span>
                    </div>
                </div>
            </div>

            {/* Academic Status & Honours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Status */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <span>📊</span> Academic Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Degree Programme</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{profile?.studentDetails?.degreeProgramme || 'Not Selected'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Combination</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{profile?.studentDetails?.combination || 'Not Selected'}</p>
                        </div>
                    </div>
                </div>

                {/* Projected Honours */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl shadow-sm border-2 border-amber-200 dark:border-amber-800 p-6">
                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                        <span>🎖️</span> Projected Honours
                    </h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{profile?.honours || 'Pass Degree'}</p>
                            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">Based on GPA: {profile?.gpa?.overall?.toFixed(2) || '0.00'}</p>
                        </div>
                        <span className="text-5xl">🏆</span>
                    </div>
                </div>
            </div>

            {/* Dean's List Eligibility */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <span>⭐</span> Dean's List Eligibility
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`p-4 rounded-xl border-2 ${profile?.deansList?.[`level${level}`] === 'ELIGIBLE'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800 shadow-sm'
                            : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
                            }`}>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Level {level}</p>
                            <p className={`font-bold text-sm ${profile?.deansList?.[`level${level}`] === 'ELIGIBLE'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                {profile?.deansList?.[`level${level}`] || 'NOT ELIGIBLE'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-emerald-200 dark:border-emerald-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overall GPA</p>
                        <span className="text-3xl">🏆</span>
                    </div>
                    <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{profile?.gpa?.overall?.toFixed(2) || '0.00'}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-amber-200 dark:border-amber-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Credits</p>
                        <span className="text-3xl">⭐</span>
                    </div>
                    <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{profile?.credits?.total || '0'}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-blue-200 dark:border-blue-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Modules</p>
                        <span className="text-3xl">📚</span>
                    </div>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{profile?.results?.length || '0'}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-purple-200 dark:border-purple-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Level</p>
                        <span className="text-3xl">📈</span>
                    </div>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{student?.level || '-'}</p>
                </div>
            </div>

            {/* Level-wise Performance */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <span>📊</span> Level-wise Performance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(level => (
                        <div key={level} className="text-center">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Level {level}</p>
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border-2 border-indigo-100 dark:border-indigo-800">
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                    {profile?.gpa?.[`level${level}`]?.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">GPA</p>
                                <div className="pt-3 border-t border-indigo-200 dark:border-indigo-800">
                                    <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                                        {profile?.credits?.[`level${level}`] || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Credits</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Module Results Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span>📖</span> Module Results
                    </h3>

                    {/* Level Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedLevel('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedLevel === 'all'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            All Levels
                        </button>
                        {[1, 2, 3, 4].map(level => (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(level.toString())}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedLevel === level.toString()
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                Level {level}
                            </button>
                        ))}
                    </div>
                </div>

                {!profile?.results || profile.results.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No results recorded yet</p>
                        <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Your module results will appear here once they are entered by the administration.</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No results for this level</p>
                        <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Try selecting a different level filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Level</th>
                                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Code</th>
                                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Module Title</th>
                                    <th className="text-center py-4 px-4 text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Credits</th>
                                    <th className="text-center py-4 px-4 text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Marks</th>
                                    <th className="text-center py-4 px-4 text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Grade</th>
                                    <th className="text-center py-4 px-4 text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">GP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.map((result, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                                        <td className="py-4 px-4 font-medium text-gray-700 dark:text-gray-300">L{result.module.level}</td>
                                        <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-400">{result.module.code}</td>
                                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{result.module.title}</td>
                                        <td className="py-4 px-4 text-center text-gray-700 dark:text-gray-300 font-medium">{result.module.credits}</td>
                                        <td className="py-4 px-4 text-center font-semibold text-gray-900 dark:text-white">{result.marks}</td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm ${result.grade.startsWith('A') ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                                                result.grade.startsWith('B') ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                                    result.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' :
                                                        result.grade.startsWith('D') ? 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' :
                                                            'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                                }`}>
                                                {result.grade}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center font-bold text-gray-900 dark:text-white">{result.gradePoint.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
