import React, { useState, useEffect, useMemo } from 'react';
import { Search, Book, AlertCircle, RefreshCw } from 'lucide-react';
import { academicService, resourceService, authService } from '../../services/authService';
import UnifiedPageLoader from '../../components/loaders/UnifiedPageLoader';
import ScrollReveal from '../../components/ui/ScrollReveal';
import ResourceCard from './StudentLearning/ResourceCard';
import Dropdown from '../../components/Dropdown';
import { toast } from 'react-hot-toast';



const StudentLearning = () => {
    const [user] = useState(authService.getUser());
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modules, setModules] = useState([]);
    const [resources, setResources] = useState([]);
    const [error, setError] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [selectedSemester, setSelectedSemester] = useState('All');
    const [selectedModule, setSelectedModule] = useState('All');
    const [selectedType, setSelectedType] = useState('All');

    useEffect(() => {
        fetchLearningData();
    }, []);

    const fetchLearningData = async () => {
        setIsRefreshing(true);
        try {
            const modulesRes = await academicService.getStudentModules();
            const studentModules = modulesRes.data?.modules || [];
            setModules(studentModules);

            const moduleIds = studentModules.map(m => m._id);

            // Fetch Resources via Single Bulk Call
            const bulkRes = await resourceService.getBulkResources(moduleIds);

            let allResources = [];
            if (bulkRes?.data?.data) {
                // Map the resources back to their objects for frontend filtering logic
                allResources = bulkRes.data.data.map(r => {
                    const parentModule = studentModules.find(m => m._id === String(r.module));
                    return { ...r, moduleObj: parentModule };
                });
            }

            allResources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setResources(allResources);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch learning data:', err);
            setError('Failed to load learning materials. Please try again later.');
            toast.error('Failed to load learning materials');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesSearch = res.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                res.moduleObj?.code?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesLevel = selectedLevel === 'All' || res.moduleObj?.level?.toString() === selectedLevel.toString();
            const matchesSemester = selectedSemester === 'All' || res.moduleObj?.semester?.toString() === selectedSemester.toString();
            const matchesModule = selectedModule === 'All' || res.moduleObj?.code === selectedModule;
            const matchesType = selectedType === 'All' || res.type === selectedType;

            return matchesSearch && matchesLevel && matchesSemester && matchesModule && matchesType;
        });
    }, [resources, searchTerm, selectedLevel, selectedSemester, selectedModule, selectedType]);

    const filterOptions = useMemo(() => {
        const levels = [...new Set(modules.map(m => m.level))].sort();
        const semesters = [...new Set(modules.map(m => m.semester))].sort();
        return { levels, semesters };
    }, [modules]);

    const typeFilters = [
        { id: 'All', label: 'All courses' },
        { id: 'past_paper', label: 'Past Papers' },
        { id: 'tutorial', label: 'Tutorials' },
        { id: 'assignment', label: 'Assignments' },
        { id: 'book', label: 'Books' }
    ];

    const typeCounts = useMemo(() => ({
        All: resources.length,
        past_paper: resources.filter(r => r.type === 'past_paper').length,
        tutorial: resources.filter(r => r.type === 'tutorial').length,
        assignment: resources.filter(r => r.type === 'assignment').length,
        book: resources.filter(r => r.type === 'book').length,
    }), [resources]);

    if (isLoading) return <UnifiedPageLoader />;

    return (
        <div className="w-full mx-auto min-h-full pb-10 pt-4 font-['Kodchasan'] tracking-wide">

            {/* ── SINGLE UNIFIED CARD: filters + content ── */}
            <div className="bg-white rounded-[2rem] border border-slate-200/70 shadow-sm overflow-visible">

                {/* ── ROW 1: Dropdowns ── */}
                <div className="flex flex-wrap items-center gap-2 px-5 pt-5 pb-3">
                    <Dropdown
                        value={selectedLevel}
                        onChange={(e) => { setSelectedLevel(e.target.value); setSelectedModule('All'); }}
                        options={[
                            { value: 'All', label: 'All Levels' },
                            ...filterOptions.levels.map(l => ({ value: String(l), label: `Level ${l}` }))
                        ]}
                        className="w-32 sm:w-36"
                    />
                    <Dropdown
                        value={selectedSemester}
                        onChange={(e) => { setSelectedSemester(e.target.value); setSelectedModule('All'); }}
                        options={[
                            { value: 'All', label: 'All Semesters' },
                            ...filterOptions.semesters.map(s => ({ value: String(s), label: `Semester ${s}` }))
                        ]}
                        className="w-36 sm:w-40"
                    />
                    <Dropdown
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        options={[
                            { value: 'All', label: 'All Modules' },
                            ...modules
                                .filter(m => (selectedLevel === 'All' || m.level?.toString() === selectedLevel) &&
                                    (selectedSemester === 'All' || m.semester?.toString() === selectedSemester))
                                .map(m => ({ value: m.code, label: m.code }))
                        ]}
                        className="w-36 sm:w-40"
                    />
                    <span className="text-xs text-slate-400 font-semibold ml-1">
                        {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* ── ROW 2: Search + Refresh — always full width ── */}
                <div className="flex items-center gap-2 px-5 pb-4 border-b border-slate-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" strokeWidth={2.5} />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#151313] outline-none placeholder:text-slate-400 focus:border-slate-300 transition-all"
                        />
                    </div>
                    <button
                        onClick={fetchLearningData}
                        disabled={isRefreshing}
                        title="Refresh"
                        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                    </button>
                </div>

                {/* ── ROW 2: Tab bar ── */}
                <div className="flex items-center gap-0 px-4 overflow-x-auto border-b border-slate-100" style={{ scrollbarWidth: 'none' }}>
                    {typeFilters.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-black whitespace-nowrap border-b-2 -mb-px transition-all
                                ${selectedType === type.id
                                    ? 'border-[#ff5734] text-[#151313]'
                                    : 'border-transparent text-slate-400 hover:text-[#151313] hover:border-slate-200'
                                }`}
                        >
                            {type.label}
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${selectedType === type.id
                                ? 'bg-[#ff5734]/10 text-[#ff5734]'
                                : 'bg-slate-100 text-slate-400'
                                }`}>
                                {typeCounts[type.id] ?? 0}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── CONTENT AREA ── */}
                <div className="p-5 sm:p-6">
                    {error ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                            <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
                            <h3 className="text-lg font-black text-rose-900 mb-1">Error Loading Data</h3>
                            <p className="text-rose-700/80 mb-5 font-bold text-sm">{error}</p>
                            <button
                                onClick={fetchLearningData}
                                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-full transition-colors text-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredResources.length > 0 ? (
                        /* Resources grid
                           Mobile: 1 col | Tablet: 2 col | Desktop: 3 col */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {filteredResources.map((resource) => (
                                <ResourceCard
                                    key={resource._id}
                                    resource={resource}
                                    moduleCode={resource.moduleObj?.code}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                                <Book className="w-7 h-7 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-[#151313] mb-2">No resources found</h3>
                            <p className="text-sm font-medium text-slate-400 max-w-xs">
                                {searchTerm || selectedLevel !== 'All' || selectedSemester !== 'All' || selectedModule !== 'All' || selectedType !== 'All'
                                    ? "No resources match your current filters."
                                    : "No resources have been uploaded for your enrolled modules yet."}
                            </p>
                            {(searchTerm || selectedLevel !== 'All' || selectedSemester !== 'All' || selectedModule !== 'All' || selectedType !== 'All') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedLevel('All');
                                        setSelectedSemester('All');
                                        setSelectedModule('All');
                                        setSelectedType('All');
                                    }}
                                    className="mt-5 px-6 py-2 rounded-full border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentLearning;
