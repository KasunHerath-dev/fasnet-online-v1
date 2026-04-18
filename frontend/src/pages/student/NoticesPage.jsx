import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Megaphone, ArrowLeft, Info } from '@phosphor-icons/react';
import NoticeBoard from '../../components/student/NoticeBoard';

const NoticesPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            
            {/* Main Content Area - Header now handled by TopNavbar */}

            {/* Main Content Area */}
            <div className="bg-white dark:bg-white/[0.03] rounded-[2.5rem] p-6 md:p-8 border border-slate-200 dark:border-white/5 shadow-sm min-h-[600px]">
                <NoticeBoard isDashboard={false} />
            </div>

        </div>
    );
};

export default NoticesPage;
