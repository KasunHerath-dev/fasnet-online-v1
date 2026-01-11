import { useState, useEffect } from 'react'
import { batchYearService } from '../services/authService'

export default function BatchYearModal({ onClose, onSuccess, editData = null }) {
    const [batchYear, setBatchYear] = useState({ year: '', name: '', relatedCourse: '' })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (editData) {
            setBatchYear({
                year: editData.year || '',
                name: editData.name || '',
                relatedCourse: editData.relatedCourse || ''
            })
        }
    }, [editData])

    const handleSubmit = async () => {
        if (!batchYear.year) {
            alert('Year is required')
            return
        }
        setLoading(true)
        try {
            if (editData) {
                // Update existing batch year
                await batchYearService.update(editData._id, batchYear)
                onSuccess()
            } else {
                // Create new batch year
                await batchYearService.create(batchYear)
                onSuccess(batchYear.year)
            }
            onClose()
        } catch (err) {
            alert(err.response?.data?.error?.message || `Failed to ${editData ? 'update' : 'create'} batch year`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {editData ? '✏️ Edit Batch Year' : '➕ Add New Batch Year'}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Year *</label>
                        <input
                            type="text"
                            value={batchYear.year}
                            onChange={(e) => setBatchYear({ ...batchYear, year: e.target.value })}
                            className="input"
                            placeholder="e.g. 2024"
                            disabled={!!editData}
                        />
                        {editData && (
                            <p className="text-xs text-gray-500 mt-1">Year cannot be changed after creation</p>
                        )}
                    </div>
                    <div>
                        <label className="input-label">Name / Label</label>
                        <input
                            type="text"
                            value={batchYear.name}
                            onChange={(e) => setBatchYear({ ...batchYear, name: e.target.value })}
                            className="input"
                            placeholder="e.g. Batch 2024, 24/25 Intake"
                        />
                    </div>
                    <div>
                        <label className="input-label">Related Course (Optional)</label>
                        <input
                            type="text"
                            value={batchYear.relatedCourse}
                            onChange={(e) => setBatchYear({ ...batchYear, relatedCourse: e.target.value })}
                            className="input"
                            placeholder="e.g. Computer Science"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? (editData ? 'Updating...' : 'Creating...') : (editData ? 'Update Batch Year' : 'Create Batch Year')}
                    </button>
                </div>
            </div>
        </div>
    )
}
