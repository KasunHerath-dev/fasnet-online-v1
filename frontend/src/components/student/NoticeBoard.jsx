import React, { useState, useEffect } from 'react'
import {
    Megaphone, Clock, Tag, FilePdf, FileDoc,
    ArrowRight, X, Globe, DownloadSimple,
    Info, CalendarBlank, Link, ArrowSquareOut,
    Spinner, SealCheck, CaretRight
} from '@phosphor-icons/react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { socketService } from '../../services/socketService'

/* ─── helpers ─────────────────────────────────────────────── */
function getAttachmentIcon(filename = '') {
    const ext = filename.split('.').pop().toLowerCase()
    if (['doc', 'docx'].includes(ext)) return <FileDoc size={18} weight="fill" className="text-blue-400" />
    return <FilePdf size={18} weight="fill" className="text-rose-400" />
}

/** Returns the best download URL: local backend path → original URL */
function resolveDownloadUrl(att) {
    if (att.localPath) {
        // Served from our backend /attachments endpoint
        const filename = att.localPath.split('/').pop().split('\\').pop()
        return `/attachments/${filename}`
    }
    return att.url
}

/* ─── Modal ───────────────────────────────────────────────── */
function NoticeModal({ notice, onClose }) {
    if (!notice) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#ff5734]/10 flex items-center justify-center">
                            <Megaphone size={22} weight="duotone" className="text-[#ff5734]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#ff5734] uppercase tracking-widest">Faculty Notice</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <CalendarBlank size={12} className="text-slate-400" />
                                <span className="text-[11px] text-slate-500 font-bold">{new Date(notice.publishedAt || notice.createdAt).toLocaleDateString()}</span>
                                {notice.aiProcessed && (
                                    <span className="text-[9px] font-black text-violet-600 bg-violet-600/10 border border-violet-600/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                        <SealCheck size={10} weight="fill" /> AI INSIGHT
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Close Button as X to the right */}
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-[#ff5734] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                        <X size={20} weight="bold" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-10 space-y-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tight">{notice.title}</h2>
                        {notice.originalTitle && notice.originalTitle !== notice.title && (
                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider italic flex items-center gap-1.5">
                                <Info size={12} /> Original Title: "{notice.originalTitle}"
                            </p>
                        )}
                    </div>

                    <div className="p-8 bg-slate-50/80 rounded-[2.5rem] border border-slate-100 text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-['Kodchasan']">
                        {notice.content}
                    </div>

                    {/* Attachments */}
                    {notice.attachments?.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <FilePdf size={14} weight="fill" className="text-rose-500" />
                                Attachments ({notice.attachments.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {notice.attachments.map((att, i) => (
                                    <a key={i} href={resolveDownloadUrl(att)} download target="_blank" rel="noreferrer" 
                                       className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#ff5734]/20 hover:shadow-lg transition-all shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                {getAttachmentIcon(att.filename || att.url)}
                                            </div>
                                            <div className="min-w-0 pr-2">
                                                <p className="text-xs font-black text-slate-800 truncate">{att.filename || 'Document'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Click to download</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#ff5734] group-hover:bg-[#ff5734]/10 transition-all">
                                            <DownloadSimple size={16} weight="bold" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                        <a href={notice.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-[#ff5734] transition-colors uppercase tracking-widest">
                            <ArrowSquareOut size={14} weight="bold" /> View Original Source
                        </a>
                        <button onClick={onClose} className="w-full sm:w-auto px-8 py-3 bg-[#ff5734] hover:bg-[#e64a2e] text-white text-[11px] font-black rounded-2xl transition-all shadow-lg shadow-[#ff5734]/25 uppercase tracking-widest">
                            GOT IT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─── Main Board ──────────────────────────────────────────── */
const NoticeBoard = ({ isDashboard = false, initialNotices = [], isDark = false }) => {
    const [notices, setNotices] = useState([])
    const [modules, setModules] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [page, setPage] = useState(1)
    const navigate = useNavigate()
    const { id } = useParams()

    const [modulesLoaded, setModulesLoaded] = useState(false)

    const fetchModules = async () => {
        try {
            const res = await api.get('/academic/my-modules')
            if (res.data?.modules) setModules(res.data.modules)
        } catch (err) {
            console.error('Failed to fetch student modules', err)
        } finally {
            setModulesLoaded(true)
        }
    }

    const fetchNotices = async () => {
        // If we have initial notices (from dashboard parent), use them and skip fetching
        if (initialNotices && initialNotices.length > 0) {
            setNotices(isDashboard ? initialNotices.slice(0, 3) : initialNotices)
            setLoading(false)
            return
        }

        try {
            // For students, we always restrict to published notices
            const limit = isDashboard ? 20 : 50 // Fetch enough to filter down
            const res = await api.get(`/notices?limit=${limit}&status=published`)
            if (res.data.success) setNotices(res.data.data)
        } catch (err) {
            console.error('Failed to fetch notices', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { 
        const init = async () => {
            await fetchModules()
            await fetchNotices()
        }
        init()

        // ── Real-time Sync ──
        socketService.on('new_notice', fetchNotices)
        socketService.on('notice_deleted', ({ id }) => {
            setNotices(prev => prev.filter(n => n._id !== id))
        })
        socketService.on('all_notices_deleted', () => {
            setNotices([])
        })

        return () => {
            socketService.off('new_notice')
            socketService.off('notice_deleted')
            socketService.off('all_notices_deleted')
        }
    }, [])

    // Faculty Notices are global, no module filtering needed
    const displayNotices = isDashboard ? notices.slice(0, 3) : notices;

    if (loading) return (
        <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-[72px] ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'} rounded-2xl border`} />
            ))}
        </div>
    )

    return (
        <>
            <div className="space-y-3">
                {displayNotices.map((notice) => (
                    <button
                        key={notice._id}
                        onClick={() => setSelected(notice)}
                        className={`w-full group flex items-center gap-4 p-4 rounded-[2rem] ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-[#ff5734]/20'} border hover:shadow-2xl transition-all text-left cursor-pointer`}
                    >
                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-2xl ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'} border flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#ff5734] group-hover:text-white transition-all`}>
                            <Megaphone size={22} weight="duotone" className="text-[#ff5734] group-hover:text-white transition-colors" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[8px] font-black text-[#ff5734] uppercase tracking-widest bg-[#ff5734]/10 px-1.5 py-0.5 rounded-md border border-[#ff5734]/10">Notice</span>
                                <span className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                                    <CalendarBlank size={10} weight="fill" className="text-slate-500" />
                                    {new Date(notice.publishedAt || notice.createdAt).toLocaleDateString()}
                                </span>
                                {notice.attachments?.length > 0 && (
                                    <span className="text-[9px] text-rose-400 flex items-center gap-1 font-black bg-rose-500/5 px-1.5 py-0.5 rounded-full">
                                        <FilePdf size={10} weight="fill" />
                                        {notice.attachments.length}
                                    </span>
                                )}
                            </div>
                            <h4 className={`text-[13px] font-black ${isDark ? 'text-white' : 'text-slate-800'} group-hover:text-[#ff5734] transition-colors truncate leading-tight`}>{notice.title}</h4>
                            <p className={`text-[10px] text-slate-500 ${isDark ? 'group-hover:text-slate-300' : 'group-hover:text-slate-400'} transition-colors line-clamp-1 mt-0.5 leading-tight italic`}>{notice.subtext || "Click to see details..."}</p>
                        </div>

                        {/* Action Hint */}
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all uppercase tracking-tighter">View</span>
                            <div className={`w-7 h-7 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'} flex items-center justify-center group-hover:bg-[#ff5734] transition-all shadow-lg`}>
                                <ArrowRight size={14} weight="bold" className={`${isDark ? 'text-white/20' : 'text-slate-400'} group-hover:text-white transition-all`} />
                            </div>
                        </div>
                    </button>
                ))}

                {displayNotices.length > 0 && isDashboard && (
                    <button 
                        onClick={() => navigate(`/${id}/notices`)}
                        className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl ${isDark ? 'bg-[#ff5734]/5 border-[#ff5734]/10' : 'bg-slate-50 border-slate-200'} text-[#ff5734] text-[11px] font-black hover:bg-[#ff5734]/10 transition-all group/btn uppercase tracking-widest border`}
                    >
                        SEE ALL NOTICES
                        <CaretRight size={14} weight="bold" className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                )}

                {displayNotices.length === 0 && (
                    <div className="text-center py-10">
                        <Info size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No faculty notices at the moment.</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <NoticeModal notice={selected} onClose={() => setSelected(null)} />
        </>
    )
}

export default NoticeBoard
