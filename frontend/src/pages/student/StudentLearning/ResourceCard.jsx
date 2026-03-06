import React from 'react';
import { Bookmark, Download, FileText } from 'lucide-react';

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
                bg: 'bg-[#fccc42]', // Warm Yellow
                text: 'text-[#151313]',
                pillBg: 'bg-[#151313]',
                pillText: 'text-white',
                btnBg: 'bg-[#ff5734]',
                btnText: 'text-white'
            };
        case 'tutorial':
            return {
                bg: 'bg-[#be94f5]', // Soft Purple
                text: 'text-[#151313]',
                pillBg: 'bg-white/50',
                pillText: 'text-[#151313]',
                btnBg: 'bg-[#ff5734]',
                btnText: 'text-white'
            };
        case 'assignment':
            return {
                bg: 'bg-[#bae6fd]', // Sky Blue
                text: 'text-[#151313]',
                pillBg: 'bg-white/50',
                pillText: 'text-[#151313]',
                btnBg: 'bg-[#ff5734]',
                btnText: 'text-white'
            };
        case 'marking_scheme':
            return {
                bg: 'bg-[#151313]', // Dark Promo Card
                text: 'text-white',
                pillBg: 'bg-[#fccc42]',
                pillText: 'text-[#151313]',
                btnBg: 'bg-[#ff5734]',
                btnText: 'text-white'
            };
        case 'book':
        default:
            return {
                bg: 'bg-white',
                text: 'text-[#151313]',
                pillBg: 'bg-slate-100',
                pillText: 'text-[#151313]',
                btnBg: 'bg-[#151313]',
                btnText: 'text-white'
            };
    }
}

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

const ResourceCard = ({ resource, moduleCode }) => {
    const handleDownload = () => {
        if (resource.webContentLink && resource.webContentLink.includes('cloudinary')) {
            const url = resource.webContentLink.includes('/upload/')
                ? resource.webContentLink.replace('/upload/', '/upload/fl_attachment/')
                : resource.webContentLink;
            window.location.href = url;
            return;
        }
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/resources/stream/${resource._id}`, '_blank');
    };

    const theme = getCardTheme(resource.type);

    return (
        <div className={`rounded-[2.5rem] border font-['Kodchasan'] tracking-wide ${theme.bg === 'bg-[#151313]' ? 'border-transparent shadow-xl shadow-black/10' : 'border-[#151313] border-[2px]'} ${theme.bg} p-8 sm:p-9 flex flex-col justify-between min-h-[300px] relative hover:-translate-y-1.5 transition-all duration-300 group`}>

            {/* Top row: Pill & Bookmark */}
            <div className="flex justify-between items-start mb-8">
                <div className={`px-5 py-2 rounded-full text-[12px] font-black tracking-widest uppercase ${theme.pillBg} ${theme.pillText} ${theme.bg === 'bg-white' ? 'border border-[#151313]/20' : ''}`}>
                    {moduleCode || getTypeLabel(resource.type)}
                </div>
                <button className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors ${theme.text}`}>
                    <Bookmark className="w-[26px] h-[26px]" strokeWidth={2.5} />
                </button>
            </div>

            {/* Title */}
            <h3 className={`font-black text-[26px] sm:text-3xl leading-[1.1] mb-10 line-clamp-3 ${theme.text}`}>
                {resource.title}
            </h3>

            {/* Middle: Info line & Visual Bar */}
            <div className="mt-auto">
                <div className="flex justify-between items-end mb-3">
                    <span className={`text-[12px] font-black ${theme.text} opacity-70 uppercase tracking-widest`}>
                        {getTypeLabel(resource.type)}
                    </span>
                    <span className={`text-[12px] font-black ${theme.text} opacity-70 tracking-widest`}>
                        {formatBytes(resource.size)}
                    </span>
                </div>

                {/* Thick horizontal bar (Iconic style) */}
                <div className="h-[7px] w-full bg-[#151313] rounded-full mb-8"></div>

                {/* Bottom row: Action Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleDownload}
                        className={`${theme.btnBg} ${theme.btnText} border-[2px] border-[#151313] px-8 py-3.5 rounded-full font-black text-sm sm:text-base tracking-wide flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[4px_4px_0px_0px_rgba(21,19,19,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]`}
                    >
                        <span>Download</span>
                        <Download className="w-5 h-5" strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
