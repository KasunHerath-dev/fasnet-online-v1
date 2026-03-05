import { useState, useEffect } from 'react'
import { importService, batchYearService, authService } from '../../../services/authService'
import BatchYearModal from '../../../components/admin/BatchYearModal'
import Dropdown from '../../../components/Dropdown'
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c14] font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="relative flex flex-col w-full min-h-screen">

                {/* Enhanced Hero Header - Command Center Style (Ash Theme) */}
                <div className="relative w-full h-[200px] md:h-[260px] lg:h-[300px] overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem] shadow-2xl z-10 bg-gradient-to-br from-violet-950 via-violet-900 to-blue-900">
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='white' stroke-opacity='.12' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }}></div>

                    {/* Violet/Blue glows */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', opacity: 0.1 }}></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', opacity: 0.08, animationDelay: '2s' }}></div>

                    <div className="relative flex flex-col justify-end h-full px-4 md:px-8 pb-8 md:pb-12 pt-6 md:pt-8 z-10 max-w-7xl mx-auto w-full">
                        <div className="flex items-end gap-3 md:gap-5">
                            {/* Enhanced Logo */}
                            <div className="relative group">
                                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl group-hover:opacity-90 transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(37,99,235,0.6))' }}>
                                    <Users className="w-7 h-7 md:w-9 md:h-9 text-white" />
                                </div>
                                {/* Online Indicator */}
                                <div className="absolute -top-1 -right-1">
                                    <span className="relative flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-black"></span>
                                    </span>
                                </div>
                            </div>
                            <div className="min-w-0 flex-1 pb-1">
                                <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-1">
                                    Register Students
                                </h1>
                                <p className="text-slate-400 text-xs md:text-base lg:text-lg font-medium hidden sm:block">
                                    Bulk import new student records
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto w-full px-3 md:px-6 z-20 -mt-6 md:-mt-8 space-y-4 md:space-y-6 lg:space-y-8">

                    {/* Step Indicator - Ash Theme */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${selectedBatchYear ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'}`}>
                                    {selectedBatchYear ? <CheckCircle className="w-5 h-5" /> : '1'}
                                </div>
                                <div className="flex-1 md:flex-none">
                                    <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Batch Year</p>
                                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Academic year</p>
                                </div>
                            </div>
                            <div className="hidden md:block h-px flex-1 mx-4 bg-slate-200 dark:bg-slate-800">
                                <div className={`h-full bg-slate-900 dark:bg-white transition-all duration-500 ${selectedBatchYear ? 'w-1/3' : 'w-0'}`}></div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${file ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : selectedBatchYear ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'}`}>
                                    {file ? <CheckCircle className="w-5 h-5" /> : '2'}
                                </div>
                                <div className="flex-1 md:flex-none">
                                    <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Upload File</p>
                                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Select data file</p>
                                </div>
                            </div>
                            <div className="hidden md:block h-px flex-1 mx-4 bg-slate-200 dark:bg-slate-800">
                                <div className={`h-full bg-slate-900 dark:bg-white transition-all duration-500 ${file ? 'w-2/3' : 'w-0'}`}></div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${result ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : file ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'}`}>
                                    {result ? <CheckCircle className="w-5 h-5" /> : '3'}
                                </div>
                                <div className="flex-1 md:flex-none">
                                    <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Import</p>
                                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Complete</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Batch Year Selection - Ash Theme */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-slate-900 dark:text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Select Batch Year</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-end">
                            <div className="flex-1 w-full max-w-md">
                                <label className="block text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
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
                                            className="min-h-[44px] min-w-[44px] w-12 h-12 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center active:scale-95"
                                            title="Add New Batch Year"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-2 font-medium">
                            <AlertCircle className="w-4 h-4" />
                            This batch year will be applied to all students in the uploaded file
                        </p>
                    </div>

                    {/* Upload Section - Ash Theme */}
                    <div className={`bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800 transition-all ${!selectedBatchYear ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
                                <Upload className="w-5 h-5 text-white dark:text-slate-900" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Upload File</h2>
                        </div>

                        <div
                            className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all ${dragActive
                                ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-white/5'
                                : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-600'
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
                                <label htmlFor="fileInput" className="cursor-pointer block group">
                                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="w-8 h-8 md:w-10 md:h-10 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                                    </div>
                                    <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">Drop file here or click to browse</p>
                                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Supports .xlsx, .xls, and .csv files</p>
                                    <div className="mt-4 md:mt-6 inline-block min-h-[44px] px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-lg active:scale-95">
                                        Choose File
                                    </div>
                                </label>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                        <FileText className="w-8 h-8 md:w-10 md:h-10 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white">{file.name}</p>
                                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-mono">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <button
                                        onClick={clearFile}
                                        className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2 text-sm md:text-base bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-200 dark:hover:border-red-800"
                                    >
                                        <X className="w-4 h-4" />
                                        Remove File
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="mt-4 md:mt-6 flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="w-6 h-6 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm md:text-base text-slate-900 dark:text-white font-bold">Processing file...</span>
                            </div>
                        )}
                    </div>

                    {/* Preview - Ash Theme */}
                    {preview && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Data Preview</h2>
                                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">{preview.totalRows} rows found</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="min-h-[44px] w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {importing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-slate-500 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
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

                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            {preview.columns.map((col) => (
                                                <th key={col} className="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {preview.preview.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                {preview.columns.map((col) => (
                                                    <td key={col} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
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

                    {/* Results - Ash Theme */}
                    {result && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                                <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white dark:text-slate-900" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Registration Complete</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                                <div className="bg-black dark:bg-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg border border-slate-800 dark:border-slate-700 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div>
                                            <p className="text-sm md:text-base text-slate-400 font-bold mb-1 uppercase tracking-wider">Students Created</p>
                                            <p className="text-4xl md:text-5xl font-black text-white">{result.created}</p>
                                        </div>
                                        <div className="bg-emerald-500/20 p-3 rounded-xl">
                                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                                    <div className="flex items-center justify-between relative z-10">
                                        <div>
                                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase tracking-wider">Skipped (Existing)</p>
                                            <p className="text-4xl md:text-5xl font-black">{result.skipped}</p>
                                        </div>
                                        <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-xl">
                                            <AlertCircle className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-2xl p-6">
                                    <h3 className="font-bold text-red-900 dark:text-red-400 mb-4 flex items-center gap-2 text-lg">
                                        <AlertCircle className="w-5 h-5" />
                                        Errors Encountered ({result.errors.length})
                                    </h3>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 max-h-60 overflow-auto border border-slate-200 dark:border-slate-800">
                                        <ul className="space-y-2">
                                            {result.errors.slice(0, 10).map((err, idx) => (
                                                <li key={idx} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2 font-medium">
                                                    <span className="font-black whitespace-nowrap">Row {err.row}:</span>
                                                    <span>{err.message}</span>
                                                </li>
                                            ))}
                                            {result.errors.length > 10 && (
                                                <li className="text-sm text-red-600 dark:text-red-500 font-bold pt-2 border-t border-red-100 dark:border-red-900/20">
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

