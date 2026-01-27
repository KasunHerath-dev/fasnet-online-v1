import { useState, useEffect } from 'react'
import { importService, batchYearService, authService } from '../services/authService'
import BatchYearModal from '../components/BatchYearModal'
import Dropdown from '../components/Dropdown'
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Calendar,
    Users,
    TrendingUp,
    Download,
    X,
    Plus
} from 'lucide-react'

export default function RegisterStudentsPage() {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState(null)
    const [dragActive, setDragActive] = useState(false)

    // Batch Year State
    const [batchYears, setBatchYears] = useState([])
    const [selectedBatchYear, setSelectedBatchYear] = useState('')
    const [showBatchModal, setShowBatchModal] = useState(false)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)

    useEffect(() => {
        const user = authService.getCurrentUser()
        setIsSuperAdmin(user?.roles?.includes('superadmin'))
        fetchBatchYears()
    }, [])

    const fetchBatchYears = async () => {
        try {
            const res = await batchYearService.getAll()
            setBatchYears(res.data.batchYears || [])
        } catch (err) {
            console.error('Failed to fetch batch years', err)
        }
    }

    const handleBatchYearCreated = (year) => {
        fetchBatchYears()
        setSelectedBatchYear(year)
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processFile(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            await processFile(selectedFile)
        }
    }

    const processFile = async (selectedFile) => {
        setFile(selectedFile)
        setLoading(true)
        setPreview(null)
        setResult(null)

        try {
            const res = await importService.preview(selectedFile)
            setPreview(res.data)
        } catch (error) {
            alert('Preview failed: ' + (error.response?.data?.error?.message || error.message))
        } finally {
            setLoading(false)
        }
    }

    const handleImport = async () => {
        if (!file) return
        if (!selectedBatchYear) {
            alert('Please select a batch year before registering students.')
            return
        }

        setImporting(true)
        try {
            const res = await importService.importStudents(file, false, selectedBatchYear)
            setResult(res.data.results)
        } catch (error) {
            alert('Registration failed: ' + (error.response?.data?.error?.message || error.message))
        } finally {
            setImporting(false)
        }
    }

    const clearFile = () => {
        setFile(null)
        setPreview(null)
        setResult(null)
    }

    return (
        <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="relative flex flex-col w-full min-h-screen">

                {/* Hero Header - Professional */}
                <div className="relative w-full h-[180px] md:h-[240px] lg:h-[280px] bg-gradient-to-br from-stitch-blue via-[#6b13ec] to-stitch-pink overflow-hidden rounded-b-[1.5rem] md:rounded-b-[2.5rem] shadow-2xl z-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-stitch-blue opacity-20 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl"></div>
                    <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>

                    <div className="relative flex flex-col justify-end h-full px-4 md:px-6 pb-8 md:pb-12 pt-6 md:pt-8 z-10 max-w-7xl mx-auto w-full">
                        <div className="flex items-end gap-3 md:gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white opacity-20 rounded-xl md:rounded-2xl blur-md group-hover:blur-lg transition-all"></div>
                                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-105 transition-transform">
                                    <Users className="w-7 h-7 md:w-9 md:h-9 text-white" />
                                </div>
                            </div>
                            <div className="min-w-0 flex-1 pb-1">
                                <h1 className="text-white text-2xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight drop-shadow-lg mb-1">
                                    Register Students
                                </h1>
                                <p className="text-white/95 text-xs md:text-base lg:text-lg font-semibold leading-tight drop-shadow-md hidden sm:block">
                                    Bulk import new students
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto w-full px-3 md:px-6 z-20 -mt-6 md:-mt-8 space-y-4 md:space-y-6 lg:space-y-8">

                    {/* Step Indicator */}
                    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border-2 border-gray-100">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedBatchYear ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>
                                    {selectedBatchYear ? <CheckCircle className="w-5 h-5" /> : '1'}
                                </div>
                                <div className="flex-1 md:flex-none">
                                    <p className="text-sm md:text-base font-bold text-gray-900">Select Batch Year</p>
                                    <p className="text-xs md:text-sm text-gray-600">Choose the academic year</p>
                                </div>
                            </div>
                            <div className="hidden md:block h-1 flex-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full bg-indigo-600 transition-all duration-500 ${selectedBatchYear ? 'w-1/3' : 'w-0'}`}></div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${file ? 'bg-green-500 text-white' : selectedBatchYear ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                    {file ? <CheckCircle className="w-5 h-5" /> : '2'}
                                </div>
                                <div className="flex-1 md:flex-none">
                                    <p className="text-sm md:text-base font-bold text-gray-900">Upload File</p>
                                    <p className="text-xs md:text-sm text-gray-600">Select your data file</p>
                                </div>
                            </div>
                            <div className="hidden md:block h-1 flex-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full bg-indigo-600 transition-all duration-500 ${file ? 'w-2/3' : 'w-0'}`}></div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${result ? 'bg-green-500 text-white' : file ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                    {result ? <CheckCircle className="w-5 h-5" /> : '3'}
                                </div>
                                <div className="flex-1 md:flex-none">
                                    <p className="text-sm md:text-base font-bold text-gray-900">Import</p>
                                    <p className="text-xs md:text-sm text-gray-600">Complete registration</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Batch Year Selection */}
                    <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border-2 border-gray-100">
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900">Select Batch Year</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-end">
                            <div className="flex-1 w-full max-w-md">
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                                    Batch Year <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <Dropdown
                                        value={selectedBatchYear}
                                        onChange={(e) => setSelectedBatchYear(e.target.value)}
                                        options={[
                                            { value: '', label: 'Select Batch Year' },
                                            ...batchYears.map(b => ({
                                                value: b.year,
                                                label: `${b.name || b.year} ${b.relatedCourse ? `(${b.relatedCourse})` : ''}`
                                            }))
                                        ]}
                                        placeholder="Select Batch Year"
                                        variant="default"
                                        className="flex-1"
                                    />
                                    {isSuperAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => setShowBatchModal(true)}
                                            className="min-h-[44px] min-w-[44px] w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center active:scale-95"
                                            title="Add New Batch Year"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 mt-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            This batch year will be applied to all students in the uploaded file
                        </p>
                    </div>

                    {/* Upload Section */}
                    <div className={`bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border-2 border-gray-100 transition-all ${!selectedBatchYear ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Upload className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900">Upload File</h2>
                        </div>

                        <div
                            className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all ${dragActive
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50/30 hover:border-indigo-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="fileInput"
                                disabled={!selectedBatchYear}
                            />

                            {!file ? (
                                <label htmlFor="fileInput" className="cursor-pointer block">
                                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                                        <Upload className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                    </div>
                                    <p className="text-lg md:text-xl font-bold text-gray-900 mb-2">Drop your file here or click to browse</p>
                                    <p className="text-sm md:text-base text-gray-600">Supports .xlsx, .xls, and .csv files</p>
                                    <div className="mt-4 md:mt-6 inline-block min-h-[44px] px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95">
                                        Choose File
                                    </div>
                                </label>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-green-100 rounded-2xl flex items-center justify-center">
                                        <FileText className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-base md:text-lg font-bold text-gray-900">{file.name}</p>
                                        <p className="text-xs md:text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <button
                                        onClick={clearFile}
                                        className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-sm md:text-base bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-all active:scale-95"
                                    >
                                        <X className="w-4 h-4" />
                                        Remove File
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="mt-4 md:mt-6 flex items-center justify-center gap-3 bg-blue-50 p-4 rounded-xl">
                                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm md:text-base text-blue-900 font-semibold">Loading preview...</span>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border-2 border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-black text-gray-900">Data Preview</h2>
                                        <p className="text-sm md:text-base text-gray-600">{preview.totalRows} rows found</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="min-h-[44px] w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {importing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Register {preview.totalRows} Students
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                                        <tr>
                                            {preview.columns.map((col) => (
                                                <th key={col} className="px-4 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {preview.preview.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                                {preview.columns.map((col) => (
                                                    <td key={col} className="px-4 py-3 text-sm text-gray-900">
                                                        {String(row[col] || '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border-2 border-green-200">
                            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900">Registration Complete!</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm md:text-base text-green-100 font-medium mb-1">Students Created</p>
                                            <p className="text-4xl md:text-5xl font-black">{result.created}</p>
                                        </div>
                                        <CheckCircle className="w-12 h-12 md:w-16 md:h-16 opacity-20" />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm md:text-base text-gray-100 font-medium mb-1">Skipped (Existing)</p>
                                            <p className="text-4xl md:text-5xl font-black">{result.skipped}</p>
                                        </div>
                                        <AlertCircle className="w-12 h-12 md:w-16 md:h-16 opacity-20" />
                                    </div>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                                    <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2 text-lg">
                                        <AlertCircle className="w-5 h-5" />
                                        Errors Encountered ({result.errors.length})
                                    </h3>
                                    <div className="bg-white rounded-xl p-4 max-h-60 overflow-auto">
                                        <ul className="space-y-2">
                                            {result.errors.slice(0, 10).map((err, idx) => (
                                                <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                                    <span className="font-bold">Row {err.row}:</span>
                                                    <span>{err.message}</span>
                                                </li>
                                            ))}
                                            {result.errors.length > 10 && (
                                                <li className="text-sm text-red-600 font-semibold">
                                                    ... and {result.errors.length - 10} more errors
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Batch Year Modal */}
                {showBatchModal && (
                    <BatchYearModal
                        onClose={() => setShowBatchModal(false)}
                        onSuccess={handleBatchYearCreated}
                    />
                )}

                <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
            </div>
        </div>
    )
}
