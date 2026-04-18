import React from 'react';
import { 
    Download, Eye, BookmarkSimple, FileText, 
    BookOpen, GraduationCap, Lightning, Quotes,
    ArrowsClockwise, FilePdf, CalendarBlank
} from '@phosphor-icons/react';

const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getCardTheme = (type) => {
    switch (type) {
        case 'past_paper':
            return {
                bg: 'bg-orange-50/50',
                border: 'border-orange-100',
                color: 'text-orange-500',
                iconBg: 'bg-orange-500/10',
                tag: 'bg-orange-500/10 text-orange-500 border-orange-500/10'
            };
        case 'tutorial':
            return {
                bg: 'bg-blue-50/50',
                border: 'border-blue-100',
                color: 'text-blue-500',
                iconBg: 'bg-blue-500/10',
                tag: 'bg-blue-500/10 text-blue-500 border-blue-500/10'
            };
        case 'assignment':
            return {
                bg: 'bg-purple-50/50',
                border: 'border-purple-100',
                color: 'text-purple-500',
                iconBg: 'bg-purple-500/10',
                tag: 'bg-purple-500/10 text-purple-500 border-purple-500/10'
            };
        case 'marking_scheme':
            return {
                bg: 'bg-emerald-50/50',
                border: 'border-emerald-100',
                color: 'text-emerald-500',
                iconBg: 'bg-emerald-500/10',
                tag: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
            };
        case 'book':
        default:
            return {
                bg: 'bg-slate-50/50',
                border: 'border-slate-100',
                color: 'text-slate-500',
                iconBg: 'bg-slate-500/10',
                tag: 'bg-slate-100 text-slate-500 border-slate-200'
            };
    }
}

const typeIcon = (type) => {
    if (type === 'past_paper') return <FilePdf size={22} weight="duotone" />;
    if (type === 'tutorial') return <BookOpen size={22} weight="duotone" />;
    if (type === 'assignment') return <Lightning size={22} weight="duotone" />;
    return <FileText size={22} weight="duotone" />;
};

const getTypeLabel = (type) => {
    const labels = {
        'past_paper': 'Past Paper',
        'tutorial': 'Tutorial',
        'assignment': 'Assignment',
        'marking_scheme': 'Mark. Scheme',
        'book': 'Resource Book',
        'other': 'Other'
    };
    return labels[type] || 'Resource';
};

const ResourceCard = ({ resource, moduleCode, onPreview, index = 0 }) => {
    const handleDownload = () => {
        if (resource.storageType === 'google_drive' && resource.webContentLink) {
            window.open(resource.webContentLink, '_blank');
        } else {
            window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/resources/stream/${resource._id}`, '_blank');
        }
    };

    const theme = getCardTheme(resource.type);

    return (
        <div 
            className="group relative flex flex-col bg-white rounded-[2rem] border border-slate-200 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-[#ff5734]/30 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
        >
            {/* Upper Section: Type & Module */}
            <div className="p-5 flex items-start justify-between gap-4">
                <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center ${theme.color} group-hover:scale-110 transition-transform duration-500 ease-out`}>
                    {typeIcon(resource.type)}
                </div>
                
                <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${theme.tag}`}>
                        {getTypeLabel(resource.type)}
                    </span>
                    {moduleCode && (
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200/50">
                            {moduleCode}
                        </span>
                    )}
                </div>
            </div>

            {/* Middle Section: Title */}
            <div className="px-5 pb-4">
                <h4 className="text-sm font-black text-[#151313] leading-[1.3] group-hover:text-[#ff5734] transition-colors duration-300 line-clamp-2 min-h-[2.6rem]">
                    {resource.title}
                </h4>
            </div>

            {/* Bottom Section: Info & Actions */}
            <div className="mt-auto p-4 bg-slate-50/50 border-t border-slate-100/80 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {formatBytes(resource.size)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.05em]">
                        {new Date(resource.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onPreview && onPreview(resource)}
                        className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#ff5734] hover:border-[#ff5734]/30 hover:shadow-md transition-all duration-300"
                        title="Preview"
                    >
                        <Eye size={20} weight="bold" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="w-11 h-11 rounded-2xl bg-[#151313] flex items-center justify-center text-white hover:bg-[#ff5734] hover:shadow-[0_8px_20px_rgba(255,87,52,0.3)] transition-all duration-300"
                        title="Download"
                    >
                        <Download size={20} weight="bold" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
