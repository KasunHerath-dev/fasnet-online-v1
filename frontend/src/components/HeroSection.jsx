import React from 'react'
import { ArrowRight, Sparkles, GraduationCap, TrendingUp } from 'lucide-react'

export default function HeroSection() {
    return (
        <section className="relative min-h-screen bg-black overflow-hidden flex items-center">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#f3184c]/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full">
                            <Sparkles className="w-4 h-4 text-[#f3184c]" />
                            <span className="text-sm font-bold text-gray-400">Student Portal</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                            <span className="text-white">Your Academic</span>
                            <br />
                            <span className="bg-gradient-to-r from-[#f3184c] via-purple-500 to-blue-500 bg-clip-text text-transparent">
                                Journey Starts Here
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg sm:text-xl text-gray-400 max-w-xl">
                            Track progress, access resources, and excel in your studies.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button className="group px-8 py-4 bg-[#f3184c] hover:bg-[#d01440] text-white rounded-xl font-bold text-lg transition-all flex items-center gap-2 shadow-lg shadow-[#f3184c]/30 hover:shadow-[#f3184c]/50">
                                Get Started
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl font-bold text-lg transition-all">
                                Learn More
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8 pt-4">
                            <div>
                                <div className="text-3xl font-black text-white">5K+</div>
                                <div className="text-sm text-gray-500">Students</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-white">100+</div>
                                <div className="text-sm text-gray-500">Courses</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-white">95%</div>
                                <div className="text-sm text-gray-500">Success Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Feature Cards */}
                    <div className="relative">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Card 1 */}
                            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#f3184c] transition-all group">
                                <div className="w-12 h-12 bg-[#f3184c]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#f3184c]/20 transition-colors">
                                    <GraduationCap className="w-6 h-6 text-[#f3184c]" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-2">Track Progress</h3>
                                <p className="text-sm text-gray-500">Monitor your GPA and credits in real-time</p>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-blue-500 transition-all group mt-8">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-2">Analytics</h3>
                                <p className="text-sm text-gray-500">Visualize your academic performance</p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-purple-500 transition-all group">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                                    <Sparkles className="w-6 h-6 text-purple-500" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-2">Resources</h3>
                                <p className="text-sm text-gray-500">Access study materials anytime</p>
                            </div>

                            {/* Card 4 */}
                            <div className="bg-gradient-to-br from-[#f3184c] to-purple-600 rounded-2xl p-6 mt-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                <div className="relative">
                                    <div className="text-4xl font-black text-white mb-2">24/7</div>
                                    <p className="text-sm text-white/90 font-bold">Always Available</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Element */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#f3184c] to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        </section>
    )
}
