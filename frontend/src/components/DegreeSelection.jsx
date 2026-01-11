import React, { useState, useEffect } from 'react';
import { academicService, batchYearService } from '../services/authService';
import Dropdown from './Dropdown';

export default function DegreeSelection() {
    const [candidates, setCandidates] = useState([]);
    const [batchYears, setBatchYears] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(null);

    const degreeOptions = [
        "B.Sc. (General) Degree",
        "B.Sc. (Joint Major) Degree",
        "B.Sc. (Special) in Computer Science",
        "B.Sc. (Special) in Applied Electronics",
        "B.Sc. (Special) in Industrial Management",
        "B.Sc. (Special) in Mathematics with Statistics"
    ];

    useEffect(() => {
        fetchBatchYears();
    }, []);

    useEffect(() => {
        if (selectedBatch) {
            fetchCandidates();
        }
    }, [selectedBatch]);

    const fetchBatchYears = async () => {
        try {
            const res = await batchYearService.getAll();
            setBatchYears(res.data.batchYears || []);
        } catch (error) {
            console.error("Error fetching batches", error);
        }
    };

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const res = await academicService.getDegreeCandidates({ batchYear: selectedBatch });
            setCandidates(res.data);
        } catch (error) {
            console.error("Error fetching candidates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignDegree = async (studentId, degreeProgramme) => {
        if (!degreeProgramme) return alert("Please select a degree programme");
        if (!window.confirm(`Assign "${degreeProgramme}" to this student? They will be promoted to Level 3.`)) return;

        setProcessing(studentId);
        try {
            await academicService.assignDegree({ studentId, degreeProgramme });
            // Remove from list or update UI
            setCandidates(candidates.filter(c => c._id !== studentId));
            alert("Degree assigned successfully!");
        } catch (error) {
            alert(error.response?.data?.message || "Error assigning degree");
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="card animate-fadeIn mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🎓 Degree Selection (Level 2 → 3)</h2>
            <p className="text-sm text-gray-500 mb-6">Select students who have completed Level 2 and assign their specialized degree programme for Level 3.</p>

            <div className="mb-6">
                <label className="input-label">Select Batch Year</label>
                <Dropdown
                    className="w-full max-w-xs"
                    value={selectedBatch}
                    onChange={e => setSelectedBatch(e.target.value)}
                    options={[
                        { value: '', label: 'Select Batch' },
                        ...batchYears.map(b => ({
                            value: b.year,
                            label: b.name || b.year
                        }))
                    ]}
                    placeholder="Select Batch"
                    variant="default"
                />
            </div>

            {loading ? (
                <div className="text-center py-8"><div className="loading-spinner mx-auto"></div></div>
            ) : !selectedBatch ? (
                <div className="text-center py-8 text-gray-500">Please select a batch to view eligible students.</div>
            ) : candidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No Level 2 students found in this batch.</div>
            ) : (
                <div className="">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Reg No</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Current GPA</th>
                                <th className="px-4 py-3">Select Degree Programme</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map(student => (
                                <CandidateRow
                                    key={student._id}
                                    student={student}
                                    degreeOptions={degreeOptions}
                                    onAssign={handleAssignDegree}
                                    isProcessing={processing === student._id}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function CandidateRow({ student, degreeOptions, onAssign, isProcessing }) {
    const [selectedDegree, setSelectedDegree] = useState(student.degreeProgramme || "");

    return (
        <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{student.registrationNumber}</td>
            <td className="px-4 py-3">{student.fullName}</td>
            <td className="px-4 py-3 font-bold text-indigo-600">{student.gpa}</td>
            <td className="px-4 py-3">
                <Dropdown
                    className="w-full min-w-[250px]"
                    value={selectedDegree}
                    onChange={e => setSelectedDegree(e.target.value)}
                    options={[
                        { value: '', label: 'Select Degree...' },
                        ...degreeOptions.map(d => ({
                            value: d,
                            label: d
                        }))
                    ]}
                    placeholder="Select Degree..."
                    variant="default"
                />
            </td>
            <td className="px-4 py-3">
                <button
                    onClick={() => onAssign(student._id, selectedDegree)}
                    disabled={isProcessing || !selectedDegree}
                    className="btn btn-sm btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                    {isProcessing ? 'Saving...' : 'Confirm & Promote'}
                </button>
            </td>
        </tr>
    );
}
