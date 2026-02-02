import React from 'react'
import { Award } from 'lucide-react'

const Badge = ({ label, color = "gray" }) => {
    const colors = {
        blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        red: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        orange: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        gray: "bg-white/5 text-gray-400 border border-white/10",
    }
    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${colors[color] || colors.gray}`}>
            {label}
        </span>
    )
}

export default function HeroSection({ firstName, student, gpa, credits, showDeansList }) {
    return (
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-rose-900/20 to-black border border-white/5 overflow-hidden min-h-[250px] flex items-center p-8 lg:p-12 mb-8">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 blur-[100px] rounded-full"></div>

            <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
                        Welcome back,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">{firstName}</span>
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Badge label={`Level ${student?.level || 1}`} color="gray" />
                        <Badge label={`Sem ${student?.semester || 1}`} color="gray" />
                        <Badge label={student?.combination || "COMB 01"} color="gray" />
                    </div>
                    {showDeansList && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold animate-pulse">
                            <Award className="w-4 h-4" /> Dean's List Eligible
                        </div>
                    )}
                </div>

                {/* Quick Stats on Hero */}
                <div className="flex gap-4">
                    <div className="text-center p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm">
                        <span className="block text-3xl font-black text-white">{gpa}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">GPA</span>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm">
                        <span className="block text-3xl font-black text-white">{credits}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Credits</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
