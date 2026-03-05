import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Cake,
    UserPlus,
    RefreshCw,
    AlertTriangle,
    Settings,
    LogOut,
    BookOpen,
    TrendingUp,
    Bell,
    Sun,
    Moon,
    Shield,
    Database,
    X,
    Menu
} from 'lucide-react'
import { authService } from '../services/authService'
import { hasPermission, isSuperAdmin, PERMISSIONS } from '../utils/permissions'

/* ────────────────────────────────────────────────────────────────
   NAV ITEMS CONFIG
──────────────────────────────────────────────────────────────── */
function buildLinks(user) {
    const superAdmin = isSuperAdmin(user)
    const links = []

    links.push({ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard })

    if (superAdmin || hasPermission(user, PERMISSIONS.VIEW_ANALYTICS)) {
        links.push({ label: 'Analytics', path: '/analytics', icon: TrendingUp })
    }
    if (superAdmin || hasPermission(user, PERMISSIONS.VIEW_STUDENTS)) {
        links.push({ label: 'Students', path: '/students', icon: Users })
    }
    if (superAdmin || hasPermission(user, PERMISSIONS.VIEW_BIRTHDAYS)) {
        links.push({ label: 'Birthdays', path: '/birthdays', icon: Cake })
    }
    if (superAdmin || hasPermission(user, PERMISSIONS.BULK_IMPORT)) {
        links.push({ label: 'Register', path: '/register-students', icon: UserPlus })
    }
    if (superAdmin || hasPermission(user, PERMISSIONS.BULK_UPDATE)) {
        links.push({ label: 'Update Data', path: '/update-students', icon: RefreshCw })
    }
    if (superAdmin) {
        links.push({ label: 'Missing', path: '/missing-students', icon: AlertTriangle })
    }
    if (!superAdmin && user?.roles?.includes('admin')) {
        links.push({ label: 'Resources', path: '/admin/resources', icon: BookOpen })
    }
    if (superAdmin || hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS)) {
        links.push({ label: 'Admin', path: '/admin', icon: Settings })
    }

    return links
}

