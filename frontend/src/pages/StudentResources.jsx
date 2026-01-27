import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Download,
    FileText,
    Search,
    AlertCircle,
    File,
    CheckCircle,
    Calendar,
    Layers,
    Clock,
    LayoutGrid,
    X,
    Zap,
    Activity,
    TrendingUp,
    Package,
    ChevronDown,
    ChevronUp,
    Grid3x3,
    Sparkles
} from 'lucide-react';
import { academicService } from '../services/academicService';
import { authService } from '../services/authService';
import { MODULE_DATA } from '../data/moduleList';
import { resourceService } from '../services/resourceService';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';

const ResourceCard = ({ resource, viewMode = 'cards' }) => {
    const toast = useToast();
    const getTypeColor = (type) => {
        const colors = {
            tutorial: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            assignment: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
            past_paper: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
            book: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
            marking_scheme: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
            other: 'text-slate-600 bg-slate-50 dark:bg-slate-700/20 border-slate-200 dark:border-slate-700'
        };
        return colors[type] || colors.other;
    };

    const getTypeIcon = (type) => {
        const icons = {
            tutorial: FileText,
            assignment: CheckCircle,
            past_paper: BookOpen,
            book: BookOpen,
            marking_scheme: FileText,
            other: File
        };
        const Icon = icons[type] || File;
        return <Icon className="w-4 h-4" />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDownload = async () => {
        try {
            if (resource.downloadUrl) {
                window.open(resource.downloadUrl, '_blank');
                return;
            }

            if (!resource._id) {
                console.error('No resource ID');
                return;
            }

            const response = await resourceService.download(resource._id);

            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('text/html')) {
                console.error('Download failed: Backend returned HTML (likely 404 or error)');
                toast.error('Failed to download file. Please try again later.');
                return;
            }

            const blob = new Blob([response.data], {
                type: contentType || 'application/octet-stream'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = resource.fileName || resource.title || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Download failed", error);
            toast.error("Failed to download file.");
        }
    };

    // List View
    if (viewMode === 'list') {
        return (
            <div className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 p-6">
                <div className="flex items-center gap-6">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${getTypeColor(resource.type)}`}>
                        {getTypeIcon(resource.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 mb-1">
                            {resource.title}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTypeColor(resource.type)}`}>
                                {resource.type.replace('_', ' ')}
                            </span>
                            {resource.academicYear && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                    {resource.academicYear}
                                </span>
                            )}
                            {resource.fileSize && (
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    {formatFileSize(resource.fileSize)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        className="min-h-[44px] flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                    </button>
                </div>
            </div>
        );
    }

    // Card View (Default)
    return (
        <div className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getTypeColor(resource.type)}`}>
                        {getTypeIcon(resource.type)}
                    </div>
                    {resource.answerFor && (
                        <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold">
                            Answer Key
                        </span>
                    )}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 mb-2">
                    {resource.title}
                </h3>
                {resource.academicYear && (
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400">
                        {resource.academicYear}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* File Info */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium truncate">
                        {resource.fileName || 'Resource File'}
                    </span>
                    {resource.fileSize && (
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold ml-2">
                            {formatFileSize(resource.fileSize)}
                        </span>
                    )}
                </div>

                {/* Type Badge */}
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getTypeColor(resource.type)}`}>
                        {resource.type.replace('_', ' ')}
                    </span>
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownload}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    Download
                </button>
            </div>
        </div>
    );
};

