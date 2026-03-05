import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-xl flex flex-col gap-1.5 min-w-[160px]">
                <p className="font-black text-white mb-2">{label}</p>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Cumulative GPA:</span>
                    <span className="text-purple-400 font-black">{data.gpa.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Semester GPA:</span>
                    <span className="text-emerald-400 font-black">{data.semGpa.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Credits:</span>
                    <span className="text-moccaccino-400 font-black">{data.credits}</span>
                </div>
            </div>
        );
    }
    return null;
};

const DetailedPerformanceChart = ({ data }) => {
    // Mock data if none provided
    const chartData = data || [
        { semester: 'Semester 1', gpa: 3.2, credits: 15 },
        { semester: 'Semester 2', gpa: 3.5, credits: 15 },
        { semester: 'Semester 3', gpa: 3.4, credits: 18 },
        { semester: 'Semester 4', gpa: 3.7, credits: 15 },
        { semester: 'Semester 5', gpa: 3.9, credits: 16 }
    ];

    return (
        <div className="flex flex-col w-full h-full min-h-[250px]">
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorGpaLarge" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                        <XAxis
                            dataKey="semester"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            domain={[2.0, 4.0]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148, 163, 184, 0.2)', strokeWidth: 2, strokeDasharray: '3 3' }} />
                        <Area
                            type="monotone"
                            dataKey="gpa"
                            stroke="#8b5cf6"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorGpaLarge)"
                            activeDot={{ r: 8, strokeWidth: 0, fill: '#8b5cf6' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DetailedPerformanceChart;
