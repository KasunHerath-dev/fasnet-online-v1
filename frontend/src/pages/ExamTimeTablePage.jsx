import React, { useState, useMemo } from 'react'
import { EXAM_TIME_TABLE } from '../data/examTimeTable'

export default function ExamTimeTablePage() {
    const [selectedLevel, setSelectedLevel] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredData = useMemo(() => {
        return EXAM_TIME_TABLE.map(day => {
            const filteredSessions = day.sessions.filter(session => {
                // Search filter
                const searchLower = searchQuery.toLowerCase()
                const matchesSearch = session.code.toLowerCase().includes(searchLower) ||
                    session.title.toLowerCase().includes(searchLower)

                if (!matchesSearch) return false

                // Level filter
                if (selectedLevel === 'All') return true

                // Infer level from code (e.g., CMIS 1113 -> Level 1)
                // Codes are like CMIS 1113, CMIS 3124/3224
                const codeParts = session.code.split(' ')
                if (codeParts.length > 1) {
                    const numPart = codeParts[1]
                    // Handle slash cases like 3124/3224 - accept if any matches
                    if (numPart.includes('/')) {
                        const nums = numPart.split('/')
                        return nums.some(n => n.startsWith(selectedLevel))
                    }
                    return numPart.startsWith(selectedLevel)
                }
                return true
            })

            return {
                ...day,
                sessions: filteredSessions
            }
        }).filter(day => day.sessions.length > 0)
    }, [selectedLevel, searchQuery])

    const getLevelBadgeColor = (code) => {
        const level = code.split(' ')[1]?.charAt(0)
        switch (level) {
            case '1': return 'bg-blue-100 text-blue-800 border-blue-200'
            case '2': return 'bg-green-100 text-green-800 border-green-200'
            case '3': return 'bg-purple-100 text-purple-800 border-purple-200'
            case '4': return 'bg-orange-100 text-orange-800 border-orange-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🗓️</span>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exam Time Table</h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Semester I Examination - February 2026 (Academic Year 2023/2024)
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['All', '1', '2', '3', '4'].map(level => (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(level)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${selectedLevel === level
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300'
                                    }`}
                            >
                                {level === 'All' ? 'All Levels' : `Level ${level}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative w-full md:w-64">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search subject or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="space-y-6">
                {filteredData.length > 0 ? (
                    filteredData.map((day, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="bg-gray-50 dark:bg-slate-900/50 p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-gray-200 dark:border-slate-700 shadow-sm">
                                        <span className="text-xs font-bold text-gray-500 uppercase">{new Date(day.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-xl font-black text-gray-900 dark:text-white">{new Date(day.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{day.day}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{day.date}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold">
                                    {day.sessions.length} Sessions
                                </span>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-slate-700">
                                {day.sessions.map((session, sIdx) => (
                                    <div key={sIdx} className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="md:w-48 flex-shrink-0">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-mono text-sm">
                                                <span>🕒</span>
                                                {session.time}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start md:items-center justify-between gap-4 mb-1">
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                    {session.title}
                                                </h4>
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getLevelBadgeColor(session.code)}`}>
                                                    {session.code}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                Code: <span className="font-mono">{session.code}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-600">
                        <span className="text-4xl mb-3 block">👻</span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No exams found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center text-sm text-gray-400">
                Data based on Semester I Exam Time Table - February 2026
            </div>
        </div>
    )
}
