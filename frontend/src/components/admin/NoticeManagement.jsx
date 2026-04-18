import React, { useState, useEffect } from 'react'
import { 
  Eye, Trash, CheckCircle, Clock, 
  Tag, Link as LinkIcon, FilePdf, 
  DotsThreeVertical, MagnifyingGlass,
  Funnel, ArrowRight, Spinner, Megaphone,
  ArrowClockwise, X, Globe, DownloadSimple,
  CalendarBlank, ArrowSquareOut, SealCheck,
  FileDoc
} from '@phosphor-icons/react'
import api from '../../services/api'
import { socketService } from '../../services/socketService'
import { useConfirm } from '../../hooks/useConfirm'
import { toast } from 'react-hot-toast'

/* ─── Modal Helpers (Same as student portal) ─── */
function getAttachmentIcon(filename = '') {
    const ext = filename.split('.').pop().toLowerCase()
    if (['doc', 'docx'].includes(ext)) return <FileDoc size={18} weight="fill" className="text-blue-400" />
    return <FilePdf size={18} weight="fill" className="text-rose-400" />
}

function resolveDownloadUrl(att) {
    if (att.localPath) {
        const filename = att.localPath.split('/').pop().split('\\').pop()
        return `/attachments/${filename}`
    }
    return att.url
}

