import React, { useState, useEffect } from 'react';
import WelcomeBanner from './WelcomeBanner';
import NoticeBoard from './NoticeBoard';
import RecentResourcesList from './RecentResourcesList';
import { authService, academicService } from '../../../services/authService';
import { noticeService } from '../../../services/noticeService';
import UnifiedPageLoader from '../../../components/loaders/UnifiedPageLoader';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const currentUser = authService.getUser();
                if (currentUser?.studentRef) {
                    const studentId = currentUser.studentRef._id || currentUser.studentRef;

                    // Fetch Dashboard and Notices in parallel
                    const [dashRes, noticesRes] = await Promise.all([
                        academicService.getStudentDashboard(studentId),
                        noticeService.getAll().catch(() => ({ data: { data: [] } }))
                    ]);

                    setDashboardData(dashRes.data);

                    // Set notices from the global notice API
                    setNotices(noticesRes?.data?.data || []);
                }
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <UnifiedPageLoader />;

    const { student, academic } = dashboardData || {};
    const firstName = student?.firstName || student?.name?.split(' ')[0] || authService.getUser()?.studentRef?.firstName || '';
    const totalCredits = academic?.credits?.total !== undefined ? academic?.credits?.total : 0;

    return (
        <div className="flex flex-col gap-4 xl:gap-8 w-full min-h-full font-['Kodchasan'] tracking-wide bg-transparent pb-4">



            {/* Top area: Welcome Banner */}
            <div className="w-full shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                <WelcomeBanner
                    studentName={firstName}
                    level={academic?.currentLevel || ''}
                    semester={academic?.currentSemester || ''}
                    credits={totalCredits}
                    progress={academic?.progress !== undefined ? academic?.progress : ''}
                    combination={student?.combination}
                    combinationSubjects={student?.combinationSubjects}
                />
            </div>

            {/* Bottom Split Area */}
            <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both flex-1 min-h-[400px]">
                {/* Left: Notice Board */}
                <div className="w-full xl:w-1/2 flex flex-col h-full">
                    <NoticeBoard notices={notices} />
                </div>

                {/* Right: Recent Resources */}
                <div className="w-full xl:w-1/2 flex flex-col h-full">
                    <RecentResourcesList />
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
