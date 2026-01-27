import { useState, useEffect } from 'react'
import { authService, academicService } from '../services/authService'
import Loader from '../components/Loader'
import { MODULE_DATA } from '../data/moduleList'
import {
    GraduationCap,
    Award,
    BookCheck,
    Target,
    TrendingUp,
    Activity,
    Sparkles,
    Package,
    ChevronDown,
    ChevronUp,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    X
} from 'lucide-react'

// Grade Badge Component
const GradeBadge = ({ grade }) => {
    const getGradeColor = (grade) => {
        if (!grade) return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
        if (grade.startsWith('A')) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        if (grade.startsWith('B')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        if (grade.startsWith('C')) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
        if (grade === 'D+' || grade === 'D') return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    };

    return (
        <span className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-lg font-black border-2 ${getGradeColor(grade)}`}>
            {grade || '-'}
        </span>
    );
};

// Module Result Card Component
const ModuleResultCard = ({ module, result }) => {
    const isPass = result && result.grade && !['D+', 'D', 'E', 'F', 'N', 'I'].includes(result.grade);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-black">
                            {module.code}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold">
                            {module.department}
                        </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                        {module.title}
                    </h4>
                </div>
                <GradeBadge grade={result?.grade} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Credits</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{module.credits}</p>
                </div>
                <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">GP</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                        {result?.gradePoint?.toFixed(2) || '-'}
                    </p>
                </div>
                <div className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</p>
                    <div className="flex justify-center">
                        {result ? (
                            isPass ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )
                        ) : (
                            <Clock className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {result && result.gradePoint !== undefined && (
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${result.gradePoint >= 3.5 ? 'bg-emerald-500' :
                                result.gradePoint >= 3.0 ? 'bg-blue-500' :
                                    result.gradePoint >= 2.5 ? 'bg-yellow-500' :
                                        result.gradePoint >= 2.0 ? 'bg-orange-500' :
                                            'bg-red-500'
                            }`}
                        style={{ width: `${(result.gradePoint / 4) * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
};

// Semester Card Component
const SemesterCard = ({ semester, level, modules, profile, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // Calculate semester stats
    const calculateSemesterGPA = () => {
        let totalWeightedGP = 0;
        let totalCredits = 0;

        modules.forEach(module => {
            const result = profile?.results?.find(r =>
                r.module && r.module.code && r.module.code.replace(/\s+/g, '').toUpperCase() === module.code.replace(/\s+/g, '').toUpperCase()
            );

            if (result && result.gradePoint !== undefined && result.grade !== 'I') {
                totalWeightedGP += (result.gradePoint * module.credits);
                totalCredits += module.credits;
            }
        });

        return totalCredits > 0 ? (totalWeightedGP / totalCredits).toFixed(2) : '0.00';
    };

    const calculateCompletedCredits = () => {
        let completed = 0;
        modules.forEach(module => {
            const result = profile?.results?.find(r =>
                r.module && r.module.code && r.module.code.replace(/\s+/g, '').toUpperCase() === module.code.replace(/\s+/g, '').toUpperCase()
            );
            if (result && result.grade && !['I', 'N'].includes(result.grade)) {
                completed += module.credits;
            }
        });
        return completed;
    };

    const semGPA = calculateSemesterGPA();
    const completedCredits = calculateCompletedCredits();
    const totalCredits = modules.reduce((acc, m) => acc + m.credits, 0);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                            S{semester}
                        </span>
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            Semester {semester === 1 ? 'I' : 'II'}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Level {level} • {modules.length} Modules
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Stats Badges */}
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Credits: </span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                                {completedCredits}/{totalCredits}
                            </span>
                        </div>
                        <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">SGPA: </span>
                            <span className={`text-sm font-black ${parseFloat(semGPA) >= 3.5 ? 'text-emerald-600 dark:text-emerald-400' :
                                    parseFloat(semGPA) >= 2.0 ? 'text-blue-600 dark:text-blue-400' :
                                        'text-orange-600 dark:text-orange-400'
                                }`}>
                                {semGPA}
                            </span>
                        </div>
                    </div>

                    {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                </div>
            </button>

            {/* Content */}
            {isOpen && (
                <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                    {/* Mobile Stats */}
                    <div className="sm:hidden flex gap-3 mb-6">
                        <div className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block">Credits</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                                {completedCredits}/{totalCredits}
                            </span>
                        </div>
                        <div className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block">SGPA</span>
                            <span className={`text-sm font-black ${parseFloat(semGPA) >= 3.5 ? 'text-emerald-600 dark:text-emerald-400' :
                                    parseFloat(semGPA) >= 2.0 ? 'text-blue-600 dark:text-blue-400' :
                                        'text-orange-600 dark:text-orange-400'
                                }`}>
                                {semGPA}
                            </span>
                        </div>
                    </div>

                    {/* Module Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modules.map((module, idx) => {
                            const result = profile?.results?.find(r =>
                                r.module && r.module.code && r.module.code.replace(/\s+/g, '').toUpperCase() === module.code.replace(/\s+/g, '').toUpperCase()
                            );
                            return (
                                <ModuleResultCard key={idx} module={module} result={result} />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function StudentAcademic() {
    const [user, setUser] = useState(null)
    const [student, setStudent] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [showDegreeRules, setShowDegreeRules] = useState(false);
    const [showGradingScale, setShowGradingScale] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const currentUser = authService.getUser();
                setUser(currentUser);

                if (currentUser && currentUser.studentRef && currentUser.studentRef._id) {
                    const res = await academicService.getStudentProfile(currentUser.studentRef._id);
                    const data = res.data;
                    if (data) {
                        setStudent(data.studentDetails);
                        setProfile(data);
                        setSelectedLevel(data.studentDetails?.level?.toString() || 'all');
                    }
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

            if (result && result.gradePoint !== undefined && result.grade !== 'I') {
                totalWeightedGP += (result.gradePoint * module.credits);
                totalCredits += module.credits;
            }
        });

        return totalCredits > 0 ? (totalWeightedGP / totalCredits).toFixed(2) : '0.00';
    };

    // Helper: Filter modules by combination
    const filterModulesByCombination = (modules, combination) => {
        if (!combination) return modules;

        const comb = combination.toUpperCase();
        const COMB_1 = ['CMIS', 'ELTN', 'MATH', 'STAT'];
        const COMB_2 = ['ELTN', 'IMGT', 'MATH', 'STAT'];
        const COMB_3 = ['IMGT', 'CMIS', 'MATH', 'STAT'];

        return modules.filter(m => {
            const dept = m.department;

            if (comb.includes('COMB 1') || comb.includes('COMB1')) {
                return COMB_1.includes(dept);
            }
            if (comb.includes('COMB 2') || comb.includes('COMB2')) {
                return COMB_2.includes(dept);
            }
            if (comb.includes('COMB 3') || comb.includes('COMB3')) {
                return COMB_3.includes(dept);
            }

            return true;
        });
    };

    // Helper: Calculate Total Number of Modules
    const calculateTotalModules = (moduleData, level, combination) => {
        let filtered = moduleData.filter(m => level === 'all' || m.level === parseInt(level));
        filtered = filterModulesByCombination(filtered, combination);
        return filtered.length;
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

            if (result && result.grade && !['I', 'N'].includes(result.grade)) {
                completedCredits += module.credits;
            }
        });

        return completedCredits;
    };

    // Render Degree Rules Modal
    const renderDegreeRulesModal = () => {
        if (!showDegreeRules) return null;

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
                    <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-6 h-6" />
                            Degree Requirements
                        </h2>
                        <button
                            onClick={() => setShowDegreeRules(false)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                            <h3 className="font-black text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                General Degree
                            </h3>
                            <ul className="space-y-2 text-sm font-bold text-blue-800 dark:text-blue-200">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Minimum 90 credits across 3 years</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>No class or CGPA requirement</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                            <h3 className="font-black text-purple-900 dark:text-purple-300 mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Special Degree
                            </h3>
                            <ul className="space-y-2 text-sm font-bold text-purple-800 dark:text-purple-200">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Minimum 120 credits across 4 years</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>CGPA ≥ 2.0 (Class or above)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Complete all modules in chosen combination</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render Grading Scale Modal
    const renderGradingScaleModal = () => {
        if (!showGradingScale) return null;

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
                    <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-6 h-6" />
                            Grading Scale
                        </h2>
                        <button
                            onClick={() => setShowGradingScale(false)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-sm font-black text-slate-700 dark:text-slate-300 uppercase">Grade</th>
                                        <th className="text-center py-3 px-4 text-sm font-black text-slate-700 dark:text-slate-300 uppercase">GP</th>
                                        <th className="text-left py-3 px-4 text-sm font-black text-slate-700 dark:text-slate-300 uppercase">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {[
                                        { grade: 'A', gp: '4.00', desc: 'Excellent', color: 'emerald' },
                                        { grade: 'A-', gp: '3.70', desc: 'Very Good', color: 'emerald' },
                                        { grade: 'B+', gp: '3.30', desc: 'Good', color: 'blue' },
                                        { grade: 'B', gp: '3.00', desc: 'Above Average', color: 'blue' },
                                        { grade: 'B-', gp: '2.70', desc: 'Average', color: 'blue' },
                                        { grade: 'C+', gp: '2.30', desc: 'Below Average', color: 'yellow' },
                                        { grade: 'C', gp: '2.00', desc: 'Pass', color: 'yellow' },
                                        { grade: 'C-', gp: '1.70', desc: 'Marginal Pass', color: 'orange' },
                                        { grade: 'D+', gp: '1.30', desc: 'Fail (Repeat)', color: 'red' },
                                        { grade: 'D', gp: '1.00', desc: 'Fail (Repeat)', color: 'red' },
                                        { grade: 'E', gp: '0.00', desc: 'Absent/Fail', color: 'red' },
                                    ].map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <GradeBadge grade={item.grade} />
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="text-lg font-black text-slate-900 dark:text-white">{item.gp}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-bold text-slate-700 dark:text-slate-300">{item.desc}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        )
    }

    // Check Dean's List eligibility
    const cumulativeGPA = parseFloat(calculateGPA(profile, MODULE_DATA, 'all', student?.combination));
    const isDeansList = cumulativeGPA >= 3.5;

    // Group modules by level and semester
    const groupModulesByLevelSemester = () => {
        const grouped = {};

        const levelsToShow = selectedLevel === 'all' ? [1, 2, 3, 4] : [parseInt(selectedLevel)];

        levelsToShow.forEach(level => {
            [1, 2].forEach(semester => {
                let modules = MODULE_DATA.filter(m => m.level === level && m.semester === semester);
                modules = filterModulesByCombination(modules, student?.combination);

                if (modules.length > 0) {
                    const key = `${level}-${semester}`;
                    grouped[key] = { level, semester, modules };
                }
            });
        });

        return grouped;
    };

    const groupedModules = groupModulesByLevelSemester();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-display text-slate-900 dark:text-white transition-colors duration-500">

            {/* Enhanced Hero Section */}
            <div className="relative w-full overflow-hidden pb-12 sm:pb-16 lg:pb-20">
                <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                </div>

                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-700 opacity-10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
                        <div className="flex-1 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg w-fit">
                                <GraduationCap className="w-4 h-4 text-blue-300" />
                                <span className="text-white text-xs font-bold tracking-wide uppercase">Academic Records</span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
                                    Academic
                                    <span className="block mt-1 text-slate-500">
                                        Performance
                                    </span>
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                                    Track your GPA, credits, and module results across all levels.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-white text-xs sm:text-sm font-bold">Live System</span>
                                </div>
                                {isDeansList && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/20 backdrop-blur-md border border-yellow-400/30">
                                        <Sparkles className="w-4 h-4 text-yellow-300" />
                                        <span className="text-yellow-100 text-xs sm:text-sm font-bold">Dean's List</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-12 sm:pb-20">

                {/* Enhanced Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Cumulative GPA */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:scale-105 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {cumulativeGPA.toFixed(2)}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Cumulative GPA
                        </p>
                    </div>

                    {/* Total Credits */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:scale-105 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {calculateCompletedCredits(profile, MODULE_DATA, 'all', student?.combination)}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Total Credits
                        </p>
                    </div>

                    {/* Modules */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:scale-105 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                <BookCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {calculateTotalModules(MODULE_DATA, 'all', student?.combination)}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Modules
                        </p>
                    </div>

                    {/* Current Level */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:scale-105 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                            Level {student?.level || '-'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Current Level
                        </p>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setShowGradingScale(true)}
                        className="flex items-center justify-center gap-3 p-6 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl hover:shadow-lg hover:scale-105 transition-all group"
                    >
                        <div className="w-12 h-12 bg-white dark:bg-emerald-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-black text-emerald-900 dark:text-emerald-300">View Grading Scale</p>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">WUSL GPA Reference</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowDegreeRules(true)}
                        className="flex items-center justify-center gap-3 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl hover:shadow-lg hover:scale-105 transition-all group"
                    >
                        <div className="w-12 h-12 bg-white dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-black text-blue-900 dark:text-blue-300">Degree Requirements</p>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">General vs Special</p>
                        </div>
                    </button>
                </div>

                {/* Level Filter Pills */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl border border-slate-200 dark:border-slate-800 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <span className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">View Level:</span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedLevel('all')}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${selectedLevel === 'all'
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                All Levels
                            </button>
                            {[1, 2, 3, 4].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(level.toString())}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${selectedLevel === level.toString()
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    Level {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Level-wise Performance Cards */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 mb-8">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Level-wise Performance
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(level => (
                            <div key={level} className="text-center">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Level {level}</p>
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

                {/* Semester Cards */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="w-6 h-6" />
                        Module Results
                    </h3>

                    {Object.values(groupedModules).map((group, idx) => (
                        <SemesterCard
                            key={`${group.level}-${group.semester}`}
                            semester={group.semester}
                            level={group.level}
                            modules={group.modules}
                            profile={profile}
                            defaultOpen={idx === 0}
                        />
                    ))}
                </div>

            </div>

            {/* Modals */}
            {renderDegreeRulesModal()}
            {renderGradingScaleModal()}
        </div>
    )
}
