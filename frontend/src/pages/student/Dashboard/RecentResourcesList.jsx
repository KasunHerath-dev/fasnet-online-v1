import React from 'react';
import { Newspaper, Megaphone, BookOpen, Calendar, ArrowRight, Rss } from 'lucide-react';

const RecentResourcesList = ({ news = [] }) => {
    return (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 h-full flex flex-col group hover:-translate-y-1 transition-transform">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-800 font-bold text-xl tracking-tight">
                    Latest News
                </h3>
                <button className="text-sm font-bold text-[#ff5734] hover:text-[#e04d2e] transition-colors flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* News List */}
            <div className="flex flex-col flex-1 gap-4 overflow-y-auto no-scrollbar">
                {news.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 h-full py-10 opacity-60">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Rss className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium text-center">No recent news</p>
                        <p className="text-slate-400 text-sm text-center mt-1">Stay tuned for campus updates</p>
                    </div>
                ) : (
                    news.map((item, index) => {
                        const Icon = item.icon || Newspaper;
                        return (
                            <div
                                key={item.id}
                                className={`flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer ${index !== news.length - 1 ? 'border-b border-slate-100 pb-4' : ''}`}
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg || 'bg-slate-100'}`}>
                                    <Icon className={`w-5 h-5 ${item.iconColor || 'text-slate-500'}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${item.tagColor || 'bg-slate-100 text-slate-600'}`}>
                                            {item.tag || 'News'}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                                    </div>
                                    <p className="text-[14px] font-bold text-slate-800 leading-snug line-clamp-2">
                                        {item.title}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
};

export default RecentResourcesList;
