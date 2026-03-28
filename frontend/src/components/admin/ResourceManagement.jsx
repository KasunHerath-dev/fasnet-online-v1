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
                    <div className="bg-white dark:bg-stitch-card-dark rounded-[2rem] shadow-xl border border-slate-100 dark:border-white/5 p-6 md:p-8 sticky top-6">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-slate-900 dark:bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                                <Upload className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Upload</h2>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Add new materials</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-6">
                            {/* Level Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Academic Level</label>
                                <Dropdown
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    options={levels.map(l => ({ value: l, label: `Level ${l}` }))}
                                    className="w-full"
                                />
                            </div>

                            {/* Semester Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Semester</label>
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
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Target Module</label>
                                    <span className="text-[10px] font-bold text-stitch-blue">
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
                                    <div className="flex items-center gap-2 mt-2 text-red-500 dark:text-red-400">
                                        <AlertCircle className="w-4 h-4" />
                                        <p className="text-xs font-bold">No modules available</p>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-white/5 my-2"></div>

                            {/* Resource Category Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Category</label>
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
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
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
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Academic Year</label>
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
                                                className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all flex items-center justify-center border-2 border-indigo-100 dark:border-indigo-500/20 flex-shrink-0"
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
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Storage Provider</label>
                                <Dropdown
                                    value={formData.storageType}
                                    onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                                    options={[
                                        { value: 'mega', label: 'Mega Drive (Primary)' },
                                        { value: 'google_drive', label: 'Google Drive (Secondary)' }
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            {/* File Upload */}
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 text-center hover:bg-slate-100 hover:border-slate-400 dark:hover:bg-slate-800 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer relative group">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {formData.file ? (
                                    <div className="flex flex-col items-center animate-fadeIn">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-full px-2">{formData.file.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-stitch-blue" />
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-slate-200">Tap to upload file</p>
                                        <p className="text-xs text-slate-400">PDF, Word, PPT • Max 50MB</p>
                                    </div>
                                )}
                            </div>

                            {/* Title Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Resource Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-4 bg-white dark:bg-black/20 border-2 border-slate-200 dark:border-white/10 rounded-2xl focus:border-stitch-blue dark:focus:border-stitch-blue font-bold text-slate-900 dark:text-white transition-all outline-none"
                                    placeholder="e.g. Lecture 01 Slides"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !formData.file || !formData.moduleId}
                                className={`w-full py-4 rounded-xl font-black text-white shadow-lg shadow-slate-900/10 flex items-center justify-center gap-3 transition-all transform hover:translate-y-[-2px]
                                    ${uploading || !formData.file
                                        ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                                        : 'bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-black hover:shadow-xl active:scale-95'}`}
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
                        <div className="h-96 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 border-3 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/5 p-8 text-center">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10 opacity-50" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Module Selected</h3>
                            <p className="font-medium max-w-sm mx-auto">Please select a Level, Semester, and Module from the left panel to view and manage resources.</p>
                        </div>
                    ) : (
                        loading ? (
                            <div className="h-96 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 border-4 border-stitch-blue/30 border-t-stitch-blue rounded-full animate-spin mb-4"></div>
                                <p className="font-bold text-slate-500 dark:text-slate-400">Loading resources...</p>
                            </div>
                        ) : (
                            <>
                                {/* Tutorials Section */}
                                <ResourceSection
                                    title="Tutorials"
                                    resources={resources.filter(r => r.type === 'tutorial')}
                                    icon={<FileQuestion className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                                    color="indigo"
                                    onDelete={handleDelete}
                                />

                                {/* Assignments Section */}
                                <ResourceSection
                                    title="Assignments"
                                    resources={resources.filter(r => r.type === 'assignment')}
                                    icon={<PenTool className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                                    color="orange"
                                    onDelete={handleDelete}
                                />

                                {/* Past Papers Section */}
                                <ResourceSection
                                    title="Question Papers"
                                    resources={resources.filter(r => r.type === 'past_paper')}
                                    icon={<FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                                    color="purple"
                                    onDelete={handleDelete}
                                />

                                {/* Marking Schemes Section */}
                                <ResourceSection
                                    title="Marking Schemes"
                                    resources={resources.filter(r => r.type === 'marking_scheme')}
                                    icon={<CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                                    color="teal"
                                    onDelete={handleDelete}
                                />

                                {/* Books Section */}
                                <ResourceSection
                                    title="Books & Reading"
                                    resources={resources.filter(r => r.type === 'book')}
                                    icon={<Book className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                                    color="rose"
                                    onDelete={handleDelete}
                                />

                                {resources.length === 0 && (
                                    <div className="bg-white dark:bg-stitch-card-dark rounded-[2rem] p-12 text-center border border-slate-100 dark:border-white/5">
                                        <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">No resources found</p>
                                        <p className="text-slate-500 dark:text-slate-400">Be the first to upload materials for this module.</p>
                                    </div>
                                )}
                            </>
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
    // Dynamic color classes based on the 'color' prop would typically need a lookup or full classes
    // simplifying for safety using direct mappings for the ones we generally use
    const colors = {
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 border-indigo-100 dark:border-indigo-500/20',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100 border-orange-100 dark:border-orange-500/20',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 border-purple-100 dark:border-purple-500/20',
        teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-900 dark:text-teal-100 border-teal-100 dark:border-teal-500/20',
        rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-100 border-rose-100 dark:border-rose-500/20'
    };

    const headerClass = colors[color] || colors.indigo;

    if (resources.length === 0) return null;

    return (
        <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden transition-all hover:translate-y-[-4px] duration-300">
            <div className={`p-6 border-b flex items-center gap-4 ${headerClass}`}>
                <div className="p-3 bg-white dark:bg-white/10 rounded-xl shadow-sm backdrop-blur-sm">
                    {icon}
                </div>
                <h3 className="text-lg font-black">{title}</h3>
                <span className="ml-auto bg-white dark:bg-black/20 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                    {resources.length}
                </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
                {resources.map(resource => (
                    <ResourceItem key={resource._id} resource={resource} onDelete={onDelete} color={color} />
                ))}
            </div>
        </div>
    )
}

function ResourceItem({ resource, onDelete, color }) {
    return (
        <div className="p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-400 uppercase border border-slate-200 dark:border-white/10">
                    {resource.mimeType?.includes('pdf') ? 'PDF' : resource.mimeType?.split('/')[1]?.slice(0, 3) || 'FILE'}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 text-base">
                        {resource.title}
                        {resource.type === 'marking_scheme' && resource.answerFor && (
                            <span className="px-2 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[10px] uppercase font-bold tracking-wide">
                                {resource.answerFor.replace('_', ' ')} Answer
                            </span>
                        )}
                        {resource.academicYear && (
                            <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wide">
                                {resource.academicYear}
                            </span>
                        )}
                        <span className={`px-2 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wide border ml-2 ${
                            resource.storageType === 'google_drive' 
                                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30'
                        }`}>
                            {resource.storageType === 'google_drive' ? 'Drive' : 'Mega'}
                        </span>
                    </h4>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                        {(resource.size / 1024 / 1024).toFixed(2)} MB • {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                    href={`/api/v1/resources/stream/${resource._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-stitch-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                    title="Download / View"
                >
                    <ExternalLink className="w-5 h-5" />
                </a>
                <button
                    onClick={() => onDelete(resource._id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    title="Delete"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}


