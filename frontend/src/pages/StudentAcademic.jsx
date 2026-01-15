import { useState, useEffect } from 'react'
import { authService, academicService } from '../services/authService'
import Loader from '../components/Loader'
import { MODULE_DATA } from '../data/moduleList'

export default function StudentAcademic() {
    const [user, setUser] = useState(null)
    const [student, setStudent] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedLevel, setSelectedLevel] = useState('1');
    const [showDegreeRules, setShowDegreeRules] = useState(false);
    const [showGradingScale, setShowGradingScale] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await authService.getProfile();
                if (res.success) {
                    setUser(res.user);
                    setStudent(res.studentProfile?.studentDetails); // Set student from studentProfile
                    setProfile(res.studentProfile);
                    // Default to student's level or 1
                    setSelectedLevel(res.studentProfile?.studentDetails?.level?.toString() || '1');
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Helper: Calculate GPA for a specific level or cumulative
    const calculateGPA = (profile, moduleData, level) => {
        if (!profile || !profile.results) return '0.00';

        const targetModules = moduleData.filter(m => level === 'all' || m.level === parseInt(level));
        let totalWeightedGP = 0;
        let totalCredits = 0;

        targetModules.forEach(module => {
            const result = profile.results.find(r =>
                r.module && r.module.code && r.module.code.replace(/\s+/g, '').toUpperCase() === module.code.replace(/\s+/g, '').toUpperCase()
            );

            // Only count if grade is not I, and has a gradePoint
            if (result && result.gradePoint !== undefined && result.grade !== 'I') {
                totalWeightedGP += (result.gradePoint * module.credits);
                totalCredits += module.credits;
            }
        });

        // GPA = Sum(GP * Credits) / Sum(Credits)
        return totalCredits > 0 ? (totalWeightedGP / totalCredits).toFixed(2) : '0.00';
    };

    // Helper: Calculate Completed Credits
    const calculateCompletedCredits = (profile, moduleData, level) => {
        if (!profile || !profile.results) return 0;

        const targetModules = moduleData.filter(m => level === 'all' || m.level === parseInt(level));
        let completedCredits = 0;

        targetModules.forEach(module => {
            const result = profile.results.find(r =>
                r.module && r.module.code && r.module.code.replace(/\s+/g, '').toUpperCase() === module.code.replace(/\s+/g, '').toUpperCase()
            );
            // Count if grade is valid pass (C or better technically for degree, but any pass D or better gives credits usually? 
            // WUSL Rules: D+, D, E are fail grades - check doc.
            // Doc says "Grades D+, D, E = Fail grades". So only >= C- (1.7) count??
            // Wait, "Grade C = Minimum pass grade (2.0)". "Grades D+, D, E = Fail grades".
            // Actually checking doc: "Grades D+, D, E = Fail grades" (Line 306).
            // So need to check if gradePoint >= 1.7 (C-) or 2.0 (C)?
            // Doc "Grade C = Minimum pass grade".
            // Doc says "Pass Degree Requirements... Grade C or better".
            // But usually credits are earned for D? 
            // WUSL Doc Line 306: "Grades D+, D, E = Fail grades". 
            // So if grade is D+ (1.3), it is Fail.
            // So only Grade Point >= 1.7 (C-) is pass? 
            // Line 298: "C- : Satisfactory".
            // So let's assume >= C- earns credits. But usually for General Degree "Grade C or better" is needed for major credits.
            // For simple "Completed Credits" display, I will sum anything that is NOT (D+, D, E, I, F).

            if (result && result.grade && !['D+', 'D', 'E', 'F', 'N', 'I'].includes(result.grade)) {
                completedCredits += module.credits;
            }
        });

        return completedCredits;
    };

    // Render function for Degree Rules Modal
    const renderDegreeRulesModal = () => {
        if (!showDegreeRules) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Degree Rules & Requirements</h3>
                        <button onClick={() => setShowDegreeRules(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-4 text-gray-700 dark:text-gray-300 space-y-4">
                        <p>This section would detail the specific requirements for your degree program, including:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Minimum GPA requirements (e.g., 2.0 for Pass, 3.3 for First Class Honours)</li>
                            <li>Total credit requirements (e.g., 120 credits for a general degree)</li>
                            <li>Specific module requirements (core, optional, electives)</li>
                            <li>Level-wise credit distribution</li>
                            <li>Rules for repeating modules or supplementary exams</li>
                        </ul>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Please refer to the official university handbook or your faculty for the most accurate and up-to-date information.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // Render function for Grading Scale Modal
    const renderGradingScaleModal = () => {
        if (!showGradingScale) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">WUSL Grading Scale</h3>
                        <button onClick={() => setShowGradingScale(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-4 text-gray-700 dark:text-gray-300">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Grade
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Grade Point (GP)
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">A+</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">4.0</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Excellent</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">A</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">4.0</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Excellent</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">A-</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">3.7</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Very Good</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">B+</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">3.3</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Good</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">B</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">3.0</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Good</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">B-</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">2.7</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Satisfactory</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">C+</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">2.3</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Satisfactory</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">C</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">2.0</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Minimum Pass Grade</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">C-</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">1.7</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Satisfactory (Fail for degree credit)</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">D+</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">1.3</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Fail</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">D</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">1.0</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Fail</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">E</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">0.0</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Fail</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">F</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">0.0</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Fail (Absent/Disqualified)</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">I</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">N/A</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Incomplete</td></tr>
                                    <tr><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">N</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">N/A</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Not Graded</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Note: A minimum grade of 'C' (2.0 GP) is generally required for a module to count towards degree credit. Grades C-, D+, D, E, F, I, N do not typically earn degree credits.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <Loader />
    }

    if (!student) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                    <span className="text-6xl mb-4 block">❌</span>
                    <h2 className="text-2xl font-bold text-red-800">Student record not found</h2>
                </div>
            </div>
        )
    }

    // Filter results based on selected level
    const filteredResults = selectedLevel === 'all'
        ? profile?.results || []
        : (profile?.results || []).filter(r => r.module.level === parseInt(selectedLevel))

    return (
        <div className="p-4 md:p-8 animate-fadeIn max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-5xl">🎓</span>
                        <h1 className="text-3xl md:text-4xl font-bold">Academic Records</h1>
                    </div>
                    <p className="text-xl md:text-2xl font-medium opacity-90 mb-4">
                        {student.fullName}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            📋 {student.registrationNumber}
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            📅 {student.batchYear}
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            🎓 Level {student.level}
                        </span>
                    </div>
                </div>
            </div>

            {/* Academic Status & Honours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Status */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <span>📊</span> Academic Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Degree Programme</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{profile?.studentDetails?.degreeProgramme || 'Not Selected'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Combination</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{profile?.studentDetails?.combination || 'Not Selected'}</p>
                        </div>
                    </div>
                </div>

                {/* Projected Honours */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl shadow-sm border-2 border-amber-200 dark:border-amber-800 p-6">
                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                        <span>🎖️</span> Projected Honours
                    </h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{profile?.honours || 'Pass Degree'}</p>
                            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">Based on GPA: {profile?.gpa?.overall?.toFixed(2) || '0.00'}</p>
                        </div>
                        <span className="text-5xl">🏆</span>
                    </div>
                </div>
            </div>

            {/* Dean's List Eligibility */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <span>⭐</span> Dean's List Eligibility
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`p-4 rounded-xl border-2 ${profile?.deansList?.[`level${level}`] === 'ELIGIBLE'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800 shadow-sm'
                            : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
                            }`}>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Level {level}</p>
                            <p className={`font-bold text-sm ${profile?.deansList?.[`level${level}`] === 'ELIGIBLE'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                {profile?.deansList?.[`level${level}`] || 'NOT ELIGIBLE'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-emerald-200 dark:border-emerald-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overall GPA</p>
                        <span className="text-3xl">🏆</span>
                    </div>
                    <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{profile?.gpa?.overall?.toFixed(2) || '0.00'}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-amber-200 dark:border-amber-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Credits</p>
                        <span className="text-3xl">⭐</span>
                    </div>
                    <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{profile?.credits?.total || '0'}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-blue-200 dark:border-blue-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Modules</p>
                        <span className="text-3xl">📚</span>
                    </div>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{profile?.results?.length || '0'}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-purple-200 dark:border-purple-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Level</p>
                        <span className="text-3xl">📈</span>
                    </div>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{student?.level || '-'}</p>
                </div>
            </div>

            {/* Level-wise Performance */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <span>📊</span> Level-wise Performance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(level => (
                        <div key={level} className="text-center">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Level {level}</p>
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border-2 border-indigo-100 dark:border-indigo-800">
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                    {profile?.gpa?.[`level${level}`]?.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">GPA</p>
                                <div className="pt-3 border-t border-indigo-200 dark:border-indigo-800">
                                    <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                                        {profile?.credits?.[`level${level}`] || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Credits</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Module Results Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span>📖</span> Module Results
                    </h3>

                    {/* Level Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedLevel('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedLevel === 'all'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            All Levels
                        </button>
                        {[1, 2, 3, 4].map(level => (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(level.toString())}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedLevel === level.toString()
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                Level {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* WUSL Academic Info & GPA Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Level GPA Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-all"></div>
                        <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-sm mb-1">
                            {selectedLevel === 'all' ? 'Cumulative GPA' : `Level ${selectedLevel} GPA`}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-gray-900 dark:text-white">
                                {calculateGPA(profile, MODULE_DATA, selectedLevel)}
                            </span>
                            <span className="text-sm font-bold text-gray-400 dark:text-gray-500">
                                / 4.00
                            </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {`Completed: ${calculateCompletedCredits(profile, MODULE_DATA, selectedLevel)} Credits`}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons for Rules */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowGradingScale(true)}
                            className="flex flex-col justify-center items-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-800 rounded-3xl hover:shadow-md transition-all group cursor-pointer"
                        >
                            <div className="bg-white dark:bg-emerald-900/30 p-3 rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="text-2xl">📊</span>
                            </div>
                            <span className="font-bold text-emerald-800 dark:text-emerald-300">View Grading Scale</span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">WUSL GPA Reference</span>
                        </button>

                        <button
                            onClick={() => setShowDegreeRules(true)}
                            className="flex flex-col justify-center items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800 rounded-3xl hover:shadow-md transition-all group cursor-pointer"
                        >
                            <div className="bg-white dark:bg-blue-900/30 p-3 rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🎓</span>
                            </div>
                            <span className="font-bold text-blue-800 dark:text-blue-300">Degree Requirements</span>
                            <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">General vs Special</span>
                        </button>
                    </div>
                </div>

                {/* Content Table using Static List + DB Grades */}
                {/* Semester-wise Module Organization */}
                {[1, 2].map((semester) => {
                    // Filter modules for this Level + Semester
                    const semesterModules = MODULE_DATA.filter(m =>
                        (selectedLevel === 'all' || m.level === parseInt(selectedLevel)) &&
                        m.semester === semester
                    );

                    if (semesterModules.length === 0) return null;

                    // Calculate Semester Stats
                    const currentSemGPA = calculateGPA(profile, semesterModules, 'all');
                    const currentSemCredits = calculateCompletedCredits(profile, semesterModules, 'all');
                    const totalSemCredits = semesterModules.reduce((acc, m) => acc + m.credits, 0);

                    return (
                        <div key={semester} className="mb-8 last:mb-0">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm border border-indigo-200 dark:border-indigo-800">
                                        S{semester}
                                    </span>
                                    Semester {semester === 1 ? 'dI' : 'II'} &nbsp;
                                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 self-center hidden sm:inline-block">
                                        (Level {selectedLevel === 'all' ? 'All' : selectedLevel})
                                    </span>
                                </h3>
                                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                    <div className="bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm flex items-center gap-2">
                                        <span className="text-gray-500 dark:text-gray-400">Credits:</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{currentSemCredits}/{totalSemCredits}</span>
                                    </div>
                                    <div className="bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm flex items-center gap-2">
                                        <span className="text-gray-500 dark:text-gray-400">SGPA:</span>
                                        <span className={`font-bold ${parseFloat(currentSemGPA) >= 2.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {currentSemGPA}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                                                <th className="text-left py-3 px-4 sm:px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                                                <th className="text-left py-3 px-4 sm:px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module Title</th>
                                                <th className="text-center py-3 px-4 sm:px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                                                <th className="text-center py-3 px-4 sm:px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="text-center py-3 px-4 sm:px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                            {semesterModules.map((module, idx) => {
                                                const result = profile?.results?.find(r =>
                                                    r.module && r.module.code && r.module.code.replace(/\s+/g, '').toUpperCase() === module.code.replace(/\s+/g, '').toUpperCase()
                                                );

                                                const isPass = result && result.grade && !['D+', 'D', 'E', 'F', 'N', 'I'].includes(result.grade);

                                                return (
                                                    <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${!result ? 'opacity-60' : ''}`}>
                                                        <td className="py-4 px-4 sm:px-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-xs sm:text-sm">
                                                                    {module.code}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 inline-block bg-gray-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded uppercase tracking-wide w-fit">
                                                                    {module.department}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 sm:px-6">
                                                            <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                                                                {module.title}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 sm:px-6 text-center">
                                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-bold text-gray-600 dark:text-gray-300">
                                                                {module.credits}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 sm:px-6 text-center">
                                                            {result ? (
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isPass
                                                                        ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                                                        : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                                                    }`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${isPass ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                                    {isPass ? 'Pass' : 'Repeat'}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-400 border border-gray-100 dark:bg-slate-700/50 dark:text-gray-500 dark:border-slate-700">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4 sm:px-6 text-center">
                                                            {result ? (
                                                                <div className="flex flex-col items-center">
                                                                    <span className={`text-lg font-black ${(result.grade || '').startsWith('A') ? 'text-emerald-600 dark:text-emerald-400' :
                                                                            (result.grade || '').startsWith('B') ? 'text-blue-600 dark:text-blue-400' :
                                                                                (result.grade || '').startsWith('C') ? 'text-yellow-600 dark:text-yellow-400' :
                                                                                    'text-red-500 dark:text-red-400'
                                                                        }`}>
                                                                        {result.grade}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                                                                        GP: {result.gradePoint?.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-200 dark:text-gray-700 font-bold text-xl">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {renderDegreeRulesModal()}
            {renderGradingScaleModal()}
        </div>
    )
}
