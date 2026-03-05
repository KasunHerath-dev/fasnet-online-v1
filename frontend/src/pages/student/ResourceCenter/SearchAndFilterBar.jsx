import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

const SearchAndFilterBar = ({ onSearch, filters, setFilters }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <div className="w-full flex flex-col md:flex-row gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-moccaccino-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search for lecture notes, past papers, assignments..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-moccaccino-500/50 shadow-sm transition-all text-sm md:text-base"
                />
            </div>

            {/* Filter Toggle Mobile & Desktop */}
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl text-slate-600 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
            >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
            </button>

            {/* Filter Flyout / Drawer */}
            {isFilterOpen && (
                <div className="absolute top-[80px] right-0 md:top-auto md:right-auto md:relative w-full md:w-auto z-20 animate-in fade-in slide-in-from-top-4 md:slide-in-from-right-4 duration-200">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3">
                        <div className="flex justify-between items-center sm:hidden mb-2">
                            <h4 className="font-bold text-slate-800 dark:text-white">Filters</h4>
                            <button onClick={() => setIsFilterOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
                        </div>

                        <select
                            value={filters.subject}
                            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-moccaccino-500/50"
                        >
                            <option value="all">All Subjects</option>
                            <option value="CS-301">CS-301</option>
                            <option value="CS-401">CS-401</option>
                        </select>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-moccaccino-500/50"
                        >
                            <option value="all">All Types</option>
                            <option value="pdf">PDF Docs</option>
                            <option value="video">Lectures</option>
                            <option value="link">Web Links</option>
                        </select>
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-moccaccino-500/50"
                        >
                            <option value="all">Any Year</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchAndFilterBar;