const NoticePreviewModal = ({ notice, onClose }) => {
    if (!notice) return null
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#111827] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                            <Megaphone size={20} weight="duotone" className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Notice Preview</p>
                            <span className="text-[10px] text-slate-400 font-medium">{new Date(notice.publishedAt || notice.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <X size={20} weight="bold" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                    <div>
                        <h2 className="text-xl font-black text-white leading-tight">{notice.title}</h2>
                        {notice.originalTitle && notice.originalTitle !== notice.title && (
                            <p className="text-[10px] text-slate-500 mt-1 italic">Original: "{notice.originalTitle}"</p>
                        )}
                    </div>
                    <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 text-slate-300 text-sm leading-7 whitespace-pre-wrap">
                        {notice.content}
                    </div>
                    {notice.attachments?.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <FilePdf size={13} weight="fill" className="text-rose-400" />
                                Attachments ({notice.attachments.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {notice.attachments.map((att, i) => (
                                    <div key={i} className="flex items-center justify-between p-3.5 bg-white/[0.04] border border-white/5 rounded-xl">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                {getAttachmentIcon(att.filename)}
                                            </div>
                                            <span className="text-xs font-bold text-white truncate">{att.filename}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const NoticeManagement = () => {
    const [notices, setNotices] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [actionId, setActionId] = useState(null)
    const [selectedNotice, setSelectedNotice] = useState(null)
    const [isScraping, setIsScraping] = useState(false)
    const { confirm, ConfirmDialogNode } = useConfirm()

    useEffect(() => {
        fetchNotices()

        // Real-time listeners for scraper events
        socketService.on('scraper_started', () => {
            console.log('[Socket] Scraper started...')
            setIsScraping(true)
        })

        socketService.on('scraper_finished', ({ code } = {}) => {
            console.log(`[Socket] Scraper finished (code: ${code}), refreshing list...`)
            setIsScraping(false)
            fetchNotices()
            toast.success('Scrape completed — List updated', { icon: '✅' })
        })

        return () => {
            socketService.off('scraper_started')
            socketService.off('scraper_finished')
        }
    }, [filter]) // Re-fetch when filter status changes

    const fetchNotices = async () => {
        setLoading(true)
        try {
            // Use server-side filtering by passing the status in query
            const statusQuery = filter === 'all' ? '' : `&status=${filter}`
            const res = await api.get(`/notices?limit=100${statusQuery}`)
            
            if (res.data.success) {
                setNotices(res.data.data)
            }
        } catch (err) {
            console.error('Failed to fetch notices', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredNotices = notices.filter(n => {
        // Search filter (Status is now handled by API)
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                             n.originalTitle?.toLowerCase().includes(search.toLowerCase()) ||
                             n.content?.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
    })

    const handlePublish = async (id) => {
        const ok = await confirm({
            title: 'Publish Notice?',
            message: 'This notice will be visible to all students on their dashboards.',
            type: 'info',
            confirmLabel: 'PUBLISH LIVE'
        })
        if (!ok) return

        setActionId(id)
        try {
            const res = await api.patch(`/notices/${id}/publish`)
            if (res.data.success) {
                setNotices(notices.map(n => n._id === id ? { ...n, status: 'published' } : n))
                toast.success('Notice published successfully!')
            }
        } catch (err) {
            console.error('Failed to publish', err)
            toast.error('Failed to publish notice')
        } finally {
            setActionId(null)
        }
    }

    const handleUnpublish = async (id) => {
        const ok = await confirm({
            title: 'Unpublish Notice?',
            message: 'This notice will be hidden from all students and moved back to drafts.',
            type: 'warning',
            confirmLabel: 'UNPUBLISH NOW'
        })
        if (!ok) return

        setActionId(id)
        try {
            const res = await api.patch(`/notices/${id}/unpublish`)
            if (res.data.success) {
                setNotices(notices.map(n => n._id === id ? { ...n, status: 'draft' } : n))
                toast.success('Notice moved to drafts')
            }
        } catch (err) {
            console.error('Failed to unpublish', err)
            toast.error('Failed to unpublish notice')
        } finally {
            setActionId(null)
        }
    }

    const handleDelete = async (id) => {
        const ok = await confirm({
            title: 'Delete Notice?',
            message: 'This action is permanent and cannot be undone.',
            type: 'danger',
            confirmLabel: 'DELETE NOW'
        })
        if (!ok) return

        try {
            const res = await api.delete(`/notices/${id}`)
            if (res.data.success) {
                setNotices(notices.filter(n => n._id !== id))
                toast.success('Notice deleted')
            }
        } catch (err) {
            console.error('Failed to delete', err)
            toast.error('Failed to delete notice')
        }
    }

    const handleDeleteAll = async () => {
        const ok = await confirm({
            title: '🚨 CRITICAL ACTION',
            message: 'You are about to delete ALL notices. This will clear the entire feed for all students. Are you absolutely sure?',
            type: 'danger',
            confirmLabel: 'WIPE EVERYTHING',
            cancelLabel: 'ABORT'
        })
        if (!ok) return
        
        const secondOk = await confirm({
            title: 'FINAL WARNING',
            message: 'Type "DELETE" is not required, but this is your last chance. Confirm final wipe?',
            type: 'danger',
            confirmLabel: 'CONFIRM WIPE'
        })
        if (!secondOk) return

        try {
            const res = await api.delete('/notices')
            if (res.data.success) {
                setNotices([])
                toast.success('All notices wiped successfully')
            }
        } catch (err) {
            console.error('Failed to delete all', err)
            toast.error('Failed to wipe notices')
        }
    }

    const handleTriggerScrape = async () => {
        try {
            setIsScraping(true)
            await api.post('/notices/scrape')
            toast.success('Analyzing Faculty feed...', { icon: '🔍' })

            // Fail-safe: if the scraper hangs for more than 5 mins, release UI
            const safetyTimeout = setTimeout(() => {
                setIsScraping(prev => {
                    if (prev) {
                        console.warn('[Scraper] Fail-safe: Releasing UI after timeout');
                        fetchNotices(); // One last try
                        toast.error('Scraper taking too long — check logs');
                        return false;
                    }
                    return prev;
                });
            }, 300000); // 5 mins

            // Store timeout ID to clear if finished early
            window._scraperTimeout = safetyTimeout;

        } catch (err) {
            console.error('Failed to trigger scraper', err)
            toast.error('Failed to trigger scraper')
            setIsScraping(false)
        }
    }

    const stats = {
        total: notices.length,
        published: notices.filter(n => n.status === 'published').length,
        draft: notices.filter(n => n.status === 'draft').length
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Scraped', val: stats.total, icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'Live on Portal', val: stats.published, icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                    { label: 'Drafts Pending', val: stats.draft, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' }
                ].map((s, i) => (
                    <div key={i} className={`p-6 rounded-[2.5rem] border ${s.border} ${s.bg} shadow-sm group hover:scale-[1.02] transition-all`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                                <h3 className={`text-3xl font-black ${s.color}`}>{s.val}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-3xl ${s.bg} border-2 border-white flex items-center justify-center ${s.color} shadow-inner`}>
                                <s.icon size={24} weight="duotone" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by title or original content..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                        />
                    </div>

                    <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
                        {['all', 'draft', 'published'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider capitalize transition-all ${
                                    filter === f ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleTriggerScrape}
                        disabled={isScraping}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                            isScraping 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                        }`}
                    >
                        {isScraping ? (
                            <>
                                <Spinner size={16} className="animate-spin" />
                                Scraping...
                            </>
                        ) : (
                            <>
                                <ArrowClockwise size={16} weight="bold" />
                                Run Scraper
                            </>
                        )}
                    </button>
                    <button 
                        onClick={handleDeleteAll}
                        title="Delete All Notices"
                        className="p-3 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all active:scale-90 shadow-sm"
                    >
                        <Trash size={22} weight="bold" />
                    </button>
                </div>
            </div>

            {/* Scraper Status Overlay */}
            {isScraping && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-[2rem] animate-pulse shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <Spinner size={18} className="animate-spin text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Scraping Live Feed</p>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest opacity-70">AI is analyzing faculty announcements...</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { setIsScraping(false); fetchNotices(); }}
                        className="px-4 py-2 bg-white border border-indigo-200 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Force Refresh
                    </button>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spinner size={32} className="animate-spin text-indigo-500" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Notices...</p>
                </div>
            ) : filteredNotices.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <Megaphone size={48} weight="duotone" className="mx-auto text-slate-300 mb-4" />
                    <h4 className="text-sm font-bold text-slate-600">No notices found</h4>
                    <p className="text-xs text-slate-400 mt-1">Try running the scraper or changing filters</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredNotices.map((notice) => (
                        <div 
                            key={notice._id}
                            onClick={() => setSelectedNotice(notice)}
                            className={`group p-6 rounded-[2.5rem] border transition-all hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer relative overflow-hidden ${
                                notice.status === 'draft' ? 'bg-white border-slate-200' : 'bg-white border-indigo-500/30'
                            }`}
                        >
                            {/* Status Accent Bar for Published */}
                            {notice.status === 'published' && (
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                            )}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            notice.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {notice.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                            <Clock size={12} /> {new Date(notice.publishedAt || notice.createdAt).toLocaleDateString()}
                                        </span>
                                        {notice.aiProcessed ? (
                                            <span className="text-[9px] font-black text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                ✦ AI
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                                                Original
                                            </span>
                                        )}
                                        {notice.attachments?.length > 0 && (
                                            <span className="text-[10px] text-indigo-500 flex items-center gap-1 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                                                <FilePdf size={12} weight="fill" /> {notice.attachments.length} Attachment(s)
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-base font-bold text-slate-800 line-clamp-1 mb-1">{notice.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notice.subtext || notice.content?.substring(0, 150)}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {notice.tags?.map(tag => (
                                            <span key={tag} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                <Tag size={10} /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                    {notice.status === 'draft' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handlePublish(notice._id); }}
                                            disabled={actionId === notice._id}
                                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 uppercase tracking-widest active:scale-95"
                                        >
                                            {actionId === notice._id ? <Spinner size={14} className="animate-spin" /> : <CheckCircle size={16} weight="fill" />}
                                            PUBLISH
                                        </button>
                                    )}
                                    {notice.status === 'published' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleUnpublish(notice._id); }}
                                            disabled={actionId === notice._id}
                                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[10px] font-black shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 uppercase tracking-widest active:scale-95"
                                        >
                                            {actionId === notice._id ? <Spinner size={14} className="animate-spin" /> : <Clock size={16} weight="fill" />}
                                            UNPUBLISH
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => setSelectedNotice(notice)}
                                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                        title="View Preview"
                                    >
                                        <Eye size={18} weight="bold" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(notice._id)}
                                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                        title="Delete"
                                    >
                                        <Trash size={18} weight="bold" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal & Dialogs */}
            <NoticePreviewModal 
                notice={selectedNotice} 
                onClose={() => setSelectedNotice(null)} 
            />
            {ConfirmDialogNode}
        </div>
    )
}

export default NoticeManagement
