import React from 'react'
import ResourceManagement from '../components/ResourceManagement'
import { BookOpen } from 'lucide-react'

export default function AdminResourcesPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8 animate-fadeIn">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                    <div className="relative z-10 flex items-center gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-0.5 md:mb-1">Resource Manager</h1>
                            <p className="text-sm md:text-base lg:text-lg text-indigo-100 font-medium">Upload and manage academic materials for students</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <ResourceManagement />
                </div>
            </div>
        </div>
    )
}
