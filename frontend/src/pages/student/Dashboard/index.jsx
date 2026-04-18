import React, { useState, useEffect } from 'react';
import WelcomeBanner from './WelcomeBanner';
import NoticeBoard from './NoticeBoard';
import AdminToolkit from './AdminToolkit';

import { authService, academicService } from '../../../services/authService';
import { noticeService } from '../../../services/noticeService';
import UnifiedPageLoader from '../../../components/loaders/UnifiedPageLoader';
import { socketService } from '../../../services/socketService';
import { useToast } from '../../../context/ToastContext';

const Dashboard = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [notices, setNotices] = useState([]);

    const fetchNotices = async () => {
        try {
            const res = await noticeService.getAll().catch(() => ({ data: { data: [] } }));
            setNotices(res?.data?.data || []);
        } catch (err) {
            console.error('Failed to refresh notices', err);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const currentUser = authService.getUser();
                if (currentUser?.studentRef) {
                    const studentId = currentUser.studentRef._id || currentUser.studentRef;

                    // Fetch Dashboard and Notices in parallel
                    const [dashRes] = await Promise.all([
                        academicService.getStudentDashboard(studentId),
                        fetchNotices()
                    ]);

                    setDashboardData(dashRes.data);
                }
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();

        // ── Real-time Socket Listeners ──
        socketService.on('new_notice', fetchNotices);
        socketService.on('notice_deleted', ({ id }) => {
            setNotices(prev => prev.filter(n => n._id !== id));
        });
        socketService.on('all_notices_deleted', () => {
            setNotices([]);
        });


        return () => {
            socketService.off('new_notice');
            socketService.off('notice_deleted');
            socketService.off('all_notices_deleted');

        };
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
 
            {/* Admin Toolkit for Promoted Users (Dual Role) */}
            {authService.getUser()?.roles?.includes('admin') && (
                <div className="w-full shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                    <AdminToolkit user={authService.getUser()} />
                </div>
            )}

            {/* Notice Board (Full Width Now) */}
                <div className="w-full h-full">
                    <NoticeBoard notices={notices} />
                </div>

        </div>
    );
};

export default Dashboard;
