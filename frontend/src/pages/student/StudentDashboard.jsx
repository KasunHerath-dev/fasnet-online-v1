import UnifiedPageLoader from '../../components/loaders/UnifiedPageLoader';

import React, { useState, useEffect } from 'react';
import { authService, academicService } from '../../services/authService';
import {
    BookOpen,
    Clock,
    MapPin,
    Award,
    ArrowUpRight,
    AlertCircle,
    PartyPopper,
    Calendar,
    TrendingUp,
    User,
    TrendingDown,
    CheckCircle2,
    XCircle,
    Bell
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const currentUser = authService.getUser();
                if (currentUser && currentUser.studentRef) {
                    const studentId = currentUser.studentRef._id || currentUser.studentRef;
                    const response = await academicService.getStudentDashboard(studentId);
                    setDashboardData(response.data);
                } else {
                    setError('Student profile not linked');
                }
            } catch (err) {
                console.error('❌ Error:', err);
                setError(err.response?.data?.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Mock data for charts and additional features
    const performanceData = [
        { semester: 'S1', gpa: 3.2 },
        { semester: 'S2', gpa: 3.5 },
        { semester: 'S3', gpa: 3.7 },
        { semester: 'S4', gpa: 3.6 },
        { semester: 'S5', gpa: 3.85 }
    ];

    const mockDeadlines = [
        { id: 1, title: 'Database Assignment', course: 'CS-301', date: 'Feb 10', type: 'urgent', color: 'rose' },
        { id: 2, title: 'Algorithm Project', course: 'CS-401', date: 'Feb 12', type: 'important', color: 'amber' },
        { id: 3, title: 'Software Engineering Quiz', course: 'SE-302', date: 'Feb 14', type: 'normal', color: 'blue' },
        { id: 4, title: 'Network Lab Report', course: 'NW-201', date: 'Feb 16', type: 'normal', color: 'emerald' },
        { id: 5, title: 'ML Mid-Term Preparation', course: 'AI-501', date: 'Feb 20', type: 'important', color: 'purple' }
    ];

    const mockActivities = [
        { id: 1, type: 'grade', title: 'Database Systems Grade Posted', time: '2 hours ago', icon: Award },
        { id: 2, type: 'announcement', title: 'Library Hours Extended', time: '5 hours ago', icon: Bell },
        { id: 3, type: 'resource', title: 'New Lecture Notes Available', time: '1 day ago', icon: BookOpen },
        { id: 4, type: 'event', title: 'Tech Talk: AI in Healthcare', time: '2 days ago', icon: Calendar }
    ];

    if (loading) {
        return <UnifiedPageLoader />;
    }

    if (error || !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">{error || 'No data available'}</p>
                </div>
            </div>
        );
    }

    const { student, academic } = dashboardData;
    const firstName = student?.name?.split(' ')[0] || 'Student';

    // Calculate mock GPA data
    const currentGPA = 3.85;
    const previousGPA = 3.60;
    const gpaChange = currentGPA - previousGPA;
    const gpaColor = currentGPA >= 3.7 ? 'emerald' : currentGPA >= 3.0 ? 'blue' : 'amber';

    // Calculate mock attendance
    const attendancePercent = 92;
    const attendanceColor = attendancePercent >= 90 ? 'emerald' : attendancePercent >= 75 ? 'amber' : 'rose';

    return (
        <div className="min-h-full p-4 space-y-4">
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[180px]">

                {/* HERO BANNER - Wide */}
                <div className="md:col-span-4 lg:col-span-4 md:row-span-1 relative rounded-3xl overflow-hidden group">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>

                    {/* Animated particles (simple version) */}
                    <div className="absolute inset-0 opacity-20">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${2 + Math.random() * 2}s`
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium tracking-wider uppercase mb-1">
                                Dashboard
                            </p>
                            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
                                {getGreeting()}, <span className="text-pink-200">{firstName}</span>
                            </h1>
                        </div>

                        <div className="flex items-end justify-between">
                            <div className="flex gap-3">
                                <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm">
                                    Level {student?.level || '1'}
                                </div>
                                <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm">
                                    Semester {academic?.currentSemester || '1'}
                                </div>
                                <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm">
                                    45 Credits
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-48">
                                <div className="flex justify-between text-white/80 text-xs mb-1">
                                    <span>Semester Progress</span>
                                    <span>60%</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-pink-400 to-purple-300 w-[60%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GPA CARD - Square */}
                <div className="md:col-span-2 lg:col-span-2 md:row-span-1 relative rounded-3xl overflow-hidden bg-white/5 dark:bg-white/3 backdrop-blur-xl border border-white/10 group hover:-translate-y-1 transition-all duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br from-${gpaColor}-500/10 to-${gpaColor}-600/5`}></div>

                    <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Award className={`w-5 h-5 text-${gpaColor}-400`} />
                                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">Current GPA</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-5xl font-black text-${gpaColor}-500 tabular-nums`}>
                                    {currentGPA.toFixed(2)}
                                </span>
                                <div className={`flex items-center gap-1 text-${gpaChange >= 0 ? 'emerald' : 'rose'}-500`}>
                                    {gpaChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span className="text-sm font-semibold">
                                        {Math.abs(gpaChange).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-600 text-xs">
                            vs previous semester: {previousGPA.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* ATTENDANCE RING - Tall */}
                <div className="md:col-span-2 lg:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden bg-white/5 dark:bg-white/3 backdrop-blur-xl border border-white/10 group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative z-10 h-full p-6 flex flex-col items-center justify-center">
                        <h3 className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-4">Attendance</h3>

                        {/* SVG Ring Chart */}
                        <div className="relative w-32 h-32">
                            <svg className="transform -rotate-90" viewBox="0 0 120 120">
                                {/* Background circle */}
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    className="text-slate-700/20 dark:text-slate-800/30"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    strokeDasharray={`${2 * Math.PI * 50}`}
                                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - attendancePercent / 100)}`}
                                    className={`text-${attendanceColor}-500 transition-all duration-1000 ease-out`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-3xl font-black text-${attendanceColor}-500 tabular-nums`}>
                                    {attendancePercent}%
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 w-full space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-500">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    Present
                                </span>
                                <span className="font-semibold text-white">42</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-500">
                                    <XCircle className="w-4 h-4 text-rose-500" />
                                    Absent
                                </span>
                                <span className="font-semibold text-white">4</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DEADLINES TIMELINE - Tall */}
                <div className="md:col-span-2 lg:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden bg-white/5 dark:bg-white/3 backdrop-blur-xl border border-white/10 group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative z-10 h-full p-6">
                        <h3 className="text-white font-bold text-lg mb-4">Upcoming Deadlines</h3>

                        <div className="space-y-4 overflow-y-auto max-h-[calc(100%-3rem)]">
                            {mockDeadlines.map((deadline, index) => (
                                <div key={deadline.id} className="flex gap-3 group/item cursor-pointer">
                                    {/* Timeline dot */}
                                    <div className="relative flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full bg-${deadline.color}-500 ring-4 ring-${deadline.color}-500/20`}></div>
                                        {index < mockDeadlines.length - 1 && (
                                            <div className="w-0.5 h-full bg-gradient-to-b from-slate-600 to-transparent mt-1"></div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-2">
                                        <p className="text-white font-semibold text-sm group-hover/item:text-purple-300 transition-colors">
                                            {deadline.title}
                                        </p>
                                        <p className="text-slate-500 text-xs mt-0.5">{deadline.course}</p>
                                        <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {deadline.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PERFORMANCE CHART - Tall */}
                <div className="md:col-span-2 lg:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden bg-white/5 dark:bg-white/3 backdrop-blur-xl border border-white/10 group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative z-10 h-full p-6">
                        <h3 className="text-white font-bold text-lg mb-4">Performance Trend</h3>

                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={performanceData}>
                                <defs>
                                    <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="semester"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[2.5, 4.0]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="gpa"
                                    stroke="#a855f7"
                                    strokeWidth={3}
                                    dot={{ fill: '#a855f7', r: 5 }}
                                    activeDot={{ r: 7 }}
                                    fill="url(#gpaGradient)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ACTIVITY FEED - Wide */}
                <div className="md:col-span-4 lg:col-span-6 md:row-span-1 relative rounded-3xl overflow-hidden bg-white/5 dark:bg-white/3 backdrop-blur-xl border border-white/10 group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative z-10 h-full p-6">
                        <h3 className="text-white font-bold text-lg mb-4">Recent Activity</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {mockActivities.map((activity) => {
                                const Icon = activity.icon;
                                return (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group/activity">
                                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover/activity:bg-purple-500 group-hover/activity:text-white transition-all">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{activity.title}</p>
                                            <p className="text-slate-500 text-xs mt-0.5">{activity.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
