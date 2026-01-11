import { useState, useEffect } from 'react'
import { batchYearService, authService } from '../services/authService'
import BatchYearModal from './BatchYearModal'
import { Lock } from 'lucide-react'

export default function BatchYearManagement() {
    const [batchYears, setBatchYears] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingBatchYear, setEditingBatchYear] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)

    useEffect(() => {
        const user = authService.getUser()
        setIsSuperAdmin(user?.roles?.includes('superadmin'))
        fetchBatchYears()
    }, [])

    const fetchBatchYears = async () => {
        try {
            const res = await batchYearService.getAll()
            setBatchYears(res.data.batchYears || [])
        } catch (err) {
            console.error('Failed to fetch batch years', err)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (batchYear) => {
        setEditingBatchYear(batchYear)
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this batch year? This action cannot be undone.')) {
            return
        }

        setDeletingId(id)
        try {
            await batchYearService.delete(id)
            fetchBatchYears()
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to delete batch year')
        } finally {
            setDeletingId(null)
        }
    }

    const handleModalClose = () => {
        setShowModal(false)
        setEditingBatchYear(null)
    }

    const handleSuccess = () => {
        fetchBatchYears()
        handleModalClose()
    }

    return (
        <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">📅 Manage Batch Years</h2>
                    <p className="text-sm text-gray-500 mt-1">Create, edit, or delete batch years</p>
                </div>
                {isSuperAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary w-full sm:w-auto"
                    >
                        ➕ Add Batch Year
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="loading-spinner"></div>
                    <span className="ml-3 text-gray-600">Loading batch years...</span>
                </div>
            ) : batchYears.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-gray-600 font-medium">No batch years found</p>
                    {isSuperAdmin && (
                        <p className="text-sm text-gray-500 mt-1">Click "Add Batch Year" to create one</p>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Name / Label</th>
                                <th>Related Course</th>
                                {isSuperAdmin ? (
                                    <th className="text-right">Actions</th>
                                ) : (
                                    <th className="text-right">Access</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {batchYears.map((batch) => (
                                <tr key={batch._id}>
                                    <td className="font-semibold">{batch.year}</td>
                                    <td>{batch.name || '-'}</td>
                                    <td>{batch.relatedCourse || '-'}</td>
                                    <td>
                                        {isSuperAdmin ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(batch)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(batch._id)}
                                                    disabled={deletingId === batch._id}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                                                >
                                                    {deletingId === batch._id ? '...' : '🗑️ Delete'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end">
                                                <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium border border-gray-200">
                                                    <Lock className="w-3 h-3" />
                                                    Read Only
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <BatchYearModal
                    onClose={handleModalClose}
                    onSuccess={handleSuccess}
                    editData={editingBatchYear}
                />
            )}
        </div>
    )
}
