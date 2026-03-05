import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarNavigation from './SidebarNavigation';
import TopNavbar from './TopNavbar';
import { authService } from '../../../services/authService';
import ProfileSetupModal from '../../ProfileSetupModal';
const LayoutWrapper = () => {
    const location = useLocation();
    const [user, setUser] = useState(authService.getUser());
    const [showProfileSetup, setShowProfileSetup] = useState(false);

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

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Check if profile setup is needed whenever user state changes
        if (user && user.needsProfileSetup) {
            setShowProfileSetup(true);
        } else {
            setShowProfileSetup(false);
        }
    }, [user]);

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        /* Dark background fills the whole screen */
        <div className="flex h-screen bg-[#151313] overflow-hidden font-['Kodchasan'] tracking-wide">

            {/* 1. Sidebar — sits directly on the dark bg */}
            <SidebarNavigation user={user} />

            {/* 2. White rounded panel — contains navbar + scrollable content */}
            <main className="flex-1 flex flex-col m-3 bg-white dark:bg-[#1c1c1c] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40 text-[#151313] dark:text-white transition-colors duration-300">

                {/* Scrollable Content — navbar lives inside so glass effect has content behind it */}
                <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth flex flex-col relative">
                    {/* Sticky glass navbar — content scrolls behind this */}
                    <TopNavbar user={user} />
                    <div className="animate-[fade-in-up_0.6s_ease-out] flex-1 flex flex-col px-6 pb-28 md:pb-8">
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
                </div>
            </main>
        </div>
    );
};

export default LayoutWrapper;
