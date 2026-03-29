import React, { useState, useEffect } from 'react';
import { academicService, authService, batchYearService, resourceService } from '../../services/authService';
import Dropdown from '../Dropdown';
import BatchYearModal from './BatchYearModal';
import { useToast } from '../../context/ToastContext';
import { Upload, FileText, Trash2, ExternalLink, CheckCircle, AlertCircle, Plus, Book, FileQuestion, PenTool } from 'lucide-react';

// Using the same module list for fallback/consistency
const ALL_MODULES = [
    // Level 1 - Semester I
    { _id: 'CMIS1113', code: 'CMIS1113', title: 'Introduction to Computers and Operating Systems', level: '1', semester: '1', credits: 3 },
    { _id: 'CMIS1123', code: 'CMIS1123', title: 'Computer Programming I', level: '1', semester: '1', credits: 3 },
    { _id: 'CMIS1131', code: 'CMIS1131', title: 'Practical Computing I', level: '1', semester: '1', credits: 1 },
    { _id: 'ELTN1112', code: 'ELTN1112', title: 'Fundamentals of Electricity and Magnetism', level: '1', semester: '1', credits: 2 },
    { _id: 'ELTN1122', code: 'ELTN1122', title: 'Introduction to Semiconductors', level: '1', semester: '1', credits: 2 },
    { _id: 'ELTN1132', code: 'ELTN1132', title: 'Basic Digital Electronics', level: '1', semester: '1', credits: 2 },
    { _id: 'MATH1112', code: 'MATH1112', title: 'Introduction to Mathematics I', level: '1', semester: '1', credits: 2 },
    { _id: 'STAT1113', code: 'STAT1113', title: 'Introduction to Probability and Statistics I', level: '1', semester: '1', credits: 3 },
    { _id: 'IMGT1112', code: 'IMGT1112', title: 'Principles of Management', level: '1', semester: '1', credits: 2 },
    { _id: 'IMGT1122', code: 'IMGT1122', title: 'Business Economics', level: '1', semester: '1', credits: 2 },
    { _id: 'IMGT1132', code: 'IMGT1132', title: 'Entrepreneurial Dynamics', level: '1', semester: '1', credits: 2 },

    // Level 1 - Semester II
    { _id: 'CMIS1212', code: 'CMIS1212', title: 'Computer Programming II', level: '1', semester: '2', credits: 2 },
    { _id: 'CMIS1221', code: 'CMIS1221', title: 'Practical Computing II', level: '1', semester: '2', credits: 1 },
    { _id: 'ELTN1212', code: 'ELTN1212', title: 'Basic Electronics - Lab', level: '1', semester: '2', credits: 2 },
    { _id: 'ELTN1222', code: 'ELTN1222', title: 'General Physics', level: '1', semester: '2', credits: 2 },
    { _id: 'MATH1212', code: 'MATH1212', title: 'Introduction to Mathematics II', level: '1', semester: '2', credits: 2 },
    { _id: 'MATH1222', code: 'MATH1222', title: 'Differential Equations', level: '1', semester: '2', credits: 2 },
    { _id: 'STAT1213', code: 'STAT1213', title: 'Introduction to Probability and Statistics II', level: '1', semester: '2', credits: 3 },
    { _id: 'IMGT1212', code: 'IMGT1212', title: 'Principles of Accounting', level: '1', semester: '2', credits: 2 },
    { _id: 'IMGT1222', code: 'IMGT1222', title: 'Marketing Management', level: '1', semester: '2', credits: 2 },

    // Level 2 - Semester I
    { _id: 'CMIS2113', code: 'CMIS2113', title: 'Object-oriented Programming', level: '2', semester: '1', credits: 3 },
    { _id: 'CMIS2123', code: 'CMIS2123', title: 'Database Management Systems', level: '2', semester: '1', credits: 3 },
    { _id: 'ELTN2112', code: 'ELTN2112', title: 'Electricity and Magnetism', level: '2', semester: '1', credits: 2 },
    { _id: 'ELTN2121', code: 'ELTN2121', title: 'Electricity and Magnetism - Lab', level: '2', semester: '1', credits: 1 },
    { _id: 'MATH2114', code: 'MATH2114', title: 'Linear Algebra I', level: '2', semester: '1', credits: 4 },
    { _id: 'STAT2112', code: 'STAT2112', title: 'Statistical Inference I', level: '2', semester: '1', credits: 2 },
    { _id: 'IMGT2112', code: 'IMGT2112', title: 'Operations Management I', level: '2', semester: '1', credits: 2 },
    { _id: 'IMGT2122', code: 'IMGT2122', title: 'Cost & Management Accounting', level: '2', semester: '1', credits: 2 },
    { _id: 'IMGT2132', code: 'IMGT2132', title: 'Service Industry Concepts', level: '2', semester: '1', credits: 2 },

    // Level 2 - Semester II
    { _id: 'CMIS2214', code: 'CMIS2214', title: 'Data Structures & Analysis of Algorithms', level: '2', semester: '2', credits: 4 },
    { _id: 'ELTN2213', code: 'ELTN2213', title: 'Semiconductor Devices', level: '2', semester: '2', credits: 3 },
    { _id: 'ELTN2221', code: 'ELTN2221', title: 'Semiconductor Devices - Lab', level: '2', semester: '2', credits: 1 },
    { _id: 'ELTN2232', code: 'ELTN2232', title: 'Analogue Electronics', level: '2', semester: '2', credits: 2 },
    { _id: 'ELTN2241', code: 'ELTN2241', title: 'Analogue Electronics - Lab', level: '2', semester: '2', credits: 1 },
    { _id: 'MATH2213', code: 'MATH2213', title: 'Linear Algebra II', level: '2', semester: '2', credits: 3 },
    { _id: 'STAT2212', code: 'STAT2212', title: 'Design of Experiments', level: '2', semester: '2', credits: 2 },
    { _id: 'STAT2222', code: 'STAT2222', title: 'Regression Analysis', level: '2', semester: '2', credits: 2 },
    { _id: 'IMGT2212', code: 'IMGT2212', title: 'Human Resource Management', level: '2', semester: '2', credits: 2 },
    { _id: 'IMGT2222', code: 'IMGT2222', title: 'Operations Research I', level: '2', semester: '2', credits: 2 },

    // Level 3 - Semester I
    { _id: 'CMIS3114', code: 'CMIS3114', title: 'Data Communication & Computer Networks', level: '3', semester: '1', credits: 4 },
    { _id: 'CMIS3122', code: 'CMIS3122', title: 'Rapid Application Development', level: '3', semester: '1', credits: 2 },
    { _id: 'CMIS3134', code: 'CMIS3134', title: 'Computer Architecture & Compiler Design', level: '3', semester: '1', credits: 4 },
    { _id: 'CMIS3142', code: 'CMIS3142', title: 'Computational Methods', level: '3', semester: '1', credits: 2 },
    { _id: 'CMIS3153', code: 'CMIS3153', title: 'Advanced Database Systems', level: '3', semester: '1', credits: 3 },
    { _id: 'ELTN3113', code: 'ELTN3113', title: 'Digital Electronics', level: '3', semester: '1', credits: 3 },
    { _id: 'ELTN3121', code: 'ELTN3121', title: 'Digital Electronics - Lab', level: '3', semester: '1', credits: 1 },
    { _id: 'ELTN3133', code: 'ELTN3133', title: 'Data Acquisition and Signal Processing', level: '3', semester: '1', credits: 3 },
    { _id: 'ELTN3141', code: 'ELTN3141', title: 'Data Acquisition and Signal Processing – Lab', level: '3', semester: '1', credits: 1 },
    { _id: 'MMOD3113', code: 'MMOD3113', title: 'Mathematical Methods', level: '3', semester: '1', credits: 3 },
    { _id: 'MMOD3124', code: 'MMOD3124', title: 'Mathematical Models', level: '3', semester: '1', credits: 4 },
    { _id: 'STAT3112', code: 'STAT3112', title: 'Statistical Inference II', level: '3', semester: '1', credits: 2 },
    { _id: 'STAT3124', code: 'STAT3124', title: 'Time Series Analysis', level: '3', semester: '1', credits: 4 },
    { _id: 'IMGT3112', code: 'IMGT3112', title: 'Operations Management II', level: '3', semester: '1', credits: 2 },
    { _id: 'IMGT3122', code: 'IMGT3122', title: 'Organization Development', level: '3', semester: '1', credits: 2 },
    { _id: 'IMGT3162', code: 'IMGT3162', title: 'Business & Industrial Law', level: '3', semester: '1', credits: 2 },

    // Level 3 - Semester II
    { _id: 'CMIS3214', code: 'CMIS3214', title: 'Software Engineering', level: '3', semester: '2', credits: 4 },
    { _id: 'CMIS3224', code: 'CMIS3224', title: 'Web Designing and e-commerce', level: '3', semester: '2', credits: 4 },
    { _id: 'CMIS3234', code: 'CMIS3234', title: 'Computer Graphics and Visualization', level: '3', semester: '2', credits: 4 },
    { _id: 'CMIS3242', code: 'CMIS3242', title: 'Mobile and Ubiquitous Computing', level: '3', semester: '2', credits: 2 },
    { _id: 'CMIS3253', code: 'CMIS3253', title: 'Data Mining', level: '3', semester: '2', credits: 3 },
    { _id: 'ELTN3212', code: 'ELTN3212', title: 'AC Theory', level: '3', semester: '2', credits: 2 },
    { _id: 'ELTN3222', code: 'ELTN3222', title: 'Scientific Writing', level: '3', semester: '2', credits: 2 },
    { _id: 'ELTN3233', code: 'ELTN3233', title: 'Microprocessor and Microcontroller Technology', level: '3', semester: '2', credits: 3 },
    { _id: 'ELTN3241', code: 'ELTN3241', title: 'Microprocessor and Microcontroller Technology - Lab', level: '3', semester: '2', credits: 1 },
    { _id: 'MMOD3214', code: 'MMOD3214', title: 'Numerical Methods', level: '3', semester: '2', credits: 4 },
    { _id: 'STAT3212', code: 'STAT3212', title: 'Statistical Techniques', level: '3', semester: '2', credits: 2 },
    { _id: 'STAT3223', code: 'STAT3223', title: 'Operations Research', level: '3', semester: '2', credits: 3 },
    { _id: 'STAT3232', code: 'STAT3232', title: 'Data Analysis & Preparation of Statistical Reports', level: '3', semester: '2', credits: 2 },
    { _id: 'IMGT3212', code: 'IMGT3212', title: 'Operations Research II', level: '3', semester: '2', credits: 2 },
    { _id: 'IMGT3222', code: 'IMGT3222', title: 'Management of Technology', level: '3', semester: '2', credits: 2 },
    { _id: 'IMGT3232', code: 'IMGT3232', title: 'International Business', level: '3', semester: '2', credits: 2 },

    // Level 4 - Semester I
    { _id: 'CMIS4114', code: 'CMIS4114', title: 'Artificial Intelligence', level: '4', semester: '1', credits: 4 },
    { _id: 'CMIS4123', code: 'CMIS4123', title: 'Advanced Operating Systems', level: '4', semester: '1', credits: 3 },
    { _id: 'CMIS4134', code: 'CMIS4134', title: 'Distributed and Cloud Computing', level: '4', semester: '1', credits: 4 },
    { _id: 'CMIS4142', code: 'CMIS4142', title: 'Image Processing', level: '4', semester: '1', credits: 2 },
    { _id: 'CMIS4153', code: 'CMIS4153', title: 'Parallel Computing', level: '4', semester: '1', credits: 3 },
    { _id: 'CMIS4118', code: 'CMIS4118', title: 'Research Project (Special)', level: '4', semester: '1', credits: 8 },
    { _id: 'CMIS4126', code: 'CMIS4126', title: 'Research Project (Joint Major)', level: '4', semester: '1', credits: 6 },
    { _id: 'ELTN4114', code: 'ELTN4114', title: 'Communication Theory and Systems', level: '4', semester: '1', credits: 4 },
    { _id: 'ELTN4143', code: 'ELTN4143', title: 'Programmable Logic Devices', level: '4', semester: '1', credits: 3 },
    { _id: 'ELTN4151', code: 'ELTN4151', title: 'Programmable Logic Devices - Lab', level: '4', semester: '1', credits: 1 },
    { _id: 'MATH4114', code: 'MATH4114', title: 'Complex Variables', level: '4', semester: '1', credits: 4 },
    { _id: 'STAT4114', code: 'STAT4114', title: 'Stochastic Processes', level: '4', semester: '1', credits: 4 },
    { _id: 'STAT4134', code: 'STAT4134', title: 'Actuarial Mathematics', level: '4', semester: '1', credits: 4 },
    { _id: 'IMGT4123', code: 'IMGT4123', title: 'Environmental Management based on ISO 14001', level: '4', semester: '1', credits: 3 },
    { _id: 'IMGT4133', code: 'IMGT4133', title: 'Computer based Modelling & Simulation', level: '4', semester: '1', credits: 3 },
    { _id: 'IMGT4142', code: 'IMGT4142', title: 'Supply Chain Management', level: '4', semester: '1', credits: 2 },
    { _id: 'IMGT4152', code: 'IMGT4152', title: 'Productivity Techniques', level: '4', semester: '1', credits: 2 },
    { _id: 'IMGT4162', code: 'IMGT4162', title: 'Financial Management', level: '4', semester: '1', credits: 2 },
    { _id: 'IMGT4172', code: 'IMGT4172', title: 'Strategic Management', level: '4', semester: '1', credits: 2 },

    // Level 4 - Semester II
    { _id: 'CMIS4216', code: 'CMIS4216', title: 'Industrial Training (Special)', level: '4', semester: '2', credits: 6 },
    { _id: 'INDT4216', code: 'INDT4216', title: 'Industrial Training (General/Joint Major)', level: '4', semester: '2', credits: 6 },
    { _id: 'ELTN4213', code: 'ELTN4213', title: 'Digital Signal Processing', level: '4', semester: '2', credits: 3 },
    { _id: 'MATH4214', code: 'MATH4214', title: 'Partial Differential Equations', level: '4', semester: '2', credits: 4 },
    { _id: 'MATH4224', code: 'MATH4224', title: 'Measure Theory', level: '4', semester: '2', credits: 4 },
    { _id: 'IMGT4213', code: 'IMGT4213', title: 'Advanced Marketing Management', level: '4', semester: '2', credits: 3 },
    { _id: 'IMGT4222', code: 'IMGT4222', title: 'Applied Econometrics', level: '4', semester: '2', credits: 2 },
    { _id: 'IMGT4234', code: 'IMGT4234', title: 'Advanced Operations Research', level: '4', semester: '2', credits: 4 },
    { _id: 'IMGT4242', code: 'IMGT4242', title: 'Strategic Business Analysis', level: '4', semester: '2', credits: 2 },
];

