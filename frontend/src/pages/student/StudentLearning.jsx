import React, { useState, useEffect, useMemo } from 'react';
import { academicService, resourceService, authService } from '../../services/authService';
import UnifiedPageLoader from '../../components/loaders/UnifiedPageLoader';
import { 
    BookOpen, WarningCircle, ArrowsClockwise, 
    MagnifyingGlass, X, Funnel, FileText, 
    Monitor, Download, BookmarkSimple, CaretDown,
    ListChecks, GraduationCap, Lightning, Quotes
} from '@phosphor-icons/react';
import ResourceCard from './StudentLearning/ResourceCard';
import DocumentViewerModal from '../../components/ui/DocumentViewerModal';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import Dropdown from '../../components/Dropdown';

const WUSL_MODULES = [
    // Level 1
    { code: 'CMIS 1113', title: 'Introduction to Computers', level: 1, semester: 1 },
    { code: 'CMIS 1123', title: 'Computer Programming I', level: 1, semester: 1 },
    { code: 'CMIS 1131', title: 'Practical Computing I', level: 1, semester: 1 },
    { code: 'ELTN 1112', title: 'Fundamentals of Electricity', level: 1, semester: 1 },
    { code: 'ELTN 1122', title: 'Intro to Semiconductors', level: 1, semester: 1 },
    { code: 'ELTN 1132', title: 'Basic Digital Electronics', level: 1, semester: 1 },
    { code: 'MATH 1112', title: 'Introduction to Mathematics I', level: 1, semester: 1 },
    { code: 'STAT 1113', title: 'Intro to Prob & Stats I', level: 1, semester: 1 },
    { code: 'IMGT 1112', title: 'Principles of Management', level: 1, semester: 1 },
    { code: 'CMIS 1212', title: 'Computer Programming II', level: 1, semester: 2 },
    { code: 'MATH 1222', title: 'Differential Equations', level: 1, semester: 2 },
    { code: 'STAT 1213', title: 'Intro to Prob & Stats II', level: 1, semester: 2 },
    
    // Level 2
    { code: 'CMIS 2113', title: 'Object-oriented Programming', level: 2, semester: 1 },
    { code: 'CMIS 2123', title: 'Database Management Systems', level: 2, semester: 1 },
    { code: 'MATH 2114', title: 'Linear Algebra I', level: 2, semester: 1 },
    { code: 'STAT 2112', title: 'Statistical Inference I', level: 2, semester: 1 },
    { code: 'CMIS 2214', title: 'Data Structures & Algorithms', level: 2, semester: 2 },
    { code: 'ELTN 2232', title: 'Analogue Electronics', level: 2, semester: 2 },
    { code: 'MATH 2213', title: 'Linear Algebra II', level: 2, semester: 2 },
    { code: 'STAT 2222', title: 'Regression Analysis', level: 2, semester: 2 },

    // Level 3
    { code: 'CMIS 3114', title: 'Data Comm & Computer Networks', level: 3, semester: 1 },
    { code: 'CMIS 3122', title: 'Rapid Application Development', level: 3, semester: 1 },
    { code: 'CMIS 3134', title: 'Computer Architecture', level: 3, semester: 1 },
    { code: 'CMIS 3153', title: 'Advanced Database Systems', level: 3, semester: 1 },
    { code: 'STAT 3124', title: 'Time Series Analysis', level: 3, semester: 1 },
    { code: 'CMIS 3214', title: 'Software Engineering', level: 3, semester: 2 },
    { code: 'CMIS 3224', title: 'Web Designing and e-commerce', level: 3, semester: 2 },
    { code: 'CMIS 3253', title: 'Data Mining', level: 3, semester: 2 },
    { code: 'MMOD 3214', title: 'Numerical Methods', level: 3, semester: 2 },

    // Level 4
    { code: 'CMIS 4114', title: 'Artificial Intelligence', level: 4, semester: 1 },
    { code: 'CMIS 4134', title: 'Cloud Computing', level: 4, semester: 1 },
    { code: 'CMIS 4142', title: 'Image Processing', level: 4, semester: 1 },
    { code: 'ELTN 4114', title: 'Communication Theory', level: 4, semester: 1 },
    { code: 'CMIS 4216', title: 'Industrial Training', level: 4, semester: 2 },
    { code: 'ELTN 4213', title: 'Digital Signal Processing', level: 4, semester: 2 }
];

const LEVEL_OPTIONS = [
    { value: 'All', label: 'All Levels' },
    { value: '1', label: 'Level 1' },
    { value: '2', label: 'Level 2' },
    { value: '3', label: 'Level 3' },
    { value: '4', label: 'Level 4' }
];

const SEMESTER_OPTIONS = [
    { value: 'All', label: 'All Semesters' },
    { value: '1', label: 'Semester 1' },
    { value: '2', label: 'Semester 2' }
];

