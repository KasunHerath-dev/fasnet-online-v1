import React, { useState, useEffect, useRef } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Bell, Search, BookOpen, GraduationCap, Calendar, Megaphone, X, CheckCheck, ShieldCheck, Lock } from 'lucide-react';
import { authService } from '../../../services/authService';
import { notificationService } from '../../../services/notificationService';

// ── Notification type → icon/colour mapping ──────────────────
const TYPE_MAP = {
    resource_added: { icon: BookOpen, iconBg: 'bg-[#bae6fd]', iconColor: 'text-blue-600' },
    grade_published: { icon: GraduationCap, iconBg: 'bg-[#be94f5]/30', iconColor: 'text-purple-600' },
    account_verified: { icon: ShieldCheck, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    password_changed: { icon: Lock, iconBg: 'bg-[#fccc42]/40', iconColor: 'text-amber-600' },
    announcement: { icon: Megaphone, iconBg: 'bg-[#ff5734]/10', iconColor: 'text-[#ff5734]' },
};

const DEFAULT_TYPE = { icon: Bell, iconBg: 'bg-slate-100', iconColor: 'text-slate-500' };

// ── Relative time helper ──────────────────────────────────────
const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
};

const TopNavbar = ({ user }) => {
    const location = useLocation();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const notifRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getPageContext = (path) => {
        if (path.includes('/dashboard')) return { title: 'Dashboard', subtitle: "Here's what's happening today." };
        if (path.includes('/academics')) return { title: 'Academic Growth', subtitle: 'Track your performance and grades.' };
        if (path.includes('/learning')) return { title: 'Resource Center', subtitle: 'Access your study materials.' };
        if (path.includes('/profile')) return { title: 'Settings & Profile', subtitle: 'Manage your account preferences.' };
        return { title: 'Student Portal', subtitle: 'Welcome back.' };
    };

    const context = getPageContext(location.pathname);

    // Fetch real notifications on mount
    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await notificationService.getAll();
                setNotifications(res.data?.data || []);
            } catch (_) {
                // On failure keep empty array — no mock fallback
            } finally {
                setLoading(false);
            }
        };
        fetchNotifs();
    }, []);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotificationsOpen(false);
            }
        };
        if (isNotificationsOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isNotificationsOpen]);

    // User display name logic
    const fName = user?.studentRef?.firstName || user?.firstName || '';
    const lName = user?.studentRef?.lastName || user?.lastName || '';
    const fullNameFallback = user?.studentRef?.fullName || user?.studentRef?.name;
    const displayName = `${fName} ${lName}`.trim() || fullNameFallback || 'Student';
    const displayHandle = user?.studentRef?.registrationNumber ? `@${user.studentRef.registrationNumber}` : '@student';
    const initials = displayName.charAt(0).toUpperCase() || 'S';

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    const markAllRead = async (e) => {
        e.stopPropagation();
        try {
            await notificationService.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (_) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
    };

    const markRead = async (id) => {
        try {
            await notificationService.markRead(id);
        } catch (_) { /* silent */ }
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    };

    return (
        <header className="
            sticky top-0 z-40 font-['Kodchasan']
            flex flex-row items-center justify-between w-full
            px-4 lg:px-6 py-3 lg:py-4
            bg-white/70 dark:bg-[#1c1c1c]/70 backdrop-blur-xl
            border-b border-white/60 dark:border-white/5
            shadow-sm shadow-black/[0.03]
            mb-4
        ">

            {/* Title */}
            <div className="flex-1 min-w-0 mr-3">
                {location.pathname.includes('/dashboard') ? (
                    <h1 className="text-base md:text-xl font-medium text-slate-500 truncate">
                        Welcome to <span className="text-[#ff5734] font-bold">fasnet.online</span>
                    </h1>
                ) : (
                    <h1 className="text-base md:text-xl font-bold text-slate-500 truncate">
                        {context.title}
                    </h1>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">

                {/* Search — hidden on mobile */}
                <div className="relative w-40 md:w-56 lg:w-64 hidden sm:block">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-white border border-slate-200 rounded-full py-2 pl-4 pr-11 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff5734]/20 focus:border-[#ff5734] transition-all shadow-sm"
                    />
                    <button className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#ff5734] hover:bg-[#e84d2e] rounded-full flex items-center justify-center text-white transition-colors">
                        <Search size={13} strokeWidth={3} />
                    </button>
                </div>

                {/* ── Notifications ────────────────────────────── */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => { setIsNotificationsOpen(o => !o); setIsProfileMenuOpen(false); }}
                        className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full border flex items-center justify-center transition-all shadow-sm
                            ${isNotificationsOpen
                                ? 'bg-[#ff5734] border-[#ff5734] text-white'
                                : 'border-slate-200 text-[#151313] hover:bg-slate-50'}`}
                        aria-label="Notifications"
                    >
                        <Bell className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#ff5734] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white px-0.5 shadow">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                        {/* ping ring when unread */}
                        {unreadCount > 0 && !isNotificationsOpen && (
                            <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-[#ff5734] animate-ping opacity-50 pointer-events-none" />
                        )}
                    </button>

                    {/* Notifications Panel */}
                    {isNotificationsOpen && (
                        <div className="
                            z-[60] bg-white rounded-2xl shadow-2xl shadow-black/10 border border-slate-100
                            animate-in fade-in slide-in-from-top-2 duration-200
                            fixed top-[68px] left-3 right-3
                            sm:absolute sm:fixed-none sm:top-14 sm:right-0 sm:left-auto sm:w-[360px]
                        ">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-[#151313] text-sm">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] font-black bg-[#ff5734] text-white px-2 py-0.5 rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-[#ff5734] px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <CheckCheck className="w-3 h-3" />
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsNotificationsOpen(false)}
                                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#151313] hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Notification List */}
                            <div className="overflow-y-auto max-h-[min(360px,60vh)] divide-y divide-slate-50">
                                {loading ? (
                                    <div className="py-8 text-center">
                                        <div className="w-5 h-5 rounded-full border-2 border-[#ff5734] border-t-transparent animate-spin mx-auto" />
                                        <p className="text-xs text-slate-400 mt-2 font-semibold">Loading…</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-slate-400">All caught up!</p>
                                        <p className="text-xs text-slate-300 mt-0.5">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => {
                                        const { icon: Icon, iconBg, iconColor } = TYPE_MAP[notif.type] || DEFAULT_TYPE;
                                        const isUnread = !notif.isRead;
                                        return (
                                            <div
                                                key={notif._id}
                                                onClick={() => markRead(notif._id)}
                                                className={`flex gap-3 px-4 py-3.5 cursor-pointer transition-all hover:bg-slate-50 relative
                                                    ${isUnread ? 'bg-[#ff5734]/[0.02]' : ''}`}
                                            >
                                                {/* Unread dot */}
                                                {isUnread && (
                                                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#ff5734] shrink-0" />
                                                )}
                                                {/* Icon */}
                                                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                                                    <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2.5} />
                                                </div>
                                                {/* Text */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${isUnread ? 'font-bold text-[#151313]' : 'font-semibold text-slate-600'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                                                        {notif.body}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                                        {timeAgo(notif.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 border-t border-slate-100 text-center">
                                <button className="text-xs font-bold text-[#ff5734] hover:text-[#e84d2e] transition-colors">
                                    View all notifications →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Profile ───────────────────────────────────── */}
                <div className="relative">
                    <div
                        className="flex items-center gap-2 cursor-pointer group pl-1"
                        onClick={() => { setIsProfileMenuOpen(o => !o); setIsNotificationsOpen(false); }}
                    >
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#fccc42] shadow-sm shrink-0">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#fccc42] flex items-center justify-center text-[#151313] font-black text-sm">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-sm font-bold text-[#151313] leading-tight">{displayName}</p>
                            <p className="text-[11px] font-medium text-slate-500 leading-tight">{displayHandle}</p>
                        </div>
                    </div>

                    {/* Profile Menu Dropdown */}
                    {isProfileMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)} />
                            <div className="absolute top-14 right-0 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                {/* User Header */}
                                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                    <p className="font-black text-[#151313] text-sm">{displayName}</p>
                                    <p className="text-xs text-slate-400 font-medium">{displayHandle}</p>
                                </div>
                                <NavLink
                                    to={`${user?.studentRef?.registrationNumber ? '/' + user.studentRef.registrationNumber : ''}/profile`}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    My Profile
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-[#ff5734] hover:bg-[#ff5734]/5 font-semibold transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