export default function ResourceManagement() {
    const toast = useToast();
    const [modules, setModules] = useState([]);
    const [filteredModules, setFilteredModules] = useState([]);
    const [batchYears, setBatchYears] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);
    const [showBatchModal, setShowBatchModal] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        batchYear: new Date().getFullYear().toString(),
        level: '1',
        semester: '1',
        moduleId: '',
        category: 'question', // 'question' or 'answer'
        context: 'tutorial', // 'tutorial', 'assignment', 'past_paper', 'other'
        storageType: 'mega', // 'mega' or 'google_drive'
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
        const currentUser = authService.getUser();
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
            if (years.length > 0 && !authService.getCurrentUser()?.batchScope && !formData.batchYear) {
                setFormData(prev => ({ ...prev, batchYear: years[0].year }));
            }
        } catch (error) {
            console.error("Failed to load batches", error);
        }
    };

    const handleBatchYearCreated = (year) => {
        loadInitialData(); // Refresh list
        if (year) {
            setFormData(prev => ({ ...prev, batchYear: year })); // Select new year
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
        let sourceModules = ALL_MODULES;

        // Fallback to local list if API modules are absent (Consolidated)
        // Only use API modules if they are significantly different? 
        // For now, ALL_MODULES is the source of truth for the dropdown structure.
        if (modules && modules.length > ALL_MODULES.length) {
            sourceModules = modules;
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
            if (file.size > 50 * 1024 * 1024) {
                toast.error('File size must be less than 50MB');
                e.target.value = ''; // Reset input
                return;
            }
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
        data.append('storageType', formData.storageType);

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

        // Find module in API list OR Fallback list
        const selectedModule = modules.find(m => m._id === formData.moduleId) ||
            ALL_MODULES.find(m => m._id === formData.moduleId);

        if (selectedModule) {
            data.append('moduleContext', JSON.stringify(selectedModule));
        }

        // Append Academic Year for specific types
        if ((finalType === 'past_paper' || (finalType === 'marking_scheme' && finalAnswerFor === 'past_paper')) && formData.batchYear) {
            data.append('academicYear', formData.batchYear);
        }

        try {
            await resourceService.upload(data);
            toast.success('File uploaded successfully!');
            // Reset form file part
            setFormData(prev => ({ ...prev, file: null, title: '' }));
            fetchResources(formData.moduleId);
        } catch (error) {
            const serverError = error.response?.data?.error;
            const message = error.response?.data?.message || error.message;
            toast.error(`Upload failed: ${message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            await resourceService.delete(id);
            toast.success('Resource deleted successfully');
            fetchResources(formData.moduleId);
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 sticky top-6">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                                <Upload className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Upload</h2>
                                <p className="text-sm font-bold text-slate-500">Add new materials</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-6">
                            {/* Level Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Academic Level</label>
                                <Dropdown
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    options={levels.map(l => ({ value: l, label: `Level ${l}` }))}
                                    className="w-full"
                                />
                            </div>

                            {/* Semester Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Semester</label>
                                <Dropdown
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    options={semesters.map(s => ({ value: s, label: `Semester ${s}` }))}
                                    className="w-full"
                                />
                            </div>

                            {/* Module Selection */}
                            <div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Module</label>
                                    <span className="text-[10px] font-bold text-indigo-600">
                                        L{formData.level} • S{formData.semester}
                                    </span>
                                </div>
                                <Dropdown
                                    value={formData.moduleId}
                                    onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                                    options={filteredModules.map(m => ({ value: m._id, label: `${m.code} - ${m.title}` }))}
                                    placeholder={filteredModules.length > 0 ? "Select Module" : "No modules found"}
                                    className="w-full"
                                />
                                {filteredModules.length === 0 && (
                                    <div className="flex items-center gap-2 mt-2 text-red-500">
                                        <AlertCircle className="w-4 h-4" />
                                        <p className="text-xs font-bold">No modules available</p>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-slate-100 my-2"></div>

                            {/* Resource Category Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Category</label>
                                <Dropdown
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    options={categories}
                                    className="w-full"
                                />
                            </div>

                            {/* Resource Context Selection (Tutorial, Past Paper, etc.) */}
                            {formData.category !== 'book' && (
                                <div className="animate-fadeIn">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                        {formData.category === 'question' ? 'Document Type' : 'Answer For'}
                                    </label>
                                    <Dropdown
                                        value={formData.context}
                                        onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                                        options={contexts}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* Academic Year Selection (Only for Past Papers) */}
                            {((formData.context === 'past_paper') || (formData.category === 'answer' && formData.context === 'past_paper')) && (
                                <div className="animate-fadeIn">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Academic Year</label>
                                    <div className="flex gap-2">
                                        <Dropdown
                                            value={formData.batchYear}
                                            onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                                            options={batchYears.map(y => ({ value: y.year, label: y.name || y.year }))}
                                            placeholder="Select Year"
                                            className="flex-1"
                                        />
                                        {user?.roles?.includes('superadmin') && (
                                            <button
                                                type="button"
                                                onClick={() => setShowBatchModal(true)}
                                                className="w-12 h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all flex items-center justify-center border-2 border-indigo-100 flex-shrink-0"
                                                title="Add New Academic Year"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Storage Provider Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Storage Provider</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['mega', 'google_drive'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, storageType: type })}
                                            className={`py-2 px-3 rounded-xl text-[11px] font-bold border-2 transition-all ${
                                                formData.storageType === type 
                                                    ? (type === 'mega' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-indigo-50 border-indigo-200 text-indigo-600')
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                        >
                                            {type === 'mega' ? 'Mega Drive' : 'Google Drive'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 text-center hover:bg-white hover:border-indigo-400 transition-all duration-300 cursor-pointer relative group shadow-inner">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {formData.file ? (
                                    <div className="flex flex-col items-center animate-fadeIn">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <p className="font-bold text-slate-900 truncate max-w-full px-2">{formData.file.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform border border-slate-100">
                                            <Upload className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <p className="font-bold text-slate-900">Tap to upload file</p>
                                        <p className="text-xs text-slate-400 font-medium tracking-tight">PDF, Word, PPT • Max 50MB</p>
                                    </div>
                                )}
                            </div>

                            {/* Title Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Resource Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 font-bold text-slate-900 transition-all outline-none"
                                    placeholder="e.g. Lecture 01 Slides"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !formData.file || !formData.moduleId}
                                className={`w-full py-4 rounded-xl font-black text-white shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-95
                                    ${uploading || !formData.file
                                        ? 'bg-slate-200 cursor-not-allowed shadow-none text-slate-400'
                                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300'}`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        <span>Upload Resource</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Resource List */}
                <div className="xl:col-span-2 space-y-8">
                    {!formData.moduleId ? (
                        <div className="h-96 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white p-8 text-center shadow-sm">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                <FileText className="w-10 h-10 opacity-30" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">No Module Selected</h3>
                            <p className="font-semibold text-slate-500 max-w-sm mx-auto">Please select a Level, Semester, and Module from the left panel to view and manage resources.</p>
                        </div>
                    ) : (
                        loading ? (
                            <div className="h-96 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                <p className="font-bold text-slate-500">Loading resources...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Section Components */}
                                <ResourceSection
                                    title="Tutorials"
                                    resources={resources.filter(r => r.type === 'tutorial')}
                                    icon={<FileQuestion className="w-5 h-5 text-indigo-600" />}
                                    color="indigo"
                                    onDelete={handleDelete}
                                />

                                <ResourceSection
                                    title="Assignments"
                                    resources={resources.filter(r => r.type === 'assignment')}
                                    icon={<PenTool className="w-5 h-5 text-amber-600" />}
                                    color="orange"
                                    onDelete={handleDelete}
                                />

                                <ResourceSection
                                    title="Question Papers"
                                    resources={resources.filter(r => r.type === 'past_paper')}
                                    icon={<FileText className="w-5 h-5 text-purple-600" />}
                                    color="purple"
                                    onDelete={handleDelete}
                                />

                                <ResourceSection
                                    title="Marking Schemes"
                                    resources={resources.filter(r => r.type === 'marking_scheme')}
                                    icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
                                    color="teal"
                                    onDelete={handleDelete}
                                />

                                <ResourceSection
                                    title="Books & Reading"
                                    resources={resources.filter(r => r.type === 'book')}
                                    icon={<Book className="w-5 h-5 text-rose-600" />}
                                    color="rose"
                                    onDelete={handleDelete}
                                />

                                {resources.length === 0 && (
                                    <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-sm">
                                        <div className="mb-4 inline-flex w-16 h-16 bg-slate-50 rounded-full items-center justify-center border border-slate-100">
                                            <Book className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">No resources found</h3>
                                        <p className="text-slate-500 font-medium">Be the first to upload materials for this module.</p>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Batch Year Modal */}
            {
                showBatchModal && (
                    <BatchYearModal
                        onClose={() => setShowBatchModal(false)}
                        onSuccess={handleBatchYearCreated}
                    />
                )
            }
        </div >
    );
}

function ResourceSection({ title, resources, icon, color, onDelete }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-900 border-indigo-100',
        orange: 'bg-amber-50 text-amber-900 border-amber-100',
        purple: 'bg-purple-50 text-purple-900 border-purple-100',
        teal: 'bg-emerald-50 text-emerald-900 border-emerald-100',
        rose: 'bg-rose-50 text-rose-900 border-rose-100'
    };

    const headerClass = colors[color] || colors.indigo;

    if (resources.length === 0) return null;

    return (
        <div className="bg-white rounded-[2.5rem] shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden transition-all hover:translate-y-[-4px] duration-300">
            <div className={`p-6 border-b flex items-center gap-4 ${headerClass}`}>
                <div className="p-3 bg-white rounded-xl shadow-sm border border-black/5">
                    {icon}
                </div>
                <h3 className="text-lg font-black">{title}</h3>
                <span className="ml-auto bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-black/5">
                    {resources.length}
                </span>
            </div>
            <div className="divide-y divide-slate-50">
                {resources.map(resource => (
                    <ResourceItem key={resource._id} resource={resource} onDelete={onDelete} color={color} />
                ))}
            </div>
        </div>
    )
}

function ResourceItem({ resource, onDelete, color }) {
    return (
        <div className="p-5 hover:bg-slate-50/80 transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-[10px] text-slate-500 uppercase border border-slate-200 shadow-sm leading-none text-center">
                    {resource.mimeType?.includes('pdf') ? 'PDF' : resource.mimeType?.split('/')[1]?.slice(0, 3) || 'FILE'}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-3 text-base">
                        {resource.title}
                        {resource.type === 'marking_scheme' && resource.answerFor && (
                            <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[9px] uppercase font-black tracking-wider">
                                {resource.answerFor.replace('_', ' ')} Answer
                            </span>
                        )}
                        {resource.academicYear && (
                            <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] uppercase font-black tracking-wider border border-indigo-100">
                                {resource.academicYear}
                            </span>
                        )}
                        <span className={`px-2 py-1 rounded-lg text-[9px] uppercase font-black tracking-wider border ml-2 ${
                            resource.storageType === 'google_drive' 
                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                            {resource.storageType === 'google_drive' ? 'Drive' : 'Mega'}
                        </span>
                    </h4>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-2">
                        {(resource.size / 1024 / 1024).toFixed(2)} MB 
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        {new Date(resource.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                    href={`/api/v1/resources/stream/${resource._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Download / View"
                >
                    <ExternalLink className="w-5 h-5" />
                </a>
                <button
                    onClick={() => onDelete(resource._id)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}


