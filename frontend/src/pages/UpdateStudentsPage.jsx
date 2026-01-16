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
    Info
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 lg:space-y-8 animate-fadeIn">

                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-40 -mb-40"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <RefreshCw className="w-6 h-6 md:w-7 md:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">Update Student Data</h1>
                                <p className="text-sm md:text-base lg:text-lg text-purple-200 font-medium">Bulk update existing student information from Excel or CSV files</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-blue-200">
                    <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Info className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm md:text-base font-bold text-blue-900 mb-2">How Updates Work</h3>
                            <ul className="text-xs md:text-sm text-blue-800 space-y-1">
                                <li>• Students are matched by <strong>Registration Number</strong></li>
                                <li>• Only existing students will be updated</li>
                                <li>• New students in the file will be skipped</li>
                                <li>• Empty cells will not overwrite existing data</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border-2 border-gray-100">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${file ? 'bg-green-500 text-white' : 'bg-purple-600 text-white'}`}>
                                {file ? <CheckCircle className="w-5 h-5" /> : '1'}
                            </div>
                            <div className="flex-1 md:flex-none">
                                <p className="text-sm md:text-base font-bold text-gray-900">Upload File</p>
                                <p className="text-xs md:text-sm text-gray-600">Select your update file</p>
                            </div>
                        </div>
                        <div className="hidden md:block h-1 flex-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full bg-purple-600 transition-all duration-500 ${file ? 'w-1/2' : 'w-0'}`}></div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${result ? 'bg-green-500 text-white' : file ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                {result ? <CheckCircle className="w-5 h-5" /> : '2'}
                            </div>
                            <div className="flex-1 md:flex-none">
                                <p className="text-sm md:text-base font-bold text-gray-900">Update</p>
                                <p className="text-xs md:text-sm text-gray-600">Apply changes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border-2 border-gray-100">
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900">Upload Update File</h2>
                    </div>

                    <div
                        className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all ${dragActive
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 bg-gradient-to-br from-gray-50 to-purple-50/30 hover:border-purple-400'
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
                                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Upload className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                                <p className="text-lg md:text-xl font-bold text-gray-900 mb-2">Drop your file here or click to browse</p>
                                <p className="text-sm md:text-base text-gray-600">Supports .xlsx, .xls, and .csv files</p>
                                <div className="mt-4 md:mt-6 inline-block min-h-[44px] px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95">
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
                        <div className="mt-4 md:mt-6 flex items-center justify-center gap-3 bg-purple-50 p-4 rounded-xl">
                            <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm md:text-base text-purple-900 font-semibold">Loading preview...</span>
                        </div>
                    )}
                </div>

                {/* Preview */}
                {preview && (
                    <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border-2 border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
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
                                className="min-h-[44px] w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                            >
                                {importing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5" />
                                        Update {preview.totalRows} Records
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
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
                                        <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
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
                    <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border-2 border-purple-200">
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900">Update Complete!</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm md:text-base text-purple-100 font-medium mb-1">Students Updated</p>
                                        <p className="text-4xl md:text-5xl font-black">{result.updated || 0}</p>
                                    </div>
                                    <CheckCircle className="w-12 h-12 md:w-16 md:h-16 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm md:text-base text-gray-100 font-medium mb-1">Skipped (Not Found)</p>
                                        <p className="text-4xl md:text-5xl font-black">{result.skipped || 0}</p>
                                    </div>
                                    <AlertCircle className="w-12 h-12 md:w-16 md:h-16 opacity-20" />
                                </div>
                            </div>
                        </div>

                        {result.errors && result.errors.length > 0 && (
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
