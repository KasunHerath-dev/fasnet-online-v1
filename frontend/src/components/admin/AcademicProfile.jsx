import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import Dropdown from '../Dropdown';

export default function AcademicProfile({ studentId, isReadOnly = false }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newResult, setNewResult] = useState({
        moduleId: '',
        marks: '',
        attempt: 1,
        academicYear: new Date().getFullYear().toString()
    });

    useEffect(() => {
        fetchData();
    }, [studentId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileRes, modulesRes] = await Promise.all([
                academicService.getStudentProfile(studentId),
                academicService.getModules()
            ]);
            setProfile(profileRes.data);
            setModules(modulesRes.data);
        } catch (error) {
            console.error('Error fetching academic data:', error);
        } finally {
            setLoading(false);
        }
    };

    const [isEditingResult, setIsEditingResult] = useState(false);
    const [selectedResultId, setSelectedResultId] = useState(null);

    const handleEditClick = (result) => {
        setNewResult({
            moduleId: result.module._id,
            marks: result.marks,
            attempt: result.attempt,
            academicYear: result.academicYear || new Date().getFullYear().toString(),
            isAbsent: result.grade === 'I' || result.marks === 0 && result.grade === 'E' // Approximation
        });
        setSelectedResultId(result._id);
        setIsEditingResult(true);
        setShowAddModal(true);
    };

    const handleSaveResult = async (e) => {
        e.preventDefault();
        try {
            if (isEditingResult) {
                await academicService.updateResult(selectedResultId, {
                    ...newResult
                });
                alert('Result updated successfully');
            } else {
                await academicService.addResult({
                    studentId,
                    ...newResult
                });
                alert('Result added successfully');
            }
            setShowAddModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to save result: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetForm = () => {
        setNewResult({ moduleId: '', marks: '', attempt: 1, academicYear: new Date().getFullYear().toString(), isAbsent: false });
        setIsEditingResult(false);
        setSelectedResultId(null);
    };

    if (loading) return <div className="p-8 text-center"><div className="loading-spinner mx-auto"></div></div>;
    if (!profile) return <div className="p-8 text-center text-gray-500">No academic data found.</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* ... (Existing Stats Cards Code same as before) ... */}

            {/* Student Info & Honours Projection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card bg-gradient-to-br from-indigo-50 to-white border-l-4 border-l-indigo-500">
                    <h3 className="text-lg font-bold text-indigo-900 mb-2">Academic Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Degree Programme</p>
                            <p className="font-semibold">{profile.studentDetails?.degreeProgramme || 'Not Selected'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Combination</p>
                            <p className="font-semibold">{profile.studentDetails?.combination || 'Not Selected'}</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-amber-50 to-white border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-bold text-amber-900 mb-2">Projected Honours</h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{profile.honours}</p>
                            <p className="text-xs text-gray-500">Based on current GPA: {profile.gpa.overall}</p>
                        </div>
                        <span className="text-3xl">🎖️</span>
                    </div>
                </div>
            </div>

            {/* Dean's List Status */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Dean's List Eligibility</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`p-4 rounded-xl border ${profile.deansList[`level${level}`] === 'ELIGIBLE'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-100'
                            }`}>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Level {level}</p>
                            <p className={`font-bold ${profile.deansList[`level${level}`] === 'ELIGIBLE'
                                ? 'text-green-600'
                                : 'text-gray-400'
                                }`}>
                                {profile.deansList[`level${level}`]}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* GPA Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card green">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stat-label">Overall GPA</p>
                            <p className="stat-value text-emerald-600">{profile.gpa.overall}</p>
                        </div>
                        <span className="text-2xl">🏆</span>
                    </div>
                </div>
                <div className="stat-card blue">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stat-label">Total Credits</p>
                            <p className="stat-value text-blue-600">{profile.credits.total}</p>
                        </div>
                        <span className="text-2xl">⭐</span>
                    </div>
                </div>
                <div className="stat-card purple">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stat-label">Modules</p>
                            <p className="stat-value text-purple-600">{profile.results.length}</p>
                        </div>
                        <span className="text-2xl">📚</span>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="stat-label">Current Level</p>
                            <p className="stat-value text-orange-600">
                                {Math.max(...profile.results.map(r => r.module.level), 0) || '-'}
                            </p>
                        </div>
                        <span className="text-2xl">📈</span>
                    </div>
                </div>
            </div>

            {/* Level-wise Performance */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Level-wise Performance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(level => (
                        <div key={level} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-sm font-semibold text-gray-500 mb-1">Level {level}</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{profile.gpa[`level${level}`] || '0.00'}</p>
                                    <p className="text-xs text-gray-500">GPA</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-indigo-600">{profile.credits[`level${level}`] || 0}</p>
                                    <p className="text-xs text-gray-500">Credits</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Results Table */}
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Module Results</h3>
                    {!isReadOnly && (
                        <button
                            onClick={() => { resetForm(); setShowAddModal(true); }}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <span>➕</span> Add Result
                        </button>
                    )}
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Level</th>
                                <th>Code</th>
                                <th>Module Title</th>
                                <th className="text-center">Credits</th>
                                <th className="text-center">Marks</th>
                                <th className="text-center">Grade</th>
                                <th className="text-center">GP</th>
                                {!isReadOnly && <th className="text-center">Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {profile.results.length === 0 ? (
                                <tr>
                                    <td colSpan={!isReadOnly ? "8" : "7"} className="text-center py-8 text-gray-500">No results recorded yet.</td>
                                </tr>
                            ) : (
                                profile.results.map((result) => (
                                    <tr key={result._id}>
                                        <td>L{result.module.level}</td>
                                        <td className="font-medium">{result.module.code}</td>
                                        <td>{result.module.title}</td>
                                        <td className="text-center">{result.module.credits}</td>
                                        <td className="text-center">{result.marks}</td>
                                        <td className="text-center">
                                            <span className={`badge ${result.grade.startsWith('A') ? 'badge-success' :
                                                result.grade.startsWith('B') ? 'badge-primary' :
                                                    result.grade.startsWith('C') ? 'badge-warning' :
                                                        'badge-danger'
                                                }`}>
                                                {result.grade}
                                            </span>
                                        </td>
                                        <td className="text-center font-bold text-gray-700">{result.gradePoint.toFixed(2)}</td>
                                        {!isReadOnly && (
                                            <td className="text-center">
                                                <button
                                                    onClick={() => handleEditClick(result)}
                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Result Modal */}
            {!isReadOnly && showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="text-xl font-bold mb-4">{isEditingResult ? 'Edit Result' : 'Add New Result'}</h3>
                        <form onSubmit={handleSaveResult} className="space-y-4">
                            <div>
                                <label className="input-label">Module</label>
                                <Dropdown
                                    className={`w-full ${isEditingResult ? 'opacity-50 pointer-events-none' : ''}`}
                                    value={newResult.moduleId}
                                    onChange={e => setNewResult({ ...newResult, moduleId: e.target.value })}
                                    options={[
                                        { value: '', label: 'Select Module' },
                                        ...modules.map(m => ({
                                            value: m._id,
                                            label: `${m.code} - ${m.title} (${m.credits} cr)`
                                        }))
                                    ]}
                                    placeholder="Select Module"
                                    variant="default"
                                />
                            </div>

                            <div>
                                <label className="input-label">Marks (0-100)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        className="input flex-1"
                                        required={!newResult.isAbsent}
                                        disabled={newResult.isAbsent}
                                        min="0"
                                        max="100"
                                        value={newResult.marks}
                                        onChange={e => setNewResult({ ...newResult, marks: e.target.value })}
                                    />
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newResult.isAbsent || false}
                                            onChange={e => setNewResult({ ...newResult, isAbsent: e.target.checked, marks: e.target.checked ? '' : newResult.marks })}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        Absent / Incomplete
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="input-label">Attempt</label>
                                    <input
                                        type="number"
                                        className="input"
                                        required
                                        min="1"
                                        value={newResult.attempt}
                                        onChange={e => setNewResult({ ...newResult, attempt: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Academic Year</label>
                                    <input
                                        type="text"
                                        className="input"
                                        required
                                        placeholder="2023/2024"
                                        value={newResult.academicYear}
                                        onChange={e => setNewResult({ ...newResult, academicYear: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); resetForm(); }}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    {isEditingResult ? 'Update Result' : 'Save Result'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
