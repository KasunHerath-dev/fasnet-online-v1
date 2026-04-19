import React from 'react';

const shimmer = `
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes pulse-fade {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
@keyframes logo-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.08); opacity: 1; }
}
`;

const ShimmerBar = ({ w = 'w-full', h = 'h-4', rounded = 'rounded-xl', className = '' }) => (
    <div
        className={`${w} ${h} ${rounded} ${className}`}
        style={{
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '400px 100%',
            animation: 'shimmer 1.4s ease-in-out infinite',
        }}
    />
);

const UnifiedPageLoader = ({ variant = 'default' }) => (
    <>
        <style>{shimmer}</style>
        <div className="flex-1 w-full flex flex-col bg-[#f7f7f5] min-h-0 overflow-hidden">

            {/* ── Brand Header Strip ── */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                    {/* Logo pulse */}
                    <div
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff5734] to-[#fccc42]"
                        style={{ animation: 'logo-pulse 1.6s ease-in-out infinite' }}
                    />
                    <ShimmerBar w="w-28" h="h-4" />
                </div>
                <ShimmerBar w="w-10" h="h-10" rounded="rounded-full" />
            </div>

            {/* ── Hero Card Skeleton ── */}
            <div className="mx-4 mt-4 rounded-[2rem] bg-[#1a1a18] p-6 flex-shrink-0 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(255,87,52,0.15) 0%, transparent 70%)' }} />
                <ShimmerBar w="w-24" h="h-3" className="opacity-30 mb-4" />
                <ShimmerBar w="w-48" h="h-8" rounded="rounded-2xl" className="opacity-20 mb-3" />
                <ShimmerBar w="w-64" h="h-4" className="opacity-20 mb-6" />
                <div className="flex gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <ShimmerBar w="w-14" h="h-3" className="opacity-20" />
                            <ShimmerBar w="w-10" h="h-6" rounded="rounded-xl" className="opacity-25" />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Content Cards Skeleton ── */}
            <div className="flex-1 px-4 pt-4 pb-4 flex flex-col gap-3 min-h-0">

                {/* Card 1 — wide notice-style */}
                <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-[1.2rem] bg-slate-100 flex-shrink-0"
                            style={{ animation: 'shimmer 1.4s ease-in-out infinite', backgroundSize: '400px 100%', background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)' }} />
                        <div className="flex-1 flex flex-col gap-1.5">
                            <ShimmerBar w="w-32" h="h-3" />
                            <ShimmerBar w="w-20" h="h-2.5" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {[90, 75, 60, 80].map((pct, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <ShimmerBar w="w-8" h="h-8" rounded="rounded-xl" className="flex-shrink-0" />
                                <div className="flex-1 flex flex-col gap-1">
                                    <ShimmerBar w={`w-[${pct}%]`} h="h-3" />
                                    <ShimmerBar w="w-20" h="h-2.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card 2 — stat cards row */}
                <div className="grid grid-cols-3 gap-2 flex-shrink-0">
                    {['bg-[#fde047]/30', 'bg-[#e9d5ff]/30', 'bg-[#bae6fd]/30'].map((bg, i) => (
                        <div key={i} className={`${bg} rounded-[1.5rem] p-4 flex flex-col gap-2`}>
                            <ShimmerBar w="w-full" h="h-2.5" />
                            <ShimmerBar w="w-3/4" h="h-6" rounded="rounded-xl" />
                            <ShimmerBar w="w-full" h="h-2" />
                        </div>
                    ))}
                </div>

            </div>

            {/* ── Loading Label ── */}
            <div className="flex items-center justify-center gap-2.5 py-4 flex-shrink-0">
                <div className="relative w-4 h-4">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ff5734] animate-spin"
                        style={{ animationDuration: '0.7s' }} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Syncing data
                </span>
            </div>

        </div>
    </>
);

export default UnifiedPageLoader;
