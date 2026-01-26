import React from 'react'
import ResourceManagement from '../components/ResourceManagement'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminResourcesPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-fadeIn p-4 md:p-8">
                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 dark:from-indigo-900 dark:via-indigo-950 dark:to-violet-950 rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-10">
                    {/* Background Visuals */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative z-10">
                        <button
                            onClick={() => navigate('/admin')}
                            className="group flex items-center gap-2 text-indigo-100 hover:text-white transition-colors mb-6 font-medium"
                        >
                            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                            Back to Dashboard
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                                <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">Resource Manager</h1>
                                <p className="text-indigo-100 text-lg font-medium max-w-2xl">Upload, organize, and manage academic materials for all batches and semesters.</p>
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
