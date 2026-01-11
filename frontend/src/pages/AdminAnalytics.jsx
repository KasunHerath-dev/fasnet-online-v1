import Loader from '../components/Loader';

// ... existing imports ...

export default function AdminAnalytics() {
    // ... existing code ...

    if (loading && !analytics) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Analytics</h2>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={() => fetchAnalytics()}
                        className="mt-4 btn bg-red-600 text-white hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">

                {/* Hero Header */}
                <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-6 md:p-8 shadow-2xl">
                    {/* Background Visuals - Isolated in overflow-hidden container */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                        <div className="hidden md:block absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                        <div className="hidden md:block absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -ml-40 -mb-40"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-2">Analytics Dashboard</h1>
                                <p className="text-blue-200 text-sm md:text-lg font-medium">Overview of student demographics and academic performance</p>
                            </div>

                            {/* Filters - Glassmorphism style */}
                            <div className="flex flex-wrap gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl">
                                <Dropdown
                                    value={filters.batch}
                                    onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                                    options={batches.map(b => ({ value: b.year, label: b.year }))}
                                    variant="default"
                                    className="w-full sm:w-40"
                                    placeholder="Batch"
                                />
                                <Dropdown
                                    value={filters.level}
                                    onChange={(e) => setFilters({ ...filters, level: Number(e.target.value) })}
                                    options={[1, 2, 3, 4].map(l => ({ value: l, label: `Level ${l}` }))}
                                    variant="default"
                                    className="w-full sm:w-32"
                                    placeholder="Level"
                                />
                                <Dropdown
                                    value={filters.semester}
                                    onChange={(e) => setFilters({ ...filters, semester: Number(e.target.value) })}
                                    options={[1, 2].map(s => ({ value: s, label: `Sem ${s}` }))}
                                    variant="default"
                                    className="w-full sm:w-36"
                                    placeholder="Semester"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demographics Section */}
                {demographics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Students</p>
                            <p className="text-4xl font-black text-gray-900 mt-1">{demographics.total}</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Boys</p>
                            <p className="text-4xl font-black text-gray-900 mt-1">{demographics.male}</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Girls</p>
                            <p className="text-4xl font-black text-gray-900 mt-1">{demographics.female}</p>
                        </div>
                    </div>
                )}

                {analytics ? (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-200/60">
                            <GraduationCap className="w-8 h-8 text-indigo-900" />
                            <h2 className="text-2xl font-black text-gray-900">
                                Academic Performance
                            </h2>
                            <span className="ml-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                                {filters.batch} • Level {filters.level} • Sem {filters.semester}
                            </span>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:shadow-xl transition-shadow">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Exam Candidates</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">{analytics.totalStudents}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:shadow-xl transition-shadow">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Passed All</p>
                                <p className="text-3xl font-black text-emerald-600 mt-2">{analytics.passed}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100 hover:shadow-xl transition-shadow">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Failed / Repeat</p>
                                <p className="text-3xl font-black text-red-600 mt-2">{analytics.failed}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Semester GPA</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-black text-purple-600 mt-2">{analytics.avgGPA}</p>
                                    <span className="text-sm font-bold text-gray-400 mb-1.5">avg</span>
                                </div>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gender Distribution Chart */}
                            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-500" />
                                        Gender Distribution
                                    </h3>
                                </div>
                                <div className="relative h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={demoPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={110}
                                                paddingAngle={0}
                                                dataKey="value"
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                {demoPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={DEMO_COLORS[index % DEMO_COLORS.length]} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Central Label */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total</p>
                                        <p className="text-3xl font-black text-gray-800">{demographics.total}</p>
                                    </div>
                                </div>
                            </div>

                            {/* GPA Distribution - Full Width */}
                            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-blue-500" />
                                        GPA Distribution
                                    </h3>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis
                                                dataKey="range"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#F3F4F6' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="#3B82F6"
                                                name="Students"
                                                radius={[6, 6, 0, 0]}
                                                barSize={40}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Repeaters Alert */}
                        {analytics.failed > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 animate-pulse-slow">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-red-900 text-lg">Attention Required</h3>
                                        <p className="text-red-700">{analytics.failed} students have failed one or more modules in this semester and need to repeat.</p>
                                    </div>
                                </div>
                                <button className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg hover:shadow-red-200 transition-all font-semibold flex items-center justify-center gap-2">
                                    View Repeat List
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            There are no semester results found for <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{filters.batch}</span> (Level {filters.level}, Semester {filters.semester}).
                        </p>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}
