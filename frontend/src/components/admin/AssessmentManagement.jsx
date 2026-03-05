import React, { useState, useEffect } from 'react';
import { academicService, batchYearService, assessmentService, authService } from '../../services/authService';
import Dropdown from '../Dropdown';
import { Upload, FileText, CheckCircle, AlertCircle, Lock, GraduationCap, Calendar, BookOpen, TrendingUp } from 'lucide-react';

// Comprehensive module list from WUSL Module Tracker
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

export default function AssessmentManagement() {
    const [modules, setModules] = useState([]);
    const [filteredModules, setFilteredModules] = useState([]);
    const [batchYears, setBatchYears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        batchYear: new Date().getFullYear().toString(),
        level: '1',
        moduleId: '',
        type: 'Mid',
        file: null
    });

    // Valid levels
    const levels = ['1', '2', '3', '4'];

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        // If admin has batch scope, enforce it
        if (currentUser?.batchScope) {
            setFormData(prev => ({ ...prev, batchYear: currentUser.batchScope.toString() }));
        }

        fetchInitialData();
    }, []);

    // Filter modules when level changes
    useEffect(() => {
        console.log('Filtering Effect running. Level:', formData.level);

        let filtered = [];

        // 1. Try to find matching modules from API data
        if (modules.length > 0) {
            filtered = modules.filter(m => {
                if (m.level) return m.level.toString() === formData.level;
                if (m.code && m.code.length >= 5) {
                    const levelChar = m.code.charAt(4);
                    return levelChar === formData.level;
                }
                return true; // Keep if undetermined
            });
        }

        // 2. If no matches from API (or API empty), use local comprehensive list
        if (filtered.length === 0) {
            console.log('No matches from API, using local ALL_MODULES fallback');
            filtered = ALL_MODULES.filter(m => m.level === formData.level);
        }

        console.log('Filtered result count:', filtered.length);
        setFilteredModules(filtered);

    }, [formData.level, modules]);

    const fetchInitialData = async () => {
        try {
            const [modulesRes, batchRes] = await Promise.all([
                academicService.getModules(),
                batchYearService.getAll()
            ]);
            setModules(modulesRes.data || []);
            setBatchYears(batchRes.data.batchYears || []);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file || !formData.moduleId) {
            alert('Please select a module and a file');
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('batchYear', formData.batchYear);
        data.append('level', formData.level);
        data.append('moduleId', formData.moduleId);
        data.append('type', formData.type);
        data.append('file', formData.file);

        try {
            const res = await assessmentService.uploadResults(data);
            alert(`Upload Successful!\nProcessed: ${res.data.stats.total}\nSuccess: ${res.data.stats.success}\nErrors: ${res.data.stats.errors.length}`);
            if (res.data.stats.errors.length > 0) {
                console.error(res.data.stats.errors);
            }
        } catch (error) {
            alert('Upload failed: ' + (error.response?.data?.error?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const isSuperAdmin = user?.roles?.includes('superadmin');
    const isAdmin = user?.roles?.includes('admin');
    const hasBatchScope = !!user?.batchScope;
    const isBatchDisabled = !isSuperAdmin && hasBatchScope;

    return (
        <div className="space-y-6">
            {/* Instructions Card - Ash */}
            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-300">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">Upload Instructions</h3>
                        <ul className="text-sm text-slate-700 space-y-1.5">
                            <li className="flex items-start gap-2">
                                <span className="text-slate-900 mt-0.5">•</span>
                                <span>Upload an Excel/CSV file with student results</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-slate-900 mt-0.5">•</span>
                                <span><strong className="font-bold">Column 1:</strong> Registration Number (must match module)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-slate-900 mt-0.5">•</span>
                                <span><strong className="font-bold">Column 2:</strong> Marks (numerical value)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Main Upload Form */}
            <form onSubmit={handleUpload} className="space-y-6">
                {/* Selection Grid - Stats Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Batch Year Card */}
                    <div className="relative bg-white rounded-xl sm:rounded-2xl p-5 border border-slate-300 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-5 h-5 text-slate-900" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Batch Year</span>
                        </div>
                        <Dropdown
                            value={formData.batchYear}
                            onChange={e => setFormData({ ...formData, batchYear: e.target.value })}
                            options={batchYears.map(b => ({ value: b.year, label: b.name || b.year }))}
                            variant="default"
                            className={`w-full ${isBatchDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                        />
                        {isBatchDisabled && (
                            <>
                                <Lock className="w-4 h-4 text-slate-400 absolute right-12 top-16" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Locked to assigned batch</p>
                            </>
                        )}
                    </div>

                    {/* Level Card */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-5 border border-slate-300 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5 text-slate-900" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Level</span>
                        </div>
                        <Dropdown
                            value={formData.level}
                            onChange={e => setFormData({ ...formData, level: e.target.value })}
                            options={levels.map(l => ({ value: l, label: `Level ${l}` }))}
                            variant="default"
                            className="w-full"
                        />
                    </div>

                    {/* Module Card */}
                    <div className="sm:col-span-2 bg-white rounded-xl sm:rounded-2xl p-5 border border-slate-300 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5 text-slate-900" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Module</span>
                        </div>
                        <Dropdown
                            value={formData.moduleId}
                            onChange={e => setFormData({ ...formData, moduleId: e.target.value })}
                            options={[
                                { value: '', label: 'Select Module' },
                                ...filteredModules.map(m => ({
                                    value: m._id,
                                    label: `${m.code} - ${m.title}`
                                }))
                            ]}
                            placeholder="Select Module"
                            variant="default"
                            className="w-full"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{filteredModules.length} modules available</p>
                    </div>
                </div>

                {/* Exam Type & File Upload Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Exam Type Card */}
                    <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-5 border border-slate-300">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-slate-900" />
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Exam Type</span>
                        </div>
                        <Dropdown
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            options={[
                                { value: 'Mid', label: 'Mid Semester Exam' },
                                { value: 'End', label: 'End Semester Exam' }
                            ]}
                            variant="default"
                            className="w-full"
                        />
                    </div>

                    {/* File Upload Card */}
                    <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-5 border border-slate-300">
                        <div className="flex items-center gap-2 mb-3">
                            <Upload className="w-5 h-5 text-slate-900" />
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Results File</span>
                        </div>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm transition-colors hover:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                onChange={handleFileChange}
                                required
                            />
                            <FileText className="w-5 h-5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Excel or CSV format</p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative overflow-hidden bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        <div className="relative flex items-center gap-2.5">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Uploading Results...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Upload Results</span>
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </form>
        </div>
    );
}
