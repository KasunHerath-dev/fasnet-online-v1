import React, { useState, useEffect } from 'react';
import { academicService, authService, batchYearService, resourceService } from '../services/authService';
import Dropdown from './Dropdown';
import { Upload, FileText, Trash2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

// Using the same module list for fallback/consistency
const ALL_MODULES = [
    // ... (rest of file)
];

export default function ResourceManagement() {
    const [modules, setModules] = useState([]);
    const [filteredModules, setFilteredModules] = useState([]);
    const [batchYears, setBatchYears] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        batchYear: new Date().getFullYear().toString(),
        level: '1',
        semester: '1',
        moduleId: '',
        category: 'question', // 'question' or 'answer'
        context: 'tutorial', // 'tutorial', 'assignment', 'past_paper', 'other'
        title: '',
        file: null
    });

    const levels = ['1', '2', '3', '4'];
    const semesters = ['1', '2'];

    // UI Options
    const categories = [
        { value: 'question', label: 'Question Paper / Problem Sheet' },
        { value: 'answer', label: 'Answer / Marking Scheme' },
        { value: 'book', label: 'Book / Reading Material' }
    ];

    const contexts = [
        { value: 'tutorial', label: 'Tutorial' },
        { value: 'assignment', label: 'Assignment' },
        { value: 'past_paper', label: 'Past Paper' },
        { value: 'other', label: 'Other' }
    ];


    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        loadInitialData();

        // Check internal module list vs API
        fetchModules();
    }, []);

    useEffect(() => {
        filterModules();
    }, [formData.level, formData.semester, modules]); // Re-filter when level or semester changes

    useEffect(() => {
        if (formData.moduleId) {
            fetchResources(formData.moduleId);
        } else {
            setResources([]);
        }
    }, [formData.moduleId]);

    const loadInitialData = async () => {
        try {
            const batchRes = await batchYearService.getAll();
            const years = batchRes.data.batchYears || batchRes.data || [];
            setBatchYears(years);

            // Set default batch if available
            if (years.length > 0 && !authService.getCurrentUser()?.batchScope) {
                setFormData(prev => ({ ...prev, batchYear: years[0].year }));
            }
        } catch (error) {
            console.error("Failed to load batches", error);
        }
    };

    const fetchModules = async () => {
        try {
            const res = await academicService.getModules();
            if (res.data && res.data.length > 0) {
                setModules(res.data);
            } else {
                // Fallback if needed, or handled by API returning default list
                setModules([]);
            }
        } catch (error) {
            console.error("Failed to fetch modules", error);
        }
    };

    const filterModules = () => {
        let sourceModules = modules;

        // Fallback to local list if API modules are absent
        if (!sourceModules || sourceModules.length === 0) {
            sourceModules = ALL_MODULES;
        }

        // Filter by Level AND Semester
        const filtered = sourceModules.filter(m =>
            m.level.toString() === formData.level &&
            m.semester.toString() === formData.semester
        );
        setFilteredModules(filtered);

        // Reset module selection if it's no longer in the list
        if (formData.moduleId && !filtered.find(m => m._id === formData.moduleId)) {
            setFormData(prev => ({ ...prev, moduleId: '' }));
        }
    };

    const fetchResources = async (moduleId) => {
        setLoading(true);
        try {
            const res = await resourceService.getByModule(moduleId);
            setResources(res.data.data);
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, file }));
            // Auto-set title if empty
            if (!formData.title) {
                setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file || !formData.moduleId) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', formData.file);
        data.append('title', formData.title);
        data.append('moduleId', formData.moduleId);

        // Logic to map Category + Context -> Type + AnswerFor
        let finalType = 'other';
        let finalAnswerFor = '';

        if (formData.category === 'question') {
            // Map Context directly to Type
            finalType = formData.context; // 'tutorial', 'assignment', 'past_paper', 'other'
        } else if (formData.category === 'answer') {
            finalType = 'marking_scheme';
            finalAnswerFor = formData.context; // 'tutorial', 'assignment', 'past_paper', 'other'
        } else if (formData.category === 'book') {
            finalType = 'book';
        }

        data.append('type', finalType);
        if (finalAnswerFor) {
            data.append('answerFor', finalAnswerFor);
        }

        try {
            await resourceService.upload(data);
            alert('File uploaded successfully!');
            // Reset form file part
            setFormData(prev => ({ ...prev, file: null, title: '' }));
            fetchResources(formData.moduleId);
        } catch (error) {
            const serverError = error.response?.data?.error;
            const message = error.response?.data?.message || error.message;
            alert(`Upload failed: ${message}\nDetails: ${serverError || ''}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            await resourceService.delete(id);
            fetchResources(formData.moduleId);
        } catch (error) {
            alert('Delete failed');
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
// Header removed (Mega auth is server-side)

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 sticky top-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-800">Upload Resource</h2>
                                <p className="text-sm text-gray-500 font-bold">Add materials for students</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            {/* Level Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Level</label>
                                <Dropdown
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    options={levels.map(l => ({ value: l, label: `Level ${l}` }))}
                                />
                            </div>

                            {/* Semester Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Semester</label>
                                <Dropdown
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    options={semesters.map(s => ({ value: s, label: `Semester ${s}` }))}
                                />
                            </div>

                            {/* Module Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Module</label>
                                <Dropdown
                                    value={formData.moduleId}
                                    onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                                    options={filteredModules.map(m => ({ value: m._id, label: `${m.code} - ${m.title}` }))}
                                    placeholder="Select Module"
                                />
                            </div>

                            {/* Updated Workflow: Category -> Context */}

                            {/* Resource Category Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Resource Category</label>
                                <Dropdown
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    options={categories}
                                />
                            </div>

                            {/* Resource Context Selection (Tutorial, Past Paper, etc.) */}
                            {formData.category !== 'book' && (
                                <div className="animate-fadeIn">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {formData.category === 'question' ? 'Document Type' : 'Answer For'}
                                    </label>
                                    <Dropdown
                                        value={formData.context}
                                        onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                                        options={contexts}
                                    />
                                </div>
                            )}

                            {/* File Upload */}
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {formData.file ? (
                                    <div className="flex flex-col items-center">
                                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                        <p className="font-bold text-gray-700">{formData.file.name}</p>
                                        <p className="text-xs text-gray-500">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-600">
                                        <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <p className="font-bold">Click to upload or drag and drop</p>
                                        <p className="text-xs">PDF, Word, PPT (Max 10MB)</p>
                                    </div>
                                )}
                            </div>

                            {/* Title Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 font-bold text-gray-700 transition-all outline-none"
                                    placeholder="e.g. Lecture 1 Slides"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !formData.file || !formData.moduleId}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
                                    ${uploading || !formData.file
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200 hover:scale-[1.02]'}`}
                            >
                                {uploading ? 'Uploading...' : 'Upload Resource'}
                                {!uploading && <Upload className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Resource List */}
                <div className="lg:col-span-2 space-y-6">
                    {!formData.moduleId ? (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                            <FileText className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-bold">Select a module to view resources</p>
                        </div>
                    ) : (
                        <>
                            {/* Tutorials Section */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <FileText className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="font-bold text-indigo-900">Tutorials</h3>
                                    <span className="ml-auto bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm border border-indigo-100">
                                        {resources.filter(r => r.type === 'tutorial').length}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {resources.filter(r => r.type === 'tutorial').map(resource => (
                                        <ResourceItem key={resource._id} resource={resource} onDelete={handleDelete} />
                                    ))}
                                    {resources.filter(r => r.type === 'tutorial').length === 0 && (
                                        <div className="p-8 text-center text-gray-400 font-medium">No tutorials uploaded yet</div>
                                    )}
                                </div>
                            </div>

                            {/* Assignments Section */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <FileText className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <h3 className="font-bold text-orange-900">Assignments</h3>
                                    <span className="ml-auto bg-white px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm border border-orange-100">
                                        {resources.filter(r => r.type === 'assignment').length}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {resources.filter(r => r.type === 'assignment').map(resource => (
                                        <ResourceItem key={resource._id} resource={resource} onDelete={handleDelete} />
                                    ))}
                                    {resources.filter(r => r.type === 'assignment').length === 0 && (
                                        <div className="p-8 text-center text-gray-400 font-medium">No assignments uploaded yet</div>
                                    )}
                                </div>
                            </div>

                            {/* Past Papers Section */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <FileText className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="font-bold text-purple-900">Question Papers</h3>
                                    <span className="ml-auto bg-white px-3 py-1 rounded-full text-xs font-bold text-purple-600 shadow-sm border border-purple-100">
                                        {resources.filter(r => r.type === 'past_paper').length}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {resources.filter(r => r.type === 'past_paper').map(resource => (
                                        <ResourceItem key={resource._id} resource={resource} onDelete={handleDelete} />
                                    ))}
                                    {resources.filter(r => r.type === 'past_paper').length === 0 && (
                                        <div className="p-8 text-center text-gray-400 font-medium">No question papers uploaded yet</div>
                                    )}
                                </div>
                            </div>

                            {/* Marking Schemes Section */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-teal-50 border-b border-teal-100 flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <CheckCircle className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <h3 className="font-bold text-teal-900">Answers / Marking Schemes</h3>
                                    <span className="ml-auto bg-white px-3 py-1 rounded-full text-xs font-bold text-teal-600 shadow-sm border border-teal-100">
                                        {resources.filter(r => r.type === 'marking_scheme').length}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {resources.filter(r => r.type === 'marking_scheme').map(resource => (
                                        <ResourceItem key={resource._id} resource={resource} onDelete={handleDelete} />
                                    ))}
                                    {resources.filter(r => r.type === 'marking_scheme').length === 0 && (
                                        <div className="p-8 text-center text-gray-400 font-medium">No marking schemes uploaded yet</div>
                                    )}
                                </div>
                            </div>

                            {/* Books Section */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <FileText className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <h3 className="font-bold text-rose-900">Books / Reading Materials</h3>
                                    <span className="ml-auto bg-white px-3 py-1 rounded-full text-xs font-bold text-rose-600 shadow-sm border border-rose-100">
                                        {resources.filter(r => r.type === 'book').length}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {resources.filter(r => r.type === 'book').map(resource => (
                                        <ResourceItem key={resource._id} resource={resource} onDelete={handleDelete} />
                                    ))}
                                    {resources.filter(r => r.type === 'book').length === 0 && (
                                        <div className="p-8 text-center text-gray-400 font-medium">No books uploaded yet</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ResourceItem({ resource, onDelete }) {
    return (
        <div className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">{resource.mimeType?.split('/')[1] || 'FILE'}</span>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        {resource.title}
                        {resource.type === 'marking_scheme' && resource.answerFor && (
                            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] uppercase font-bold border border-teal-200">
                                {resource.answerFor.replace('_', ' ')} Answer
                            </span>
                        )}
                    </h4>
                    <p className="text-xs text-gray-500">
                        {(resource.size / 1024 / 1024).toFixed(2)} MB • {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                    href={`${import.meta.env.VITE_API_BASE_URL}/resources/stream/${resource._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download / View"
                >
                    <ExternalLink className="w-5 h-5" />
                </a>
                <button
                    onClick={() => onDelete(resource._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
