import React from 'react';
import ResourceCard from './ResourceCard';
import { SearchX } from 'lucide-react';

const MaterialLayout = ({ resources, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white/40 dark:bg-slate-800/40 rounded-3xl h-[220px] animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (!resources || resources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700 min-h-[300px]">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <SearchX className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Resources Found</h3>
                <p className="text-slate-500 font-medium max-w-md">
                    We couldn't find any study materials matching your search or filter criteria. Try adjusting your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
                <div key={resource.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                    <ResourceCard resource={resource} />
                </div>
            ))}
        </div>
    );
};

export default MaterialLayout;
