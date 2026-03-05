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
        window.open(`/api/v1/resources/stream/${resource._id}`, '_blank');
    };

    const theme = getCardTheme(resource.type);

    // Pseudo-random avatars for vibrant aesthetic based on title length
    const initialPairs = [['JD', 'bg-rose-200 text-rose-700'], ['AS', 'bg-blue-200 text-blue-700'], ['MK', 'bg-emerald-200 text-emerald-700']];
    const statCount = (resource.title.length * 3) + 12;

    return (
        <div className={`rounded-[2rem] border font-['Kodchasan'] tracking-wide ${theme.bg === 'bg-[#151313]' ? 'border-transparent shadow-xl shadow-black/10' : 'border-[#151313] border-[1.5px]'} ${theme.bg} p-6 sm:p-7 flex flex-col justify-between min-h-[280px] relative hover:-translate-y-1 transition-transform duration-300`}>

            {/* Top row: Pill & Bookmark */}
            <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase ${theme.pillBg} ${theme.pillText} ${theme.bg === 'bg-white' ? 'border border-[#151313]/20' : ''} ${theme.bg === 'bg-[#be94f5]' || theme.bg === 'bg-[#bae6fd]' ? 'border border-[#151313] bg-white' : ''}`}>
                    {moduleCode || getTypeLabel(resource.type)}
                </div>
                <button className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors ${theme.text}`}>
                    <Bookmark className="w-[22px] h-[22px]" strokeWidth={2.5} />
                </button>
            </div>

            {/* Title */}
            <h3 className={`font-black text-[22px] sm:text-2xl leading-[1.2] mb-8 line-clamp-3 ${theme.text}`}>
                {resource.title}
            </h3>

            {/* Middle: Info line & Progress */}
            <div className="mt-auto flex flex-col gap-4">
                <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-[11px] font-black ${theme.text} opacity-80 uppercase tracking-wide`}>
                            {getTypeLabel(resource.type)}
                        </span>
                        <span className={`text-[11px] font-black ${theme.text} opacity-80 tracking-wide`}>
                            {formatBytes(resource.size)}
                        </span>
                    </div>
                    {/* Visual horizontal bar */}
                    <div className="h-2 w-full bg-[#151313]/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${theme.bg === 'bg-[#151313]' ? 'bg-[#ff5734]' : 'bg-[#151313]'}`} style={{ width: '100%' }}></div>
                    </div>
                </div>

                {/* Bottom row: Avatars & Button */}
                <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center">
                        <div className="flex -space-x-2">
                            {initialPairs.map((pair, idx) => (
                                <div key={idx} className={`w-[34px] h-[34px] rounded-full border-2 border-[#151313] flex items-center justify-center text-[10px] font-black ${pair[1]}`}>
                                    {pair[0]}
                                </div>
                            ))}
                        </div>
                        <div className={`ml-2 w-[34px] h-[34px] rounded-full border-[1.5px] border-[#151313] bg-[#fccc42] flex items-center justify-center text-[11px] font-black text-[#151313]`}>
                            +{statCount}
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        className={`${theme.btnBg} ${theme.btnText} ${theme.bg === 'bg-[#151313]' ? '' : 'border-[1.5px] border-[#151313]'} px-5 py-2.5 rounded-full font-black text-xs sm:text-sm tracking-wide flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform`}
                    >
                        <span>Continue</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
