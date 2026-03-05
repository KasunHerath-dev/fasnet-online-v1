import { useState, useEffect } from 'react'
import api from '../../../services/api'
import {
    UploadCloud,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle,
    RefreshCcw,
    ArrowLeft,
    Layers,
    Users,
    Database,
    Activity,
    FileText,
    FileCode2,
    Check
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { batchYearService } from '../../../services/authService'

const WUSL_COMBINATIONS = [
    {
        group: "Level 1 & 2 Core Combinations",
        options: [
            { id: "COMB1", label: "COMB 1: MATH & STAT + CMIS + ELTN" },
            { id: "COMB2", label: "COMB 2: MATH & STAT + ELTN + IMGT" },
            { id: "COMB3", label: "COMB 3: MATH & STAT + IMGT + CMIS" }
        ]
    },
    {
        group: "Level 3 General Sub-Combinations",
        options: [
            { id: "COMB1A", label: "COMB 1A (MATH + CMIS + ELTN)" },
            { id: "COMB1B", label: "COMB 1B (STAT + CMIS + ELTN)" },
            { id: "COMB1C", label: "COMB 1C (MATH + STAT + CMIS)" },
            { id: "COMB2A", label: "COMB 2A (MATH + ELTN + IMGT)" },
            { id: "COMB2B", label: "COMB 2B (STAT + ELTN + IMGT)" },
            { id: "COMB2C", label: "COMB 2C (MATH + STAT + IMGT)" },
            { id: "COMB3A", label: "COMB 3A (MATH + IMGT + CMIS)" },
            { id: "COMB3B", label: "COMB 3B (STAT + IMGT + CMIS)" },
            { id: "COMB3C", label: "COMB 3C (MATH + STAT + IMGT)" }
        ]
    },
    {
        group: "B.Sc. Joint Major Degrees",
        options: [
            { id: "JM-1A", label: "1A: CMIS (Major) + ELTN (Major)" },
            { id: "JM-1B", label: "1B: CMIS (Major) + MMST (Major)" },
            { id: "JM-2A", label: "2A: ELTN (Major) + CMIS (Major)" },
            { id: "JM-2B", label: "2B: ELTN (Major) + MMST (Major)" },
            { id: "JM-3A", label: "3A: IMGT (Major) + ELTN (Major)" },
            { id: "JM-3B", label: "3B: IMGT (Major) + MMST (Major)" }
        ]
    },
    {
        group: "B.Sc. Special (Honours) Degrees",
        options: [
            { id: "SP-CS", label: "Special in Computer Science" },
            { id: "SP-AE", label: "Special in Applied Electronics" },
            { id: "SP-IM", label: "Special in Industrial Management" },
            { id: "SP-MATH", label: "Special in Mathematics with Statistics" }
        ]
    }
];

export default function BulkCombinationPage() {
    const [file, setFile] = useState(null)
    const [batchYear, setBatchYear] = useState('')
    const [combination, setCombination] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [batches, setBatches] = useState([])
    const toast = useToast()
    const navigate = useNavigate()

    useEffect(() => {
        fetchBatches()
    }, [])

    const fetchBatches = async () => {
        try {
            const res = await batchYearService.getAll()
            setBatches(res.data.batchYears || [])
        } catch (error) {
            console.error('Error fetching batches:', error)
            toast?.error('Failed to load batch years')
        }
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
            setResult(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file || !batchYear || !combination) {
            toast?.error('Please fill in all fields')
            return
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('batchYear', String(batchYear))
        formData.append('combination', combination)

        setLoading(true)
        setResult(null)

        try {
            const response = await api.post('/academic/bulk-combination', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setResult(response.data)
            toast?.success('Bulk update completed!')
        } catch (error) {
            console.error('Error uploading file:', error)
            setResult({
                success: false,
                message: error.response?.data?.message || error.message || 'Upload failed',
                errors: error.response?.data?.errors || []
            })
            toast?.error('Update failed')
        } finally {
            setLoading(false)
        }
    }

    // Helper to determine the theme of the results
    const isSuccess = result?.success && (!result.errors || result.errors.length === 0);
    const isPartialSuccess = result?.success && result.errors?.length > 0;
    const isError = !result?.success && result;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c14] font-display text-slate-900 dark:text-white pb-24 transition-colors duration-300">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] sm:top-[-20%] left-[-10%] w-[40%] sm:w-[50%] h-[40%] sm:h-[50%] bg-violet-500/8 dark:bg-violet-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] sm:bottom-[-20%] right-[-10%] w-[40%] sm:w-[50%] h-[40%] sm:h-[50%] bg-blue-500/8 dark:bg-blue-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 animate-fadeIn">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="group flex items-center gap-2 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 font-semibold transition-colors w-fit"
                        >
                            <div className="p-1.5 bg-white dark:bg-white/5 shadow-sm border border-slate-200 dark:border-white/10 rounded-lg group-hover:bg-violet-50 dark:group-hover:bg-violet-500/20 group-hover:border-violet-200 dark:group-hover:border-violet-500/30 transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Return to Dashboard
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                                <Database className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Bulk Data Loader
                                </h1>
                                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium mt-1">
                                    Mass-assign subject combinations to student batches instantly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: UPLOAD FORM */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">

                            {/* Subtle gradient border effect */}
                            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl opacity-70 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, #7c3aed, #2563eb)' }}></div>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.15))' }}>
                                    <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configuration</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Batch Year Select */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5" /> Target Batch
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={batchYear}
                                            onChange={(e) => setBatchYear(e.target.value)}
                                            className="w-full h-14 pl-5 pr-12 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none text-slate-900 dark:text-white font-bold appearance-none transition-all shadow-sm"
                                        >
                                            <option value="">Select Academic Batch</option>
                                            {batches.map((batch) => (
                                                <option key={batch._id} value={batch.year}>
                                                    {batch.year} Intake
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none bg-white dark:bg-white/5 p-1 rounded-md border border-slate-200 dark:border-white/10">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Combination Select */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileCode2 className="w-3.5 h-3.5" /> Target Combination
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={combination}
                                            onChange={(e) => setCombination(e.target.value)}
                                            className="w-full h-14 pl-5 pr-12 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none text-slate-900 dark:text-white font-bold appearance-none transition-all shadow-sm"
                                        >
                                            <option value="">Select Academic Combination</option>
                                            {WUSL_COMBINATIONS.map((group, gIdx) => (
                                                <optgroup key={gIdx} label={group.group}>
                                                    {group.options.map((opt) => (
                                                        <option key={opt.id} value={opt.id}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none bg-white dark:bg-white/5 p-1 rounded-md border border-slate-200 dark:border-white/10">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* File Dropzone */}
                                <div className="space-y-3 pt-2">
                                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileSpreadsheet className="w-3.5 h-3.5" /> Data File
                                    </label>

                                    <label className={`
                                        relative flex flex-col items-center justify-center w-full h-48 
                                        border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300
                                        overflow-hidden group
                                        ${file
                                            ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-500/5'
                                            : 'border-slate-300 dark:border-white/20 hover:border-teal-400 hover:bg-teal-50/30 dark:hover:bg-white/5'
                                        }
                                    `}>
                                        {/* Animated BG for empty state */}
                                        {!file && (
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                        )}

                                        <div className="flex flex-col items-center justify-center p-6 text-center z-10">
                                            {file ? (
                                                <div className="animate-scaleIn flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-white dark:bg-[#0B0F19] rounded-2xl shadow-sm border border-teal-200 dark:border-teal-900/50 flex items-center justify-center mb-4">
                                                        <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                                                    </div>
                                                    <p className="text-sm text-teal-800 dark:text-teal-300 font-bold mb-1 truncate max-w-[200px]">{file.name}</p>
                                                    <p className="text-xs font-semibold text-teal-600/70 dark:text-teal-500/70 bg-white dark:bg-[#0B0F19] px-3 py-1 rounded-full border border-teal-100 dark:border-teal-900/30 mt-2">
                                                        Change File
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center transform transition-transform duration-300 group-hover:-translate-y-1">
                                                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                                        <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-teal-500 transition-colors" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Click or drag to upload</p>
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500">CSV or Excel format</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".csv, .xlsx, .xls"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading || !file || !batchYear || !combination}
                                        className={`
                                            w-full h-14 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-2
                                            ${loading || !file || !batchYear || !combination
                                                ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-white/5'
                                                : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 border border-teal-400/20'
                                            }
                                        `}
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCcw className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Execute Update
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Help / Instructions Card */}
                        <div className="bg-slate-100/50 dark:bg-[#121826]/50 border border-slate-200 dark:border-white/5 rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-teal-500" /> Upload Instructions
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                                    The system automatically extracts registration numbers from the <strong>first column</strong>.
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                                    You don't need a specific column header, pure lists work fine.
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                                    If a student doesn't exist in the selected batch, they will be skipped.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PROCESSING HUB */}
                    <div className="xl:col-span-8 flex flex-col h-full">
                        <div className="bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none flex-grow flex flex-col">

                            {/* Panel Header */}
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : result ? (result.success ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Processing Telemetry</h2>
                                </div>
                            </div>

                            <div className="flex-grow p-6 sm:p-8">

                                {/* Idle State */}
                                {!result && !loading && (
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center animate-fadeIn">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl animate-pulse"></div>
                                            <div className="w-24 h-24 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center relative z-10 shadow-sm">
                                                <Layers className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">System Ready</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                                            Select a batch, specify the combination, and upload your data file to begin processing.
                                        </p>
                                    </div>
                                )}

                                {/* Loading State */}
                                {loading && (
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center animate-fadeIn">
                                        <div className="relative w-32 h-32 flex items-center justify-center">
                                            {/* Outer spinner rings */}
                                            <div className="absolute inset-0 border-4 border-slate-100 dark:border-white/5 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-transparent border-t-teal-500 border-r-teal-500 rounded-full animate-spin"></div>

                                            {/* Inner core */}
                                            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-500/10 rounded-full flex items-center justify-center animate-pulse">
                                                <Database className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-bounce" style={{ animationDuration: '2s' }} />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mt-8 mb-2 tracking-tight">
                                            Analyzing & Updating...
                                        </h3>
                                        <p className="text-teal-600 dark:text-teal-400 font-bold animate-pulse">
                                            Modifying student records in real-time
                                        </p>
                                    </div>
                                )}

                                {/* Results State */}
                                {result && (
                                    <div className="space-y-8 animate-fadeIn">

                                        {/* Result Banner */}
                                        <div className={`
                                            p-6 sm:p-8 rounded-3xl border relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left
                                            ${isPartialSuccess ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/20' :
                                                isSuccess ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-500/20' :
                                                    'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-500/20'}
                                        `}>
                                            {/* Background glow */}
                                            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-50 
                                                ${isPartialSuccess ? 'bg-amber-400' : isSuccess ? 'bg-green-400' : 'bg-red-400'}`}>
                                            </div>

                                            <div className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center shadow-sm relative z-10
                                                ${isPartialSuccess ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' :
                                                    isSuccess ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' :
                                                        'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}
                                            `}>
                                                {isPartialSuccess ? <AlertCircle className="w-8 h-8" /> :
                                                    isSuccess ? <CheckCircle className="w-8 h-8" /> :
                                                        <RefreshCcw className="w-8 h-8" />}
                                            </div>

                                            <div className="relative z-10">
                                                <h3 className={`text-2xl font-black tracking-tight mb-2
                                                    ${isPartialSuccess ? 'text-amber-900 dark:text-amber-300' :
                                                        isSuccess ? 'text-green-900 dark:text-green-300' :
                                                            'text-red-900 dark:text-red-300'}
                                                `}>
                                                    {isPartialSuccess ? 'Processing Finished with Exceptions' :
                                                        isSuccess ? 'Successfully Updated All Records' :
                                                            'Critical Processing Error'}
                                                </h3>
                                                <p className={`text-base font-medium
                                                    ${isPartialSuccess ? 'text-amber-800/80 dark:text-amber-400/90' :
                                                        isSuccess ? 'text-green-800/80 dark:text-green-400/90' :
                                                            'text-red-800/80 dark:text-red-400/90'}
                                                `}>
                                                    {isPartialSuccess ? `The batch run completed, but ${result.errors.length} rows encountered errors during processing.` :
                                                        isSuccess ? `Every student in the uploaded file for batch ${batchYear} was cleanly updated.` :
                                                            result.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bento Stat Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Total Scanned */}
                                            <div className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                                                    <Layers className="w-16 h-16" />
                                                </div>
                                                <div className="relative z-10">
                                                    <p className="text-xs font-black text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Rows Scanned</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{result.totalProcessed || 0}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Success Count */}
                                            <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200/50 dark:border-green-500/10 rounded-2xl p-5 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                                    <Check className="w-16 h-16" />
                                                </div>
                                                <div className="relative z-10">
                                                    <p className="text-xs font-black text-green-600 dark:text-green-500 uppercase tracking-wider mb-1">Successfully Updated</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-4xl font-black text-green-700 dark:text-green-400 tracking-tight">{result.updatedCount || 0}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Error Count */}
                                            <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-500/10 rounded-2xl p-5 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                                                    <AlertCircle className="w-16 h-16" />
                                                </div>
                                                <div className="relative z-10">
                                                    <p className="text-xs font-black text-red-600 dark:text-red-500 uppercase tracking-wider mb-1">Failed Records</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-4xl font-black text-red-700 dark:text-red-400 tracking-tight">{result.errors?.length || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Error Table */}
                                        {result.errors && result.errors.length > 0 && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                    Exception Log
                                                    <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200 dark:border-red-500/30">
                                                        {result.errors.length} Issues
                                                    </span>
                                                </h3>

                                                <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-inner">
                                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead className="bg-slate-50 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                                                                <tr>
                                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3 border-b border-slate-200 dark:border-white/10">Read Value (Reg No)</th>
                                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">Error Analysis</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                                {result.errors.map((error, idx) => (
                                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                                                        <td className="px-6 py-4">
                                                                            <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-200 dark:border-white/10">
                                                                                {error.regNum || error.registrationNumber || 'Unknown'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                                                                                {error.message || error.error || 'Unknown Error'}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.5);
                }
                .uppercase-placeholder::placeholder {
                    text-transform: none;
                }
            `}</style>
        </div>
    )
}