const StudentLearning = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [user] = useState(authService.getUser());
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modules, setModules] = useState([]);
    const [resources, setResources] = useState([]);
    const [error, setError] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('1');
    const [selectedSemester, setSelectedSemester] = useState('1');
    const [selectedModule, setSelectedModule] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedPreview, setSelectedPreview] = useState(null);

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

    const filterOptions = {
        levels: ['1', '2', '3', '4'],
        semesters: ['1', '2']
    };

    const displayModules = useMemo(() => {
        // Merge fetched modules with static ones, ensuring no duplicates
        const merged = [...WUSL_MODULES];
        modules.forEach(m => {
            if (!merged.find(wm => wm.code === m.code)) {
                merged.push(m);
            }
        });
        return merged.sort((a, b) => a.code.localeCompare(b.code));
    }, [modules]);

    const moduleOptions = useMemo(() => {
        const filtered = displayModules.filter(m => 
            (selectedLevel === 'All' || m.level?.toString() === selectedLevel) &&
            (selectedSemester === 'All' || m.semester?.toString() === selectedSemester)
        );
        
        return [
            { value: 'All', label: `All ${selectedLevel !== 'All' ? 'L' + selectedLevel : ''} Modules` },
            ...filtered.map(m => ({ value: m.code, label: `${m.code} — ${m.title}` }))
        ];
    }, [displayModules, selectedLevel, selectedSemester]);

    const typeOptions = [
        { value: 'All', label: 'All Materials' },
        { value: 'past_paper', label: 'Past Papers' },
        { value: 'lecture_note', label: 'Lecture Notes' },
        { value: 'tutorial', label: 'Tutorials' },
        { value: 'assignment', label: 'Assignments' }
    ];

    const typeCounts = useMemo(() => ({
        All: resources.length,
        past_paper: resources.filter(r => r.type === 'past_paper').length,
        tutorial: resources.filter(r => r.type === 'tutorial').length,
        assignment: resources.filter(r => r.type === 'assignment').length,
        book: resources.filter(r => r.type === 'book').length,
    }), [resources]);

    // ── Skeleton Loader Component ──
    const Skeleton = ({ className }) => (
        <div className={`bg-slate-100 animate-pulse rounded-2xl ${className}`} />
    );

    if (isLoading) return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Unified Filter Bento Skeleton */}
            <div className="bg-white rounded-[3rem] p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col gap-8">
                <Skeleton className="h-14 w-full rounded-[2rem]" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex flex-col gap-2">
                            <Skeleton className="h-3 w-20 px-2" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-sm min-h-[400px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <Skeleton className="w-12 h-12 rounded-2xl" />
                                <Skeleton className="w-20 h-5" />
                            </div>
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <div className="mt-auto pt-4 flex gap-2">
                                <Skeleton className="flex-1 h-10" />
                                <Skeleton className="w-10 h-10" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            
            <DocumentViewerModal 
                isOpen={!!selectedPreview} 
                onClose={() => setSelectedPreview(null)} 
                resource={selectedPreview} 
            />

            {/* ── Unified Filter Bento Box ── */}
            <div className="bg-white rounded-[3rem] p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col gap-8 transition-all duration-500 hover:shadow-md">
                
                {/* Search Bar (Top Priority) */}
                <div className="relative group">
                    <MagnifyingGlass size={22} weight="bold" className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff5734] transition-colors" />
                    <input
                        type="text"
                        placeholder="Find resources or specific modules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-14 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 text-sm md:text-base font-medium focus:outline-none focus:ring-4 focus:ring-[#ff5734]/10 focus:border-[#ff5734]/30 transition-all duration-300"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 rounded-xl transition-colors">
                            <X size={16} weight="bold" className="text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    
                    {/* Level Selection */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Academic Level</span>
                        <Dropdown 
                            variant="premium-light"
                            value={selectedLevel}
                            onChange={(e) => { setSelectedLevel(e.target.value); setSelectedModule('All'); }}
                            options={LEVEL_OPTIONS}
                            placeholder="Select Level"
                            icon={<GraduationCap size={18} weight="bold" />}
                        />
                    </div>

                    {/* Semester Selection */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Semester</span>
                        <Dropdown 
                            variant="premium-light"
                            value={selectedSemester}
                            onChange={(e) => { setSelectedSemester(e.target.value); setSelectedModule('All'); }}
                            options={SEMESTER_OPTIONS}
                            placeholder="Select Semester"
                            icon={<ListChecks size={18} weight="bold" />}
                        />
                    </div>

                    {/* Module Selection */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Target Module</span>
                        <Dropdown 
                            variant="premium-light"
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            options={moduleOptions}
                            placeholder="Select Module"
                            icon={<BookOpen size={18} weight="bold" />}
                        />
                    </div>

                    {/* Content Type Selection */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Material Type</span>
                        <Dropdown 
                            variant="premium-light"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            options={typeOptions}
                            placeholder="Select Material"
                            icon={<Lightning size={18} weight="bold" />}
                        />
                    </div>
                </div>
            </div>

            {/* ── Content Grid ── */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-sm min-h-[400px]">
                {error ? (
                    <div className="text-center py-16">
                        <WarningCircle size={40} weight="duotone" className="mx-auto text-red-400 mb-4" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Access Error</h3>
                        <p className="text-xs text-slate-400 mb-6">{error}</p>
                        <button onClick={fetchLearningData} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest">
                            Retry Connection
                        </button>
                    </div>
                ) : filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredResources.map((resource, index) => (
                            <ResourceCard
                                key={resource._id}
                                resource={resource}
                                moduleCode={resource.moduleObj?.code}
                                onPreview={(res) => setSelectedPreview(res)}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/60 transition-all duration-500 hover:border-[#ff5734]/20">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
                            <MagnifyingGlass size={32} weight="duotone" className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-[#151313] uppercase tracking-widest mb-2">No Resources Found</h3>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                            We couldn't find any resources matching your current filters. Try adjusting your search or selection.
                        </p>
                        <button 
                            onClick={() => { setSearchTerm(''); setSelectedModule('All'); setSelectedType('All'); setSelectedLevel('All'); setSelectedSemester('All'); }}
                            className="mt-8 px-8 py-3 bg-[#151313] text-white text-[11px] font-black rounded-2xl hover:bg-[#ff5734] transition-all uppercase tracking-[0.2em] shadow-lg shadow-black/10"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentLearning;
