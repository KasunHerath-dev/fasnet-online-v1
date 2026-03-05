import React from 'react';
import { BookOpen } from 'lucide-react';

const AcademicLoader = () => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
                <div className="absolute inset-0 bg-moccaccino-500 blur-xl opacity-20 animate-pulse rounded-full" />
                <BookOpen size={64} className="text-moccaccino-600 dark:text-moccaccino-400 animate-bounce relative z-10" />
            </div>
            <h3 className="mt-8 text-xl font-bold text-slate-700 dark:text-slate-200 animate-pulse">Loading Academic Data...</h3>
            <div className="mt-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-moccaccino-400 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-3 h-3 rounded-full bg-moccaccino-500 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-3 h-3 rounded-full bg-moccaccino-600 animate-bounce" />
            </div>
        </div>
    );
};

export default AcademicLoader;
