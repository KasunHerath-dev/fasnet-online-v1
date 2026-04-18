import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, GraduationCap, BookOpen, UserRound, LogOut,
    Users, Cake, UserPlus, RefreshCw, Settings, Shield, BookMarked, Megaphone
} from 'lucide-react';
import { authService } from '../../../services/authService';
import { hasPermission, PERMISSIONS } from '../../../utils/permissions';

const NavItem = ({ to, icon: Icon, label, isActive, isMobile, onHover, isExpanded, accent = false }) => {
    const activeBg   = accent ? '#ff5734' : '#fccc42';
    const activeText = accent ? '#ffffff' : '#151313';

    return (
        <NavLink
            to={to}
            onMouseEnter={() => onHover && onHover(to)}
            className={`group/item relative flex items-center w-full px-3 py-1.5 mb-0.5
                transition-all duration-300 rounded-xl select-none`}
        >
            {/* ── Icon Container (the "badge") ── */}
            <div
                className={`flex-shrink-0 flex items-center justify-center rounded-[14px]
                    transition-all duration-300
                    ${isMobile ? 'w-10 h-10' : 'w-11 h-11'}
                    ${isActive
                        ? 'scale-105 shadow-lg'
                        : 'hover:bg-white/10 group-hover/item:scale-105'
                    }`}
                style={isActive ? { backgroundColor: activeBg } : {}}
            >
                <Icon
                    size={20}
                    style={{ color: isActive ? activeText : 'rgba(255,255,255,0.45)' }}
                    className="transition-all duration-300 group-hover/item:text-white"
                    strokeWidth={isActive ? 2.5 : 1.8}
                />
            </div>

            {/* ── Label (only when sidebar expanded) ── */}
            {!isMobile && (
                <span
                    className={`ml-3 text-[13px] font-bold tracking-tight whitespace-nowrap
                        transition-all duration-300
                        ${isActive ? 'text-white' : 'text-white/40 group-hover/item:text-white'}
                        ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'}`}
                >
                    {label}
                </span>
            )}
        </NavLink>
    );
};


