import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    LayoutDashboard,
    TrendingUp,
    Calendar,
    Settings,
    Bell,
    Search,
    LogOut,
    User,
    Sun,
    Moon
} from 'lucide-react';

import { authService } from '../services/authService';
import spaceHeroImg from '../assets/images/space_nebula_hero.png';
import ProfileSetupModal from '../components/ProfileSetupModal';

const StudentLayout = () => {
    const [user] = useState(authService.getUser());
    const [logoUrl, setLogoUrl] = useState(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileSetup, setShowProfileSetup] = useState(false);

    useEffect(() => {
        // Check if profile setup is needed
        if (user && user.needsProfileSetup) {
            setShowProfileSetup(true);
        }
    }, [user]);

    useEffect(() => {
        // Initialize Theme
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    // Mock Notifications
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Algorithm Analysis Report due tonight', time: '2 hours ago', read: false },
        { id: 2, title: 'New grade released: Database Systems', time: '5 hours ago', read: true },
        { id: 3, title: 'Library fine payment confirmation', time: 'Yesterday', read: true },
        { id: 4, title: 'Campus Wi-Fi maintenance scheduled', time: '2 days ago', read: true },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    useEffect(() => {
        // Fetch dynamic logo on mount
        const fetchLogo = async () => {
            try {
                // Use relative path - proxy or CORS will handle it
                const response = await fetch(`${import.meta.env.VITE_API_URL}/settings/logo`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.logoUrl) {
                        setLogoUrl(`${import.meta.env.VITE_API_URL.replace('/api/v1', '')}${data.logoUrl}`);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch logo:", error);
            }
        };
        fetchLogo();
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Highlight active link helper
    const isLinkActive = (path) => {
        // Exact match for dashboard, startsWith for others
        if (path === '/dashboard' && location.pathname === '/dashboard') return true;
        if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className={`flex h-screen font-sans overflow-hidden relative selection:bg-moccaccino-500/30
            ${location.pathname === '/dashboard' ? 'bg-slate-900 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200'}`}>

            {/* ---------------------------------------------------------------------------
             * BACKGROUND LAYERS
             * --------------------------------------------------------------------------- */}

            {/* 1. Dashboard Specific Space Background - Optimized */}
            {location.pathname === '/dashboard' && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={spaceHeroImg}
                        alt=""
                        className="w-full h-full object-cover blur-[80px] opacity-60 scale-110 animate-pulse-slow translate-z-0 will-change-transform"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>
            )}

            {/* 2. Standard Background (Non-Dashboard) — Lightweight static gradient */}
            {location.pathname !== '/dashboard' && (
                <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-slate-50 via-slate-50 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
            )}

            {/* Content Container - Ensure z-index is above pattern */}
            <div className="flex h-screen w-full relative z-10 font-display">

                {/* ---------------------------------------------------------------------------
       * FLOATING GLASS SIDEBAR - Liquid Style (V2 for Dashboard)
       * --------------------------------------------------------------------------- */}
                <aside className={`hidden md:flex flex-col items-center fixed left-6 top-6 bottom-6 z-50 transition-all duration-300
                    ${location.pathname === '/dashboard'
                        ? 'w-[4.5rem] bg-black/20 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-[2rem] py-6'
                        : 'w-[5.5rem] bg-white/10 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-[3rem] py-8'
                    }`}>

                    {/* Logo / Brand */}
                    <div className={`${location.pathname === '/dashboard' ? 'mb-6' : 'mb-8'} flex justify-center w-full relative group`}>
                        <div className={`absolute inset-0 bg-moccaccino-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${location.pathname === '/dashboard' ? 'hidden' : ''}`}></div>
                        <div className={`
                            ${location.pathname === '/dashboard'
                                ? 'w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center'
                                : 'w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-xl'
                            } relative z-10 transform group-hover:scale-105 transition-all duration-300`}>
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <span className={`font-black text-transparent bg-clip-text bg-gradient-to-tr from-moccaccino-400 to-white
                                    ${location.pathname === '/dashboard' ? 'text-lg' : 'text-xl'}`}>A</span>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 flex flex-col items-center gap-4 w-full px-2">
                        <NavItem to="/dashboard" icon={<LayoutDashboard size={location.pathname === '/dashboard' ? 20 : 24} />} active={isLinkActive('/dashboard')} isV2={location.pathname === '/dashboard'} />
                        <NavItem to="/academics" icon={<TrendingUp size={location.pathname === '/dashboard' ? 20 : 24} />} active={isLinkActive('/academics')} isV2={location.pathname === '/dashboard'} />

                        {/* Divider */}
                        <div className={`w-8 h-[2px] bg-white/5 rounded-full my-2 ${location.pathname === '/dashboard' ? 'w-6' : 'w-8'}`}></div>

                        <NavItem to="/learning" icon={<BookOpen size={location.pathname === '/dashboard' ? 20 : 24} />} active={isLinkActive('/learning')} isV2={location.pathname === '/dashboard'} />
                        <NavItem to="/schedule" icon={<Calendar size={location.pathname === '/dashboard' ? 20 : 24} />} active={isLinkActive('/schedule')} isV2={location.pathname === '/dashboard'} />
                        <NavItem to="/resources" icon={<Search size={location.pathname === '/dashboard' ? 20 : 24} />} active={isLinkActive('/resources')} isV2={location.pathname === '/dashboard'} />
                    </nav>

                    {/* Bottom Actions (Settings) */}
                    <div className="mt-auto flex flex-col items-center gap-4 w-full mb-2">
                        <NavItem to="/settings" icon={<Settings size={location.pathname === '/dashboard' ? 20 : 22} />} active={isLinkActive('/settings')} isV2={location.pathname === '/dashboard'} />
                    </div>
                </aside>

                {/* ---------------------------------------------------------------------------
       * MOBILE BOTTOM NAVIGATION
       * --------------------------------------------------------------------------- */}
                <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-[2.5rem] px-6 py-4 flex justify-between items-center transition-all duration-300">
                    <NavItem to="/dashboard" icon={<LayoutDashboard size={22} />} active={isLinkActive('/dashboard')} mobile />
                    <NavItem to="/academics" icon={<TrendingUp size={22} />} active={isLinkActive('/academics')} mobile />
                    <NavItem to="/learning" icon={<BookOpen size={22} />} active={isLinkActive('/learning')} mobile />
                    <NavItem to="/schedule" icon={<Calendar size={22} />} active={isLinkActive('/schedule')} mobile />
                    <NavItem to="/profile" icon={<User size={22} />} active={isLinkActive('/profile')} mobile />
                </nav>

                {/* ---------------------------------------------------------------------------
       * MAIN CONTENT AREA
       * --------------------------------------------------------------------------- */}
                {/* Main Content Area with Page Transition */}
                <main className={`flex-1 ml-0 md:ml-[7rem] relative overflow-y-auto h-screen scroll-smooth no-scrollbar ${location.pathname === '/dashboard' ? 'p-0' : 'p-4 pb-32 md:p-6'}`}>

                    {/* TOP BAR - Modified for Dashboard */}
                    <header className={`flex flex-row items-center gap-3 transition-all duration-300 ${location.pathname === '/dashboard'
                        ? 'absolute top-9 md:top-11 left-0 right-0 z-40 px-6 md:px-8 pointer-events-none justify-end'
                        : 'mb-8 md:mb-10 justify-between'
                        }`}>

                        {/* Title Section - Hidden on Dashboard as it's merged into the banner */}
                        <div className={`min-w-0 flex-1 ${location.pathname === '/dashboard' ? 'hidden' : 'block opacity-100 visible'}`}>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                {getPageTitle(location.pathname)}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base mt-1">
                                {getPageSubtitle(location.pathname)}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pointer-events-auto">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="w-10 h-10 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:scale-105 active:scale-95 transition-all shadow-sm"
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border ${isNotificationsOpen
                                        ? 'bg-moccaccino-100 border-moccaccino-200 text-moccaccino-600 dark:bg-moccaccino-900/20 dark:border-moccaccino-800'
                                        : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                                        <div className="absolute top-14 right-0 w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden ring-1 ring-black/5">
                                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center">
                                                <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                                                <button className="text-xs font-bold text-moccaccino-600 hover:text-moccaccino-700 transition-colors">Mark all read</button>
                                            </div>
                                            <div className="max-h-[320px] overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => handleNotificationClick(notif.id)}
                                                            className={`px-5 py-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${!notif.read ? 'bg-moccaccino-50/20 dark:bg-moccaccino-900/10' : ''}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-1.5">
                                                                <p className={`text-sm leading-snug ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                                                                    {notif.title}
                                                                </p>
                                                                {!notif.read && <span className="w-2 h-2 bg-moccaccino-500 rounded-full flex-shrink-0 mt-1.5 ml-3 ring-2 ring-white dark:ring-slate-900"></span>}
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{notif.time}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center text-slate-400 text-sm font-medium">
                                                        No new notifications
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Profile Toggle */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 p-[1px] shadow-sm hover:scale-105 active:scale-95 transition-all"
                                >
                                    <div className="w-full h-full rounded-[11px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                                            {user?.username?.substring(0, 1).toUpperCase() || 'S'}
                                        </span>
                                    </div>
                                </button>

                                {isProfileMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                                        <div className="absolute top-14 right-0 w-60 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col gap-1 animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-200 z-50 ring-1 ring-black/5">
                                            <NavLink
                                                to="/profile"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-colors"
                                            >
                                                <User size={18} />
                                                <span>Profile</span>
                                            </NavLink>

                                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 rounded-2xl transition-colors w-full text-left"
                                            >
                                                <LogOut size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* PAGE CONTENT */}
                    <div key={location.pathname} className={`animate-fade-in-up md:p-6 p-4 flex flex-col ${location.pathname === '/dashboard' ? 'pt-0 md:pt-0' : ''}`}>
                        <Outlet />
                    </div>

                    {/* First-time Profile Setup Modal */}
                    <ProfileSetupModal
                        isOpen={showProfileSetup}
                        user={user}
                        onComplete={(updatedUser) => {
                            // Update local storage and state
                            authService.setUser(updatedUser);
                            setShowProfileSetup(false);
                            // Optionally reload or update local user state if needed
                            window.location.reload();
                        }}
                    />
                </main>
            </div>
        </div>
    );
};

// Helper to determine Titles based on path
const getPageTitle = (path) => {
    if (path === '/dashboard') return "Dashboard";
    if (path.startsWith('/learning')) return "My Learning";
    if (path.startsWith('/academics')) return "Academic Performance";
    if (path.startsWith('/schedule')) return "Schedule & Exams";
    if (path.startsWith('/profile')) return "Profile & Settings";
    return "Dashboard";
};

const getPageSubtitle = (path) => {
    if (path === '/dashboard') return "Here's what's happening in your campus life today.";
    if (path.startsWith('/learning')) return "Access your enrolled modules and learning resources.";
    if (path.startsWith('/academics')) return "Track your GPA, transcripts, and exam results.";
    if (path.startsWith('/schedule')) return "View your upcoming classes and exam dates.";
    if (path.startsWith('/profile')) return "Manage your account settings and preferences.";
    return "Welcome back.";
};

// Simple Nav Item Helper Component
const NavItem = ({ to, icon, label, active = false, mobile = false, isV2 = false }) => (
    <NavLink
        to={to}
        title={label}
        className={`flex items-center justify-center transition-all duration-300 relative group
      ${mobile ? 'w-12 h-12 rounded-2xl' : isV2 ? 'w-10 h-10 rounded-xl' : 'w-12 h-12 rounded-2xl'} 
      ${active
                ? isV2
                    ? 'bg-gradient-to-tr from-purple-500 to-blue-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-105'
                    : 'bg-moccaccino-600 text-white shadow-[0_0_20px_rgba(235,68,11,0.5)] scale-110'
                : isV2
                    ? 'text-white/40 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
    >
        {icon}
        {/* Tooltip on hover (desktop only) */}
        {!mobile && (
            <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {label}
            </span>
        )}
    </NavLink>
);

export default StudentLayout;
