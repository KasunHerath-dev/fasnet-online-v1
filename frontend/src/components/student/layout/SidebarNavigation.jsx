import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, GraduationCap, BookOpen, UserRound, LogOut,
    Users, Cake, UserPlus, RefreshCw, Settings, Shield, BookMarked
} from 'lucide-react';
import { authService } from '../../../services/authService';
import { hasPermission, PERMISSIONS } from '../../../utils/permissions';

const NavItem = ({ to, icon: Icon, label, isActive, isMobile, onHover, accent = false }) => {
    return (
        <NavLink
            to={to}
            onMouseEnter={() => onHover && onHover(to)}
            className={`group relative flex items-center justify-center transition-all duration-300
                ${isMobile ? 'w-10 h-10 rounded-2xl' : 'w-10 h-10 rounded-[12px] mx-auto mb-1'}
                ${isActive
                    ? accent
                        ? 'bg-[#ff5734] text-white shadow-lg shadow-[#ff5734]/30'
                        : 'bg-[#fccc42] text-[#151313]'
                    : accent
                        ? 'text-[#ff5734]/60 hover:text-[#ff5734] hover:bg-[#ff5734]/10'
                        : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
        >
            <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />

            {/* Desktop Tooltip */}
            {!isMobile && (
                <span className="absolute left-14 bg-[#151313] border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap shadow-xl z-[100]">
                    {label}
                    <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#151313]"></span>
                </span>
            )}
        </NavLink>
    );
};

const SidebarNavigation = ({ user }) => {
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
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-16 shrink-0 bg-[#151313] z-[100] py-6 transition-colors duration-300">
                {/* Logo Area */}
                <div className="flex justify-center mb-8 cursor-pointer" onClick={() => navigate(`${basePath}/dashboard`)}>
                    <div className="w-10 h-10 bg-[#fccc42] rounded-[14px] flex items-center justify-center shadow-lg overflow-hidden hover:scale-105 transition-transform">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-black text-xl text-[#151313]">F</span>
                        )}
                    </div>
                </div>

                {/* Student Nav Links */}
                <nav className="flex-1 flex flex-col items-center w-full px-2 space-y-1 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            isActive={isLinkActive(item.to)}
                            isMobile={false}
                            onHover={handlePrefetch}
                        />
                    ))}

                    <div className="w-6 h-px bg-white/10 my-3 mx-auto rounded-full"></div>

                    <NavItem
                        to={`${basePath}/profile`}
                        icon={UserRound}
                        label="Settings"
                        isActive={isLinkActive(`${basePath}/profile`)}
                        isMobile={false}
                        onHover={handlePrefetch}
                    />

                    {/* Admin Section — only for promoted admins */}
                    {isPromotedAdmin && adminItems.length > 0 && (
                        <>
                            {/* Admin divider with shield icon */}
                            <div className="w-full flex flex-col items-center gap-1 my-2">
                                <div className="w-6 h-px bg-[#ff5734]/30 rounded-full"></div>
                                <div className="relative group cursor-default">
                                    <div className="w-7 h-7 rounded-lg bg-[#ff5734]/10 border border-[#ff5734]/20 flex items-center justify-center">
                                        <Shield size={13} className="text-[#ff5734]" />
                                    </div>
                                    <span className="absolute left-10 top-1/2 -translate-y-1/2 bg-[#ff5734] text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all duration-200 shadow-lg z-[100]">
                                        Admin Tools
                                    </span>
                                </div>
                            </div>

                            {adminItems.map((item) => (
                                <NavItem
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    isActive={isLinkActive(item.to)}
                                    isMobile={false}
                                    accent={true}
                                />
                            ))}
                        </>
                    )}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto flex flex-col items-center w-full px-2">
                    <button
                        onClick={handleLogout}
                        className="group relative flex items-center justify-center w-10 h-10 rounded-[14px] text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                        <LogOut size={20} />
                        <span className="absolute left-14 bg-[#151313] border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap shadow-xl z-[100]">
                            Logout
                            <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#151313]"></span>
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
