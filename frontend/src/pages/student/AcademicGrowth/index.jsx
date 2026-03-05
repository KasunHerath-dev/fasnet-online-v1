import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Award, Target, TrendingUp, BookOpen, CheckCircle2, Clock, XCircle, GripVertical } from 'lucide-react';
import { authService, academicService } from '../../../services/authService';
import UnifiedPageLoader from '../../../components/loaders/UnifiedPageLoader';
import SharedDropdown from '../../../components/Dropdown';
import DetailedPerformanceChart from './DetailedPerformanceChart';

// ─── Grade Helpers ─────────────────────────────────────────────────────────────
const getGradePoint = (grade) => {
    if (!grade) return 0;
    const g = grade.toUpperCase();
    if (g === 'A+' || g === 'A') return 4.0;
    if (g === 'A-') return 3.7;
    if (g === 'B+') return 3.3;
    if (g === 'B') return 3.0;
    if (g === 'B-') return 2.7;
    if (g === 'C+') return 2.3;
    if (g === 'C') return 2.0;
    if (g === 'C-') return 1.7;
    if (g === 'D+') return 1.3;
    if (g === 'D') return 1.0;
    return 0;
};

const normalizeCode = (code) => (code || '').replace(/\s+/g, '').toUpperCase();

const getGradeStyle = (grade) => {
    if (!grade) return { badge: 'bg-slate-100 text-slate-400', row: '' };
    if (grade.startsWith('A')) return { badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', row: '' };
    if (grade.startsWith('B')) return { badge: 'bg-blue-100 text-blue-700 border border-blue-200', row: '' };
    if (grade.startsWith('C')) return { badge: 'bg-amber-100 text-amber-700 border border-amber-200', row: '' };
    if (grade === 'D+' || grade === 'D') return { badge: 'bg-orange-100 text-orange-700 border border-orange-200', row: '' };
    if (['F', 'E', 'N', 'I'].includes(grade.toUpperCase())) return { badge: 'bg-rose-100 text-rose-700 border border-rose-200', row: '' };
    return { badge: 'bg-slate-100 text-slate-600', row: '' };
};

const getHonors = (gpa) => {
    const g = parseFloat(gpa);
    if (g >= 3.70) return 'First Class';
    if (g >= 3.30) return 'Second Upper';
    if (g >= 3.00) return 'Second Lower';
    if (g >= 2.00) return 'Pass';
    return 'Below Pass';
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatusIcon = ({ grade }) => {
    if (!grade) return <Clock className="w-4 h-4 text-slate-300" />;
    if (['F', 'E', 'N', 'I'].includes(grade.toUpperCase())) return <XCircle className="w-4 h-4 text-rose-400" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
};

// Improved stat card — more breathing room, clearer hierarchy
const StatCard = ({ tag, value, label, sub, bg, textColor, tagBg, icon: Icon }) => (
    <div className={`${bg} rounded-2xl px-5 py-4 flex items-start gap-4 border border-black/5 shadow-sm relative overflow-hidden`}>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit ${tagBg}`}>{tag}</span>
            <div className={`text-3xl font-black ${textColor} leading-tight`}>{value}</div>
            <div className={`text-xs font-semibold ${textColor} opacity-60`}>{label}</div>
            {sub && <div className={`text-[10px] font-semibold ${textColor} opacity-40 mt-0.5`}>{sub}</div>}
        </div>
        <div className={`opacity-15 ${textColor} flex-shrink-0 mt-1`}>
            {Icon && <Icon className="w-8 h-8" />}
        </div>
    </div>
);


// Mobile card component
const MobileModuleCard = ({ mod }) => {
    if (!mod) return null;
    const s = getGradeStyle(mod.result?.grade);
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-3 flex flex-col gap-2 hover:bg-slate-50/70 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StatusIcon grade={mod.result?.grade} />
                    <span className="font-black text-[#151313] text-sm whitespace-nowrap">{mod.code || 'UNKNOWN'}</span>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black ${s.badge}`}>
                    {mod.result?.grade || '—'}
                </span>
            </div>
            <div className="text-slate-600 text-xs leading-snug">{mod.title || 'Untitled Module'}</div>
            <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Credits: {mod.credits || 0}</span>
                <span>GP: {mod.result?.gradePoint != null ? parseFloat(mod.result.gradePoint).toFixed(1) : '—'}</span>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AcademicGrowth = () => {
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const [combinationInfo, setCombinationInfo] = useState({ combination: '', description: '' });
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [selectedSemester, setSelectedSemester] = useState(1);

    // Resizable split state
    const [splitPct, setSplitPct] = useState(65);
    const isDragging = useRef(false);
    const containerRef = useRef(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    // Update on resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Drag handlers
    const onDragStart = useCallback((e) => {
        e.preventDefault();
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const onDragMove = useCallback((e) => {
        if (!isDragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const pct = Math.min(Math.max((x / rect.width) * 100, 30), 75);
        setSplitPct(pct);
    }, []);

    const onDragEnd = useCallback(() => {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);
        window.addEventListener('touchmove', onDragMove);
        window.addEventListener('touchend', onDragEnd);
        return () => {
            window.removeEventListener('mousemove', onDragMove);
            window.removeEventListener('mouseup', onDragEnd);
            window.removeEventListener('touchmove', onDragMove);
            window.removeEventListener('touchend', onDragEnd);
        };
    }, [onDragMove, onDragEnd]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = authService.getUser();
                const [profileRes, modulesRes] = await Promise.all([
                    currentUser?.studentRef?._id
                        ? academicService.getStudentProfile(currentUser.studentRef._id)
                        : Promise.resolve(null),
                    academicService.getStudentModules()
                ]);

                const refLevel = currentUser?.studentRef?.level
                    || profileRes?.data?.studentDetails?.currentLevel || 1;
                const refSem = currentUser?.studentRef?.currentSemester || 1;
                setSelectedLevel(refLevel);
                setSelectedSemester(refSem);

                if (modulesRes?.data) {
                    const fetchedModules = modulesRes.data.modules;
                    setModules(Array.isArray(fetchedModules) ? fetchedModules : []);
                    setCombinationInfo({
                        combination: modulesRes.data.combination || '',
                        description: modulesRes.data.description || ''
                    });
                }
            } catch (err) {
                // Don't use console.error here to avoid React Error Overlay triggering on Axios 401
                console.warn('Academic data could not be fetched (likely unauthorized)');

            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const availableLevels = useMemo(
        () => [...new Set((Array.isArray(modules) ? modules : []).map(m => m?.level || 1))].sort(), [modules]
    );
    const availableSemesters = useMemo(() => {
        const safeModules = Array.isArray(modules) ? modules : [];
        const sems = [...new Set(safeModules.filter(m => m?.level === selectedLevel).map(m => m?.semester || 1))].sort();
        return sems.length > 0 ? sems : [1, 2];
    }, [modules, selectedLevel]);

    const overallStats = useMemo(() => {
        let wp = 0, tc = 0, ec = 0;
        const safeModules = Array.isArray(modules) ? modules : [];
        safeModules.forEach(m => {
            if (!m) return;
            const g = m.result?.grade;
            if (g && g !== 'I') { wp += getGradePoint(g) * (m.credits || 0); tc += (m.credits || 0); }
            if (g && !['I', 'F', 'E', 'N'].includes(g.toUpperCase())) ec += (m.credits || 0);
        });
        return { gpa: tc > 0 ? (wp / tc).toFixed(2) : '0.00', credits: ec };
    }, [modules]);

    const semesterModules = useMemo(() => {
        const safeModules = Array.isArray(modules) ? modules : [];
        const seen = new Set();
        return safeModules
            .filter(m => m?.level === selectedLevel && m?.semester === selectedSemester)
            .filter(m => {
                const key = normalizeCode(m.code);
                if (!key || seen.has(key)) return false;
                seen.add(key); return true;
            });
    }, [modules, selectedLevel, selectedSemester]);

    const semStats = useMemo(() => {
        let wp = 0, tc = 0;
        semesterModules.forEach(m => {
            const g = m.result?.grade;
            if (g && g !== 'I') { wp += getGradePoint(g) * m.credits; tc += m.credits; }
        });
        return { gpa: tc > 0 ? (wp / tc).toFixed(2) : '—', credits: tc };
    }, [semesterModules]);

    const chartData = useMemo(() => {
        const history = [];
        let cumWP = 0, cumC = 0;
        [1, 2, 3, 4].forEach(lvl => {
            [1, 2].forEach(sem => {
                const safeModules = Array.isArray(modules) ? modules : [];
                const seen = new Set();
                const mods = safeModules
                    .filter(m => m?.level === lvl && m?.semester === sem)
                    .filter(m => { const k = normalizeCode(m?.code); if (!k || seen.has(k)) return false; seen.add(k); return true; });
                if (!mods.length) return;
                let swp = 0, sc = 0;
                mods.forEach(m => {
                    if (!m) return;
                    const g = m.result?.grade;
                    if (g && g !== 'I') { swp += getGradePoint(g) * (m.credits || 0); sc += (m.credits || 0); }
                });
                cumWP += swp; cumC += sc;
                history.push({
                    semester: `L${lvl}S${sem}`,
                    gpa: cumC > 0 ? parseFloat((cumWP / cumC).toFixed(2)) : 0,
                    semGpa: sc > 0 ? parseFloat((swp / sc).toFixed(2)) : 0,
                    credits: sc
                });
            });
        });
        return history;
    }, [modules]);

    const honors = useMemo(() => getHonors(overallStats.gpa), [overallStats.gpa]);
    const isDeansList = parseFloat(overallStats.gpa) >= 3.70 && overallStats.credits >= 30;

    const levelOptions = (availableLevels.length > 0 ? availableLevels : [1, 2, 3, 4])
        .map(l => ({ value: l, label: `Level ${l}` }));
    const semOptions = availableSemesters.map(s => ({ value: s, label: `Semester ${s}` }));

    if (loading) return <UnifiedPageLoader />;

    return (
        <div className="flex flex-col gap-4 w-full font-['Kodchasan'] tracking-wide flex-1 min-h-0 overflow-hidden">

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-shrink-0">
                <StatCard
                    tag="Overall GPA" value={overallStats.gpa} label="Cumulative Grade Point Average"
                    sub="/ 4.00 · WUSL Scale"
                    bg="bg-[#fde047]" textColor="text-[#451a03]" tagBg="bg-black/10 text-[#451a03]" icon={Award}
                />
                <StatCard
                    tag="Credits Earned" value={String(overallStats.credits)} label="Towards Degree Completion"
                    sub="of 120 total credits"
                    bg="bg-[#e9d5ff]" textColor="text-[#3b0764]" tagBg="bg-[#fde047] text-[#451a03]" icon={Target}
                />
                <StatCard
                    tag="Classification" value={honors} label="Predicted Degree Class"
                    sub={`Based on GPA ${overallStats.gpa}${isDeansList ? ' · ⭐ Dean\'s List' : ''}`}
                    bg="bg-[#bae6fd]" textColor="text-[#082f49]" tagBg="bg-[#f472b6] text-white" icon={TrendingUp}
                />
            </div>

            {/* ── Resizable Split: Table | Chart ── */}
            <div ref={containerRef} className={`flex flex-col lg:flex-row ${isMobile ? 'gap-4 overflow-visible' : 'gap-0 overflow-hidden rounded-[2rem]'} min-h-0 flex-1`}>

                {/* Left: Module Table */}
                <div
                    className={`${isMobile ? 'rounded-[2rem]' : 'rounded-l-[2rem]'} bg-white flex flex-col overflow-hidden border border-slate-200/70 shadow-sm min-h-0`}
                    style={isMobile ? {} : { width: `${splitPct}%` }}
                >
                    {/* Table header */}
                    <div className="flex flex-wrap items-center gap-2 px-5 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
                        <SharedDropdown
                            value={selectedLevel}
                            onChange={e => { setSelectedLevel(parseInt(e.target.value)); setSelectedSemester(1); }}
                            options={levelOptions}
                            name="level"
                            className="min-w-[110px]"
                        />
                        <SharedDropdown
                            value={selectedSemester}
                            onChange={e => setSelectedSemester(parseInt(e.target.value))}
                            options={semOptions}
                            name="semester"
                            className="min-w-[130px]"
                        />
                        {combinationInfo.combination && (
                            <span className="px-2.5 py-1 bg-[#fccc42]/20 text-[#b45309] text-[10px] font-black rounded-lg tracking-widest uppercase">
                                {combinationInfo.combination}
                            </span>
                        )}
                        {isDeansList && (
                            <span className="px-2.5 py-1 bg-[#fccc42] text-[#451a03] text-[10px] font-black rounded-lg">⭐ Dean's</span>
                        )}
                        <span className="text-xs text-slate-400 font-semibold">{semesterModules.length} modules · {semStats.credits} cr</span>
                        <div className="ml-auto text-right">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sem GPA</div>
                            <div className="text-lg font-black text-[#ff5734] leading-none">{semStats.gpa}</div>
                        </div>
                    </div>

                    {/* Scrollable content – table on desktop, cards on mobile */}
                    {isMobile ? (
                        <div className="p-4 overflow-y-auto flex-1">
                            {semesterModules.length > 0 ? semesterModules.map((mod, idx) => (
                                <MobileModuleCard key={mod._id || idx} mod={mod} />
                            )) : (
                                <div className="py-12 text-center">
                                    <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-slate-400">No modules found.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <th className="py-3 pl-5 w-8"></th>
                                        <th className="py-3 px-3">Code</th>
                                        <th className="py-3 px-3">Module Title</th>
                                        <th className="py-3 px-3 text-center">Cr</th>
                                        <th className="py-3 px-3 text-center">Grade</th>
                                        <th className="py-3 px-3 text-right pr-5 hidden sm:table-cell">GP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {semesterModules.length > 0 ? semesterModules.map((mod, idx) => {
                                        const s = getGradeStyle(mod.result?.grade);
                                        return (
                                            <tr key={mod._id || idx} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3 pl-5"><StatusIcon grade={mod.result?.grade} /></td>
                                                <td className="py-3 px-3 font-black text-[#151313] text-xs whitespace-nowrap">{mod.code}</td>
                                                <td className="py-3 px-3 text-slate-600 text-xs leading-snug">{mod.title}</td>
                                                <td className="py-3 px-3 text-center font-bold text-slate-500 text-sm">{mod.credits}</td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black ${s.badge}`}>
                                                        {mod.result?.grade || '—'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right pr-5 font-black text-[#151313] text-sm hidden sm:table-cell">
                                                    {mod.result?.gradePoint != null ? parseFloat(mod.result.gradePoint).toFixed(1) : '—'}
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center">
                                                <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                <p className="text-sm font-bold text-slate-400">No modules found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>

                {/* Drag Handle – only visible on large screens */}
                <div
                    onMouseDown={onDragStart}
                    onTouchStart={onDragStart}
                    className="hidden lg:flex w-3 flex-shrink-0 items-center justify-center cursor-col-resize group z-10 bg-slate-100 hover:bg-[#ff5734]/20 transition-colors"
                    title="Drag to resize"
                >
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#ff5734] transition-colors" />
                </div>

                {/* Right: WUSL Track Chart – takes remaining space */}
                <div
                    className={`${isMobile ? 'rounded-[2rem]' : 'rounded-r-[2rem]'} bg-[#151313] flex flex-col overflow-hidden relative shadow-xl min-h-[300px]`}
                    style={isMobile ? {} : { flex: 1 }}
                >
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#ff5734]/10 blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between px-6 sm:px-7 pt-6 pb-2 flex-shrink-0 z-10">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-[#fccc42] text-[#151313] font-black text-[9px] uppercase tracking-wider rounded-full">
                                WUSL Track
                            </span>
                            {isDeansList && (
                                <span className="px-3 py-1 bg-[#fccc42]/20 text-[#fccc42] font-black text-[9px] uppercase tracking-wider rounded-full">
                                    ⭐ Dean's List
                                </span>
                            )}
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">CGPA</span>
                            <span className="text-2xl font-black text-[#fccc42] leading-none">{overallStats.gpa}</span>
                        </div>
                    </div>

                    <div className="px-6 sm:px-7 pt-5 pb-2 flex-shrink-0 z-10">
                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Performance Trend</h2>
                        <p className="text-[#be94f5] text-xs font-semibold mt-1 tracking-wide">Cumulative GPA across all semesters</p>
                    </div>

                    <div className="flex-1 z-10 min-h-[200px] px-2 sm:px-4 pb-2">
                        {chartData.length > 0 ? (
                            <DetailedPerformanceChart data={chartData} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                                <TrendingUp className="w-7 h-7" />
                                <span className="text-xs font-semibold">No history yet</span>
                            </div>
                        )}
                    </div>

                    <div className="px-6 sm:px-7 pb-6 pt-2 flex-shrink-0 z-10">
                        <button className="w-full py-3.5 bg-[#ff5734] hover:bg-[#e04d2e] text-white text-sm font-black rounded-[1.25rem] transition-all shadow-lg shadow-[#ff5734]/20 active:scale-[0.98]">
                            View Full Report
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AcademicGrowth;
