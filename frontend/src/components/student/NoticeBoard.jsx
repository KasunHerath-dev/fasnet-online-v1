import React, { useState, useEffect } from 'react'
import {
    Megaphone, FilePdf, FileDoc,
    ArrowRight, X, DownloadSimple,
    Info, CalendarBlank, ArrowSquareOut,
    SealCheck, CaretRight, Clock, Paperclip
} from '@phosphor-icons/react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { socketService } from '../../services/socketService'

/* ─── helpers ─────────────────────────────────────────────── */
function getAttachmentIcon(filename = '') {
    const ext = filename.split('.').pop().toLowerCase()
    if (['doc', 'docx'].includes(ext)) return <FileDoc size={14} weight="fill" className="text-blue-500" />
    return <FilePdf size={14} weight="fill" className="text-rose-500" />
}

function resolveDownloadUrl(att) {
    if (att.localPath) {
        const filename = att.localPath.split('/').pop().split('\\').pop()
        return `/attachments/${filename}`
    }
    return att.url
}

// Accent left-bar colors per notice
const ACCENTS = [
    'bg-[#ff5734]',
    'bg-[#fccc42]',
    'bg-[#be94f5]',
    'bg-[#60a5fa]',
];
const ICON_THEMES = [
    'bg-[#ff5734]/10 text-[#ff5734]',
    'bg-[#fccc42]/30 text-[#b45309]',
    'bg-[#be94f5]/20 text-purple-700',
    'bg-blue-100 text-blue-600',
];

/* ─── Notice Detail Modal ─────────────────────────────────── */
function NoticeModal({ notice, onClose }) {
    if (!notice) return null
    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
                {/* Drag handle for mobile */}
                <div className="flex-shrink-0 flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 bg-slate-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#ff5734]/10 flex items-center justify-center">
                            <Megaphone size={18} weight="duotone" className="text-[#ff5734]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-[#ff5734] uppercase tracking-widest">Faculty Notice</p>
                            <p className="text-[11px] text-slate-400 font-semibold">
                                {new Date(notice.publishedAt || notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
                        <X size={16} weight="bold" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    <h2 className="text-xl font-black text-[#151313] leading-snug">{notice.title}</h2>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {notice.content}
                    </div>

                    {notice.attachments?.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Attachments · {notice.attachments.length}
                            </p>
                            {notice.attachments.map((att, i) => (
                                <a key={i} href={resolveDownloadUrl(att)} download target="_blank" rel="noreferrer"
                                   className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#ff5734]/30 transition-all active:scale-[0.99]">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                                        {getAttachmentIcon(att.filename || att.url)}
                                    </div>
                                    <p className="flex-1 text-sm font-bold text-[#151313] truncate">{att.filename || 'Document'}</p>
                                    <DownloadSimple size={16} weight="bold" className="text-slate-400 flex-shrink-0" />
                                </a>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <a href={notice.sourceUrl} target="_blank" rel="noreferrer"
                           className="text-[11px] font-bold text-slate-400 hover:text-[#ff5734] flex items-center gap-1 transition-colors">
                            <ArrowSquareOut size={12} /> Source
                        </a>
                        <button onClick={onClose}
                            className="px-7 py-2.5 bg-[#151313] text-white text-[11px] font-black rounded-xl hover:bg-[#ff5734] transition-all uppercase tracking-widest">
                            Got It
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─── Notice Row ──────────────────────────────────────────── */
const NoticeItem = ({ notice, onClick, idx }) => {
    const dateStr = new Date(notice.publishedAt || notice.createdAt)
        .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const accentBar = ACCENTS[idx % ACCENTS.length]
    const iconTheme = ICON_THEMES[idx % ICON_THEMES.length]

    return (
        <button
            onClick={onClick}
            className="w-full group flex items-center gap-0 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md active:scale-[0.99] transition-all text-left overflow-hidden"
        >
            {/* Left accent bar */}
            <div className={`w-[4px] self-stretch flex-shrink-0 ${accentBar}`} />

            {/* Icon */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mx-3 ${iconTheme}`}>
                <Megaphone size={15} weight="duotone" />
            </div>

            {/* Main text */}
            <div className="flex-1 py-3.5 min-w-0 pr-1">
                <p className="text-[13px] font-black text-[#151313] leading-snug line-clamp-1 group-hover:text-[#ff5734] transition-colors">
                    {notice.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock size={9} />{dateStr}
                    </span>
                    {notice.attachments?.length > 0 && (
                        <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                            <Paperclip size={9} weight="bold" />{notice.attachments.length}
                        </span>
                    )}
                    {notice.aiProcessed && (
                        <span className="text-[9px] font-black text-violet-500 flex items-center gap-0.5">
                            <SealCheck size={9} weight="fill" />AI
                        </span>
                    )}
                </div>
            </div>

            {/* Arrow */}
            <div className="w-7 h-7 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 mr-3 group-hover:bg-[#151313] group-hover:border-[#151313] transition-all">
                <ArrowRight size={11} weight="bold" className="text-slate-400 group-hover:text-white transition-colors" />
            </div>
        </button>
    )
}

/* ─── Main Board ──────────────────────────────────────────── */
const NoticeBoard = ({ isDashboard = false }) => {
    const [notices, setNotices] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const navigate = useNavigate()
    const { id } = useParams()

    const fetchNotices = async () => {
        try {
            const res = await api.get(`/notices?limit=${isDashboard ? 20 : 50}&status=published`)
            if (res.data.success) setNotices(res.data.data)
        } catch { /* silent */ } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotices()
        socketService.on('new_notice', fetchNotices)
        socketService.on('notice_deleted', ({ id }) => setNotices(p => p.filter(n => n._id !== id)))
        socketService.on('all_notices_deleted', () => setNotices([]))
        return () => {
            socketService.off('new_notice')
            socketService.off('notice_deleted')
            socketService.off('all_notices_deleted')
        }
    }, [])

    const display = isDashboard ? notices.slice(0, 4) : notices

    if (loading) return (
        <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-[62px] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex">
                    <div className="w-1 bg-slate-200" />
                </div>
            ))}
        </div>
    )

    if (display.length === 0) return (
        <div className="py-10 text-center">
            <Megaphone size={28} className="mx-auto text-slate-200 mb-2" weight="duotone" />
            <p className="text-xs font-bold text-slate-400">No notices at the moment.</p>
        </div>
    )

    return (
        <>
            <div className="space-y-2">
                {display.map((n, idx) => (
                    <NoticeItem key={n._id} notice={n} idx={idx} onClick={() => setSelected(n)} />
                ))}
                {isDashboard && display.length > 0 && (
                    <button
                        onClick={() => navigate(`/${id}/notices`)}
                        className="mt-1 w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-black hover:bg-[#151313] hover:text-white hover:border-[#151313] transition-all uppercase tracking-widest group"
                    >
                        See All Notices
                        <CaretRight size={11} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                )}
            </div>
            <NoticeModal notice={selected} onClose={() => setSelected(null)} />
        </>
    )
}

export default NoticeBoard
