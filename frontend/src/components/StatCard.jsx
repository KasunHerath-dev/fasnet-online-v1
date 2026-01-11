import React from 'react';

export default function StatCard({ title, value, icon, gradient, trend, trendLabel }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${gradient} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold">{value}</h3>

                    {trend && (
                        <div className="flex items-center mt-3 text-xs font-medium bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                            <span className="mr-1">{trend > 0 ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend)}% {trendLabel}</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner text-2xl">
                    {icon}
                </div>
            </div>
        </div>
    );
}
