import UnifiedPageLoader from '../../components/loaders/UnifiedPageLoader';
import React, { useState, useEffect } from 'react';
import { authService, academicService } from '../../services/authService';
import {
    Bell,
    ArrowRight,
    WarningCircle,
    Sun,
    Moon,
    Quotes
} from '@phosphor-icons/react';
import NoticeBoard from '../../components/student/NoticeBoard';
import LmsDeadlineCard from '../../components/student/LmsDeadlineCard';
import FirstLoginModal from '../../components/FirstLoginModal';

const StudentDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(authService.getUser());

    const handleProfileComplete = (updatedUser) => {
        authService.setUser(updatedUser);
        setUser(updatedUser);
    };

    if (user?.needsProfileSetup) {
        return <FirstLoginModal user={user} onComplete={handleProfileComplete} />;
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = authService.getUser();
                if (currentUser && currentUser.studentRef) {
                    const studentId = currentUser.studentRef._id || currentUser.studentRef;
                    const dashRes = await academicService.getStudentDashboard(studentId);
                    setDashboardData(dashRes.data);
                } else {
                    setError('Student profile not linked');
                }
            } catch (err) {
                console.error('❌ Dashboard Error:', err);
                setError(err.response?.data?.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getGreetingInfo = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { label: 'Good Morning', icon: <Sun size={18} weight="duotone" /> };
        if (hour < 18) return { label: 'Good Afternoon', icon: <Sun size={18} weight="duotone" className="text-orange-400" /> };
        return { label: 'Good Evening', icon: <Moon size={18} weight="duotone" className="text-blue-400" /> };
    };
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (loading) return <UnifiedPageLoader />;

    if (error || !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-[500px] p-6">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <WarningCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-[#151313] mb-3 tracking-tight">System Notice</h3>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">{error || 'Unable to retrieve your dashboard data at this moment.'}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-[#151313] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const { student, academic } = dashboardData;
    const firstName = student?.name?.split(' ')[0] || student?.firstName || 'Scholar';
    const greeting = getGreetingInfo();

    return (
        <div className="flex-1 flex flex-col p-4 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full overflow-hidden bg-[#f7f7f5]">
            
            {/* ── Main Dashboard Grid ── */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                {/* HERO GREETING - Ultra Dark Premium (Stays Dark) */}
                <div className="lg:col-span-12 relative rounded-[2.5rem] md:rounded-[3rem] bg-[#151313] p-6 md:p-10 shadow-2xl shadow-black/40 overflow-hidden group border border-white/5">
                    {/* Atmospheric Effects */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#ff5734]/20 to-transparent rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#fccc42]/10 to-transparent rounded-full blur-[100px]" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-10">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-2.5 text-white bg-white/5 w-fit px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-2xl animate-in slide-in-from-left-6 duration-700">
                                    <span className="text-[#ff5734]">{greeting.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">{greeting.label}</span>
                                </div>
                                <div className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] sm:border-l sm:border-white/10 sm:pl-4 flex items-center">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <span className="mx-2 text-slate-700">|</span> {currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight animate-in fade-in slide-in-from-top-4 duration-700">
                                    Hello, <span className="bg-gradient-to-r from-[#ff5734] to-[#fccc42] bg-clip-text text-transparent">{firstName}</span>
                                </h1>
                                <p className="text-slate-400 font-bold text-sm md:text-base max-w-2xl leading-relaxed">
                                    Your academic workspace is <span className="text-white font-black underline decoration-[#ff5734]/40 underline-offset-4">synchronized</span>. 
                                    Currently tracking <span className="text-[#fccc42] font-black">{academic?.enrolledModules?.length || 0} modules</span> for this semester.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-right-12 duration-1000">
                            {/* Academic Status Cards */}
                            <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-8 bg-white/[0.02] backdrop-blur-3xl p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-2xl">
                                <div className="flex flex-col items-center px-2 sm:px-4">
                                    <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Level</span>
                                    <span className="text-xl sm:text-2xl font-black text-white leading-none">{student?.level || '01'}</span>
                                </div>
                                <div className="w-px h-8 sm:h-10 bg-white/5" />
                                <div className="flex flex-col items-center px-2 sm:px-4">
                                    <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Semester</span>
                                    <span className="text-xl sm:text-2xl font-black text-white leading-none">{academic?.currentSemester || '01'}</span>
                                </div>
                                <div className="w-px h-8 sm:h-10 bg-white/5" />
                                <div className="flex flex-col items-center px-2 sm:px-4">
                                    <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">GPA</span>
                                    <span className="text-xl sm:text-2xl font-black text-[#4ade80] leading-none drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">{academic?.currentGpa?.toFixed(2) || '4.00'}</span>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-4 px-8 py-4 rounded-[2rem] bg-[#151313] text-white border border-white/10 shadow-2xl hover:bg-white hover:text-black transition-all cursor-pointer group/status">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)] group-hover/status:bg-[#ff5734]" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Active Status</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FACULTY NOTICES - White Premium Bento */}
                <div className="lg:col-span-8 rounded-[3rem] bg-white border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col min-h-0 h-fit hover:shadow-xl hover:border-slate-300 transition-all group/notices">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1.5rem] bg-[#ff5734]/10 flex items-center justify-center text-[#ff5734] flex-shrink-0 group-hover/notices:bg-[#ff5734] group-hover/notices:text-white transition-all">
                                <Bell size={24} weight="duotone" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#151313] uppercase tracking-[0.3em] leading-none">Faculty Notices</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5734] animate-ping" />
                                    Live Official Stream
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate(`/${id}/notices`)}
                            className="group flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-[#151313] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff5734] transition-all w-full sm:w-auto"
                        >
                            Explore All <ArrowRight size={13} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto no-scrollbar min-h-0">
                        <NoticeBoard isDashboard={true} isDark={false} />
                    </div>
                </div>

                {/* LMS DEADLINES - White Clean */}
                <div className="lg:col-span-4 rounded-[3rem] bg-white border border-slate-200/80 overflow-hidden flex flex-col min-h-0 h-fit shadow-sm hover:shadow-xl transition-all">
                    <LmsDeadlineCard />
                </div>

            </div>
        </div>

    );
};

export default StudentDashboard;
