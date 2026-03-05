import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

const NoticeBoard = ({ notices }) => {
    const displayNotices = notices || [];

    const getIconAndColor = (type) => {
        switch (type) {
            case 'important':
                return { icon: <AlertTriangle className="w-4 h-4 text-rose-500" />, bg: 'bg-rose-100', text: 'text-rose-700' };
            case 'success':
                return { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-100', text: 'text-emerald-700' };
            case 'info':
                return { icon: <Info className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-100', text: 'text-blue-700' };
            default:
                return { icon: <Bell className="w-4 h-4 text-slate-500" />, bg: 'bg-slate-100', text: 'text-slate-700' };
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 h-full flex flex-col justify-between group hover:-translate-y-1 transition-transform xl:col-span-3">

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-800 font-bold text-xl flex items-center gap-2 tracking-tight">
                    Notices and notifications
                </h3>
                <button className="text-sm font-bold text-[#ff5734] hover:text-[#e04d2e] transition-colors">
                    View all notices
                </button>
            </div>

            {/* Table Headers */}
            <div className="flex justify-between items-center pb-2 mb-2 text-xs font-semibold text-slate-400">
                <span className="w-[60%]">Notice</span>
                <span className="w-[20%] text-center">Type</span>
                <span className="w-[20%] text-right">Date</span>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
                {displayNotices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 h-full py-10 opacity-60">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium text-center">No notices at the moment</p>
                        <p className="text-slate-400 text-sm text-center mt-1">Check back later for updates</p>
                    </div>
                ) : (
                    displayNotices.map((notice, index) => {
                        const style = getIconAndColor(notice.type);
                        return (
                            <div key={notice.id} className={`flex items-center justify-between py-4 ${index !== displayNotices.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors`}>

                                {/* Column 1: Notice Info */}
                                <div className="w-[60%] pr-4 min-w-0">
                                    <h4 className="text-[15px] font-bold text-slate-800 truncate leading-tight mb-1">
                                        {notice.title}
                                    </h4>
                                    <p className="text-[13px] text-slate-500 line-clamp-1 pr-2">
                                        {notice.subtext}
                                    </p>
                                </div>

                                {/* Column 2: Type */}
                                <div className="w-[20%] flex items-center justify-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${style.bg}`}>
                                        {style.icon}
                                    </div>
                                </div>

                                {/* Column 3: Date */}
                                <div className="w-[20%] text-right">
                                    <span className="text-[13px] font-bold text-slate-800">{notice.date}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
};

export default NoticeBoard;
