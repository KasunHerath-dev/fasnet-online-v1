import React, { useState, useEffect, useMemo } from 'react';
import { authService, academicService } from '../../services/authService';
import UnifiedPageLoader from '../../components/loaders/UnifiedPageLoader';
import Dropdown from '../../components/Dropdown';

import {
    Award,
    BookCheck,
    Target,
    TrendingUp,
    X,
    Clock
} from 'lucide-react';
import ScrollReveal from '../../components/ui/ScrollReveal';

// --- VISUAL COMPONENTS ---

const GradeBadge = ({ grade }) => {
    const getGradeColor = (grade) => {
        if (!grade) return 'bg-slate-100 text-slate-500 border-slate-200';
        if (grade.startsWith('A')) return 'bg-moccaccino-50 text-moccaccino-600 border-moccaccino-200';
        if (grade.startsWith('B')) return 'bg-orange-50 text-orange-600 border-orange-200';
        if (grade.startsWith('C')) return 'bg-amber-50 text-amber-600 border-amber-200';
        if (grade === 'D+' || grade === 'D') return 'bg-red-50 text-red-600 border-red-200';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    return (
        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-bold border ${getGradeColor(grade)}`}>
            {grade || 'Pending'}
        </span>
    );
};

const MetricCard = ({ title, value, subtext, icon: Icon, colorClass }) => {
    return (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 flex items-center justify-between transition-all hover:shadow-md hover:bg-white/80">
            <div>
                <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-slate-800">{value}</h3>
                    {subtext && <span className="text-sm font-bold text-slate-400">{subtext}</span>}
                </div>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
                <Icon className="w-7 h-7" />
            </div>
        </div>
    );
};

const ModuleCard = ({ module, result }) => {
    return (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-md hover:bg-white/80 transition-all flex flex-col justify-between h-full group">
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 px-2 py-1 rounded-md">
                        {module.code}
                    </span>
                    <GradeBadge grade={result?.grade} />
                </div>
                <h4 className="font-bold text-slate-800 leading-snug group-hover:text-moccaccino-600 transition-colors">
                    {module.title}
                </h4>
            </div>

            <div className="flex items-end justify-between border-t border-slate-50 pt-3 mt-auto">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase">Credits</span>
                    <span className="text-lg font-black text-slate-700">{module.credits}</span>
                </div>
                {result?.gradePoint !== undefined && (
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase">GP</span>
                        <span className={`text-lg font-black ${result.gradePoint >= 3.0 ? 'text-emerald-500' : 'text-slate-700'}`}>
                            {result.gradePoint.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};




// --- MAIN COMPONENT ---

export default function StudentAcademics() {
    const [user, setUser] = useState(null)
    const [student, setStudent] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all');
    const [showDegreeRules, setShowDegreeRules] = useState(false);
    const [showGradingScale, setShowGradingScale] = useState(false);

    // State for data
    const [modules, setModules] = useState([]);
    const [combinationInfo, setCombinationInfo] = useState({ code: '', description: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // 1. Get User
                const currentUser = authService.getUser();
                setUser(currentUser);

                let profilePromise = Promise.resolve(null);
                if (currentUser?.studentRef?._id) {
                    profilePromise = academicService.getStudentProfile(currentUser.studentRef._id);
                }

                // 3. Get Student's Combination Modules
                const modulesPromise = academicService.getStudentModules();

                const [res, modulesRes] = await Promise.all([profilePromise, modulesPromise]);

                if (res?.data) {
                    setStudent(res.data.studentDetails);
                    setProfile(res.data);
                    if (res.data.studentDetails?.currentLevel) {
                        setActiveTab(res.data.studentDetails.currentLevel.toString());
                    }
                }

                if (modulesRes?.data) {
                    setModules(modulesRes.data.modules || []);
                    setCombinationInfo({
                        code: modulesRes.data.combination,
                        description: modulesRes.data.description
                    });
                }

            } catch (error) {
                console.error("Failed to fetch academic data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Memoize dependency for efficiency
    const moduleIdCache = useMemo(() => modules.map(m => m._id).join(','), [modules]);

    const calculateStats = (lvl = 'all') => {
        if (modules.length === 0) return { gpa: '0.00', credits: 0, modules: 0 };

        let target = modules;
        if (lvl !== 'all') target = target.filter(m => m.level === parseInt(lvl));

        let weightedGP = 0, totalCred = 0, earnedCred = 0;

        target.forEach(m => {
            const r = m.result;
            if (r && r.gradePoint !== undefined && r.grade !== 'I') {
                weightedGP += (r.gradePoint * m.credits);
                totalCred += m.credits;
            }
            if (r && r.grade && !['I', 'F', 'E', 'N'].includes(r.grade)) {
                earnedCred += m.credits;
            }
        });

        return {
            gpa: totalCred > 0 ? (weightedGP / totalCred).toFixed(2) : '0.00',
            credits: earnedCred,
            modules: target.length
        };
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning!";
        if (hour < 18) return "Good Afternoon!";
        return "Good Evening!";
    };

    // Memoize Stats Loop
    const { stats, overallStats, isDeansList } = useMemo(() => {
        const current = calculateStats(activeTab);
        const overall = calculateStats('all');
        return {
            stats: current,
            overallStats: overall,
            isDeansList: parseFloat(overall.gpa) >= 3.5
        };
    }, [moduleIdCache, activeTab]);

    // START: Memoize Tab Content
    const displayContent = useMemo(() => {
        const levels = activeTab === 'all' ? [1, 2, 3, 4] : [parseInt(activeTab)];
        const content = [];

        levels.forEach(lvl => {
            [1, 2].forEach(sem => {
                const mods = modules.filter(m => m.level === lvl && m.semester === sem);

                if (mods.length > 0) {
                    // Mini-stats for semester header
                    let weightedGP = 0, totalCred = 0;
                    mods.forEach(m => {
                        const r = m.result;
                        if (r && r.gradePoint !== undefined && r.grade !== 'I') {
                            weightedGP += (r.gradePoint * m.credits);
                            totalCred += m.credits;
                        }
                    });

                    content.push({
                        level: lvl,
                        semester: sem,
                        modules: mods,
                        stats: {
                            gpa: totalCred > 0 ? (weightedGP / totalCred).toFixed(2) : '0.00',
                            modules: mods.length
                        }
                    });
                }
            });
        });
        return content;
    }, [activeTab, modules]);
    // END: Memoize Tab Content

    // Dummy cache variable to satisfy calculateStats dependency if needed (or just rely on 'modules')



    if (loading) return <UnifiedPageLoader />;

    return (
        <div className="font-sans">

            {/* ITEM A: WELCOME BANNER (Dashboard Style) */}
            <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white/50 flex flex-col justify-center min-h-[200px] mb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">
                            {getGreeting()}
                        </h2>
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-moccaccino-500 to-orange-500 mt-2 mb-6">
                            {user?.firstName || 'Student'}
                        </h1>

                        <div className="flex gap-3">
                            <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold tracking-wider uppercase">
                                Level {student?.currentLevel || '1'}
                            </span>
                            <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold tracking-wider uppercase">
                                COMB {student?.combination?.replace('COMB', '').trim() || '1'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowGradingScale(true)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors">Grading Scale</button>
                        <button onClick={() => setShowDegreeRules(true)} className="px-5 py-2.5 bg-moccaccino-50 hover:bg-moccaccino-100 text-moccaccino-600 rounded-xl font-bold text-sm transition-colors">Degree Rules</button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Wrapped in ScrollReveal manually or mapped if data allows, but manual wrapper is fine for fixed items */}
                <ScrollReveal delay={0}>
                    <MetricCard
                        title="Cumulative GPA"
                        value={stats.gpa}
                        icon={Award}
                        colorClass="bg-moccaccino-100 text-moccaccino-600"
                        subtext={isDeansList ? "Dean's List! 🎉" : null}
                    />
                </ScrollReveal>
                <ScrollReveal delay={100}>
                    <MetricCard
                        title="Credits Earned"
                        value={stats.credits}
                        icon={Target}
                        colorClass="bg-orange-100 text-orange-600"
                    />
                </ScrollReveal>
                <ScrollReveal delay={200}>
                    <MetricCard
                        title="Modules"
                        value={stats.modules}
                        icon={BookCheck}
                        colorClass="bg-moccaccino-100 text-moccaccino-600"
                    />
                </ScrollReveal>
                <ScrollReveal delay={300}>
                    <MetricCard
                        title="Current Level"
                        value={`Level ${student?.currentLevel || '-'}`}
                        icon={TrendingUp}
                        colorClass="bg-orange-100 text-orange-600"
                    />
                </ScrollReveal>
            </div>

            {/* Tabbed Navigation */}
            <div className="mb-6">
                {/* Mobile — shared Dropdown component */}
                <div className="sm:hidden">
                    <Dropdown
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        options={[
                            { value: 'all', label: 'Overview' },
                            { value: '1', label: 'Level 1' },
                            { value: '2', label: 'Level 2' },
                            { value: '3', label: 'Level 3' },
                            { value: '4', label: 'Level 4' },
                        ]}
                        name="level"
                    />
                </div>

                {/* Desktop Tabs */}
                <div className="hidden sm:inline-flex p-1 bg-white rounded-2xl shadow-sm border border-slate-200 w-full sm:w-auto overflow-x-auto">
                    {['all', '1', '2', '3', '4'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-[#ff5734] text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                        >
                            {tab === 'all' ? 'Overview' : `Level ${tab}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modules Grid */}
            <div className="space-y-8">
                {displayContent.map((group, groupIndex) => (
                    <div key={`${group.level}-${group.semester}`}>
                        <ScrollReveal>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-moccaccino-600 text-white font-bold text-sm shadow-md">
                                    {group.semester}
                                </span>
                                <h3 className="text-xl font-bold text-slate-800">
                                    Semester {group.semester}
                                </h3>
                                <div className="h-px bg-slate-200 flex-1 ml-4"></div>
                                <span className="text-xs font-medium text-slate-400">
                                    GPA: {group.stats.gpa} • {group.stats.modules} Modules
                                </span>
                            </div>
                        </ScrollReveal>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {group.modules.map((module, index) => (
                                <ScrollReveal key={module.code} delay={index * 50}>
                                    <ModuleCard
                                        module={module}
                                        result={profile?.results?.find(r => r.module?.code === module.code)}
                                    />
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                ))}

                {displayContent.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No results found.</p>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {showDegreeRules && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900">Degree Requirements</h2>
                            <button onClick={() => setShowDegreeRules(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-5 bg-moccaccino-50 rounded-2xl border border-moccaccino-100">
                                <h3 className="font-bold text-moccaccino-900 mb-3 text-lg">General Degree</h3>
                                <ul className="space-y-2 text-moccaccino-800 font-medium">
                                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-moccaccino-500" /> Min 90 credits (3 Years)</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-moccaccino-500" /> No specific Class/GPA Requirement</li>
                                </ul>
                            </div>
                            <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
                                <h3 className="font-bold text-orange-900 mb-3 text-lg">Special Degree</h3>
                                <ul className="space-y-2 text-orange-800 font-medium">
                                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-orange-500" /> Min 120 credits (4 Years)</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-orange-500" /> CGPA ≥ 2.00</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-orange-500" /> Complete all modules</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showGradingScale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900">Grading Scale</h2>
                            <button onClick={() => setShowGradingScale(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="overflow-y-auto max-h-[60vh]">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-100">
                                    <tr>
                                        <th className="py-3 text-slate-400 font-bold uppercase text-xs tracking-wider">Grade</th>
                                        <th className="py-3 text-slate-400 font-bold uppercase text-xs tracking-wider">GP</th>
                                        <th className="py-3 text-slate-400 font-bold uppercase text-xs tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {[
                                        { g: 'A', v: '4.00', d: 'Excellent', c: 'text-emerald-600' },
                                        { g: 'B', v: '3.00', d: 'Good', c: 'text-blue-600' },
                                        { g: 'C', v: '2.00', d: 'Pass', c: 'text-yellow-600' },
                                        { g: 'D', v: '1.00', d: 'Fail', c: 'text-orange-600' },
                                        { g: 'E', v: '0.00', d: 'Absent', c: 'text-red-600' }
                                    ].map((row, i) => (
                                        <tr key={i}>
                                            <td className={`py-4 font-black ${row.c}`}>{row.g}</td>
                                            <td className="py-4 font-bold text-slate-600">{row.v}</td>
                                            <td className="py-4 font-medium text-slate-500">{row.d}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-xs text-slate-400 mt-4 text-center">* Simplified view. Full scale available in handbook.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

