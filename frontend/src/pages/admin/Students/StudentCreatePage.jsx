import StudentForm from '../../../components/admin/StudentForm'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Sparkles } from 'lucide-react'

export default function StudentCreatePage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-display text-slate-900 dark:text-white transition-colors duration-300">

            {/* Enhanced Hero Section - Command Center Style */}
            <div className="relative w-full overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
                </div>

                {/* Floating orbs */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-white opacity-15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-cyan-300 opacity-20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                    <div className="flex flex-col items-center text-center space-y-6">

                        {/* Icon Badge */}
                        <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center shadow-2xl">
                                <UserPlus className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <span className="relative flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                                    <Sparkles className="relative w-4 h-4 text-yellow-300" />
                                </span>
                            </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-3">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight">
                                Add New Student
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-white/90 font-medium max-w-2xl leading-relaxed">
                                Register a new student into the system with complete details
                            </p>
                        </div>

                        {/* Quick Info Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-bold border border-white/25">
                                Personal Info
                            </span>
                            <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-bold border border-white/25">
                                Academic Details
                            </span>
                            <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-bold border border-white/25">
                                Contact Information
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/students')}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-slate-900 dark:text-white">Back to Students</span>
                </button>

                {/* Form Container with Enhanced Styling */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-blue-500/10">
                    <StudentForm />
                </div>
            </div>
        </div>
    )
}

