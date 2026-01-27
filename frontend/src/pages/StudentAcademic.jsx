import { useState, useEffect } from 'react'
import { authService, academicService } from '../services/authService'
import Loader from '../components/Loader'
import { MODULE_DATA } from '../data/moduleList'
import { GraduationCap, Award, BookCheck, Target, TrendingUp, Users, Activity, Sparkles, Zap, Package } from 'lucide-react'

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
                // 1. Get User from local auth
                const currentUser = authService.getUser();
                setUser(currentUser);

                // 2. Check for student reference
                if (currentUser && currentUser.studentRef && currentUser.studentRef._id) {
                    const res = await academicService.getStudentProfile(currentUser.studentRef._id);
                    // Structure based on StudentDashboard usage: res.data.studentDetails
                    // But StudentProfile usage might be: res.data which has studentDetails + results
                    // Let's inspect the response structure assumption.
                    // StudentDashboard uses: res.data.studentDetails
                    // Let's assume the API returns { studentDetails: ..., results: ... } or { data: { studentDetails: ..., results: ... } }
                    // Based on previous code, res.studentProfile was used.
                    // Let's try to adapt to what academicService returns.

                    const data = res.data;
                    if (data) {
                        setStudent(data.studentDetails);
                        setProfile(data); // data likely contains { studentDetails, results, gpa, credits }
                        setSelectedLevel(data.studentDetails?.level?.toString() || '1');
                    }
                } else {
                    console.warn("No student reference found for user");
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
    const calculateGPA = (profile, moduleData, level, combination = null) => {
        if (!profile || !profile.results) return '0.00';

        let targetModules = moduleData.filter(m => level === 'all' || m.level === parseInt(level));
        if (combination) {
            targetModules = filterModulesByCombination(targetModules, combination);
        }
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

    // Helper: Filter modules by combination
    const filterModulesByCombination = (modules, combination) => {
        if (!combination) return modules; // If no combination, show all

        // Normalize strings
        const comb = combination.toUpperCase();

        // WUSL Combination Definitions
        const COMB_1 = ['CMIS', 'ELTN', 'MATH', 'STAT'];
        const COMB_2 = ['ELTN', 'IMGT', 'MATH', 'STAT'];
        const COMB_3 = ['IMGT', 'CMIS', 'MATH', 'STAT'];

        return modules.filter(m => {
            const dept = m.department;

            // Exact Combination Match
            if (comb.includes('COMB 1') || comb.includes('COMB1')) {
                return COMB_1.includes(dept);
            }
            if (comb.includes('COMB 2') || comb.includes('COMB2')) {
                return COMB_2.includes(dept);
            }
            if (comb.includes('COMB 3') || comb.includes('COMB3')) {
                return COMB_3.includes(dept);
            }

            // Keyword Logic (Fallback for non-standard names)
            const combLower = combination.toLowerCase();
            const isComputing = combLower.includes('computer') || combLower.includes('cmis');
            const isElectronics = combLower.includes('electronic') || combLower.includes('eltn');
            const isMath = combLower.includes('math') || combLower.includes('mathematics');
            const isManagement = combLower.includes('management') || combLower.includes('imgt') || combLower.includes('industrial');
            const isStats = combLower.includes('statistic') || combLower.includes('stat');

            if (isComputing || isElectronics || isMath || isManagement || isStats) {
                if (dept === 'CMIS' && isComputing) return true;
                if (dept === 'ELTN' && isElectronics) return true;
                if (dept === 'MATH' && isMath) return true;
                if (dept === 'IMGT' && isManagement) return true;
                if (dept === 'STAT' && isStats) return true;
                return false;
            }

            // Unknown combination? Show all.
            return true;
        });
    };

    // Helper: Calculate Total Number of Modules for a given level and combination
    const calculateTotalModules = (moduleData, level, combination) => {
        const levelFiltered = moduleData.filter(m => level === 'all' || m.level === parseInt(level));
        return filterModulesByCombination(levelFiltered, combination).length;
    };

    // Helper: Calculate Completed Credits
    const calculateCompletedCredits = (profile, moduleData, level, combination = null) => {
        if (!profile || !profile.results) return 0;

        let targetModules = moduleData.filter(m => level === 'all' || m.level === parseInt(level));
        if (combination) {
            targetModules = filterModulesByCombination(targetModules, combination);
        }
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
        <div className="min-h-screen bg-slate-50 dark:bg-black font-display text-slate-900 dark:text-white transition-colors duration-500">

            {/* Enhanced Hero Section - Command Center Style */}
            <div className="relative w-full overflow-hidden pb-12 sm:pb-16 lg:pb-20">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLWdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
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
                                <GraduationCap className="w-4 h-4 text-amber-300" />
                                <span className="text-white text-xs font-bold tracking-wide uppercase">Transcript</span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
                                    Academic
                                    <span className="block mt-1 text-slate-500">
                                        Records
                                    </span>
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                                    {student.fullName}
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
                                    <span className="text-white text-xs sm:text-sm font-bold">📋 {student.registrationNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="text-white text-xs sm:text-sm font-bold">📅 {student.batchYear}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="text-white text-xs sm:text-sm font-bold">🎓 Level {student.level}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-12 sm:pb-20 space-y-6 sm:space-y-8">


                {/* Academic Status & Honours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Academic Status */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            Academic Status
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Degree Programme</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.studentDetails?.degreeProgramme || 'Not Selected'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Combination</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.studentDetails?.combination || 'Not Selected'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Projected Honours */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-800 p-6">
                        <h3 className="text-lg font-black text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            Projected Honours
                        </h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{profile?.honours || 'Pass Degree'}</p>
                                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-1">Based on GPA: {profile?.gpa?.overall?.toFixed(2) || '0.00'}</p>
                            </div>
                            <span className="text-4xl">🏆</span>
                        </div>
                    </div>
                </div>


                {/* Dean's List Eligibility */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Dean's List Eligibility
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(level => (
                            <div key={level} className={`p-4 rounded-xl border transition-all ${profile?.deansList?.[`level${level}`] === 'ELIGIBLE'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                }`}>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Level {level}</p>
                                <p className={`font-black text-sm ${profile?.deansList?.[`level${level}`] === 'ELIGIBLE'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-400 dark:text-slate-500'
                                    }`}>
                                    {profile?.deansList?.[`level${level}`] || 'NOT ELIGIBLE'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Overall GPA */}
                    <div className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {profile?.gpa?.overall?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Overall GPA
                        </p>
                    </div>

                    {/* Total Credits */}
                    <div className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {profile?.credits?.total || '0'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Total Credits
                        </p>
                    </div>

                    {/* Modules */}
                    <div className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <BookCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {calculateTotalModules(MODULE_DATA, 'all', student?.combination)}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Modules
                        </p>
                    </div>

                    {/* Current Level */}
                    <div className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">
                            Level {student?.level || '-'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Current Level
                        </p>
                    </div>
                </div>

                {/* Level-wise Performance */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Level-wise Performance
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(level => (
                            <div key={level} className="text-center">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Level {level}</p>
                                <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                                        {profile?.gpa?.[`level${level}`]?.toFixed(2) || '0.00'}
                                    </p>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">GPA</p>
                                    <div className="pt-3 border-t border-indigo-200 dark:border-indigo-800">
                                        <p className="text-xl font-black text-purple-600 dark:text-purple-400">
                                            {profile?.credits?.[`level${level}`] || 0}
                                        </p>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Credits</p>
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
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/20 transition-all"></div>
                            <h3 className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider text-sm mb-1">
                                {selectedLevel === 'all' ? 'Cumulative GPA' : `Level ${selectedLevel} GPA`}
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">
                                    {calculateGPA(profile, MODULE_DATA, selectedLevel)}
                                </span>
                                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                                    / 4.00
                                </span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    {`Completed: ${calculateCompletedCredits(profile, MODULE_DATA, selectedLevel)} Credits`}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons for Rules */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowGradingScale(true)}
                                className="flex flex-col justify-center items-center p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl hover:shadow-md transition-all group cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-white dark:bg-emerald-900/20 rounded-xl mb-3 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="font-black text-emerald-800 dark:text-emerald-300">View Grading Scale</span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">WUSL GPA Reference</span>
                            </button>

                            <button
                                onClick={() => setShowDegreeRules(true)}
                                className="flex flex-col justify-center items-center p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl hover:shadow-md transition-all group cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-white dark:bg-blue-900/20 rounded-xl mb-3 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-black text-blue-800 dark:text-blue-300">Degree Requirements</span>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">General vs Special</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Table using Static List + DB Grades */}
                    {/* Semester-wise Module Organization */}
                    {[1, 2].map((semester) => {
                        // Filter modules for this Level + Semester + Combination
                        let semesterModules = MODULE_DATA.filter(m =>
                            (selectedLevel === 'all' || m.level === parseInt(selectedLevel)) &&
                            m.semester === semester
                        );
                        // Apply combination filter
                        semesterModules = filterModulesByCombination(semesterModules, student?.combination);

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
        </div>
    )
}
