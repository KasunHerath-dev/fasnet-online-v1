import React from 'react';

const DashboardLoader = () => {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-5 pr-2 animate-pulse">

            {/* WELCOME BANNER SKELETON */}
            <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl p-8 shadow-sm h-48 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] animate-shimmer" />
                <div className="h-8 w-48 bg-slate-300 dark:bg-slate-700 rounded mb-4" />
                <div className="h-12 w-96 bg-slate-300 dark:bg-slate-700 rounded mb-6" />
                <div className="flex gap-3">
                    <div className="h-8 w-24 bg-slate-300 dark:bg-slate-700 rounded-lg" />
                    <div className="h-8 w-24 bg-slate-300 dark:bg-slate-700 rounded-lg" />
                    <div className="h-8 w-24 bg-slate-300 dark:bg-slate-700 rounded-lg" />
                </div>
            </div>

            {/* QUICK ACTIONS SKELETON */}
            <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-xl h-24 w-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] animate-shimmer" />
                    </div>
                ))}
            </div>

            {/* THREE COLUMN GRID SKELETON */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-2xl p-6 h-full min-h-[300px] relative overflow-hidden flex flex-col gap-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] animate-shimmer" />
                        <div className="h-6 w-1/2 bg-slate-300 dark:bg-slate-700 rounded" />
                        <div className="flex-1 space-y-4">
                            <div className="h-20 w-full bg-slate-300 dark:bg-slate-700 rounded-lg" />
                            <div className="h-20 w-full bg-slate-300 dark:bg-slate-700 rounded-lg" />
                            <div className="h-20 w-full bg-slate-300 dark:bg-slate-700 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardLoader;
