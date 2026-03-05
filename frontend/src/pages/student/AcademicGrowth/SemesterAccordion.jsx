import React, { useState } from 'react';
import { ChevronDown, Calendar, Hash } from 'lucide-react';
import ResultTable from './ResultTable';

const SemesterAccordion = ({ level, semester, stats, modules, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden mb-6 transition-all duration-300">
            {/* Header / Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                        <span className="font-black text-lg">{semester}</span>
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">Level {level} - Semester {semester}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><Hash className="w-4 h-4" /> {stats.modules} Modules</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {stats.credits || 0} Credits</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mini GPA Pill */}
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-xl font-black shadow-sm">
                        GPA: {stats.gpa}
                    </div>

                    <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-6 h-6" />
                    </div>
                </div>
            </button>

            {/* Collapsible Content */}
            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/50">
                        {/* Mobile GPA Pill */}
                        <div className="sm:hidden flex items-center justify-between mb-4 px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-xl font-black shadow-sm">
                            <span>Semester GPA</span>
                            <span>{stats.gpa}</span>
                        </div>

                        <ResultTable modules={modules} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SemesterAccordion;
