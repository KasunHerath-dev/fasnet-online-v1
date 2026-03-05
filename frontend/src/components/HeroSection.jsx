import React from 'react'
import { Award } from 'lucide-react'

const Badge = ({ label, color = "gray" }) => {
    const colors = {
        blue: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
        red: "bg-primary/10 text-primary border border-primary/20",
        orange: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
        gray: "bg-highlight text-text-muted border border-border-glass",
    }
    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${colors[color] || colors.gray}`}>
            {label}
        </span>
    )
}

export default function HeroSection({ firstName, student, gpa, credits, showDeansList }) {
    return (
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-primary/10 to-transparent bg-surface-glass border border-border-glass overflow-hidden min-h-[250px] flex items-center p-8 lg:p-12 mb-8 shadow-sm">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 Mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>

            <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-text-main mb-4 tracking-tight">
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">{firstName}</span>
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Badge label={`Level ${student?.level || 1}`} color="gray" />
                        <Badge label={`Sem ${student?.semester || 1}`} color="gray" />
                        <Badge label={student?.combination || "COMB 01"} color="gray" />
                    </div>
                    {showDeansList && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-bold animate-pulse">
                            <Award className="w-4 h-4" /> Dean's List Eligible
                        </div>
                    )}
                </div>

                {/* Quick Stats on Hero */}
                <div className="flex gap-4">
                    <div className="text-center p-4 rounded-2xl bg-highlight/50 border border-border-glass backdrop-blur-sm shadow-sm">
                        <span className="block text-3xl font-black text-text-main">{gpa}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase">GPA</span>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-highlight/50 border border-border-glass backdrop-blur-sm shadow-sm">
                        <span className="block text-3xl font-black text-text-main">{credits}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Credits</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
