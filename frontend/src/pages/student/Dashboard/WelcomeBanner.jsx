import React from 'react';

const WelcomeBanner = ({ studentName, level, semester, credits, progress, combination, combinationSubjects }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="relative rounded-[32px] overflow-hidden group shadow-sm bg-[#151313]">
            {/* Decorative Blur Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#fccc42] opacity-20 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff5734] opacity-20 blur-[80px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

            {/* Content Container */}
            <div className="relative z-10 w-full p-6 sm:p-8 xl:p-10 flex flex-col xl:flex-row justify-between xl:items-end gap-6 sm:gap-8 min-h-[200px]">

                {/* Left Side: Greeting */}
                <div className="flex flex-col justify-end h-full relative z-20">
                    <p className="text-white/60 font-medium tracking-widest uppercase mb-1 xl:mb-2 text-[10px] hidden sm:block">
                        Student Dashboard
                    </p>
                    <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight mb-3 xl:mb-4">
                        {getGreeting()}{studentName ? ',' : ''}<br className="hidden sm:block" />
                        {studentName ? <span className="text-[#fccc42] sm:ml-2 inline-block sm:inline">{studentName}</span> : ''}
                    </h1>
                    {combination && combination !== 'Not Set' && (
                        <div className="flex flex-wrap items-center gap-2 mt-1 xl:mt-2">
                            <span className="text-white/90 font-bold text-[10px] xl:text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 shadow-sm whitespace-nowrap">
                                {combination}
                            </span>
                            {combinationSubjects && combinationSubjects.length > 0 && (
                                <span className="text-white/60 font-medium text-[9px] xl:text-[11px] uppercase tracking-wider pl-1 line-clamp-1 break-all">
                                    {combinationSubjects.join(' • ')}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Stats & Progress */}
                <div className="flex flex-col items-start xl:items-end gap-4 xl:gap-5 w-full xl:w-auto relative z-20">
                    {/* Pills */}
                    <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                        <div className="px-3 xl:px-4 py-1.5 rounded-full bg-white/10 text-white font-bold text-[10px] xl:text-xs whitespace-nowrap">
                            Level {level || ''}
                        </div>
                        <div className="px-3 xl:px-4 py-1.5 rounded-full bg-white/10 text-white font-bold text-[10px] xl:text-xs whitespace-nowrap">
                            Semester {semester || ''}
                        </div>
                        <div className="px-3 xl:px-4 py-1.5 rounded-full bg-white/10 text-white font-bold text-[10px] xl:text-xs whitespace-nowrap">
                            {credits || ''} Credits
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full xl:w-72 bg-white/5 rounded-2xl p-4 xl:p-5">
                        <div className="flex justify-between items-center text-white/80 text-[10px] xl:text-xs font-bold mb-2">
                            <span>Semester Progress</span>
                            <span className="text-[#fccc42]">{progress !== undefined && progress !== '' ? `${progress}%` : ''}</span>
                        </div>
                        <div className="h-1.5 xl:h-2 bg-[#151313] rounded-full overflow-hidden w-full">
                            <div
                                className="h-full bg-gradient-to-r from-[#ff5734] to-[#fccc42] rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progress || 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WelcomeBanner;
