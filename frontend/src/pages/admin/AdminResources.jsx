import React from 'react'
import ResourceManagement from '../../components/admin/ResourceManagement'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminResourcesPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c14] font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-fadeIn p-4 md:p-8">
                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-10 bg-gradient-to-br from-violet-950 via-violet-900 to-blue-900">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-20 rounded-[2.5rem]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='white' stroke-opacity='.12' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}></div>
                    {/* Background Visuals */}
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -mr-20 -mt-20" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', opacity: 0.15 }}></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl -ml-20 -mb-20" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', opacity: 0.1 }}></div>

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

                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-inner border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(37,99,235,0.5))' }}>
                                <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">Resource Manager</h1>
                                <p className="text-slate-300 text-lg font-medium max-w-2xl">Upload, organize, and manage academic materials for all batches and semesters.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 p-6 md:p-8">
                    <ResourceManagement />
                </div>
            </div>

        </div>
    )
}

