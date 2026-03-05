import { useState } from 'react'
import { importService } from '../../../services/authService'
import {
    RefreshCw,
    FileText,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Upload,
    X,
    Info,
    ArrowRight
} from 'lucide-react'

export default function UpdateStudentsPage() {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState(null)
    const [dragActive, setDragActive] = useState(false)

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
            setFile(null)
        } finally {
            setLoading(false)
        }
    }

    const handleImport = async () => {
        if (!file) return

        setImporting(true)
        try {
            const res = await importService.importStudents(file, true)
            setResult(res.data.results)
        } catch (error) {
            alert('Update failed: ' + (error.response?.data?.error?.message || error.message))
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn p-4 md:p-6 lg:p-8">

                {/* Enhanced Hero Header - Command Center Style (Ash Theme) */}
                <div className="relative overflow-hidden bg-black rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-900/50 z-10 border border-slate-800">
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-black to-slate-950"></div>

                    {/* Minimalist Glows */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.03] rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-500 opacity-[0.05] rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {/* Enhanced Logo */}
                        <div className="relative group">
                            <div className="relative w-24 h-24 bg-white/5 backdrop-blur-xl rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300">
                                <RefreshCw className="w-10 h-10 text-white group-hover:rotate-180 transition-transform duration-700" />
                            </div>
                            {/* Online Indicator */}
                            <div className="absolute -top-1 -right-1">
                                <span className="relative flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-black"></span>
                                </span>
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-3">Update Database</h1>
                            <p className="text-slate-400 font-medium text-base md:text-lg max-w-2xl">
                                Bulk update student records via secure CSV/Excel import.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Enhanced Info Banner - Ash Theme */}
                <div className="relative bg-slate-50 dark:bg-slate-900/50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800">
                    <div className="relative flex items-start gap-4 md:gap-6">
                        <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 text-white dark:text-slate-900 shadow-xl">
                            <Info className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-3">System Protocols</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    Matched via Registration Number
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    Updates existing records only
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    Ignores unregistered IDs
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    Preserves data in empty cells
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Step Indicator - Ash Theme */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                        {/* Progress Line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-0 hidden md:block"></div>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-900 dark:bg-white transition-all duration-500 -z-0 hidden md:block ${result ? 'w-full' : file ? 'w-1/2' : 'w-0'
                            }`}></div>

                        {/* Step 1 */}
                        <div className="flex items-center gap-4 relative z-10 bg-white dark:bg-slate-900 pr-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-lg border-2 ${file || result ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
                                }`}>
                                {file || result ? <CheckCircle className="w-5 h-5" /> : '1'}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Upload</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-center gap-4 relative z-10 bg-white dark:bg-slate-900 px-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-lg border-2 ${result ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : file ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
                                }`}>
                                {result ? <CheckCircle className="w-5 h-5" /> : '2'}
                            </div>
                            <div>
                                <p className={`font-bold transition-colors ${file ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>Review</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-center gap-4 relative z-10 bg-white dark:bg-slate-900 pl-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-lg border-2 ${result ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
                                }`}>
                                {result ? <CheckCircle className="w-5 h-5" /> : '3'}
                            </div>
                            <div>
                                <p className={`font-bold transition-colors ${result ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>Done</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    {/* Left Column: Upload */}
                    <div className="space-y-8">
                        <div className={`bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300 ${!file ? 'md:col-span-2 max-w-3xl mx-auto w-full' : ''}`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                    <Upload className="w-6 h-6 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Upload File</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Excel or CSV format supported</p>
                                </div>
                            </div>

                            <div
                                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 group ${dragActive
                                    ? 'border-slate-900 bg-slate-50 dark:bg-slate-800 scale-[1.02]'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/50'
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
                                />

                                {!file ? (
                                    <label htmlFor="fileInput" className="cursor-pointer block">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl border border-slate-200 dark:border-slate-700">
                                            <Upload className="w-10 h-10 text-slate-900 dark:text-white" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Drop file here or click to browse</p>
                                        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Supports .xlsx, .xls, and .csv files</p>
                                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">
                                            Browse Files
                                        </div>
                                    </label>
                                ) : (
                                    <div className="animate-fadeIn">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                                            <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate px-4">{file.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-mono">{(file.size / 1024).toFixed(2)} KB</p>

                                        <button
                                            onClick={clearFile}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors border border-red-100 dark:border-red-900/30"
                                        >
                                            <X className="w-5 h-5" />
                                            Remove File
                                        </button>
                                    </div>
                                )}
                            </div>

                            {loading && (
                                <div className="mt-8 flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="w-6 h-6 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-slate-900 dark:text-white font-bold animate-pulse">Analyzing file...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Preview & Action */}
                    {file && !loading && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Preview Card */}
                            {preview && (
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                                <RefreshCw className="w-6 h-6 text-slate-900 dark:text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Review Data</h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{preview.totalRows} rows detected</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini Preview Table */}
                                    <div className="bg-slate-50 dark:bg-black/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-slate-100 dark:bg-slate-800">
                                                    <tr>
                                                        {preview.columns.slice(0, 3).map((col) => (
                                                            <th key={col} className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                {col}
                                                            </th>
                                                        ))}
                                                        {preview.columns.length > 3 && (
                                                            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">...</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                    {preview.preview.slice(0, 3).map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                                            {preview.columns.slice(0, 3).map((col) => (
                                                                <td key={col} className="px-4 py-3 text-sm text-slate-900 dark:text-slate-300 whitespace-nowrap font-medium">
                                                                    {String(row[col] || '')}
                                                                </td>
                                                            ))}
                                                            {preview.columns.length > 3 && (
                                                                <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">...</td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800">
                                            Showing first 3 rows of {preview.totalRows}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleImport}
                                        disabled={importing}
                                        className="w-full py-4 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                                    >
                                        {importing ? (
                                            <>
                                                <div className="w-6 h-6 border-4 border-slate-500 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
                                                Processing Updates...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-6 h-6" />
                                                Update {preview.totalRows} Students
                                                <ArrowRight className="w-5 h-5 ml-2 opacity-60" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {result && (
                    <div className="animate-fadeIn max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-emerald-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <div className="relative z-10 text-center mb-10">
                                <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100 dark:border-emerald-800">
                                    <TrendingUp className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">Update Complete!</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Your student data has been processed.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                <div className="bg-slate-900 dark:bg-white rounded-3xl p-8 text-white dark:text-slate-900 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                                        <CheckCircle className="w-32 h-32" />
                                    </div>
                                    <p className="text-slate-400 dark:text-slate-500 font-bold mb-2 uppercase tracking-wide text-sm">Successfully Updated</p>
                                    <p className="text-5xl md:text-6xl font-black text-white dark:text-slate-900">{result.updated || 0}</p>
                                </div>

                                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-8 shadow-inner border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <div className="absolute right-0 top-0 opacity-5 transform translate-x-1/3 -translate-y-1/3">
                                        <AlertCircle className="w-32 h-32" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-2 uppercase tracking-wide text-sm">Skipped / Not Found</p>
                                    <p className="text-5xl md:text-6xl font-black text-slate-700 dark:text-white">{result.skipped || 0}</p>
                                </div>
                            </div>

                            {result.errors && result.errors.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-8">
                                    <h3 className="font-bold text-red-900 dark:text-red-300 mb-6 flex items-center gap-3 text-xl">
                                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        Errors Encountered ({result.errors.length})
                                    </h3>
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 max-h-60 overflow-y-auto custom-scrollbar shadow-inner border border-red-100 dark:border-red-900/30">
                                        <ul className="space-y-3">
                                            {result.errors.slice(0, 10).map((err, idx) => (
                                                <li key={idx} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                                    <span className="font-bold bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-xs min-w-[60px] text-center">Row {err.row}</span>
                                                    <span className="font-medium">{err.message}</span>
                                                </li>
                                            ))}
                                            {result.errors.length > 10 && (
                                                <li className="text-center py-2 text-sm text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/10 rounded-lg">
                                                    ... and {result.errors.length - 10} more errors
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 text-center">
                                <button
                                    onClick={clearFile}
                                    className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-400 dark:hover:border-slate-500"
                                >
                                    Start New Update
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    )
}

