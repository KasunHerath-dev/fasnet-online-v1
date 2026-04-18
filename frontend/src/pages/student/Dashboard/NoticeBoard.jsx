import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
    Megaphone, CalendarBlank, FilePdf, FileDoc, 
    ArrowRight, X, DownloadSimple, SealCheck, 
    ArrowSquareOut, Info, CaretRight
} from '@phosphor-icons/react';

/* ─── Modal Helpers ────────────────────────────────────────── */
function getAttachmentIcon(filename = '') {
    const ext = filename.split('.').pop().toLowerCase();
    if (['doc', 'docx'].includes(ext)) return <FileDoc size={18} weight="fill" className="text-blue-400" />;
    return <FilePdf size={18} weight="fill" className="text-rose-400" />;
}

function resolveDownloadUrl(att) {
    if (att.localPath) {
        const filename = att.localPath.split('/').pop().split('\\').pop();
        return `/attachments/${filename}`;
    }
    return att.url;
}

/* ─── Detail Modal ─────────────────────────────────────────── */
function NoticeModal({ notice, onClose }) {
    if (!notice) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white/95 dark:bg-[#1c1c1c]/95 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl shadow-[#ff5734]/10 overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#ff5734]/10 flex items-center justify-center">
                            <Megaphone size={22} weight="duotone" className="text-[#ff5734]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#ff5734] uppercase tracking-widest">Faculty Notice</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <CalendarBlank size={12} className="text-slate-400" />
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">{new Date(notice.publishedAt || notice.createdAt).toLocaleDateString()}</span>
                                {notice.aiProcessed && (
                                    <span className="text-[9px] font-black text-violet-500 bg-violet-500/10 border border-violet-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                        <SealCheck size={10} weight="fill" /> AI
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                        <X size={20} weight="bold" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">{notice.title}</h2>
                        {notice.originalTitle && notice.originalTitle !== notice.title && (
                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider italic flex items-center gap-1.5">
                                <Info size={12} /> Original: "{notice.originalTitle}"
                            </p>
                        )}
                    </div>

                    <div className="p-7 bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-['Kodchasan']">
                        {notice.content}
                    </div>

                    {/* Attachments */}
                    {notice.attachments?.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <FilePdf size={14} weight="fill" className="text-rose-400" />
                                Attachments ({notice.attachments.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {notice.attachments.map((att, i) => (
                                    <a key={i} href={resolveDownloadUrl(att)} download target="_blank" rel="noreferrer" 
                                       className="group flex items-center justify-between p-4 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-[#ff5734]/20 hover:shadow-lg transition-all shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                {getAttachmentIcon(att.filename || att.url)}
                                            </div>
                                            <div className="min-w-0 pr-2">
                                                <p className="text-xs font-black text-slate-800 dark:text-white truncate">{att.filename || 'Document'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Click to download</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#ff5734] group-hover:bg-[#ff5734]/10 transition-all">
                                            <DownloadSimple size={16} weight="bold" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                        <a href={notice.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-[#ff5734] transition-colors uppercase tracking-widest">
                            <ArrowSquareOut size={14} weight="bold" /> View Original Source
                        </a>
                        <button onClick={onClose} className="px-7 py-3 bg-[#ff5734] hover:bg-[#e64a2e] text-white text-[11px] font-black rounded-2xl transition-all shadow-lg shadow-[#ff5734]/25 uppercase tracking-widest">
                            CLOSE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Dashboard Component ────────────────────────────────── */
const NoticeBoard = ({ notices = [] }) => {
    const [selected, setSelected] = useState(null);
    const { id } = useParams();

    const displayNotices = notices.slice(0, 3);

    return (
        <div className="bg-white dark:bg-white/[0.03] rounded-[2.5rem] p-6 shadow-sm border border-slate-200 dark:border-white/5 h-full flex flex-col group transition-all duration-500 hover:shadow-2xl hover:shadow-[#ff5734]/5 font-['Kodchasan']">
            
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#ff5734]/10 flex items-center justify-center">
                        <Megaphone size={22} weight="duotone" className="text-[#ff5734]" />
                    </div>
                    <div>
                        <h3 className="text-slate-800 dark:text-white font-black text-lg tracking-tight">Notices</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Faculty Feed</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase">Live</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 flex-1">
                {displayNotices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-10 opacity-40">
                        <Info size={40} weight="duotone" className="text-slate-400 mb-2" />
                        <p className="text-slate-500 font-bold text-xs uppercase">All caught up!</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {displayNotices.map((notice) => (
                                <button 
                                    key={notice._id} 
                                    onClick={() => setSelected(notice)}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-[#ff5734]/20 hover:bg-white dark:hover:bg-white/5 hover:translate-x-1 group/row transition-all text-left"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[8px] font-black text-[#ff5734] bg-[#ff5734]/10 px-1.5 py-0.5 rounded-md uppercase">Notice</span>
                                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                <CalendarBlank size={11} /> {new Date(notice.publishedAt || notice.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-[13px] font-black text-slate-800 dark:text-white truncate leading-tight transition-colors group-hover/row:text-[#ff5734]">
                                            {notice.title}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 italic lowercase">
                                            {notice.subtext || "Click for details..."}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-sm">
                                        <ArrowRight size={14} weight="bold" className="text-[#ff5734]" />
                                    </div>
                                </button>
                            ))}
                        </div>

                        <Link 
                            to={id ? `/${id}/notices` : `/${window.location.pathname.split('/')[1]}/notices`}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-[1.25rem] bg-[#ff5734]/5 text-[#ff5734] text-[11px] font-black hover:bg-[#ff5734]/10 transition-all group/btn uppercase tracking-widest"
                        >
                            SEE ALL NOTICES
                            <CaretRight size={14} weight="bold" className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </>
                )}
            </div>

            {/* Modal */}
            {selected && <NoticeModal notice={selected} onClose={() => setSelected(null)} />}
        </div>
    );
};

export default NoticeBoard;
