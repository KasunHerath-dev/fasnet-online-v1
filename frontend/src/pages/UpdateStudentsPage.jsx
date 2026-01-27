import { useState } from 'react'
import { importService } from '../services/authService'
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

                {/* Enhanced Hero Header - Command Center Style */}
                <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 dark:from-cyan-800 dark:via-blue-900 dark:to-indigo-950 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-blue-900/30 z-10">
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] pointer-events-none"></div>

                    {/* Floating Orbs for Depth */}
                    <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute bottom-0 left-10 w-64 h-64 bg-cyan-400/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
                    <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {/* Enhanced Logo with Glassmorphism */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white to-cyan-300 opacity-30 rounded-2xl md:rounded-3xl blur-lg group-hover:blur-xl transition-all"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-900/30 border-2 border-white/30 group-hover:scale-105 group-hover:rotate-6 transition-all">
                                <RefreshCw className="w-10 h-10 text-white group-hover:rotate-180 transition-transform duration-500" />
                            </div>
                            {/* Sparkle Indicator */}
                            <div className="absolute -top-1 -right-1">
                                <span className="relative flex h-5 w-5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-5 w-5 bg-yellow-500 items-center justify-center text-xs">✨</span>
                                </span>
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-2xl">Update Student Data</h1>
                            <p className="text-cyan-100 dark:text-cyan-200 font-semibold text-base md:text-lg max-w-2xl drop-shadow-lg">
                                Bulk update existing student information using Excel or CSV templates.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Enhanced Info Banner with Gradient */}
                <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-blue-200 dark:border-blue-800 backdrop-blur-sm shadow-xl shadow-blue-500/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl md:rounded-3xl"></div>
                    <div className="relative flex items-start gap-4 md:gap-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-blue-500/30">
                            <Info className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-black text-blue-900 dark:text-blue-100 mb-3">How Updates Work</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm md:text-base text-blue-800 dark:text-blue-200/90 font-semibold">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50"></div>
                                    Students are matched by Registration Number
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50"></div>
                                    Only existing students will be updated
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50"></div>
                                    New students in the file will be skipped
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50"></div>
                                    Empty cells will not overwrite existing data
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="bg-white dark:bg-stitch-card-dark rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-white/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                        {/* Progress Line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-white/5 -z-0 hidden md:block"></div>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-stitch-blue transition-all duration-500 -z-0 hidden md:block ${result ? 'w-full' : file ? 'w-1/2' : 'w-0'
                            }`}></div>

                        {/* Step 1 */}
                        <div className="flex items-center gap-4 relative z-10 bg-white dark:bg-stitch-card-dark pr-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all shadow-lg ${file || result ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-stitch-blue text-white shadow-stitch-blue/30'
                                }`}>
                                {file || result ? <CheckCircle className="w-6 h-6" /> : '1'}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Upload File</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select template</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-center gap-4 relative z-10 bg-white dark:bg-stitch-card-dark px-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all shadow-lg ${result ? 'bg-emerald-500 text-white shadow-emerald-500/30' : file ? 'bg-stitch-blue text-white shadow-stitch-blue/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                }`}>
                                {result ? <CheckCircle className="w-6 h-6" /> : '2'}
                            </div>
                            <div>
                                <p className={`font-bold transition-colors ${file ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>Review & Update</p>
                                <p className="text-xs text-slate-500 dark:text-slate-600 font-medium">Process changes</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-center gap-4 relative z-10 bg-white dark:bg-stitch-card-dark pl-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all shadow-lg ${result ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                }`}>
                                {result ? <CheckCircle className="w-6 h-6" /> : '3'}
                            </div>
                            <div>
                                <p className={`font-bold transition-colors ${result ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>Complete</p>
                                <p className="text-xs text-slate-500 dark:text-slate-600 font-medium">View results</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    {/* Left Column: Upload */}
                    <div className="space-y-8">
                        <div className={`bg-white dark:bg-stitch-card-dark rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/10 transition-all duration-300 ${!file ? 'md:col-span-2 max-w-3xl mx-auto w-full' : ''}`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-stitch-blue/10 dark:bg-stitch-blue/20 rounded-2xl flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-stitch-blue" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Upload File</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Excel or CSV format supported</p>
                                </div>
                            </div>

                            <div
                                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 group ${dragActive
                                    ? 'border-stitch-blue bg-stitch-blue/5 scale-[1.02]'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-stitch-blue/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
                                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-stitch-blue to-purple-600 rounded-3xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-stitch-blue/20">
                                            <Upload className="w-10 h-10 text-white" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Drop file here or click to browse</p>
                                        <p className="text-slate-500 dark:text-slate-400 mb-6">Supports .xlsx, .xls, and .csv files</p>
                                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-colors">
                                            Browse Files
                                        </div>
                                    </label>
                                ) : (
                                    <div className="animate-fadeIn">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center">
                                            <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate px-4">{file.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-mono">{(file.size / 1024).toFixed(2)} KB</p>

                                        <button
                                            onClick={clearFile}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                            Remove File
                                        </button>
                                    </div>
                                )}
                            </div>

                            {loading && (
                                <div className="mt-8 flex items-center justify-center gap-3 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <div className="w-6 h-6 border-4 border-stitch-blue border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-stitch-blue dark:text-blue-300 font-bold animate-pulse">Analyzing file...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Preview & Action */}
                    {file && !loading && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Preview Card */}
                            {preview && (
                                <div className="bg-white dark:bg-stitch-card-dark rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                                                <RefreshCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Review Data</h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{preview.totalRows} rows detected</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini Preview Table */}
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-slate-100 dark:bg-slate-800">
                                                    <tr>
                                                        {preview.columns.slice(0, 3).map((col) => (
                                                            <th key={col} className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                                                {col}
                                                            </th>
                                                        ))}
                                                        {preview.columns.length > 3 && (
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">...</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                    {preview.preview.slice(0, 3).map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                                            {preview.columns.slice(0, 3).map((col) => (
                                                                <td key={col} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
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
                                        <div className="p-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                                            Showing first 3 rows of {preview.totalRows}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleImport}
                                        disabled={importing}
                                        className="w-full py-4 bg-gradient-to-r from-stitch-blue to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                                    >
                                        {importing ? (
                                            <>
                                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                        <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-2 border-emerald-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <div className="relative z-10 text-center mb-10">
                                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <TrendingUp className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">Update Complete!</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg">Your student data has been processed.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                                        <CheckCircle className="w-32 h-32" />
                                    </div>
                                    <p className="text-emerald-100 font-bold mb-2 uppercase tracking-wide text-sm">Successfully Updated</p>
                                    <p className="text-5xl md:text-6xl font-black">{result.updated || 0}</p>
                                </div>

                                <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 shadow-inner relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <div className="absolute right-0 top-0 opacity-5 transform translate-x-1/3 -translate-y-1/3">
                                        <AlertCircle className="w-32 h-32" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-2 uppercase tracking-wide text-sm">Skipped / Not Found</p>
                                    <p className="text-5xl md:text-6xl font-black text-slate-700 dark:text-slate-200">{result.skipped || 0}</p>
                                </div>
                            </div>

                            {result.errors && result.errors.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/30 rounded-3xl p-8">
                                    <h3 className="font-bold text-red-900 dark:text-red-300 mb-6 flex items-center gap-3 text-xl">
                                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        Errors Encountered ({result.errors.length})
                                    </h3>
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 max-h-60 overflow-y-auto custom-scrollbar shadow-inner border border-red-100 dark:border-red-900/30">
                                        <ul className="space-y-3">
                                            {result.errors.slice(0, 10).map((err, idx) => (
                                                <li key={idx} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                                    <span className="font-bold bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-xs min-w-[60px] text-center">Row {err.row}</span>
                                                    <span>{err.message}</span>
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
                                    className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
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
