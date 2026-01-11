import React, { useState, useEffect } from 'react';
import { academicService, batchYearService } from '../services/authService';
import Dropdown from './Dropdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4444'];

export default function AnalyticsDashboard() {
    const [modules, setModules] = useState([]);
    const [batchYears, setBatchYears] = useState([]);
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const [repeaters, setRepeaters] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [modulesRes, batchRes] = await Promise.all([
                academicService.getModules(),
                batchYearService.getAll()
            ]);
            setModules(modulesRes.data);
            setBatchYears(batchRes.data.batchYears || []);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const fetchAnalytics = async () => {
        if (!selectedModule) return;
        setLoading(true);
        try {
            const [analyticsRes, repeatersRes] = await Promise.all([
                academicService.getModuleAnalytics({ moduleId: selectedModule, batchYear: selectedBatch }),
                academicService.getRepeaters({ moduleId: selectedModule, batchYear: selectedBatch })
            ]);
            setAnalytics(analyticsRes.data);
            setRepeaters(repeatersRes.data);
        } catch (error) {
            console.error("Error fetching analytics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedModule) {
            fetchAnalytics();
        }
    }, [selectedModule, selectedBatch]);

    const gradeData = analytics ? Object.entries(analytics.gradeDistribution).map(([grade, count]) => ({
        name: grade,
        count
    })) : [];

    const passFailData = analytics ? [
        { name: 'Passed', value: analytics.passed },
        { name: 'Failed', value: analytics.failed }
    ] : [];

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Exam Analytics & Repeats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="input-label">Batch Year</label>
                        <Dropdown
                            className="w-full"
                            value={selectedBatch}
                            onChange={e => setSelectedBatch(e.target.value)}
                            options={[
                                { value: '', label: 'All Batches' },
                                ...batchYears.map(b => ({
                                    value: b.year,
                                    label: b.name || b.year
                                }))
                            ]}
                            placeholder="All Batches"
                            variant="default"
                        />
                    </div>
                    <div>
                        <label className="input-label">Module</label>
                        <Dropdown
                            className="w-full"
                            value={selectedModule}
                            onChange={e => setSelectedModule(e.target.value)}
                            options={[
                                { value: '', label: 'Select Module' },
                                ...modules.map(m => ({
                                    value: m._id,
                                    label: `${m.code} - ${m.title}`
                                }))
                            ]}
                            placeholder="Select Module"
                            variant="default"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={async () => {
                                if (!selectedBatch) return alert('Please select a batch first');
                                if (!window.confirm(`Are you sure you want to advance batch ${selectedBatch} to the next semester?`)) return;
                                try {
                                    setLoading(true);
                                    const res = await academicService.promoteBatch({ batchYear: selectedBatch });
                                    alert(res.data.message);
                                } catch (err) {
                                    alert('Error: ' + (err.response?.data?.message || err.message));
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="btn btn-primary w-full bg-indigo-600 hover:bg-indigo-700"
                            disabled={!selectedBatch || loading}
                        >
                            🚀 Advance Batch Semester
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8"><div className="loading-spinner mx-auto"></div></div>
                ) : !selectedModule ? (
                    <div className="text-center py-8 text-gray-500">Select a module to view analytics.</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Charts */}
                        <div className="space-y-6">
                            <div className="h-64 border rounded-xl p-4">
                                <h3 className="text-sm font-bold text-gray-500 mb-2 text-center">Grade Distribution</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={gradeData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="h-64 border rounded-xl p-4">
                                <h3 className="text-sm font-bold text-gray-500 mb-2 text-center">Pass vs Fail</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={passFailData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {passFailData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#00C49F' : '#FF4444'} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Repeaters List */}
                        <div className="border rounded-xl p-4 bg-red-50 border-red-100">
                            <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                                <span>⚠️</span> Repeaters ({repeaters.length})
                            </h3>
                            <div className="overflow-y-auto max-h-[500px]">
                                {repeaters.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No repeaters found for this module.</p>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-red-700 uppercase bg-red-100">
                                            <tr>
                                                <th className="px-4 py-2">Reg No</th>
                                                <th className="px-4 py-2">Name</th>
                                                <th className="px-4 py-2 text-center">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {repeaters.map(r => (
                                                <tr key={r._id} className="bg-white border-b hover:bg-red-50">
                                                    <td className="px-4 py-2 font-medium">{r.student?.registrationNumber}</td>
                                                    <td className="px-4 py-2">{r.student?.fullName}</td>
                                                    <td className="px-4 py-2 text-center font-bold text-red-600">{r.grade}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
