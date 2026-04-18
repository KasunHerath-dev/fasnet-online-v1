import React, { useState } from 'react'
import { Megaphone, ArrowLeft, Robot, Gear, ListChecks, WarningCircle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import NoticeScraperConfig from '../../components/admin/NoticeScraperConfig'
import NoticeManagement from '../../components/admin/NoticeManagement'

const AdminNoticesPage = () => {
    const navigate = useNavigate()
    const [activeView, setActiveView] = useState('list') // 'list' or 'config'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c14] font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-fadeIn p-4 md:p-8">
                
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-10 bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900">
                    <div className="absolute inset-0 opacity-20 rounded-[2.5rem]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='white' stroke-opacity='.12' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}></div>
                    
                    <div className="relative z-10">
                        <button
                            onClick={() => navigate('/admin')}
                            className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6 font-medium"
                        >
                            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                            Back to Dashboard
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-inner border border-white/10 bg-white/10 backdrop-blur-md">
                                    <Megaphone size={40} weight="duotone" className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">Notice Manager</h1>
                                    <p className="text-slate-300 text-lg font-medium max-w-2xl">Automated scraping, AI rewriting, and student notification systems.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setActiveView('list')}
                                    className={`px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${
                                        activeView === 'list' 
                                        ? 'bg-white text-indigo-900 shadow-xl' 
                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                    }`}
                                >
                                    <ListChecks size={20} weight="bold" />
                                    Review Queue
                                </button>
                                <button 
                                    onClick={() => setActiveView('config')}
                                    className={`px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${
                                        activeView === 'config' 
                                        ? 'bg-white text-indigo-900 shadow-xl' 
                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                    }`}
                                >
                                    <Gear size={20} weight="bold" />
                                    Scraper Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Workspace */}
                    <div className="lg:col-span-8 order-2 lg:order-1">
                        <div className="bg-white dark:bg-[#121420] rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 p-6 md:p-8 min-h-[600px]">
                            {activeView === 'list' ? (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Recent Notices</h2>
                                    </div>
                                    <NoticeManagement />
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-left-4 duration-500 max-w-4xl">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Scraper Control Panel</h2>
                                    </div>
                                    <NoticeScraperConfig />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats & Quick Info */}
                    <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                        <div className="bg-white dark:bg-[#121420] rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-white/5">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">System Status</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Scraper Engine</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-700 bg-white dark:bg-emerald-500 px-2 py-0.5 rounded shadow-sm uppercase">Online</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 border border-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                                    <div className="flex items-center gap-3">
                                        <Robot size={18} weight="duotone" className="text-indigo-500" />
                                        <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400">AI Rewriter</span>
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-700 bg-white dark:bg-indigo-500 px-2 py-0.5 rounded shadow-sm uppercase">Ready</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] p-6 text-white shadow-xl shadow-orange-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <WarningCircle size={20} weight="fill" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Scraper Tips</span>
                            </div>
                            <p className="text-xs font-medium leading-relaxed opacity-90">
                                If the scraper fails to find notices, check if the University website has changed its layout. You may need to update the CSS selectors in the Settings tab.
                            </p>
                            <button 
                                onClick={() => setActiveView('config')}
                                className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black uppercase transition-all backdrop-blur-md"
                            >
                                Edit Selectors
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default AdminNoticesPage
