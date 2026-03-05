import React from 'react';

const ProfileLoader = () => {
    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 animate-pulse">
            {/* Header / Cover */}
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full relative">
                <div className="absolute -bottom-16 left-8 w-32 h-32 bg-slate-300 dark:bg-slate-700 rounded-full border-4 border-white dark:border-slate-900" />
            </div>

            <div className="pt-16 px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Info Column */}
                <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-slate-300 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded mt-8" />
                </div>

                {/* Details Column */}
                <div className="col-span-2 space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl space-y-3">
                            <div className="h-6 w-1/3 bg-slate-300 dark:bg-slate-700 rounded" />
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700/50 rounded" />
                                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700/50 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileLoader;
