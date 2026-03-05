import { useState, useEffect } from 'react'
import { batchYearService, authService } from '../../services/authService'
import BatchYearModal from './BatchYearModal'
import { Lock, Calendar, GraduationCap, Edit, Trash2, Plus, Shield } from 'lucide-react'

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
        <div className="space-y-6">
            {/* Header with Add Button - Monochrome (Ash) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">Academic Batches</h3>
                        <p className="text-xs text-slate-500">{batchYears.length} batch{batchYears.length !== 1 ? 'es' : ''} registered</p>
                    </div>
                </div>
                {isSuperAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="group relative overflow-hidden bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all duration-300 hover:shadow-xl flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4 relative" />
                        <span className="relative">Add Batch Year</span>
                    </button>
                )}
            </div>

            {/* Loading State - Ash */}
            {loading ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 shadow-lg">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Loading batch years...</span>
                    </div>
                </div>
            ) : batchYears.length === 0 ? (
                // Empty State - Ash
                <div className="bg-slate-50 rounded-2xl p-12 border-2 border-dashed border-slate-300">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
                            <Calendar className="w-10 h-10 text-slate-900" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Batch Years Found</h3>
                        <p className="text-slate-500 mb-4">Start by creating your first academic batch</p>
                        {isSuperAdmin && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                            >
                                <Plus className="w-5 h-5" />
                                Create First Batch
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                // Batch Years Table/Grid - Ash
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Year</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Name / Label</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Related Course</span>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                            {isSuperAdmin ? 'Actions' : 'Access'}
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {batchYears.map((batch) => (
                                    <tr key={batch._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                                                    <span className="text-sm font-black text-slate-900">{batch.year.toString().slice(-2)}</span>
                                                </div>
                                                <span className="font-bold text-slate-900">{batch.year}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">{batch.name || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600 dark:text-slate-400">{batch.relatedCourse || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isSuperAdmin ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(batch)}
                                                        className="group flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-900 hover:text-white transition-all font-medium text-sm hover:shadow-md"
                                                    >
                                                        <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(batch._id)}
                                                        disabled={deletingId === batch._id}
                                                        className="group flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-900 hover:text-white transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                                                    >
                                                        {deletingId === batch._id ? (
                                                            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        )}
                                                        {deletingId === batch._id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end">
                                                    <span className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700">
                                                        <Lock className="w-3.5 h-3.5" />
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

                    {/* Mobile Card View */}
                    <div className="sm:hidden divide-y divide-slate-200 dark:divide-slate-800">
                        {batchYears.map((batch) => (
                            <div key={batch._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                                            <span className="text-base font-black text-slate-900">{batch.year.toString().slice(-2)}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{batch.year}</h4>
                                            <p className="text-sm text-slate-600">{batch.name || 'No label'}</p>
                                        </div>
                                    </div>
                                    {!isSuperAdmin && (
                                        <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-medium border border-slate-200">
                                            <Lock className="w-3 h-3" />
                                            Read Only
                                        </span>
                                    )}
                                </div>
                                {batch.relatedCourse && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        <span className="font-medium">Course:</span> {batch.relatedCourse}
                                    </p>
                                )}
                                {isSuperAdmin && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(batch)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-900 hover:text-white transition-all font-medium text-sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(batch._id)}
                                            disabled={deletingId === batch._id}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-900 hover:text-white transition-all font-medium text-sm disabled:opacity-50"
                                        >
                                            {deletingId === batch._id ? (
                                                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            {deletingId === batch._id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
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
