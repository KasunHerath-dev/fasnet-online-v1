import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfileOverview from './ProfileOverview';
import PasswordChangeForm from './PasswordChangeForm';
import ThemeToggle from './ThemeToggle';
import LmsSettings from './LmsSettings';
import { authService, academicService } from '../../../services/authService';
import { notificationService } from '../../../services/notificationService';
import UnifiedPageLoader from '../../../components/loaders/UnifiedPageLoader';

const SettingsProfile = () => {
    const [user, setUser] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showLms, setShowLms] = useState(false);  // gated visibility

    const [searchParams] = useSearchParams();
    const lmsRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = authService.getUser();
                setUser(currentUser);

                if (currentUser?.studentRef) {
                    const studentId = currentUser.studentRef._id || currentUser.studentRef;
                    const response = await academicService.getStudentProfile(studentId);
                    if (response.data?.studentDetails) {
                        setStudentDetails(response.data.studentDetails);
                    }
                }

                // Show LMS card if student has an lms_invite notification OR
                // has already linked their account (lmsCredentials exist on studentRef)
                const hasLinked = !!currentUser?.studentRef?.lmsCredentials?.username;
                if (hasLinked) {
                    setShowLms(true);
                } else {
                    // Check notifications for an lms_invite
                    try {
                        const notifRes = await notificationService.getAll();
                        const notifications = notifRes.data?.data || [];
                        const wasInvited = notifications.some(n => n.type === 'lms_invite');
                        if (wasInvited) setShowLms(true);
                    } catch {
                        // If notification fetch fails, don't show LMS section
                    }
                }
            } catch (err) {
                console.error('Failed to load user profile', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, []);

    // Scroll to LMS section when ?section=lms is in the URL
    useEffect(() => {
        if (searchParams.get('section') === 'lms' && !isLoading) {
            // Short delay to let the DOM paint the LMS card
            setTimeout(() => {
                lmsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Highlight pulse for 2 s so the student sees exactly what to look at
                lmsRef.current?.classList?.add('ring-2', 'ring-indigo-500', 'ring-offset-2', 'ring-offset-transparent');
                setTimeout(() => {
                    lmsRef.current?.classList?.remove('ring-2', 'ring-indigo-500', 'ring-offset-2', 'ring-offset-transparent');
                }, 2500);
            }, 350);
        }
    }, [searchParams, isLoading, showLms]);

    if (isLoading) return <UnifiedPageLoader />;

    return (
        <div className="flex flex-col gap-5 w-full font-['Kodchasan'] tracking-wide pt-2 pb-10">

            {/* Profile Overview — first full-width card */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <ProfileOverview user={user} studentDetails={studentDetails} />
            </div>

            {/* Bottom row — Security + Appearance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                <PasswordChangeForm />
                <ThemeToggle />
            </div>

            {/* LMS Account — only shown to invited / already-linked students */}
            {showLms && (
                <div
                    ref={lmsRef}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both rounded-3xl transition-all duration-300"
                >
                    <LmsSettings />
                </div>
            )}

        </div>
    );
};

export default SettingsProfile;
