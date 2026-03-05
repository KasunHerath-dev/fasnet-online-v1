import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

const mockData = [
    { name: 'S1', gpa: 2.5 },
    { name: 'S2', gpa: 2.8 },
    { name: 'S3', gpa: 3.1 },
    { name: 'S4', gpa: 3.4 },
    { name: 'S5', gpa: 3.7 },
];

const MiniGrowthChart = ({ data = mockData }) => {
    return (
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100/50 flex flex-col h-full min-h-[160px]">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    GPA Growth
                </h2>
                <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
            </div>
            <div className="flex-1 w-full relative -ml-2 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                            itemStyle={{ color: '#ff5734' }}
                            cursor={{ stroke: '#151313', strokeWidth: 1, strokeDasharray: '4 4' }}
                            labelStyle={{ display: 'none' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="gpa"
                            stroke="#151313"
                            strokeWidth={3.5}
                            dot={{ r: 4, fill: '#ff5734', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, fill: '#ff5734', strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MiniGrowthChart;
