import React from 'react';

// Minimal, fast loader — no blur, no blobs, just a clean spinner
const UnifiedPageLoader = () => (
    <div className="flex-1 w-full flex flex-col items-center justify-center gap-4">
        {/* Dual-ring spinner */}
        <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff5734] animate-spin" style={{ animationDuration: '0.7s' }} />
        </div>
        {/* Animated dots */}
        <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"
                    style={{ animationDuration: '0.8s', animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    </div>
);

export default UnifiedPageLoader;
