import { useState, useEffect } from 'react'
import { authService, academicService, batchYearService } from '../services/authService'
import Dropdown from '../components/Dropdown'

export default function BulkCombinationPage() {
    const [user, setUser] = useState(null)
    const [batchYear, setBatchYear] = useState('')
    const [combination, setCombination] = useState('')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const [batches, setBatches] = useState([])

    useEffect(() => {
        const currentUser = authService.getUser()
        setUser(currentUser)
        if (currentUser?.batchScope) {
            setBatchYear(currentUser.batchScope)
        }

        // Fetch all batches
        batchYearService.getAll()
            .then(res => {
                // Backend returns { batchYears: [...] }
                const data = res.data?.batchYears || res.data || [];
                setBatches(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error('Failed to load batches:', err))
    }, [])

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
        setResult(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!batchYear || !combination || !file) {
            alert('Please fill all fields')
            return
        }

        const formData = new FormData()
        formData.append('batchYear', batchYear)
        formData.append('combination', combination)
        formData.append('file', file)

        setLoading(true)
        try {
            const res = await academicService.bulkUpdateCombination(formData)
            setResult(res.data)
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || err.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Bulk Combination Update</h1>
                <p className="text-gray-500">Upload Excel sheet to assign combinations to students in bulk.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year</label>
                            {user?.batchScope ? (
                                <input
                                    type="text"
                                    value={user.batchScope}
                                    disabled
                                    className="input w-full bg-gray-100 cursor-not-allowed"
                                />
                            ) : (
                                <Dropdown
                                    className="w-full"
                                    value={batchYear}
                                    onChange={(e) => setBatchYear(e.target.value)}
                                    options={[
                                        { value: '', label: 'Select Batch...' },
                                        ...(Array.isArray(batches) ? batches.map(batch => ({
                                            value: batch.year,
                                            label: batch.year
                                        })) : [])
                                    ]}
                                    placeholder="Select Batch..."
                                    variant="default"
                                />
                            )}
                            {user?.batchScope && <p className="text-xs text-blue-600 mt-1">Locked to your assigned batch.</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Combination</label>
                            <Dropdown
                                className="w-full"
                                value={combination}
                                onChange={(e) => setCombination(e.target.value)}
                                options={[
                                    { value: '', label: 'Select Combination...' },
                                    { value: 'COMB 1', label: 'COMB 1 (MATH & STAT, CMIS, ELTN)' },
                                    { value: 'COMB 2', label: 'COMB 2 (MATH & STAT, ELTN, IMGT)' },
                                    { value: 'COMB 3', label: 'COMB 3 (MATH & STAT, IMGT, CMIS)' }
                                ]}
                                placeholder="Select Combination..."
                                variant="default"
                            />
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-gray-50">
                        <input
                            type="file"
                            accept=".xlsx,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="bulkFile"
                        />
                        <label htmlFor="bulkFile" className="cursor-pointer block">
                            <div className="text-4xl mb-2">📁</div>
                            <span className="font-medium text-gray-700">
                                {file ? file.name : 'Click to Upload Excel Sheet'}
                            </span>
                            <p className="text-xs text-gray-500 mt-2">Required Column: "Registration Number"</p>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="btn btn-primary w-full py-3"
                    >
                        {loading ? 'Processing...' : 'Update Students'}
                    </button>
                </form>
            </div>

            {result && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Results</h3>
                    <div className="flex gap-4 mb-4">
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium">
                            Updated: {result.updated}
                        </div>
                        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg font-medium">
                            Errors: {result.errors.length}
                        </div>
                    </div>
                    {result.errors.length > 0 && (
                        <div className="max-h-60 overflow-y-auto border rounded-md p-2 bg-gray-50">
                            {result.errors.map((err, i) => (
                                <div key={i} className="text-sm text-red-600 border-b border-gray-200 py-1 last:border-0">
                                    {err.regNum}: {err.message}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
