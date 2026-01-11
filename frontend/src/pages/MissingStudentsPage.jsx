import { useEffect, useState } from 'react'
import { missingStudentService } from '../services/authService'

export default function MissingStudentsPage() {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        fetchMissingStudents()
    }, [])

    const fetchMissingStudents = async () => {
        try {
            setLoading(true)
            const res = await missingStudentService.getAll()
            setStudents(res.data.students || [])
            setTotal(res.data.total || 0)
        } catch (error) {
            console.error('Failed to fetch missing students', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMoveToMain = async (id) => {
        if (!window.confirm('Move this student to main database?')) return
        try {
            await missingStudentService.moveToMain(id)
            alert('✅ Student moved to main database!')
            fetchMissingStudents()
        } catch (error) {
            alert('❌ ' + (error.response?.data?.error?.message || 'Move failed'))
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this missing student record?')) return
        try {
            await missingStudentService.delete(id)
            alert('✅ Deleted!')
            fetchMissingStudents()
        } catch (error) {
            alert('❌ ' + (error.response?.data?.error?.message || 'Delete failed'))
        }
    }

    const handleDeleteAll = async () => {
        if (!window.confirm('⚠️ Delete ALL missing students?')) return
        try {
            await missingStudentService.deleteAll()
            alert('✅ All missing students deleted!')
            fetchMissingStudents()
        } catch (error) {
            alert('❌ ' + (error.response?.data?.error?.message || 'Delete failed'))
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Missing Students</h1>
                <span className="text-gray-600">Total: {total}</span>
            </div>

            <div className="card bg-yellow-50 border border-yellow-200">
                <p className="text-yellow-800">
                    <strong>⚠️ Missing Students:</strong> These registration numbers were found in import files but don't exist in the main database.
                    You can move them to the main database or delete them.
                </p>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : students.length === 0 ? (
                <div className="card text-center text-gray-500">
                    <p className="text-xl">No missing students found</p>
                    <p className="text-sm mt-2">All imported registration numbers match existing records.</p>
                </div>
            ) : (
                <>
                    <div className="card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="text-left p-3">Reg No</th>
                                    <th className="text-left p-3">Name</th>
                                    <th className="text-left p-3">Import File</th>
                                    <th className="text-left p-3">Imported At</th>
                                    <th className="text-left p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium">{student.registrationNumber}</td>
                                        <td className="p-3">{student.fullName || '-'}</td>
                                        <td className="p-3 text-xs text-gray-600">{student.importFile || '-'}</td>
                                        <td className="p-3 text-xs text-gray-600">
                                            {student.importedAt ? new Date(student.importedAt).toLocaleString() : '-'}
                                        </td>
                                        <td className="p-3 space-x-2">
                                            <button
                                                onClick={() => handleMoveToMain(student._id)}
                                                className="btn btn-primary text-xs px-2 py-1"
                                            >
                                                Add to Main
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student._id)}
                                                className="btn btn-danger text-xs px-2 py-1"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        type="button"
                        onClick={handleDeleteAll}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Deleting...' : 'Delete All Missing Students'}
                    </button>
                </>
            )}
        </div>
    )
}
