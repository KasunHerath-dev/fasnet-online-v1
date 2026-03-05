import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
    const content = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl bg-moccaccino-400/30 animate-pulse"></div>
                <Loader2 className="w-12 h-12 text-moccaccino-500 animate-spin relative z-10" />
            </div>
            {message && (
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8 w-full h-full min-h-[200px]">
            {content}
        </div>
    );
};

export default LoadingSpinner;
