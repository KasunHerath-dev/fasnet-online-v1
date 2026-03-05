import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const themes = [
    {
        key: 'light',
        label: 'Light',
        icon: Sun,
        bg: 'bg-[#fccc42]',
        activeBorder: 'border-[#fccc42]',
        previewBg: 'bg-white',
        previewAccent: 'bg-[#151313]',
    },
    {
        key: 'dark',
        label: 'Dark',
        icon: Moon,
        bg: 'bg-[#151313]',
        activeBorder: 'border-[#151313]',
        previewBg: 'bg-[#151313]',
        previewAccent: 'bg-[#fccc42]',
    },
    {
        key: 'system',
        label: 'System',
        icon: Monitor,
        bg: 'bg-[#be94f5]',
        activeBorder: 'border-[#be94f5]',
        previewBg: 'bg-slate-200',
        previewAccent: 'bg-slate-500',
    },
];

const ThemeToggle = () => {
    const [theme, setTheme] = useState('system');

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        setTheme(saved || 'system');
    }, []);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else if (newTheme === 'light') {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.removeItem('theme');
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    };

    return (
        <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-7 flex flex-col h-full">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#be94f5]/30 flex items-center justify-center shrink-0">
                    {theme === 'dark' ? (
                        <Moon className="w-5 h-5 text-[#151313]" strokeWidth={2.5} />
                    ) : theme === 'light' ? (
                        <Sun className="w-5 h-5 text-[#151313]" strokeWidth={2.5} />
                    ) : (
                        <Monitor className="w-5 h-5 text-[#151313]" strokeWidth={2.5} />
                    )}
                </div>
                <div>
                    <h3 className="text-base font-black text-[#151313]">Appearance</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Customize your portal's theme</p>
                </div>
            </div>

            {/* Theme Cards */}
            <div className="grid grid-cols-3 gap-3 flex-1">
                {themes.map((t) => {
                    const Icon = t.icon;
                    const isActive = theme === t.key;
                    return (
                        <button
                            key={t.key}
                            onClick={() => handleThemeChange(t.key)}
                            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-[1.5px] transition-all hover:-translate-y-1 duration-300
                                ${isActive
                                    ? `${t.activeBorder} ${t.bg === 'bg-[#151313]' ? 'bg-[#151313] text-white' : t.bg === 'bg-[#fccc42]' ? 'bg-[#fccc42] text-[#151313]' : 'bg-[#be94f5]/20 text-[#151313]'} shadow-md`
                                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            {/* Mini preview */}
                            <div className={`w-10 h-7 rounded-lg ${t.previewBg} border border-black/10 flex items-end justify-end p-1 overflow-hidden`}>
                                <div className={`w-3 h-3 rounded-sm ${t.previewAccent}`} />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-xs font-black tracking-wide">{t.label}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <p className="text-[10px] font-bold text-slate-400 text-center mt-4 uppercase tracking-widest">
                {theme === 'system' ? 'Following device preference' : `${theme.charAt(0).toUpperCase() + theme.slice(1)} mode active`}
            </p>
        </div>
    );
};

export default ThemeToggle;
