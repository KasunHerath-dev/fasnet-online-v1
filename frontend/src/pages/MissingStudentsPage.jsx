import { useState, useEffect } from 'react'
import { studentService } from '../services/authService'
import { Trash2, UserPlus, AlertTriangle, Search, ArrowLeft, Users, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'

export default function MissingStudentsPage() {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const { showToast } = useToast()
    const navigate = useNavigate()

    useEffect(() => {
        fetchMissingStudents()
    }, [])

    const fetchMissingStudents = async () => {
        try {
            setLoading(true)
            const res = await studentService.getMissingStudents()
            setStudents(res.data)
        } catch (error) {
            console.error(error)
            showToast('Failed to fetch missing students', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleMoveToMain = async (regNo) => {
        if (!window.confirm('Are you sure you want to move this student to the main database?')) return

        try {
            await studentService.moveMissingStudent(regNo)
            setStudents(students.filter(s => s.registrationNumber !== regNo))
            showToast('Student moved to main database successfully', 'success')
        } catch (error) {
            console.error(error)
            showToast('Failed to move student', 'error')
        }
    }

    const handleDelete = async (regNo) => {
        if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) return

        try {
            await studentService.deleteMissingStudent(regNo)
            setStudents(students.filter(s => s.registrationNumber !== regNo))
            showToast('Record deleted successfully', 'success')
        } catch (error) {
            console.error(error)
            showToast('Failed to delete record', 'error')
        }
    }

    const handleDeleteAll = async () => {
        if (!window.confirm('WARNING: Are you sure you want to delete ALL missing students? This action cannot be undone.')) return

        try {
            await studentService.deleteAllMissingStudents()
            setStudents([])
            showToast('All missing students deleted successfully', 'success')
        } catch (error) {
            console.error(error)
            showToast('Failed to delete all records', 'error')
        }
    }

    const filteredStudents = students.filter(student =>
        student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-fadeIn p-4 md:p-8">

                {/* Hero Header - Ash Theme */}
                <div className="relative overflow-hidden bg-black rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-800/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative z-10">
                        <button
                            onClick={() => navigate('/admin')}
                            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 font-medium"
                        >
                            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                            Back to Dashboard
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner border border-white/10">
                                <AlertTriangle className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Missing Students</h1>
                                <p className="text-slate-400 text-lg font-medium max-w-2xl">
                                    Manage students found in import files but missing from the database.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 p-6 md:p-8 space-y-6">

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by Registration Number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium transition-all"
                            />
                        </div>

                        {students.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                className="w-full md:w-auto px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 font-bold transition-colors flex items-center justify-center gap-2 border border-red-100 dark:border-red-500/10"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete All Records
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="bg-slate-50 dark:bg-black/20 rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center p-20">
                                <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                                <p className="font-bold text-slate-500 dark:text-slate-400 text-lg">Scanning records...</p>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                                    <Users className="w-12 h-12 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                    {searchQuery ? 'No matches found' : 'All Clear!'}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-md">
                                    {searchQuery
                                        ? 'No students match your search criteria.'
                                        : 'There are no missing student records to resolve at this time.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                                        <tr>
                                            <th className="px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Registration #
                                            </th>
                                            <th className="px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Issue
                                            </th>
                                            <th className="px-8 py-5 text-right font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                        {filteredStudents.map((student, index) => (
                                            <tr
                                                key={student._id || index}
                                                className="hover:bg-white dark:hover:bg-white/5 transition-colors group"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <span className="font-bold text-slate-900 dark:text-white font-mono text-lg">
                                                            {student.registrationNumber}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Not in Database
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleMoveToMain(student.registrationNumber)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-black dark:hover:bg-slate-200 font-bold transition-all shadow-md"
                                                            title="Move to Main Database"
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                            <span className="hidden lg:inline">Move to Main</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(student.registrationNumber)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-100 font-bold transition-all"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span className="hidden lg:inline">Delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
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