// Module Card Component
const ModuleCard = ({ module, selected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-5 rounded-2xl font-bold transition-all border-2 ${selected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                }`}
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                    <BookOpen className="w-5 h-5" />
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-black ${selected ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                    {module.credits} Credits
                </span>
            </div>
            <div className="mb-1">
                <span className="text-sm font-black opacity-70">{module.code}</span>
            </div>
            <h3 className="text-sm font-black line-clamp-2 leading-tight">
                {module.title}
            </h3>
        </button>
    );
};

export default function StudentResources() {
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [resources, setResources] = useState([]);
    const [fetchingResources, setFetchingResources] = useState(false);
    const [filterLevel, setFilterLevel] = useState('1');
    const [filterSemester, setFilterSemester] = useState('1');
    const [activeTab, setActiveTab] = useState('all');

    // New states
    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState('cards');
    const [showModuleGrid, setShowModuleGrid] = useState(false);

    // Load enrolled modules from Static Data
    useEffect(() => {
        const loadModules = async () => {
            // Get user info for smart default
            let userLevel = 1;
            try {
                const userRes = await authService.getProfile();
                if (userRes.success && userRes.studentProfile) {
                    userLevel = userRes.studentProfile.level || 1;
                }
            } catch (e) { console.error("Failed to get profile for smart default", e); }

            // Set defaults
            setFilterLevel(userLevel.toString());
            setFilterSemester('1');

            // Load ALL modules, sorted by Level -> Semester -> Code
            const allModules = [...MODULE_DATA].sort((a, b) => {
                if (a.level !== b.level) return a.level - b.level;
                if (a.semester !== b.semester) return a.semester - b.semester;
                return a.code.localeCompare(b.code);
            });

            if (allModules.length > 0) {
                setModules(allModules);

                // Smart Default: Find first module of student's current level & sem 1
                const defaultModule = allModules.find(m => m.level === parseInt(userLevel) && m.semester === 1) || allModules[0];
                setSelectedModuleId(defaultModule.code);
            } else {
                setModules([]);
            }
            setLoading(false);
        };
        loadModules();
    }, []);

    // Filter modules based on selection
    const filteredModules = modules.filter(m =>
        m.level.toString() === filterLevel &&
        m.semester.toString() === filterSemester
    );

    // Auto-select first module when filters change if current selection is invalid
    useEffect(() => {
        const currentModule = modules.find(m => m.code === selectedModuleId);
        if (currentModule && (currentModule.level.toString() !== filterLevel || currentModule.semester.toString() !== filterSemester)) {
            const firstMatch = filteredModules[0];
            if (firstMatch) setSelectedModuleId(firstMatch.code);
        }
    }, [filterLevel, filterSemester, filteredModules, modules, selectedModuleId]);

    const [moduleMap, setModuleMap] = useState({}); // Map Code -> Backend ID

    // Load Backend Modules to map Codes to IDs
    useEffect(() => {
        const fetchBackendModules = async () => {
            try {
                const res = await academicService.getModules();
                const backendModules = res.data || [];
                const map = {};
                backendModules.forEach(m => {
                    if (m.code) {
                        map[m.code.replace(/\s+/g, '')] = m._id;
                    }
                });
                setModuleMap(map);
            } catch (error) {
                console.error("Failed to fetch backend modules map", error);
            }
        };
        fetchBackendModules();
    }, []);

    // Load resources when module changes (and map is ready)
    useEffect(() => {
        if (!selectedModuleId) return;

        const loadResources = async () => {
            setFetchingResources(true);
            try {
                const normalizedCode = selectedModuleId.replace(/\s+/g, '');
                const backendId = moduleMap[normalizedCode];
                const queryId = backendId || normalizedCode || selectedModuleId;

                const res = await resourceService.getByModule(queryId);
                setResources(res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch resources", error);
                setResources([]);
            } finally {
                setFetchingResources(false);
            }
        };

        loadResources();
    }, [selectedModuleId, moduleMap]);

    // Categorize Resources
    const categorizeResources = (list) => {
        return {
            all: list,
            tutorials: list.filter(r => r.type === 'tutorial' || (r.type === 'marking_scheme' && r.answerFor === 'tutorial')),
            assignments: list.filter(r => r.type === 'assignment' || (r.type === 'marking_scheme' && r.answerFor === 'assignment')),
            pastPapers: list.filter(r => r.type === 'past_paper' || (r.type === 'marking_scheme' && r.answerFor === 'past_paper')),
            books: list.filter(r => r.type === 'book'),
            other: list.filter(r => r.type === 'other')
        };
    };

    // Filter resources by search query
    const filteredResources = resources.filter(resource => {
        if (!query) return true;
        const searchLower = query.toLowerCase();
        return (
            resource.title.toLowerCase().includes(searchLower) ||
            resource.type.toLowerCase().includes(searchLower) ||
            resource.fileName?.toLowerCase().includes(searchLower)
        );
    });

    // Categorize filtered resources
    const categorizedFiltered = categorizeResources(filteredResources);

    // Tab Definitions
    const tabs = [
        { id: 'all', label: 'All Resources', icon: Package, count: categorizedFiltered.all.length },
        { id: 'tutorials', label: 'Tutorials', icon: FileText, count: categorizedFiltered.tutorials.length },
        { id: 'assignments', label: 'Assignments', icon: CheckCircle, count: categorizedFiltered.assignments.length },
        { id: 'pastPapers', label: 'Past Papers', icon: BookOpen, count: categorizedFiltered.pastPapers.length },
        { id: 'books', label: 'Books', icon: Sparkles, count: categorizedFiltered.books.length }
    ];

    // Get selected module
    const selectedModule = modules.find(m => m.code === selectedModuleId);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-display text-slate-900 dark:text-white transition-colors duration-500">

            {/* Enhanced Hero Section - Command Center Style */}
            <div className="relative w-full overflow-hidden pb-12 sm:pb-16 lg:pb-20">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                </div>

                {/* Floating orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-700 opacity-10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-slate-600 opacity-5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">

                        {/* Left side - Title & Description */}
                        <div className="flex-1 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg w-fit">
                                <Package className="w-4 h-4 text-blue-300" />
                                <span className="text-white text-xs font-bold tracking-wide uppercase">Resources</span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
                                    Academic
                                    <span className="block mt-1 text-slate-500">
                                        Resources
                                    </span>
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                                    Access lecture materials, tutorials, and past papers for all modules.
                                </p>
                            </div>

                            {/* Quick stats badges */}
                            <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-white text-xs sm:text-sm font-bold">Live System</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <Package className="w-4 h-4 text-white" />
                                    <span className="text-white text-xs sm:text-sm font-bold">{resources.length} Resources</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-12 sm:pb-20">

                {/* Filter Pills - Always Visible */}
                <div className="mb-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Level Filter */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                            <label className="flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wide">
                                <Activity className="w-4 h-4" />
                                Academic Level
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setFilterLevel(l.toString())}
                                        className={`py-3 rounded-xl font-black text-sm transition-all ${filterLevel === l.toString()
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                    >
                                        Level {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Semester Filter */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                            <label className="flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wide">
                                <Calendar className="w-4 h-4" />
                                Semester
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[1, 2].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterSemester(s.toString())}
                                        className={`py-3 rounded-xl font-black text-sm transition-all ${filterSemester === s.toString()
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                    >
                                        Semester {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Selection Badge + Module Grid Toggle */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Selected Module:</span>
                            <span className="ml-2 text-sm font-black text-slate-900 dark:text-white">
                                {selectedModule ? `${selectedModule.code} - ${selectedModule.title}` : 'None'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModuleGrid(!showModuleGrid)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                    >
                        {showModuleGrid ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {showModuleGrid ? 'Hide' : 'Change'} Module
                    </button>
                </div>

                {/* Module Selection Grid */}
                {showModuleGrid && (
                    <div className="mb-8 animate-fadeIn">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    Select Module (Level {filterLevel}, Semester {filterSemester})
                                </h3>
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                    {filteredModules.length} modules
                                </span>
                            </div>
                            {filteredModules.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 font-bold">
                                        No modules found for Level {filterLevel}, Semester {filterSemester}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredModules.map(module => (
                                        <ModuleCard
                                            key={module.code}
                                            module={module}
                                            selected={selectedModuleId === module.code}
                                            onClick={() => {
                                                setSelectedModuleId(module.code);
                                                setShowModuleGrid(false);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Search Bar + View Toggle */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus-ring-white shadow-md"
                            placeholder="Search resources..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    {/* View Mode Toggle */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-md border border-slate-200 dark:border-slate-800 flex items-center self-start">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'cards'
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Cards
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'list'
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Layers className="w-4 h-4" />
                            List
                        </button>
                    </div>
                </div>

                {/* Resource Type Tabs */}
                <div className="mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-xl border border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-hide">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${isActive
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Resources Display */}
                {fetchingResources ? (
                    <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 dark:border-white border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold animate-pulse">Loading resources...</p>
                    </div>
                ) : categorizedFiltered[activeTab].length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center shadow-xl border border-slate-200 dark:border-slate-800">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            No {tabs.find(t => t.id === activeTab)?.label} Found
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            There are no resources available in this category.
                        </p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'cards' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {categorizedFiltered[activeTab].map(resource => (
                            <ResourceCard key={resource._id} resource={resource} viewMode={viewMode} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
