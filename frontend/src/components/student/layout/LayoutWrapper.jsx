import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarNavigation from './SidebarNavigation';
import TopNavbar from './TopNavbar';
import { authService } from '../../../services/authService';
import ProfileSetupModal from '../../ProfileSetupModal';
import LMSConnectionModal from '../../LMSConnectionModal';
import api from '../../../services/api';
const LayoutWrapper = () => {
    const location = useLocation();
    const [user, setUser] = useState(authService.getUser());
    const [showProfileSetup, setShowProfileSetup] = useState(false);
    const [isLMSModalOpen, setIsLMSModalOpen] = useState(false);
    const [activeLMSRequest, setActiveLMSRequest] = useState(null);

    useEffect(() => {
        // Subscribe to auth changes to keep state in sync
        const unsubscribe = authService.subscribe((updatedUser) => {
            setUser(updatedUser);
        });

        // Check if profile setup is needed immediately on mount
        const currentUser = authService.getUser();
        if (currentUser && currentUser.needsProfileSetup) {
            setShowProfileSetup(true);
        }

        // Listen for global LMS modal trigger
        const handleOpenLMS = async (e) => {
            const { requestId } = e.detail || {};
            try {
                // If ID is provided, fetch specific, else fetch general
                const res = await api.get('/lms/student/request');
                if (res.data) {
                    setActiveLMSRequest(res.data);
                    setIsLMSModalOpen(true);
                }
            } catch (err) {
                console.error('Failed to open LMS modal', err);
            }
        };

        window.addEventListener('open-lms-modal', handleOpenLMS);
        return () => {
            unsubscribe();
            window.removeEventListener('open-lms-modal', handleOpenLMS);
        }
    }, [user]);

    useEffect(() => {
        // Check if profile setup is needed whenever user state changes
        if (user && user.needsProfileSetup) {
            setShowProfileSetup(true);
        } else {
            setShowProfileSetup(false);
        }
    }, [user]);

    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const sidebarWidth = isSidebarHovered ? '256px' : '80px';

    return (
        /* The container now uses a CSS variable for width to force the grid to expand/contract in sync */
        <div 
            className="grid grid-cols-1 md:grid-cols-[var(--sidebar-width)_1fr] h-screen bg-[#151313] overflow-hidden font-['Kodchasan'] tracking-wide transition-all duration-300"
            style={{ '--sidebar-width': sidebarWidth }}
        >

            {/* 1. Sidebar Wrapper — captures hover for the whole layout context */}
            <div 
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
                className="h-full"
            >
                <SidebarNavigation user={user} isExpanded={isSidebarHovered} />
            </div>

            {/* 2. White rounded panel — contains navbar + scrollable content */}
            <main className="flex-1 min-w-0 flex flex-col m-2 bg-white dark:bg-[#1c1c1c] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40 text-[#151313] dark:text-white transition-all duration-300">

                {/* Scrollable Content — navbar lives inside so glass effect has content behind it */}
                <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth flex flex-col relative">
                    {/* Sticky glass navbar — content scrolls behind this */}
                    <TopNavbar user={user} />
                    <div className="animate-[fade-in-up_0.6s_ease-out] flex-1 flex flex-col px-6 pb-20 md:pb-4">
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
                    {/* Global LMS Connection Modal */}
                    <LMSConnectionModal 
                        isOpen={isLMSModalOpen}
                        onClose={() => setIsLMSModalOpen(false)}
                        request={activeLMSRequest}
                    />
                </div>
            </main>
        </div>
    );
};

export default LayoutWrapper;
