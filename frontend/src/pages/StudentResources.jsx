import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Download,
    FileText,
    Filter,
    Search,
    AlertCircle,
    File,
    CheckCircle
} from 'lucide-react';
import { academicService } from '../services/academicService';
import { authService } from '../services/authService';
import { MODULE_DATA } from '../data/moduleList';
import { resourceService } from '../services/resourceService';
import Loader from '../components/Loader';
import Dropdown from '../components/Dropdown';

export default function StudentResources() {
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [resources, setResources] = useState([]);
    const [fetchingResources, setFetchingResources] = useState(false);
    const [filterLevel, setFilterLevel] = useState('1');
    const [filterSemester, setFilterSemester] = useState('1');

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
                // res.data if axios, or res if array directly? academicService.getModules uses api.get which usually returns data.
                // Checking academicController.js: res.json(modules).
                // Checking api.js: axios response. So res.data is the array.
                const backendModules = res.data || [];
                const map = {};
                backendModules.forEach(m => {
                    // Normalize: Remove spaces to ensure matching (e.g. "CMIS 1113" or "CMIS1113")
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
                // Resolve Code to ID using Normalized Key
                const normalizedCode = selectedModuleId.replace(/\s+/g, '');
                const backendId = moduleMap[normalizedCode];

                // If we have an ID, use it. Otherwise use the Normalized Code
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

        // Only load if we have the map populated OR if we are willing to try with just code (race condition on initial load)
        // Better to wait for map?
        // If moduleMap is empty, might be loading. 
        // We can add moduleMap to dependency, and if backendId is found, triggers reload.
        loadResources();
    }, [selectedModuleId, moduleMap]);

    const [activeTab, setActiveTab] = useState('tutorials');

    // Categorize Resources
    const categorizeResources = (list) => {
        return {
            tutorials: list.filter(r => r.type === 'tutorial' || (r.type === 'marking_scheme' && r.answerFor === 'tutorial')),
            assignments: list.filter(r => r.type === 'assignment' || (r.type === 'marking_scheme' && r.answerFor === 'assignment')),
            pastPapers: list.filter(r => r.type === 'past_paper' || (r.type === 'marking_scheme' && r.answerFor === 'past_paper')),
            books: list.filter(r => r.type === 'book'),
            other: list.filter(r => r.type === 'other')
        };
    };

    const categorized = categorizeResources(resources);

    // Tab Definitions
    const tabs = [
        { id: 'tutorials', label: 'Tutorials', icon: FileText, count: categorized.tutorials.length, color: 'indigo' },
        { id: 'assignments', label: 'Assignments', icon: CheckCircle, count: categorized.assignments.length, color: 'orange' },
        { id: 'pastPapers', label: 'Past Papers', icon: BookOpen, count: categorized.pastPapers.length, color: 'emerald' },
        { id: 'books', label: 'Books', icon: BookOpen, count: categorized.books.length, color: 'rose' }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 animate-fadeIn max-w-[1400px] mx-auto space-y-8">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl">📚</span>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Academic Resources</h1>
                        </div>
                        <p className="text-blue-100 font-medium text-lg max-w-xl">
                            Access lecture materials, tutorials, and past papers, filtered by your academic year.
                        </p>
                    </div>
                    {/* Quick Filters in Header */}
                    <div className="flex gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20">
                        <div className="flex flex-col px-2">
                            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Academic Level</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setFilterLevel(l.toString())}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${filterLevel === l.toString()
                                            ? 'bg-white text-indigo-600 shadow-lg'
                                            : 'text-white hover:bg-white/20'
                                            }`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="w-px bg-white/20 my-1"></div>
                        <div className="flex flex-col px-2">
                            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Semester</span>
                            <div className="flex gap-1">
                                {[1, 2].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterSemester(s.toString())}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${filterSemester === s.toString()
                                            ? 'bg-white text-indigo-600 shadow-lg'
                                            : 'text-white hover:bg-white/20'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Selector & Controls */}
            {modules.length === 0 ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-3xl p-8 text-center max-w-2xl mx-auto mt-12">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">No Enrolled Modules Found</h3>
                    <p className="text-yellow-700 dark:text-yellow-300">You are not currently enrolled in any modules.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
                    {/* Controls Header */}
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                        <div className="w-full md:w-[400px] z-20">
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Select Module
                                </label>
                                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                    L{filterLevel} Semester {filterSemester}
                                </span>
                            </div>
                            <Dropdown
                                value={selectedModuleId}
                                onChange={(e) => setSelectedModuleId(e.target.value)}
                                options={filteredModules.map(m => ({
                                    value: m.code,
                                    label: `${m.code} - ${m.title}`
                                }))}
                                icon={<BookOpen className="w-4 h-4" />}
                                placeholder={filteredModules.length > 0 ? "Select a module..." : "No modules found"}
                                variant="default"
                            />
                        </div>

                        <div className="hidden md:block h-12 w-px bg-gray-200 dark:bg-slate-700 mx-4"></div>

                        {/* Tabs */}
                        <div className="flex-1 w-full overflow-x-auto no-scrollbar">
                            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Resource Category</label>
                            <div className="flex gap-3">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300
                                                ${isActive
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                                    : 'bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                                            {tab.label}
                                            {tab.count > 0 && (
                                                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'}`}>
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Resources Grid */}
                    {fetchingResources ? (
                        <div className="text-center py-32 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-700">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                            <p className="mt-4 text-gray-500 dark:text-gray-400 font-bold animate-pulse">Loading resources...</p>
                        </div>
                    ) : (
                        <div className="min-h-[400px]">
                            {categorized[activeTab].length === 0 ? (
                                <div className="text-center py-24 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-700">
                                    <div className="bg-white dark:bg-slate-700 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <File className="w-12 h-12 text-gray-300 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No {tabs.find(t => t.id === activeTab).label} Found</h3>
                                    <p className="text-gray-500 dark:text-gray-400">There are no resources available in this category yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                    {categorized[activeTab].map(resource => (
                                        <div key={resource._id} className="group bg-white dark:bg-slate-700 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-slate-600 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                            <div className="p-5 h-full flex flex-col">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                                                        <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    {resource.type === 'marking_scheme' && resource.answerFor && (
                                                        <span className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-100 dark:border-teal-800 uppercase tracking-wide">
                                                            {resource.answerFor.replace('_', ' ')} Answer
                                                        </span>
                                                    )}
                                                    {resource.academicYear && (
                                                        <span className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-100 dark:border-purple-800 uppercase tracking-wide ml-2">
                                                            {resource.academicYear}
                                                        </span>
                                                    )}
                                                </div>

                                                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                                                    {resource.title}
                                                </h4>

                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-6 mt-auto">
                                                    <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span>{formatFileSize(resource.size)}</span>
                                                </div>

                                                <a
                                                    href={(() => {
                                                        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                                                        // Ensure we have /api/v1 if not already there, assuming standard setup
                                                        // If VITE_API_BASE_URL ends in /api/v1, don't append. 
                                                        // But usually it's just the host.
                                                        // For safety, let's stick to the pattern used, but safer.
                                                        const url = baseUrl.includes('/api/v1')
                                                            ? baseUrl
                                                            : `${baseUrl}/api/v1`;

                                                        return `${url}/resources/stream/${resource._id}`;
                                                    })()}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-50 dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-indigo-500/30 cursor-pointer"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
