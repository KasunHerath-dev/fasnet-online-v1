import React from 'react';
import { BookOpen } from 'lucide-react';

const ResultTable = ({ modules }) => {
    // If no modules, show empty state
    if (!modules || modules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-3 opacity-50" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No results recorded for this semester yet.</p>
            </div>
        );
    }

    const getGradeColor = (grade) => {
        if (!grade) return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
        if (grade.startsWith('A')) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
        if (grade.startsWith('B')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
        if (grade.startsWith('C')) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
        if (grade === 'D+' || grade === 'D') return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
        if (grade === 'F' || grade === 'E' || grade === 'N' || grade === 'I') return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    };

    const getGradePoint = (grade) => {
        if (!grade) return null;
        const g = grade.toUpperCase();
        if (g === 'A+' || g === 'A') return 4.0;
        if (g === 'A-') return 3.7;
        if (g === 'B+') return 3.3;
        if (g === 'B') return 3.0;
        if (g === 'B-') return 2.7;
        if (g === 'C+') return 2.3;
        if (g === 'C') return 2.0;
        if (g === 'C-') return 1.7;
        if (g === 'D+') return 1.3;
        if (g === 'D') return 1.0;
        return 0.0;
    };

    return (
        <div className="overflow-x-auto w-full rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/60 dark:border-slate-700/60">
                        <th className="px-5 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[15%]">Code</th>
                        <th className="px-5 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject Title</th>
                        <th className="px-5 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-[15%]">Credits</th>
                        <th className="px-5 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-[15%]">Grade</th>
                        <th className="px-5 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-[15%]">GP</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {modules.map((mod, idx) => (
                        <tr key={mod.code || idx} className="hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-5 py-4">
                                <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold font-mono tracking-tight">
                                    {mod.code}
                                </span>
                            </td>
                            <td className="px-5 py-4">
                                <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2">
                                    {mod.title}
                                </p>
                                {/* Derive subject based on the module code prefix (e.g. CMIS1113 -> CMIS) */}
                                {mod.code && (
                                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                                        {mod.code.substring(0, 4)} Subject
                                    </span>
                                )}
                            </td>
                            <td className="px-5 py-4 text-center">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                    {mod.credits}
                                </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                                <div className="flex justify-center">
                                    <span className={`inline-flex items-center justify-center w-10 h-8 rounded-lg text-sm font-black shadow-sm ${getGradeColor(mod.result?.grade)}`}>
                                        {mod.result?.grade || '-'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                                <span className="text-sm font-black text-slate-700 dark:text-slate-300 font-mono tracking-tighter">
                                    {mod.result?.grade ? getGradePoint(mod.result.grade).toFixed(2) : '-.--'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResultTable;