const SidebarNavigation = ({ user, isExpanded }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [logoUrl, setLogoUrl] = useState(null);

    const userId = user?.studentRef?.registrationNumber || user?.username || '';
    const basePath = userId ? `/${userId}` : '';

    // Promoted admin = has 'admin' role but is also a student (has studentRef)
    const isPromotedAdmin = user?.roles?.includes('admin') && !user?.roles?.includes('superadmin');
    const permissions = user?.permissions || [];

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/settings/logo`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.logoUrl) {
                        setLogoUrl(`${import.meta.env.VITE_API_URL.replace('/api/v1', '')}${data.logoUrl}`);
                    }
                }
            } catch (error) {
                // Silently ignore
            }
        };
        fetchLogo();
    }, []);

    const isLinkActive = (path) => {
        const segment = path.split('/').pop();
        if (segment && location.pathname.includes(`/${segment}`)) return true;
        return false;
    };

    const handlePrefetch = (path) => {
        if (path.includes('dashboard')) import('../../../pages/student/Dashboard');
        if (path.includes('academics')) import('../../../pages/student/AcademicGrowth');
        if (path.includes('learning')) import('../../../pages/student/StudentLearning');
        if (path.includes('profile')) import('../../../pages/student/SettingsProfile');
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
        { to: `${basePath}/dashboard`, icon: Home, label: 'Dashboard' },
        { to: `${basePath}/notices`, icon: Megaphone, label: 'Notices' },
        { to: `${basePath}/academics`, icon: GraduationCap, label: 'Academic Growth' },
        { to: `${basePath}/learning`, icon: BookOpen, label: 'Resource Center' },
    ];

    // Build admin quick-access items based on permissions
    const adminItems = [];
    if (isPromotedAdmin) {
        if (permissions.includes('view_students') || hasPermission(user, PERMISSIONS.VIEW_STUDENTS)) {
            adminItems.push({ to: '/students', icon: Users, label: 'Students' });
        }
        if (permissions.includes('view_birthdays') || hasPermission(user, PERMISSIONS.VIEW_BIRTHDAYS)) {
            adminItems.push({ to: '/birthdays', icon: Cake, label: 'Birthdays' });
        }
        if (permissions.includes('bulk_import') || hasPermission(user, PERMISSIONS.BULK_IMPORT)) {
            adminItems.push({ to: '/register-students', icon: UserPlus, label: 'Register Students' });
        }
        if (permissions.includes('bulk_update') || hasPermission(user, PERMISSIONS.BULK_UPDATE)) {
            adminItems.push({ to: '/update-students', icon: RefreshCw, label: 'Update Data' });
        }
        if (permissions.includes('manage_resources')) {
            adminItems.push({ to: '/admin/resources', icon: BookMarked, label: 'Resource Manager' });
        }
        if (permissions.includes('system_settings') || hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS)) {
            adminItems.push({ to: '/admin', icon: Settings, label: 'Admin Settings' });
        }
    }

    return (
        <>
            {/* Desktop Sidebar - State-Driven Variable Width */}
            <aside 
                className="hidden md:flex flex-col h-screen bg-[#151313] border-r border-white/5 transition-all duration-300 ease-out z-[100] py-6 shadow-2xl overflow-hidden"
                style={{ width: 'var(--sidebar-width)' }}
            >
                
                {/* Logo Area — aligned to match nav item badges */}
                <div className="flex items-center px-3 mb-8 cursor-pointer group/logo" onClick={() => navigate(`${basePath}/dashboard`)}>
                    {/* Icon — same size as nav badges (w-11 h-11) */}
                    <div className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center group-hover/logo:scale-105 transition-transform duration-300">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#fccc42] to-[#ffda6b] rounded-[14px] shadow-lg shadow-yellow-500/25" />
                        <div className="relative flex items-center justify-center w-full h-full">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-[14px]" />
                            ) : (
                                <span className="font-black text-[22px] text-[#151313] leading-none">F</span>
                            )}
                        </div>
                    </div>
                    {/* Text — same ml-3 offset as nav labels */}
                    <div className={`ml-3 transition-all duration-300
                        ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'}`}>
                        <span className="block font-black text-[17px] text-white tracking-tighter leading-none">fasnet</span>
                        <span className="block font-bold text-[8px] uppercase tracking-[0.25em] text-[#fccc42]/70 mt-[3px]">Management Hub</span>
                    </div>
                </div>

                {/* Student Nav Links */}
                <nav className="flex-1 flex flex-col w-full px-3 space-y-1 overflow-y-auto no-scrollbar overflow-x-hidden">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            isActive={isLinkActive(item.to)}
                            isMobile={false}
                            onHover={handlePrefetch}
                            isExpanded={isExpanded}
                        />
                    ))}

                    <div className="w-8 h-px bg-white/10 my-4 mx-auto rounded-full flex-shrink-0"></div>

                    <NavItem
                        to={`${basePath}/profile`}
                        icon={UserRound}
                        label="Settings"
                        isActive={isLinkActive(`${basePath}/profile`)}
                        isMobile={false}
                        onHover={handlePrefetch}
                        isExpanded={isExpanded}
                    />

                    {/* Admin Section — only for promoted admins */}
                    {isPromotedAdmin && adminItems.length > 0 && (
                        <div className="pt-2 animate-in fade-in duration-500">
                            {/* Perfect Alignment Divider */}
                            <div className="flex items-center px-4.5 py-4 gap-4">
                                <div className={`h-px bg-white/10 transition-all ${isExpanded ? 'w-6' : 'w-11'}`}></div>
                                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#ff5734]/10 border border-[#ff5734]/20 flex items-center justify-center">
                                    <Shield size={13} className="text-[#ff5734]" />
                                </div>
                                <span className={`text-[10px] font-black text-[#ff5734] uppercase tracking-widest transition-all whitespace-nowrap
                                    ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                    Admin Tools
                                </span>
                                <div className={`flex-1 h-px bg-[#ff5734]/10 transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}></div>
                            </div>

                            <div className="space-y-1">
                                {adminItems.map((item) => (
                                    <NavItem
                                        key={item.to}
                                        to={item.to}
                                        icon={item.icon}
                                        label={item.label}
                                        isActive={isLinkActive(item.to)}
                                        isMobile={false}
                                        accent={true}
                                        isExpanded={isExpanded}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto px-1.5">
                    <button
                        onClick={handleLogout}
                        className="group/logout flex items-center w-full h-12 px-4 rounded-2xl text-white/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300"
                    >
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <LogOut size={20} />
                        </div>
                        <span className={`ml-4 text-sm font-bold transition-all duration-300 whitespace-nowrap
                            ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-4 left-4 right-4 z-[100] bg-[#151313] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-3xl px-6 py-3 flex justify-between items-center transition-colors duration-300">
                {navItems.map((item) => (
                    <NavItem
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        isActive={isLinkActive(item.to)}
                        isMobile={true}
                        onHover={handlePrefetch}
                    />
                ))}

                {/* Admin shortcut for mobile */}
                {isPromotedAdmin && adminItems.length > 0 && (
                    <NavLink
                        to={adminItems[0].to}
                        className={({ isActive }) =>
                            `relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300
                            ${isActive ? 'bg-[#ff5734] text-white' : 'text-[#ff5734]/60 hover:text-[#ff5734] hover:bg-[#ff5734]/10'}`
                        }
                    >
                        <Shield size={20} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff5734] rounded-full border-2 border-[#151313] animate-pulse" />
                    </NavLink>
                )}
            </nav>
        </>
    );
};

export default SidebarNavigation;
