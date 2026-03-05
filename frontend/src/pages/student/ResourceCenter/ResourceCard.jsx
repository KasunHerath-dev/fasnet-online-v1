import React from 'react';
import { FileText, Link as LinkIcon, Download, File, PlayCircle } from 'lucide-react';

const ResourceCard = ({ resource }) => {
    const { title, type, date, course, description } = resource;

    const getIconInfo = (resourceType) => {
        switch (resourceType) {
            case 'pdf':
                return {
                    icon: <FileText className="w-6 h-6 text-rose-500" />,
                    bg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700',
                    border: 'border-rose-200 dark:border-rose-800'
                };
            case 'video':
                return {
                    icon: <PlayCircle className="w-6 h-6 text-purple-500" />,
                    bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700',
                    border: 'border-purple-200 dark:border-purple-800'
                };
            case 'link':
                return {
                    icon: <LinkIcon className="w-6 h-6 text-emerald-500" />,
                    bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700',
                    border: 'border-emerald-200 dark:border-emerald-800'
                };
            default:
                return {
                    icon: <File className="w-6 h-6 text-blue-500" />,
                    bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700',
                    border: 'border-blue-200 dark:border-blue-800'
                };
        }
    };

    const style = getIconInfo(type);

    return (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex flex-col h-full group hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative overflow-hidden">

            {/* Hover Gradient Overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.05] transition-opacity duration-500 bg-gradient-to-br from-transparent to-${style.bg.split(' ')[0].replace('bg-', '')}`}></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${style.bg} border ${style.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {style.icon}
                </div>

                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {course}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 relative z-10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-snug mb-2 group-hover:text-moccaccino-600 dark:group-hover:text-moccaccino-400 transition-colors line-clamp-2">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {description}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{date}</span>

                <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${style.bg} border ${style.border} opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:shadow-md hover:scale-105 active:scale-95`}>
                    <Download className="w-[18px] h-[18px] text-current" />
                </button>
            </div>
        </div>
    );
};

export default ResourceCard;
