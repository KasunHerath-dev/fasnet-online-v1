import React, { useState, useEffect } from 'react';
import ProfileOverview from './ProfileOverview';
import PasswordChangeForm from './PasswordChangeForm';
import ThemeToggle from './ThemeToggle';
import { authService, academicService } from '../../../services/authService';
import UnifiedPageLoader from '../../../components/loaders/UnifiedPageLoader';

const SettingsProfile = () => {
    const [user, setUser] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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
            } catch (err) {
                console.error('Failed to load user profile', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, []);

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

        </div>
    );
};

export default SettingsProfile;
