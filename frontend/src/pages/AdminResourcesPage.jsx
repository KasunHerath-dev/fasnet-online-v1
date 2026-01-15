import React from 'react'
import ResourceManagement from '../components/ResourceManagement'
import { BookOpen } from 'lucide-react'

export default function AdminResourcesPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 animate-fadeIn">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1">Resource Manager</h1>
                            <p className="text-indigo-100 font-medium text-lg">Upload and manage academic materials for students</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <ResourceManagement />
                </div>
            </div>
        </div>
    )
}
