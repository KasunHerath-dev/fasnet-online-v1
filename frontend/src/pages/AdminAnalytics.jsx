import { useState, useEffect } from 'react';
import { academicService, batchYearService, studentService } from '../services/authService';
import Dropdown from '../components/Dropdown';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, User, GraduationCap, AlertCircle, BarChart3, ArrowUpRight } from 'lucide-react';
import Loader from '../components/Loader';

export default function AdminAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [demographics, setDemographics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        batch: '', // e.g. "2020/2021"
        level: 1,
        semester: 1
    });
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        loadMetadata();
    }, []);

    useEffect(() => {
        if (filters.batch) {
            fetchAnalytics();
            fetchDemographics();
        }
    }, [filters]);

    const loadMetadata = async () => {
        try {
            const res = await batchYearService.getAll();
            // Handle { batchYears: [...] } format or direct array
            const batchData = res.data.batchYears || res.data;

            if (batchData && Array.isArray(batchData)) {
                setBatches(batchData);
                if (batchData.length > 0) {
                    setFilters(prev => ({ ...prev, batch: batchData[0].year }));
                } else {
                    setFilters(prev => ({ ...prev, batch: '2024/2025' }));
                }
            } else {
                console.error("Invalid batch data format:", res.data);
                setBatches([]);
            }
        } catch (error) {
            console.error('Failed to load batches:', error);
            setError('Failed to load batch data');
            setLoading(false);
            setBatches([]);
        }
    };

    const fetchDemographics = async () => {
        try {
            // Fetch demographics for the selected batch
            const res = await studentService.getDemographics({ batchYear: filters.batch });
            setDemographics(res.data);
        } catch (error) {
            console.error("Failed to fetch demographics", error);
            // Don't block main analytics if this fails, just log it
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                batchYear: filters.batch,
                level: filters.level,
                semester: filters.semester
            };
            const res = await academicService.getBatchAnalytics(params);
            setAnalytics(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
            setError(error.response?.data?.message || 'Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    const DEMO_COLORS = ['#3B82F6', '#EC4899', '#9CA3AF']; // Blue (Male), Pink (Female), Gray (Other)

    // Demographics Data for Pie Chart
    const demoPieData = demographics ? [
        { name: 'Male', value: demographics.male },
        { name: 'Female', value: demographics.female }
    ] : [];

    // Transform distribution object to array for BarChart
    const barData = analytics ? Object.keys(analytics.distribution).map(range => ({
        range,
        count: analytics.distribution[range]
    })) : [];

    if (loading && !analytics) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark flex items-center justify-center p-4">
                <div className="bg-white dark:bg-stitch-card-dark border border-red-200 dark:border-red-900 rounded-2xl p-8 text-center max-w-lg w-full shadow-xl">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">Error Loading Analytics</h2>
                    <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
                    <button
                        onClick={() => fetchAnalytics()}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/30"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn p-4 md:p-8">

                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-stitch-blue via-[#6b13ec] to-stitch-pink rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-10">
                    {/* Background Visuals */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                        <div>
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/20">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">Analytics Dashboard</h1>
                            <p className="text-blue-100 text-lg font-medium opacity-90">Overview of student demographics and academic performance</p>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl">
                            <Dropdown
                                value={filters.batch}
                                onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                                options={batches.map(b => ({ value: b.year, label: b.year }))}
                                variant="default"
                                className="w-full sm:w-40 min-w-[160px]"
                                placeholder="Batch"
                            />
                            <Dropdown
                                value={filters.level}
                                onChange={(e) => setFilters({ ...filters, level: Number(e.target.value) })}
                                options={[1, 2, 3, 4].map(l => ({ value: l, label: `Level ${l}` }))}
                                variant="default"
                                className="w-full sm:w-32 min-w-[120px]"
                                placeholder="Level"
                            />
                            <Dropdown
                                value={filters.semester}
                                onChange={(e) => setFilters({ ...filters, semester: Number(e.target.value) })}
                                options={[1, 2].map(s => ({ value: s, label: `Sem ${s}` }))}
                                variant="default"
                                className="w-full sm:w-36 min-w-[120px]"
                                placeholder="Semester"
                            />
                        </div>
                    </div>
                </div>

                {/* Demographics Section */}
                {demographics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-stitch-card-dark rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/10 hover:translate-y-[-4px] transition-transform duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Students</p>
                            <p className="text-5xl font-black text-slate-900 dark:text-white mt-2">{demographics.total}</p>
                        </div>

                        <div className="bg-white dark:bg-stitch-card-dark rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/10 hover:translate-y-[-4px] transition-transform duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Boys</p>
                            <p className="text-5xl font-black text-slate-900 dark:text-white mt-2">{demographics.male}</p>
                        </div>

                        <div className="bg-white dark:bg-stitch-card-dark rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/10 hover:translate-y-[-4px] transition-transform duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Girls</p>
                            <p className="text-5xl font-black text-slate-900 dark:text-white mt-2">{demographics.female}</p>
                        </div>
                    </div>
                )}

                {analytics ? (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                            <div className="p-3 bg-stitch-blue/10 dark:bg-stitch-blue/20 rounded-2xl">
                                <GraduationCap className="w-8 h-8 text-stitch-blue" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                    Academic Performance
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                        {filters.batch}
                                    </span>
                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                        Level {filters.level}
                                    </span>
                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                        Sem {filters.semester}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-stitch-card-dark rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-white/5 hover:shadow-xl transition-shadow">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Exam Candidates</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{analytics.totalStudents}</p>
                            </div>
                            <div className="bg-white dark:bg-stitch-card-dark rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-white/5 hover:shadow-xl transition-shadow relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-10 -mt-10"></div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Passed All</p>
                                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{analytics.passed}</p>
                            </div>
                            <div className="bg-white dark:bg-stitch-card-dark rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-white/5 hover:shadow-xl transition-shadow relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/5 rounded-full -mr-10 -mt-10"></div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Failed / Repeat</p>
                                <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-2">{analytics.failed}</p>
                            </div>
                            <div className="bg-white dark:bg-stitch-card-dark rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-white/5 hover:shadow-xl transition-shadow relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-10 -mt-10"></div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Semester GPA</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">{analytics.avgGPA}</p>
                                    <span className="text-xs font-bold text-slate-400 mb-1.5">avg</span>
                                </div>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gender Distribution Chart */}
                            <div className="bg-white dark:bg-stitch-card-dark rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/5 flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
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
                                                paddingAngle={5}
                                                dataKey="value"
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                {demoPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={DEMO_COLORS[index % DEMO_COLORS.length]} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--tw-prose-bg, #fff)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Central Label */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{demographics.total}</p>
                                    </div>
                                </div>
                            </div>

                            {/* GPA Distribution - Full Width */}
                            <div className="bg-white dark:bg-stitch-card-dark rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/5">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
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
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="#3B82F6"
                                                name="Students"
                                                radius={[8, 8, 8, 8]}
                                                barSize={40}
                                            >
                                                {barData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#7C3AED'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Repeaters Alert */}
                        {analytics.failed > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-red-900 dark:text-red-300 text-lg">Attention Required</h3>
                                        <p className="text-red-700 dark:text-red-400/80">{analytics.failed} students have failed one or more modules in this semester and need to repeat.</p>
                                    </div>
                                </div>
                                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-500/20 transition-all font-bold flex items-center justify-center gap-2 transform active:scale-95">
                                    View Repeat List
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] p-12 text-center border border-slate-100 dark:border-white/5 shadow-xl animate-fadeIn">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Data Available</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 font-medium">
                            There are no semester results found for <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">{filters.batch}</span> (Level {filters.level}, Semester {filters.semester}).
                        </p>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}
