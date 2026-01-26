import { useState, useEffect } from 'react'
import api from '../services/api'
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle, RefreshCcw, ArrowLeft, Layers } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { batchYearService } from '../services/authService'

export default function BulkCombinationPage() {
    const [file, setFile] = useState(null)
    const [batchYear, setBatchYear] = useState('')
    const [combination, setCombination] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [batches, setBatches] = useState([])
    const { showToast } = useToast()
    const navigate = useNavigate()

    useEffect(() => {
        fetchBatches()
    }, [])

    const fetchBatches = async () => {
        try {
            const res = await batchYearService.getAllBatchYears()
            setBatches(res.data)
        } catch (error) {
            console.error('Error fetching batches:', error)
            showToast('Failed to load batch years', 'error')
        }
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
        setResult(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file || !batchYear || !combination) {
            showToast('Please fill in all fields', 'error')
            return
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('batchYear', batchYear)
        formData.append('combination', combination)

        setLoading(true)
        setResult(null)

        try {
            const response = await api.post('/combinations/bulk-update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setResult(response.data)
            showToast('Bulk update completed', 'success')
        } catch (error) {
            console.error('Error uploading file:', error)
            setResult({
                success: false,
                message: error.response?.data?.error || 'Upload failed',
                errors: error.response?.data?.details || []
            })
            showToast('Update failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-fadeIn p-4 md:p-8">

                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 dark:from-teal-900 dark:via-teal-950 dark:to-emerald-950 rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative z-10">
                        <button
                            onClick={() => navigate('/admin')}
                            className="group flex items-center gap-2 text-teal-100 hover:text-white transition-colors mb-6 font-medium"
                        >
                            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                            Back to Dashboard
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner border border-white/20">
                                <Layers className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Bulk Combination Update</h1>
                                <p className="text-teal-100 text-lg font-medium max-w-2xl">
                                    Update student subject combinations en masse using Excel files.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 p-8 h-full">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Upload Details</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Batch Year Select */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-wide">Batch Year</label>
                                    <div className="relative">
                                        <select
                                            value={batchYear}
                                            onChange={(e) => setBatchYear(e.target.value)}
                                            className="w-full h-14 pl-4 pr-10 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white font-bold appearance-none transition-all"
                                        >
                                            <option value="">Select Batch Year</option>
                                            {batches.map((batch) => (
                                                <option key={batch._id} value={batch.batchYear}>
                                                    {batch.batchYear}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Combination Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-wide">Combination Code</label>
                                    <input
                                        type="text"
                                        value={combination}
                                        onChange={(e) => setCombination(e.target.value)}
                                        placeholder="e.g. PCM, Bio"
                                        className="w-full h-14 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-white font-bold placeholder-slate-400 transition-all"
                                    />
                                </div>

                                {/* File Upload Area */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-wide">Excel File</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${file
                                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10'
                                            : 'border-slate-300 dark:border-white/20 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {file ? (
                                                <>
                                                    <FileSpreadsheet className="w-10 h-10 text-teal-600 dark:text-teal-400 mb-3" />
                                                    <p className="text-sm text-teal-600 dark:text-teal-400 font-bold mb-1">{file.name}</p>
                                                    <p className="text-xs text-slate-400">Click to replace</p>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-1">Click to upload file</p>
                                                    <p className="text-xs text-slate-400">XLSX or XLS only</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx, .xls"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-teal-600 text-white rounded-xl font-black text-lg hover:bg-teal-700 active:scale-95 transition-all shadow-lg shadow-teal-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCcw className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Update Students'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 p-8 min-h-full">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Processing Results</h2>

                            {!result && !loading && (
                                <div className="h-64 flex flex-col items-center justify-center text-center opacity-60">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <Layers className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Upload a file to see results here.</p>
                                </div>
                            )}

                            {loading && (
                                <div className="h-64 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Analyzing file and updating records...</p>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-6 animate-fadeIn">
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Total</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">{result.totalProcessed || 0}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-center">
                                            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Updated</p>
                                            <p className="text-2xl font-black text-green-700 dark:text-green-300">{result.updatedCount || 0}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-center">
                                            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Errors</p>
                                            <p className="text-2xl font-black text-red-700 dark:text-red-300">{result.errors?.length || 0}</p>
                                        </div>
                                    </div>

                                    {/* Error List */}
                                    {result.errors && result.errors.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5" />
                                                Review Issues
                                            </h3>
                                            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-500/20 overflow-hidden max-h-96 overflow-y-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-red-100/50 dark:bg-red-900/20">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left font-bold text-red-800 dark:text-red-300">Reg No</th>
                                                            <th className="px-6 py-3 text-left font-bold text-red-800 dark:text-red-300">Message</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-red-100 dark:divide-red-500/10">
                                                        {result.errors.map((error, idx) => (
                                                            <tr key={idx} className="hover:bg-red-100/30 dark:hover:bg-red-900/20 transition-colors">
                                                                <td className="px-6 py-3 font-mono font-bold text-red-700 dark:text-red-400">{error.registrationNumber}</td>
                                                                <td className="px-6 py-3 text-red-700 dark:text-red-400">{error.error}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Success Message */}
                                    {result.success && (!result.errors || result.errors.length === 0) && (
                                        <div className="p-8 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-500/20 text-center">
                                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                            </div>
                                            <h3 className="text-xl font-black text-green-800 dark:text-green-300 mb-2">Success!</h3>
                                            <p className="text-green-700 dark:text-green-400 font-medium">
                                                All students in the requested batch and list have been updated to the <strong>{combination}</strong> combination.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
                }
                .animate-fadeIn {
                animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    )
}
