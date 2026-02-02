import React from 'react'
import { Search, Bell, MessageCircle, Sparkles } from 'lucide-react'

export default function HeroSection() {
    return (
        <section className="relative min-h-screen bg-gradient-to-br from-[#2a1a1f] via-[#1a1520] to-black overflow-hidden">
            {/* Top Navigation Bar */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#f3184c] to-[#d01440] rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-lg">F</span>
                        </div>
                        <span className="text-white font-black text-xl hidden sm:block">fasnet</span>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#252525] rounded-xl flex items-center justify-center transition-colors relative">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-[#f3184c] rounded-full"></div>
                        </button>
                        <button className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#252525] rounded-xl flex items-center justify-center transition-colors">
                            <MessageCircle className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">K</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Heading */}
                        <div className="space-y-4">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                                Dashboard
                            </h1>
                            <p className="text-lg text-gray-400 max-w-md">
                                Track your academic progress and access everything you need in one place
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="What assignment are you looking for?"
                                className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#f3184c] transition-colors"
                            />
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 max-w-xl">
                            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                                <div className="text-2xl font-black text-white">24</div>
                                <div className="text-xs text-gray-500 mt-1">Active Courses</div>
                            </div>
                            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                                <div className="text-2xl font-black text-white">3.8</div>
                                <div className="text-xs text-gray-500 mt-1">Current GPA</div>
                            </div>
                            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                                <div className="text-2xl font-black text-white">89%</div>
                                <div className="text-xs text-gray-500 mt-1">Completion</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Illustration & Card */}
                    <div className="relative">
                        {/* Illustration */}
                        <div className="relative mb-8">
                            <div className="w-full aspect-square max-w-md mx-auto relative">
                                {/* Running Student Illustration (simplified) */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        {/* Cloud elements */}
                                        <div className="absolute -top-20 -left-10 w-24 h-12 bg-white/10 rounded-full blur-sm"></div>
                                        <div className="absolute -top-16 left-20 w-16 h-8 bg-white/10 rounded-full blur-sm"></div>
                                        <div className="absolute top-10 -right-20 w-20 h-10 bg-white/10 rounded-full blur-sm"></div>

                                        {/* Student figure (abstract) */}
                                        <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center relative">
                                            <div className="text-6xl">🎓</div>
                                            {/* Motion lines */}
                                            <div className="absolute -right-8 top-1/3 w-12 h-1 bg-white/20 rounded-full"></div>
                                            <div className="absolute -right-6 top-1/2 w-8 h-1 bg-white/20 rounded-full"></div>
                                            <div className="absolute -right-10 top-2/3 w-16 h-1 bg-white/20 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Subscription Card */}
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] rounded-2xl p-6 max-w-md mx-auto">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#f3184c] to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-white mb-1">Premium subscription</h3>
                                    <p className="text-sm text-gray-400">Buy Premium and get access to new courses</p>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-black hover:bg-[#0a0a0a] text-white rounded-xl font-bold text-sm transition-colors">
                                More detailed
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-[#f3184c]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </section>
    )
}