/* ────────────────────────────────────────────────────────────────
   MAIN LAYOUT
──────────────────────────────────────────────────────────────── */
export default function AdminLayout({ user, onLogout }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

    const links = buildLinks(user)

    // Init theme
    useEffect(() => {
        const dark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
        if (dark) { document.documentElement.classList.add('dark'); setIsDarkMode(true) }
        else { document.documentElement.classList.remove('dark'); setIsDarkMode(false) }
    }, [])

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            setIsDarkMode(false)
        } else {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setIsDarkMode(true)
        }
    }

    const handleLogout = () => {
        if (onLogout) onLogout()
        else { authService.logout(); navigate('/login') }
    }

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard'
        return location.pathname.startsWith(path)
    }

    const firstName = user?.studentRef?.firstName || user?.username || 'Admin'
    const initials = firstName.charAt(0).toUpperCase()

    return (
        <div className="flex h-screen font-sans overflow-hidden relative bg-slate-50 dark:bg-[#0a0c14] text-slate-900 dark:text-white transition-colors duration-300">

            {/* ── BACKGROUND ───────────────────────────────── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            {/* ── MOBILE OVERLAY ───────────────────────────── */}
            {isMobileNavOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                    onClick={() => setIsMobileNavOpen(false)}
                />
            )}

            {/* ── SIDEBAR ──────────────────────────────────── */}
            <aside className={`
                fixed md:flex flex-col items-center 
                top-4 bottom-4 z-[100]
                transition-all duration-300 ease-out
                ${isMobileNavOpen ? 'left-4 flex' : '-left-32 hidden'}
                md:left-4 md:flex
                w-[4.5rem] bg-white/60 dark:bg-[#111827]/80 
                backdrop-blur-2xl border border-white/30 dark:border-white/10 
                shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] rounded-[2rem] py-6
            `}>

                {/* Brand icon */}
                <div className="mb-8 flex justify-center w-full">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 flex flex-col items-center gap-3 w-full px-3 overflow-y-auto no-scrollbar">
                    {links.map((link) => {
                        const active = isActive(link.path)
                        const Icon = link.icon
                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                title={link.label}
                                onClick={() => setIsMobileNavOpen(false)}
                                className={`
                                    relative w-full h-11 flex items-center justify-center rounded-2xl transition-all duration-300 group
                                    ${active
                                        ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30 scale-105'
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {/* Tooltip */}
                                <span className="absolute left-[calc(100%+12px)] bg-slate-900 dark:bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-semibold shadow-xl">
                                    {link.label}
                                </span>
                            </NavLink>
                        )
                    })}
                </nav>

                {/* Bottom: logout */}
                <div className="mt-4 flex flex-col items-center gap-3 px-3 pt-4 border-t border-slate-200 dark:border-white/10 w-full">
                    <button
                        onClick={handleLogout}
                        title="Log out"
                        className="relative w-full h-11 flex items-center justify-center rounded-2xl text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="absolute left-[calc(100%+12px)] bg-slate-900 dark:bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-semibold shadow-xl">
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* ── MAIN AREA ─────────────────────────────────── */}
            <main className="flex-1 ml-0 md:ml-[5.5rem] relative overflow-y-auto h-screen scroll-smooth no-scrollbar">

                {/* ─ TOP BAR ─ */}
                <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-white/60 dark:bg-[#0a0c14]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10">

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                    >
                        {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    {/* Page Title */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                            {getPageTitle(location.pathname)}
                        </h1>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:block">
                            {getPageSubtitle(location.pathname)}
                        </p>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {/* Notifications bell */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileMenuOpen(false) }}
                                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all relative"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border-2 border-white dark:border-[#0a0c14]" />
                            </button>

                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                    <div className="absolute top-14 right-0 w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10">
                                            <h3 className="font-black text-slate-900 dark:text-white text-sm">Notifications</h3>
                                        </div>
                                        <div className="p-4 text-center text-slate-400 text-sm font-medium">
                                            No new notifications
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User Avatar */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsProfileMenuOpen(!isProfileMenuOpen); setIsNotificationsOpen(false) }}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                {initials}
                            </button>

                            {isProfileMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                                    <div className="absolute top-14 right-0 w-52 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-3 py-2.5 mb-1">
                                            <p className="font-black text-slate-900 dark:text-white text-sm">{firstName}</p>
                                            <p className="text-xs font-medium text-slate-400 capitalize">{user?.roles?.join(', ')}</p>
                                        </div>
                                        <div className="h-px bg-slate-100 dark:bg-white/10 mx-1 my-1" />
                                        <button
                                            onClick={() => { handleLogout(); setIsProfileMenuOpen(false) }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ─ PAGE CONTENT ─ */}
                <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

/* ── Helpers ─────────────────────────────────────────────────── */
function getPageTitle(path) {
    if (path === '/dashboard') return 'Dashboard'
    if (path.startsWith('/analytics')) return 'Analytics'
    if (path.startsWith('/students/new')) return 'Add Student'
    if (path.startsWith('/students')) return 'Students'
    if (path.startsWith('/birthdays')) return 'Birthdays'
    if (path.startsWith('/register-students')) return 'Bulk Register'
    if (path.startsWith('/update-students')) return 'Update Data'
    if (path.startsWith('/missing-students')) return 'Missing Students'
    if (path.startsWith('/admin/bulk-combination')) return 'Bulk Combination'
    if (path.startsWith('/admin/users')) return 'User Management'
    if (path.startsWith('/admin/resources')) return 'Resource Manager'
    if (path.startsWith('/admin')) return 'Admin Settings'
    if (path.startsWith('/profile-requests')) return 'Profile Requests'
    return 'Admin Portal'
}

function getPageSubtitle(path) {
    if (path === '/dashboard') return 'System overview and quick actions'
    if (path.startsWith('/analytics')) return 'Academic analytics and reports'
    if (path.startsWith('/students')) return 'Manage student records'
    if (path.startsWith('/birthdays')) return 'Upcoming student birthdays'
    if (path.startsWith('/register-students')) return 'Bulk import via Excel / CSV'
    if (path.startsWith('/update-students')) return 'Bulk update student data'
    if (path.startsWith('/admin')) return 'System configuration and settings'
    return ''
}
