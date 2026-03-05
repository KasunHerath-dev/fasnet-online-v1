import React from 'react';
import { Mail, Hash, Book, Calendar, TrendingUp, Star } from 'lucide-react';

const ProfileOverview = ({ user, studentDetails }) => {
    const fName = user?.studentRef?.firstName || user?.firstName || '';
    const lName = user?.studentRef?.lastName || user?.lastName || '';
    const displayName = `${fName} ${lName}`.trim() || user?.studentRef?.fullName || 'Student';
    const regNo = user?.studentRef?.registrationNumber || studentDetails?.registrationNumber || 'N/A';
    const initial = displayName.charAt(0).toUpperCase() || 'S';

    const infoItems = [
        {
            icon: Mail,
            label: 'Email Address',
            value: user?.email || studentDetails?.email || 'N/A',
            pillBg: 'bg-[#bae6fd]',
            iconColor: 'text-blue-600',
        },
        {
            icon: Hash,
            label: 'Registration No.',
            value: regNo,
            pillBg: 'bg-[#be94f5]/30',
            iconColor: 'text-purple-600',
        },
        {
            icon: Book,
            label: 'Combination',
            value: studentDetails?.combination?.replace('COMB', 'COMB ') || 'None Assigned',
            pillBg: 'bg-[#fccc42]/40',
            iconColor: 'text-amber-600',
        },
        {
            icon: Calendar,
            label: 'Current Level',
            value: studentDetails?.currentLevel ? `Level ${studentDetails.currentLevel}` : 'Level 1',
            pillBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
        },
        {
            icon: TrendingUp,
            label: 'Index Number',
            value: studentDetails?.indexNumber || 'Pending',
            pillBg: 'bg-[#ff5734]/10',
            iconColor: 'text-[#ff5734]',
        },
        {
            icon: Star,
            label: 'Status',
            value: 'Active Student',
            pillBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* LEFT — Dark promo avatar card */}
            <div className="rounded-[2rem] bg-[#151313] p-7 flex flex-col justify-between min-h-[260px] shadow-xl shadow-black/10 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#fccc42]/10 pointer-events-none" />
                <div className="absolute -bottom-10 -left-8 w-44 h-44 rounded-full bg-[#ff5734]/5 pointer-events-none" />

                {/* Pill */}
                <div className="relative z-10">
                    <span className="px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase bg-[#fccc42] text-[#151313]">
                        Student Profile
                    </span>
                </div>

                {/* Avatar + Name */}
                <div className="relative z-10 flex items-center gap-4 my-6">
                    <div className="w-16 h-16 rounded-full bg-[#fccc42] flex items-center justify-center text-[#151313] text-2xl font-black border-[3px] border-white/10 overflow-hidden flex-shrink-0">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                        ) : initial}
                    </div>
                    <div>
                        <h2 className="text-white font-black text-xl leading-tight">{displayName}</h2>
                        <p className="text-white/50 text-xs font-semibold mt-0.5">@{regNo}</p>
                    </div>
                </div>

                {/* CTA button */}
                <div className="relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-white/60 text-xs font-bold tracking-wide">Portal Active</span>
                    </div>
                </div>
            </div>

            {/* RIGHT — Info grid card (2 columns wide) */}
            <div className="lg:col-span-2 rounded-[2rem] bg-white border border-slate-100 shadow-sm p-7">
                <h3 className="text-base font-black text-[#151313] mb-5 tracking-wide">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {infoItems.map((item) => (
                        <div
                            key={item.label}
                            className={`flex items-start gap-3 p-4 rounded-2xl ${item.pillBg} hover:-translate-y-1 transition-transform duration-300`}
                        >
                            <div className={`mt-0.5 shrink-0 ${item.iconColor}`}>
                                <item.icon className="w-4 h-4" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-[#151313]/50 uppercase tracking-widest mb-0.5">{item.label}</p>
                                <p className="font-bold text-[#151313] text-sm truncate">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ProfileOverview;
