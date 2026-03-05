import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => {
    return (
        <div className={`bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 h-full min-h-[160px] ${colorClass?.wrapper || ''}`}>

            <div className="flex justify-start items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass?.iconBg || 'bg-[#151313] text-white'}`}>
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
            </div>

            <div>
                <p className="text-[#64748b] font-bold text-[11px] uppercase tracking-widest mb-1.5">
                    {title}
                </p>
                <h3 className="text-[2rem] font-black text-[#151313] tracking-tight leading-none">
                    {value}
                </h3>
            </div>
        </div>
    );
};

export default StatCard;
