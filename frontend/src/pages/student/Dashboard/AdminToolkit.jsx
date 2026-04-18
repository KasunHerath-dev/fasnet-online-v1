import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, UserPlus, Megaphone, Shield, ArrowRight, Library
} from 'lucide-react';
import { hasPermission, PERMISSIONS } from '../../../utils/permissions';

const ToolButton = ({ onClick, icon: Icon, label, description, color = "orange" }) => {
    const colorClasses = {
        orange: "text-[#ff5734] border-[#ff5734]/20 hover:border-[#ff5734]/40 hover:bg-[#ff5734]/5 dark:text-[#ff5734]",
        yellow: "text-[#fccc42] border-[#fccc42]/20 hover:border-[#fccc42]/40 hover:bg-[#fccc42]/5 dark:text-[#fccc42]",
        purple: "text-[#be94f5] border-[#be94f5]/20 hover:border-[#be94f5]/40 hover:bg-[#be94f5]/5 dark:text-[#be94f5]"
    };

    return (
        <button 
            onClick={onClick}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 text-left group ${colorClasses[color]}`}
        >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-current opacity-20 flex items-center justify-center">
                {/* Placeholder for actual bg since using opacity-20 on text color */}
            </div>
            <div className="shrink-0 w-10 h-10 rounded-xl absolute flex items-center justify-center">
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-sm tracking-tight text-[#151313] dark:text-white">{label}</span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight mt-0.5">{description}</p>
            </div>
        </button>
    );
};

const AdminToolkit = ({ user }) => {
    const navigate = useNavigate();
    
    if (!user) return null;

    const tools = [];
    
    if (hasPermission(user, PERMISSIONS.VIEW_STUDENTS)) {
        tools.push({
            label: 'Search Students',
            description: 'View and manage student records',
            icon: Users,
            onClick: () => navigate('/students'),
            color: 'orange'
        });
    }

    if (hasPermission(user, PERMISSIONS.ADD_STUDENTS) || hasPermission(user, PERMISSIONS.BULK_IMPORT)) {
        tools.push({
            label: 'Register Students',
            description: 'Add new students to the system',
            icon: UserPlus,
            onClick: () => navigate('/register-students'),
            color: 'yellow'
        });
    }

    if (hasPermission(user, PERMISSIONS.MANAGE_NOTICES)) {
        tools.push({
            label: 'Notice Manager',
            description: 'Create and publish system notices',
            icon: Megaphone,
            onClick: () => navigate('/admin/notices'),
            color: 'purple'
        });
    }

    if (user?.permissions?.includes('manage_resources')) {
        tools.push({
            label: 'Resources',
            description: 'Manage academic resources',
            icon: Library,
            onClick: () => navigate('/admin/resources'),
            color: 'orange'
        });
    }

    if (tools.length === 0) return null;

    return (
        <div className="w-full bg-white dark:bg-[#1c1c1c] rounded-[2rem] p-6 border-2 border-slate-100 dark:border-white/5 shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 px-1">
                <div className="w-8 h-8 rounded-lg bg-[#ff5734] flex items-center justify-center shadow-lg shadow-[#ff5734]/20">
                    <Shield size={16} className="text-white" />
                </div>
                <div>
                    <h3 className="font-black text-base tracking-tight text-[#151313] dark:text-white">Admin Toolkit</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Authorized Operations Only</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool, idx) => (
                    <ToolButton key={idx} {...tool} />
                ))}
            </div>
        </div>
    );
};

export default AdminToolkit;
