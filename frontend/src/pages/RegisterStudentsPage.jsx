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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">

                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-3xl p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -ml-40 -mb-40"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white">Register Students</h1>
                                <p className="text-blue-200 text-lg font-medium">Bulk import new students from Excel or CSV files</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedBatchYear ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>
                                {selectedBatchYear ? <CheckCircle className="w-5 h-5" /> : '1'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Select Batch Year</p>
                                <p className="text-sm text-gray-600">Choose the academic year</p>
                            </div>
                        </div>
                        <div className="h-1 flex-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full bg-indigo-600 transition-all duration-500 ${selectedBatchYear ? 'w-1/3' : 'w-0'}`}></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${file ? 'bg-green-500 text-white' : selectedBatchYear ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                {file ? <CheckCircle className="w-5 h-5" /> : '2'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Upload File</p>
                                <p className="text-sm text-gray-600">Select your data file</p>
                            </div>
                        </div>
                        <div className="h-1 flex-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full bg-indigo-600 transition-all duration-500 ${file ? 'w-2/3' : 'w-0'}`}></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${result ? 'bg-green-500 text-white' : file ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                {result ? <CheckCircle className="w-5 h-5" /> : '3'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Import</p>
                                <p className="text-sm text-gray-600">Complete registration</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Batch Year Selection */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">Select Batch Year</h2>
                    </div>

                    <div className="flex gap-4 items-end">
                        <div className="flex-1 max-w-md">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                        className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                                        title="Add New Batch Year"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        This batch year will be applied to all students in the uploaded file
                    </p>
                </div>

                {/* Upload Section */}
                <div className={`bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 transition-all ${!selectedBatchYear ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">Upload File</h2>
                    </div>

                    <div
                        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive
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
                                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Upload className="w-10 h-10 text-white" />
                                </div>
                                <p className="text-xl font-bold text-gray-900 mb-2">Drop your file here or click to browse</p>
                                <p className="text-gray-600">Supports .xlsx, .xls, and .csv files</p>
                                <div className="mt-6 inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg">
                                    Choose File
                                </div>
                            </label>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-20 h-20 mx-auto bg-green-100 rounded-2xl flex items-center justify-center">
                                    <FileText className="w-10 h-10 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{file.name}</p>
                                    <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button
                                    onClick={clearFile}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-all"
                                >
                                    <X className="w-4 h-4" />
                                    Remove File
                                </button>
                            </div>
                        )}
                    </div>

                    {loading && (
                        <div className="mt-6 flex items-center justify-center gap-3 bg-blue-50 p-4 rounded-xl">
                            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-blue-900 font-semibold">Loading preview...</span>
                        </div>
                    )}
                </div>

                {/* Preview */}
                {preview && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Data Preview</h2>
                                    <p className="text-gray-600">{preview.totalRows} rows found</p>
                                </div>
                            </div>
                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                    <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-green-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">Registration Complete!</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 font-medium mb-1">Students Created</p>
                                        <p className="text-5xl font-black">{result.created}</p>
                                    </div>
                                    <CheckCircle className="w-16 h-16 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-100 font-medium mb-1">Skipped (Existing)</p>
                                        <p className="text-5xl font-black">{result.skipped}</p>
                                    </div>
                                    <AlertCircle className="w-16 h-16 opacity-20" />
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
    )
}
