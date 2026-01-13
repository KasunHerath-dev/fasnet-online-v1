import React, { useState, useEffect } from 'react';
import { academicService, authService, batchYearService, resourceService } from '../services/authService';
import Dropdown from './Dropdown';
import { Upload, FileText, Trash2, ExternalLink, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';

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
    const [modules, setModules] = useState([]);
    const [filteredModules, setFilteredModules] = useState([]);
    const [batchYears, setBatchYears] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);
    const [authUrl, setAuthUrl] = useState('');

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
